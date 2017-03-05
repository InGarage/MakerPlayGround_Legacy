
import 'fabric';
import * as Collections from 'typescript-collections';

import { Action, ActionGroup, ActionHelper } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { GraphData, NodeData, EdgeData, TriggerData } from './graphmodel';
import { PropertyValue } from './propertyvalue';

/* display constants */
const NODE_SIZE: number = 50;
const NODE_SVG_POS: number = 30;
const NODE_NAME_YPOS: number = 40;
const NODE_NAME_FONTSIZE: number = 14;
const NODE_SVG_SCALE: number = 0.7;
const NODE_ACTION_NAME_FONTSIZE: number = 14;
const NODE_REMOVEBTN_POSX: number = (NODE_SIZE / 2);
const NODE_REMOVEBTN_POSY: number = (NODE_SIZE / 2);
const NODE_REMOVEBTN_SIZE: number = 10;
const EDGE_ARROW_HEAD_SIZE: number = 10;
const EDGE_ARROW_WIDTH: number = 1;
const EDGE_SVG_SCALE: number = 0.5;
const EDGE_IMAGE_SIZE: number = 50;
const EDGE_IMAGE_DISTANCE: number = 30;
const EDGE_DOT_RADIUS: number = 3;
const EDGE_DELBTN_DISTANCE: number = 15;
const TRIGGER_DESCRIP: number = 12;
const CROSS_WIDTH: number = 2;

export interface CanvasEventOptions {
    target_id?: string,
    src_node_id?: string, // Unique id of the source node
    dst_node_id?: string, // Unique id of the destination node
    start_x?: number,     // Parameters needed to display the edge on the screen
    start_y?: number,
    center_x?: number,
    center_y?: number,
    end_x?: number,
    end_y?: number,
    toBeMissing?: EdgeData,     // EdgeData of edge that is going to disappear from canvas
    toBeCombined?: EdgeData,     // EdgeData of edge that is going to be combined
    triggerIndex?: number
}

export type CanvasEventTypes = 'node:selected' | 'node:move' | 'node:remove' | 'edge:move' | 'object:deselected'
    | 'edge:connectionDst' | 'edge:connectionSrc' | 'edge:selected' | 'edge:combine' | 'trigger:remove' | 'edge:remove'
    | 'mouse:up' | 'mouse:down' | 'mouse:move';

type Coordinate = {
    x: number,
    y: number
}

type combineEdge = {
    toBeMissing: EdgeData,      // EdgeData of edge that is going to disappear from canvas
    toBeCombined: EdgeData      // EdgeData of edge that is going to be combined
}

export class GraphCanvas {
    private canvas: fabric.ICanvas;
    private nodeFabricObject: Collections.Dictionary<string, NodeView>;
    private edgeFabricObject: Collections.Dictionary<string, EdgeView>;
    private callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>;
    private selectingObject: NodeView | EdgeView;
    panning = false;

    constructor(private graph: GraphData, element: HTMLCanvasElement | string, options?: fabric.ICanvasOptions) {
        this.canvas = new fabric.Canvas(element, options);
        this.nodeFabricObject = new Collections.Dictionary<string, NodeView>();
        this.edgeFabricObject = new Collections.Dictionary<string, EdgeView>();
        this.callback = new Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>();
        this.initCanvas();
        this.handleGroupSelection();

        this.canvas.on('selection:cleared', (e) => {
            this.deselectAllNode();
            this.deselectAllEdge();
            this.callback.getValue('object:deselected')({});


            // this.canvas.on('mouse:move', (e) => {
            //     if (this.panning && e && e.e) {
            //         var units = 10;
            //         var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            //         this.canvas.relativePan(delta);
            //     }
            // });
        });

        this.canvas.on('object:selected', (e) => {
            if (e.target !== null) {
                if (this.selectingObject !== undefined) {
                    this.selectingObject.deselect();
                    this.callback.getValue('object:deselected')({});
                }
                const uid = e.target.get('uid');
                const object = this.nodeFabricObject.getValue(uid) || this.edgeFabricObject.getValue(uid);
                if (object !== undefined) {
                    this.selectingObject = object;
                } else {
                    console.log("We are in great danger!!!");
                }
            }
        });
    }

    private handleGroupSelection() {
        let selectedGroup: fabric.IGroup;
        let selectedNode = new Collections.Set<NodeView>((item) => { return item.id });
        let selectedEdge = new Collections.Set<EdgeView>((item) => { return item.id });

        this.canvas.on('selection:created', (e) => {
            this.selectingObject.deselect();
            this.selectingObject = undefined;

            // Grab other pieces of nodes and egdes that should be selected but hasn't been selected by user
            for (let selectingObject of this.canvas.getActiveGroup().getObjects()) {
                let uid = selectingObject.get('uid');
                if (this.nodeFabricObject.containsKey(uid)) {
                    selectedNode.add(this.nodeFabricObject.getValue(uid));
                }
                if (this.edgeFabricObject.containsKey(uid)) {
                    selectedEdge.add(this.edgeFabricObject.getValue(uid));
                }
            }
            // Modify current selection group to contain other pieces of nodes and edges that should be selected
            selectedGroup = this.canvas.getActiveGroup();
            selectedNode.forEach((node) => {
                for (const obj of node.getAllFabricElement())
                    if (selectedGroup.getObjects().indexOf(obj) === -1)
                        selectedGroup.addWithUpdate(obj);
            });
            selectedEdge.forEach((edge) => {
                for (const obj of edge.getAllFabricElement())
                    if (selectedGroup.getObjects().indexOf(obj) === -1)
                        selectedGroup.addWithUpdate(obj);
            });
            this.canvas.setActiveGroup(selectedGroup);
        });

        this.canvas.on('selection:cleared', (e) => {
            // Proceed only if user clear a group selection because selection:cleared is also emitted when we clear single object selection
            if (selectedGroup !== undefined) {
                // We move the edge first otherwise moveNode will override edge.line position and we won't know
                selectedEdge.forEach((edge) => {
                    let startX = edge.edgeData.getStartX();
                    let startY = edge.edgeData.getStartY();
                    let endX = edge.edgeData.getEndX();
                    let endY = edge.edgeData.getEndY();
                    let angle = Math.atan2((endY - startY), (endX - startX));
                    [startX, endX, startY, endY] = edge.getLineCoordinateFromOrigin(edge.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2
                        , edge.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2);
                    edge.moveEdge(startX, startY, endX, endY, angle);
                    edge.processEdgeEvent(startX, startY, endX, endY, angle, true);
                });
                // Deselect every node from the edge manually because the moveNode function doesn't handle deselect. Thus, when we move node by group select nodes,
                // node remains connect to the edge it has been connected to previously even that edges aren't a part of a group selection. After deselecting all nodes, 
                // the node will be reconnected when it is moved to the new position in the last step
                selectedNode.forEach((node) => {
                    for (const edgeData of this.graph.getEdgesBySrcNode(node.id)) {
                        this.callback.getValue('edge:connectionSrc')({
                            target_id: edgeData.getEdgeId(),
                            start_x: edgeData.getStartX(),
                            start_y: edgeData.getStartY(),
                            end_x: edgeData.getEndX(),
                            end_y: edgeData.getEndY(),
                            src_node_id: '',
                        });
                    }
                    for (const edgeData of this.graph.getEdgesByDstNode(node.id)) {
                        this.callback.getValue('edge:connectionDst')({
                            target_id: edgeData.getEdgeId(),
                            start_x: edgeData.getStartX(),
                            start_y: edgeData.getStartY(),
                            end_x: edgeData.getEndX(),
                            end_y: edgeData.getEndY(),
                            dst_node_id: '',
                        });
                    }
                });
                // We can then move the node. Here the connection will be made again since edges has already moved to their new position.
                // Thus, by moving node to the new location, node will know that it is nearing some edge(s) and will connect to those edges
                selectedNode.forEach((node) => {
                    let image = node.nodeActionImage;
                    node.moveNode(image.getLeft(), image.getTop(), true);
                });
                // Clear all temporary variable needed 
                selectedGroup = undefined;
                selectedNode.clear();
                selectedEdge.clear();
            }
        });
    }

    deselectAllNode() {
        this.canvas.deactivateAll().renderAll();
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeSelectingIndicator.visible = false;
            nodeView.nodeRemoveButton.visible = false;
        });
    }

    deselectAllEdge() {
        this.canvas.deactivateAll().renderAll();
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            edgeView.dotHead.visible = false;
            edgeView.dotTail.visible = false;
            edgeView.edgeDeleteBtn.visible = false;
            for (let delBtn of edgeView.triggerDeleteBtn)
                delBtn.visible = false;
        });
    }

    updateDataBinding(data: PropertyValue) {
        if (this.nodeFabricObject.containsKey(data.uid)) {
            const node = data.children[0];  // This is an action, data contains only one child
            for (let param of node.param) {
                if (param.name == "name") {
                    this.nodeFabricObject.getValue(data.uid).nodeNameText.setText(param.value[0]);
                    this.canvas.renderAll();
                }
            }
        }
        if (this.edgeFabricObject.containsKey(data.uid)) {
            console.log('BINDING EDGE DATA', data);
            let item = 0;
            const triggerDesSize = this.edgeFabricObject.getValue(data.uid).triggerDescription.size();
            let paramNameValue = [];

            for (let i = 0; i < data.children.length; i++) {
                for (let param of data.children[i].param) {
                    if (param.name == "name") {
                        paramNameValue.push(param.value[0]);
                    }
                }
            }

            for (let i = 0; i < triggerDesSize; i++) {
                if (i % 2 === 1) {
                    console.log('eiei', paramNameValue[item]);
                    (<fabric.IText><any>this.edgeFabricObject.getValue(data.uid).triggerDescription.item(i)).setText(paramNameValue[item]);
                    let edge = this.edgeFabricObject.getValue(data.uid);
                    edge.setObjectPositionWithinDescriptionGroup();
                    item++;
                }
            }
            this.canvas.renderAll();
        }
    }

    drawNode(nodeData: NodeData) {
        let nodeView = new NodeView(this.graph, this.canvas, this.nodeFabricObject, this.edgeFabricObject
            , this.callback, nodeData.getNodeId(), nodeData);
        this.nodeFabricObject.setValue(nodeData.getNodeId(), nodeView);
    }

    drawEdge(edgeData: EdgeData) {
        let edgeView = new EdgeView(this.graph, this.canvas, this.nodeFabricObject, this.edgeFabricObject
            , this.callback, edgeData.getEdgeId(), edgeData);
        this.edgeFabricObject.setValue(edgeData.getEdgeId(), edgeView);
    }

    removeNode(nodeData: NodeData) {
        let nodeView = this.nodeFabricObject.remove(nodeData.getNodeId());
        for (const obj of nodeView.getAllFabricElement())
            this.canvas.remove(obj);
        // this.canvas.remove(nodeView.nodeActionImage, nodeView.nodeNameText
        //     , nodeView.nodeSelectingIndicator, nodeView.nodeConnectingIndicator, nodeView.nodeRemoveButton);
    }

    removeEdge(edgeData: EdgeData) {
        let edgeView = this.edgeFabricObject.remove(edgeData.getEdgeId());
        for (const obj of edgeView.getAllFabricElement())
            this.canvas.remove(obj);
    }

    /**
     * (Re)draw the canvas with the data provided 
     * @param graph graph to be drawn onto the canvas
     */
    redraw(): void {

        // Compare Node
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            let node = this.graph.getNodeById(nodeId);
            if (node === undefined) {
                console.log("Delete node");
                this.removeNode(nodeView.nodeData);
            }
            else if (!node.isEqual(nodeView.nodeData)) {
                console.log("update node");
                this.nodeFabricObject.getValue(node.getNodeId()).reinitializeFromModel(node);
                this.canvas.renderAll();
            }

        });

        let allNode: NodeData[] = this.graph.getNodes();
        for (let node of allNode) {
            if (!this.nodeFabricObject.containsKey(node.getNodeId())) {
                console.log("Add node");
                this.drawNode(node);
            }
        }

        // Compare Edge
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            let edge = this.graph.getEdgeById(edgeId);
            if (edge === undefined) {
                console.log("Delete edge");
                this.removeEdge(edgeView.edgeData);
            }
            else if (!edge.isEqual(edgeView.edgeData)) {
                console.log("update edge");
                this.edgeFabricObject.getValue(edge.getEdgeId()).reinitializeFromModel(edge);
                this.canvas.renderAll();
            }

        });

        let allEdge: EdgeData[] = this.graph.getEdges();
        for (let edge of allEdge) {
            if (!this.edgeFabricObject.containsKey(edge.getEdgeId())) {
                console.log("Add edge");
                this.drawEdge(edge);
            }
        }
    }

    /**
     * Register a callback for a specific event
     * @param event event to register to which should be one of the event listed in CanvasEventTypes
     * @param callback a callback function to be called when that specific event is occured
     */
    on(event: CanvasEventTypes, callback: (options: CanvasEventOptions) => void) {
        this.callback.setValue(event, callback);
    }

    private initCanvas() {
        // do not allow any object to move out of canvas area
        this.canvas.on('object:moving', (e) => {
            let obj = e.target;
            // if object is too big ignore
            if (obj.height > this.canvas.getHeight() || obj.width > this.canvas.getWidth()) {
                return;
            }
            obj.setCoords();
            // top-left corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > this.canvas.getHeight() || obj.getBoundingRect().left + obj.getBoundingRect().width > this.canvas.getWidth()) {
                obj.top = Math.min(obj.top, this.canvas.getHeight() - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, this.canvas.getWidth() - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });

        this.canvas.on('mouse:up', (e) => {
            this.panning = false;
        });

        this.canvas.on('mouse:down', (e) => {
            this.panning = true;
        });
    }
}

class NodeView {
    //nodeActionImage: fabric.IImage;  // TODO: should be readonly if posible
    nodeActionImage: fabric.IGroup;
    nodeBorder: fabric.IRect;
    nodeToggle: fabric.ITriangle;
    readonly nodeConnectingIndicator: fabric.ICircle;
    readonly nodeSelectingIndicator: fabric.ICircle;
    readonly nodeNameText: fabric.IText;
    readonly nodeRemoveButton: fabric.IGroup;
    //actionGroup: ActionGroup[] = require("./action.json"); // TODO: refactor into the action class / service

    constructor(public graph: GraphData, readonly canvas: fabric.ICanvas,
        readonly nodeFabricObject: Collections.Dictionary<string, NodeView>,
        readonly edgeFabricObject: Collections.Dictionary<string, EdgeView>,
        readonly callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>,
        readonly id: string, public nodeData: NodeData) {

        // TODO: remove to its own class
        let action = ActionHelper.findActionById(nodeData.getActionId());

        this.nodeActionImage = new fabric.Group();

        const actionType = ActionHelper.getActionTypeById(action.id);
        fabric.loadSVGFromURL('/assets/img/' + actionType + '.svg', (objects, options) => {
            let nodeSvg = fabric.util.groupSVGElements(objects, options);
            nodeSvg.set({
                originX: 'center',
                originY: 'center',
                hasControls: false,
                hasBorders: false,
                scaleX: NODE_SVG_SCALE,
                scaleY: NODE_SVG_SCALE,
            });

            // let nodeSvgBorder = new fabric.Circle();
            // nodeSvgBorder.set({
            // originX: 'center',
            // originY: 'center',
            // fill: 'gray',
            // radius: NODE_SIZE / 2,
            // opacity: 0.15,
            // });

            // let nodeDisplayTag = new fabric.Circle({
            //     radius: NODE_SIZE / 2,
            //     originX: 'center',
            //     originY: 'center',
            //     startAngle: 120,
            //     endAngle: Math.PI,
            //     angle: -17.5,
            //     fill: 'black',
            //     opacity: 0.5,
            // });

            // let nodeDisplayText = new fabric.Text(action.name);
            // nodeDisplayText.set({
            //     fontFamily: "Roboto",
            //     fontSize: NODE_ACTION_NAME_FONTSIZE,
            //     fill: 'white',
            //     originX: 'center',
            //     originY: 'center',
            // });

            this.nodeActionImage.addWithUpdate(nodeSvg);
            // this.nodeActionImage.addWithUpdate(nodeSvgBorder);
            // this.nodeActionImage.addWithUpdate(nodeDisplayTag);
            // this.nodeActionImage.addWithUpdate(nodeDisplayText);

            this.initNodeEvent();
            this.nodeActionImage.set('uid', this.id);
            this.nodeConnectingIndicator.set('uid', this.id);
            this.nodeSelectingIndicator.set('uid', this.id);
            this.nodeNameText.set('uid', this.id);
            this.nodeRemoveButton.set('uid', this.id);
            this.reinitializeFromModel(nodeData);
            //this.canvas.add(this.nodeBorder, this.nodeConnectingIndicator, this.nodeSelectingIndicator, this.nodeNameText, this.nodeActionImage, this.nodeRemoveButton);
            this.canvas.add(this.nodeBorder, this.nodeNameText, this.nodeActionImage, this.nodeRemoveButton, this.nodeToggle);
        });

        this.nodeBorder = new fabric.Rect();

        this.nodeToggle = new fabric.Triangle();

        this.nodeConnectingIndicator = new fabric.Circle();
        this.nodeConnectingIndicator.set({ visible: false });

        this.nodeSelectingIndicator = new fabric.Circle();
        this.nodeSelectingIndicator.set({ visible: false });

        this.nodeNameText = new fabric.IText('');

        let cross_1 = new fabric.Line([
            nodeData.getX() + (NODE_SIZE / 2) - NODE_REMOVEBTN_SIZE,
            nodeData.getY() - (NODE_SIZE / 2),
            nodeData.getX() + (NODE_SIZE / 2),
            nodeData.getY() - (NODE_SIZE / 2) + NODE_REMOVEBTN_SIZE,
        ], {
                originX: 'center',
                originY: 'center',
                strokeWidth: CROSS_WIDTH,
                stroke: 'red'
            });

        let cross_2 = new fabric.Line([
            nodeData.getX() + (NODE_SIZE / 2),
            nodeData.getY() - (NODE_SIZE / 2),
            nodeData.getX() + (NODE_SIZE / 2) - NODE_REMOVEBTN_SIZE,
            nodeData.getY() - (NODE_SIZE / 2) + NODE_REMOVEBTN_SIZE,
        ], {
                originX: 'center',
                originY: 'center',
                strokeWidth: CROSS_WIDTH,
                stroke: 'red'
            });

        this.nodeRemoveButton = new fabric.Group([cross_1, cross_2]);

        this.nodeRemoveButton.set({ visible: false });
    }

    reinitializeFromModel(nodeData: NodeData) {
        this.nodeData = nodeData;

        this.nodeBorder.set({
            width: NODE_SIZE * 2,
            height: NODE_SIZE,
            left: nodeData.getX(),
            top: nodeData.getY(),
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            fill: 'white',
            rx: 5,
            ry: 5,
        });

        // Consider this to be our selecting indicator or connector
        // this.nodeBorder.setShadow({
        //     color: 'black',
        //     blur: 5,
        //     });
        // this.nodeBorder.setCoords();

        this.nodeActionImage.set({
            width: NODE_SIZE,
            height: NODE_SIZE,
            left: nodeData.getX() - NODE_SVG_POS,
            top: nodeData.getY(),
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            stroke: 'black',
            strokeWidth: 1,
        });
        this.nodeActionImage.setCoords();

        this.nodeToggle.set({
            left: nodeData.getX() + NODE_SVG_POS,
            top: nodeData.getY(),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE / 2,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 180,
            fill: '#444a62',
            hasControls: false,
            hasBorders: false
        });
        this.nodeToggle.setCoords();

        // set text position and remove stroke
        // this.nodeActionImage.item(3).set({
        //     fontFamily: "Roboto",
        //     top: 20,
        //     stroke: 'rgba(0,0,0,0)',
        // });
        // this.nodeActionImage.item(3).setCoords();

        // this.nodeConnectingIndicator.set({
        //     left: nodeData.getX(),
        //     top: nodeData.getY(),
        //     radius: (NODE_SIZE / 2) + 5,
        //     stroke: 'yellow',
        //     strokeWidth: 15,
        //     opacity: 0.5,
        //     fill: 'rgba(0,0,0,0)',
        //     originX: 'center',
        //     originY: 'center',
        //     hasControls: false,
        //     hasBorders: false,
        //     selectable: false
        // });
        // this.nodeConnectingIndicator.setCoords();

        // this.nodeSelectingIndicator.set({
        //     left: nodeData.getX(),
        //     top: nodeData.getY(),
        //     radius: (NODE_SIZE / 2) + 5,
        //     stroke: '#66afe9',
        //     strokeWidth: 10,
        //     opacity: 0.2,
        //     fill: 'rgba(0,0,0,0)',
        //     originX: 'center',
        //     originY: 'center',
        //     hasControls: false,
        //     hasBorders: false,
        //     selectable: false
        // });
        // this.nodeSelectingIndicator.setCoords();

        this.nodeNameText.set({
            left: nodeData.getX(),
            top: nodeData.getY() + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE,
            hasControls: false,
            hasBorders: false,
            text: nodeData.getActionParams('name')[0],
            fontFamily: "Roboto",
        });
        this.nodeNameText.setCoords();

        this.nodeRemoveButton.set({
            left: nodeData.getX() + NODE_REMOVEBTN_POSX,
            top: nodeData.getY() - NODE_REMOVEBTN_POSY,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            //visible: false
        });
        this.nodeRemoveButton.setCoords();

    }

    getAllFabricElement(): fabric.IObject[] {
        // return [this.nodeBorder, this.nodeActionImage, this.nodeConnectingIndicator, this.nodeSelectingIndicator
        //     , this.nodeNameText, this.nodeRemoveButton];
        return [this.nodeBorder, this.nodeActionImage,
            , this.nodeNameText, this.nodeRemoveButton, this.nodeToggle];
    }

    private initNodeEvent() {
        this.nodeActionImage.on('moving', (e) => {
            this.nodeRemoveButton.visible = false;
            this.moveNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop());
        });

        this.nodeActionImage.on('modified', (e) => {
            this.nodeRemoveButton.visible = true;
            this.moveNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop(), true);
        });

        this.nodeActionImage.on('selected', (e) => {
            this.nodeSelectingIndicator.visible = true;
            this.nodeRemoveButton.visible = true;

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        });

        this.nodeNameText.on('moving', (options) => {
            this.nodeRemoveButton.visible = false;
            this.moveNode(this.nodeNameText.getLeft(), this.nodeNameText.getTop() - NODE_NAME_YPOS);
        });

        this.nodeNameText.on('modified', (options) => {
            this.nodeRemoveButton.visible = true;
            this.moveNode(this.nodeNameText.getLeft(), this.nodeNameText.getTop() - NODE_NAME_YPOS, true);
        });

        this.nodeNameText.on('selected', (options) => {
            this.nodeSelectingIndicator.visible = true;
            this.nodeRemoveButton.visible = true;

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        });

        this.nodeRemoveButton.on('selected', (options) => {
            this.deleteNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop());
        });
    }

    moveNode(originX: number, originY: number, shouldEmittedEvent: boolean = false) {
        // move every components to the new location
        this.nodeActionImage.set({ left: originX, top: originY });
        this.nodeNameText.set({ left: originX, top: originY + NODE_NAME_YPOS });
        this.nodeConnectingIndicator.set({ left: originX, top: originY });
        this.nodeSelectingIndicator.set({ left: originX, top: originY });
        this.nodeRemoveButton.set({ left: originX + NODE_REMOVEBTN_POSX, top: originY - NODE_REMOVEBTN_POSY });

        // any edge that is already connected to this node, will be moved depends on this node new location
        // this must be done before connect to the new edge otherwise the new edge will also be moved according
        // to diffX and diffY calculate in calculateNewEdgePoint
        for (let edge of this.graph.getEdgesBySrcNode(this.nodeData.getNodeId())) {
            let [startX, startY] = this.calculateNewEdgePoint(edge.getStartX(), edge.getStartY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((edge.getEndY() - startY), (edge.getEndX() - startX));
            edgeView.moveEdge(startX, startY, edge.getEndX(), edge.getEndY(), angle);
            if (shouldEmittedEvent) {
                this.callback.getValue('edge:connectionSrc')({
                    target_id: edge.getEdgeId(),
                    start_x: startX,
                    start_y: startY,
                    end_x: edge.getEndX(),
                    end_y: edge.getEndY(),
                    src_node_id: edge.getSourceNodeId(),
                });
            }
        }
        for (let edge of this.graph.getEdgesByDstNode(this.nodeData.getNodeId())) {
            let [endX, endY] = this.calculateNewEdgePoint(edge.getEndX(), edge.getEndY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((endY - edge.getStartY()), (endX - edge.getStartX()));
            edgeView.moveEdge(edge.getStartX(), edge.getStartY(), endX, endY, angle);
            if (shouldEmittedEvent) {
                this.callback.getValue('edge:connectionDst')({
                    target_id: edge.getEdgeId(),
                    start_x: edge.getStartX(),
                    start_y: edge.getStartY(),
                    end_x: endX,
                    end_y: endY,
                    dst_node_id: edge.getDestinationNodeId(),
                });
            }
        }

        // show connecting indicator when this node is moving into the boundary of edge(s) that
        // this node hasn't connected to yet. The connecting indicator is shown only when we aren't
        // emitted an event (moving event) otherwise we won't have chance to clear the indicator.
        this.nodeConnectingIndicator.visible = false;
        //this.nodeRemoveButton.visible = false;
        let edge = this.getEdgeInRange(originX, originY);
        for (let e of edge.src) {
            if (e.getSourceNodeId() !== this.nodeData.getNodeId()) {
                if (shouldEmittedEvent) {
                    let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getStartX(), e.getStartY());
                    this.callback.getValue('edge:connectionSrc')({
                        target_id: e.getEdgeId(),
                        start_x: connectionPoint.x,
                        start_y: connectionPoint.y,
                        end_x: e.getEndX(),
                        end_y: e.getEndY(),
                        src_node_id: this.nodeData.getNodeId(),
                    });
                } else {
                    this.nodeConnectingIndicator.visible = true;
                }
            }
        }
        for (let e of edge.dest) {
            if (e.getDestinationNodeId() !== this.nodeData.getNodeId()) {
                if (shouldEmittedEvent) {
                    let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getEndX(), e.getEndY());
                    this.callback.getValue('edge:connectionDst')({
                        target_id: e.getEdgeId(),
                        start_x: e.getStartX(),
                        start_y: e.getStartY(),
                        end_x: connectionPoint.x,
                        end_y: connectionPoint.y,
                        dst_node_id: this.nodeData.getNodeId(),
                    });
                } else {
                    this.nodeConnectingIndicator.visible = true;
                }
            }
        }

        if (shouldEmittedEvent) {
            this.callback.getValue('node:move')({
                target_id: this.nodeData.getNodeId(),
                center_x: originX,
                center_y: originY,
            });
        }
    }

    private deselectAllNode() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeSelectingIndicator.visible = false;
            nodeView.nodeRemoveButton.visible = false;
        });
    }

    private deselectAllEdge() {
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            edgeView.dotHead.visible = false;
            edgeView.dotTail.visible = false;
            edgeView.edgeDeleteBtn.visible = false;
        });
    }

    private deleteNode(originX: number, originY: number) {
        let edge = this.getEdgeInRange(originX, originY);

        // disconnect every edge connected to this node
        for (let e of edge.src) {
            if (e.getSourceNodeId() === this.nodeData.getNodeId()) {
                this.callback.getValue('edge:connectionSrc')({
                    target_id: e.getEdgeId(),
                    start_x: e.getStartX(),
                    start_y: e.getStartY(),
                    end_x: e.getEndX(),
                    end_y: e.getEndY(),
                    src_node_id: '',
                });
            }
        }
        for (let e of edge.dest) {
            if (e.getDestinationNodeId() === this.nodeData.getNodeId()) {
                this.callback.getValue('edge:connectionDst')({
                    target_id: e.getEdgeId(),
                    start_x: e.getStartX(),
                    start_y: e.getStartY(),
                    end_x: e.getEndX(),
                    end_y: e.getEndY(),
                    dst_node_id: '',
                });
            }
        }

        //this.canvas.deactivateAllWithDispatch();

        // remove this node
        this.callback.getValue('node:remove')({
            target_id: this.nodeData.getNodeId(),
        });
    }

    // helper functions

    private calculateNewEdgePoint(oldEdgeX: number, oldEdgeY: number): [number, number] {
        // original position of node
        let originX = this.nodeData.getX();
        let originY = this.nodeData.getY();

        // calculate diff from original position
        let difX = Math.abs(originX - oldEdgeX);
        let difY = Math.abs(originY - oldEdgeY);

        // Apply diffX/diffY to currentX/currentY to find new edge start point 
        // (diff is unchanged because node and egde are moved by the same amount)
        let currentX = this.nodeActionImage.getLeft();
        let currentY = this.nodeActionImage.getTop();
        if ((oldEdgeX < originX) && (oldEdgeY > originY)) {
            return [currentX - difX, currentY + difY];
        }
        if ((oldEdgeX < originX) && (oldEdgeY < originY)) {
            return [currentX - difX, currentY - difY];
        }
        if ((oldEdgeX > originX) && (oldEdgeY < originY)) {
            return [currentX + difX, currentY - difY];
        }
        if ((oldEdgeX > originX) && (oldEdgeY > originY)) {
            return [currentX + difX, currentY + difY];
        }
    }

    private calculateConnectionPoint(originX: number, originY: number, pointX: number, pointY: number): Coordinate {
        let angle = Math.atan2((pointY - originY), (pointX - originX));
        let x = originX + (NODE_SIZE / 2 - 2) * Math.cos(angle);
        let y = originY + (NODE_SIZE / 2 - 2) * Math.sin(angle);
        return { x: x, y: y };
    }

    private getEdgeInRange(newStartX: number, newStartY: number): { 'src': EdgeData[], 'dest': EdgeData[] } {
        let inRangeEdgeSrc: EdgeData[] = this.graph.getEdgeInRangeSrc(newStartX, newStartY);
        let inRangeEdgeDst: EdgeData[] = this.graph.getEdgeInRangeDst(newStartX, newStartY);
        return { 'src': inRangeEdgeSrc, 'dest': inRangeEdgeDst };
    }

    public deselect() {
        this.nodeSelectingIndicator.visible = false;
        this.nodeRemoveButton.visible = false;
    }

}

class TriggerImageLoader {
    private image: Map<string, fabric.IPathGroup>;
    private static instance: TriggerImageLoader;

    private constructor() {
        this.image = new Map<string, fabric.IPathGroup>();
    }

    static getInstance() {
        if (!TriggerImageLoader.instance) {
            TriggerImageLoader.instance = new TriggerImageLoader();
        }
        return TriggerImageLoader.instance;
    }

    hasImage(id: string): boolean {
        return this.image.has(id);
    }

    loadImageAsync(id: string, callback: (img: fabric.IPathGroup) => void) {
        const triggerType = TriggerHelper.getTriggerTypeById(id);
        if (!this.image.has(id)) {
            fabric.loadSVGFromURL('/assets/img/' + triggerType + '.svg', (objects, options) => {
                const triggerSvg = fabric.util.groupSVGElements(objects, options);
                this.image.set(id, triggerSvg);
                callback(fabric.util.object.clone(triggerSvg));
            });
        } else {
            callback(fabric.util.object.clone(this.image.get(id)));
        }
    }

    loadImage(id: string): fabric.IPathGroup {
        return fabric.util.object.clone(this.image.get(id));
    }
}

class EdgeView {

    readonly line: fabric.ILine;
    readonly triangle: fabric.ITriangle;
    readonly dotHead: fabric.ICircle;
    readonly dotTail: fabric.ICircle;
    readonly triggerDescription: fabric.IGroup;
    triggerDeleteBtn: Array<any> = [];
    edgeDeleteBtn: fabric.IGroup;

    constructor(public graph: GraphData, readonly canvas: fabric.ICanvas,
        readonly nodeFabricObject: Collections.Dictionary<string, NodeView>,
        readonly edgeFabricObject: Collections.Dictionary<string, EdgeView>,
        readonly callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>,
        readonly id: string, public edgeData: EdgeData) {

        let startX = edgeData.getStartX();
        let startY = edgeData.getStartY();
        let endX = edgeData.getEndX();
        let endY = edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));   // in radian
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        this.line = new fabric.Line([], {
            originX: 'center',
            originY: 'center',
            perPixelTargetFind: true
        });

        this.triangle = new fabric.Triangle();

        this.dotHead = new fabric.Circle();
        this.dotHead.set({ visible: false });

        this.dotTail = new fabric.Circle();
        this.dotTail.set({ visible: false });

        this.triggerDescription = new fabric.Group();

        this.triggerDeleteBtn = [];

        let cross_1 = new fabric.Line([5, 0, 5, 10], {
            originX: 'center',
            originY: 'center',
            strokeWidth: CROSS_WIDTH,
            stroke: 'red'
        });

        let cross_2 = new fabric.Line([0, 5, 10, 5], {
            originX: 'center',
            originY: 'center',
            strokeWidth: CROSS_WIDTH,
            stroke: 'red'
        });

        this.edgeDeleteBtn = new fabric.Group([cross_1, cross_2]);

        let promises: Promise<void>[] = [];
        for (const trigger of this.edgeData.getTrigger()) {
            promises.push(new Promise<void>((resolve, reject) => {
                TriggerImageLoader.getInstance().loadImageAsync(trigger.getTriggerId(), (img) => {
                    resolve()
                });
            }));
        }
        Promise.all(promises).then(() => {
            this.initEdgeEvent();
            this.triggerDescription.set('uid', this.id);
            this.line.set('uid', this.id);
            this.triangle.set('uid', this.id);
            this.dotHead.set('uid', this.id);
            this.dotTail.set('uid', this.id);
            this.reinitializeFromModel(edgeData);
            this.canvas.add(this.edgeDeleteBtn, this.triggerDescription, this.line, this.triangle, this.dotTail, this.dotHead);
        });
    }

    getAllFabricElement(): fabric.IObject[] {
        return [this.edgeDeleteBtn, this.triggerDescription, this.line, this.triangle, this.dotHead, this.dotTail].concat(this.triggerDeleteBtn);
    }

    private initEdgeEvent() {
        this.line.on('moving', (options) => {
            this.edgeDeleteBtn.visible = false;
            for (let del of this.triggerDeleteBtn)
                del.visible = false;

            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginLineX = this.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2;
            let currentOriginLineY = this.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2;
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, false);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle);
        });
        this.line.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginLineX = this.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2;
            let currentOriginLineY = this.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2;
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, true);

            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }

            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle, true);
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;
        });
        this.line.on('selected', (options) => {
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;

            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.triggerDescription.on('moving', (options) => {
            this.edgeDeleteBtn.visible = false;
            for (let del of this.triggerDeleteBtn)
                del.visible = false;

            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginDesX = this.triggerDescription.getLeft();
            let currentOriginDesY = this.triggerDescription.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromDesOrigin(currentOriginDesX, currentOriginDesY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, false);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle);
        });

        this.triggerDescription.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginDesX = this.triggerDescription.getLeft();
            let currentOriginDesY = this.triggerDescription.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromDesOrigin(currentOriginDesX, currentOriginDesY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, true);
            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle, true);
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;
        });

        this.triggerDescription.on('selected', (options) => {
            this.dotHead.visible = true;
            this.dotTail.visible = true
            this.edgeDeleteBtn.visible = true;
            for (const obj of this.triggerDeleteBtn)
                obj.visible = true;

            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.triangle.on('moving', (options) => {
            this.edgeDeleteBtn.visible = false;
            for (let del of this.triggerDeleteBtn)
                del.visible = false;
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginTriangleX = this.triangle.getLeft();
            let currentOriginTriangleY = this.triangle.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromTriangleOrigin(currentOriginTriangleX, currentOriginTriangleY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, false);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle);
        });
        this.triangle.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentOriginTriangleX = this.triangle.getLeft();
            let currentOriginTriangleY = this.triangle.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromTriangleOrigin(currentOriginTriangleX, currentOriginTriangleY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            let edge: combineEdge = this.findIntersectionPoint(nStartX, nStartY, nEndX, nEndY, true);
            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
            this.processEdgeEvent(nStartX, nStartY, nEndX, nEndY, angle, true);
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;
        });
        this.triangle.on('selected', (options) => {
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (const obj of this.triggerDeleteBtn)
                obj.visible = true;

            // this.callback.getValue('object:deselected')({});
            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.dotHead.on('moving', (options) => {
            this.edgeDeleteBtn.visible = false;

            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            let newAngle = Math.atan2((endY - newStartY), (endX - newStartX));
            this.moveEdge(newStartX, newStartY, endX, endY, newAngle);
            this.processEdgeEvent(newStartX, newStartY, endX, endY, newAngle);
        });
        this.dotHead.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            let newAngle = Math.atan2((endY - newStartY), (endX - newStartX));
            this.moveEdge(newStartX, newStartY, endX, endY, newAngle);
            this.processEdgeEvent(newStartX, newStartY, endX, endY, newAngle, true);
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;
        });

        this.dotTail.on('moving', (options) => {
            this.edgeDeleteBtn.visible = false;

            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            let newAngle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            this.moveEdge(startX, startY, currentEndX, currentEndY, newAngle);
            this.processEdgeEvent(startX, startY, currentEndX, currentEndY, newAngle);
        });
        this.dotTail.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            let newAngle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            this.moveEdge(startX, startY, currentEndX, currentEndY, newAngle);
            this.processEdgeEvent(startX, startY, currentEndX, currentEndY, newAngle, true);
            this.dotHead.visible = true;
            this.dotTail.visible = true;
            this.edgeDeleteBtn.visible = true;
            for (let del of this.triggerDeleteBtn)
                del.visible = true;

        });

        this.edgeDeleteBtn.on('selected', (options) => {
            this.callback.getValue('edge:remove')({
                target_id: this.edgeData.getEdgeId(),
            });
        });
    }


    reinitializeFromModel(edgeData: EdgeData) {
        this.edgeData = edgeData;
        let startX = edgeData.getStartX();
        let startY = edgeData.getStartY();
        let endX = edgeData.getEndX();
        let endY = edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));   // in radian
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        this.line.set({
            x1: startX,
            y1: startY,
            x2: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            y2: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            originX: 'center',
            originY: 'center',
            strokeWidth: EDGE_ARROW_WIDTH,
            stroke: '#444a62',
            hasControls: false,
            hasBorders: false
        });
        this.line.setCoords();

        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
            fill: '#444a62',
            hasControls: false,
            hasBorders: false
        });
        this.triangle.setCoords();

        let leftEdgeDel, topEdgeDel = 0;
        let angleInDegree = (angle * (180 / Math.PI));
        if (Math.abs(angleInDegree) > 90) {
            leftEdgeDel = endX + EDGE_DELBTN_DISTANCE * Math.sin(-angle);
            topEdgeDel = endY + EDGE_DELBTN_DISTANCE * Math.cos(-angle);
        } else {
            leftEdgeDel = endX - EDGE_DELBTN_DISTANCE * Math.sin(-angle);
            topEdgeDel = endY - EDGE_DELBTN_DISTANCE * Math.cos(-angle);
        }
        this.edgeDeleteBtn.set({
            left: leftEdgeDel,
            top: topEdgeDel,
            originX: 'center',
            originY: 'center',
            angle: 45 + (angle * 180 / Math.PI),
            hasControls: false,
            hasBorders: false,
            perPixelTargetFind: true,
            visible: false,
        });
        this.edgeDeleteBtn.setCoords();

        this.dotHead.set({
            left: startX,
            top: startY,
            radius: EDGE_DOT_RADIUS,
            fill: '#444a62',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        });
        this.dotHead.setCoords();

        this.dotTail.set({
            left: endX,
            top: endY,
            radius: EDGE_DOT_RADIUS,
            fill: '#444a62',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        })
        this.dotTail.setCoords();

        for (const obj of this.triggerDescription.getObjects().concat()) {
            obj.setCoords();
            this.triggerDescription.remove(obj);
        }


        for (let i = 0; i < this.triggerDeleteBtn.length; i++) {
            for (const obj of this.triggerDeleteBtn[i].getObjects().concat()) {
                obj.setCoords();
                this.triggerDeleteBtn[i].remove(obj);
            }
        }

        this.triggerDeleteBtn = [];
        let svgAddSequence = [];
        const triggers: TriggerData[] = edgeData.getTrigger();

        for (let trigger of triggers) {
            let triggerType = TriggerHelper.getTriggerTypeById(trigger.getTriggerId());
            let triggerInfo = TriggerHelper.findTriggerById(trigger.getTriggerId());
            let triggerIndex = trigger.getTriggerIndex();

            let triggerSvg = TriggerImageLoader.getInstance().loadImage(trigger.getTriggerId());
            triggerSvg.set({
                originX: 'center',
                originY: 'center',
                scaleX: EDGE_SVG_SCALE,
                scaleY: EDGE_SVG_SCALE,
            });

            let triggerText = new fabric.Text('');
            triggerText.set({
                fontFamily: "Roboto",
                fontSize: TRIGGER_DESCRIP,
                originX: 'center',
                originY: 'center',
            });

            let cross_1 = new fabric.Line([5, 0, 5, 10], {
                originX: 'center',
                originY: 'center',
                strokeWidth: CROSS_WIDTH,
                stroke: 'red'
            });

            let cross_2 = new fabric.Line([0, 5, 10, 5], {
                originX: 'center',
                originY: 'center',
                strokeWidth: CROSS_WIDTH,
                stroke: 'red'
            });

            let deleteBtn = new fabric.Group([cross_1, cross_2]);
            this.triggerDeleteBtn.push(deleteBtn)
            svgAddSequence.push(triggerIndex);

            triggerSvg.setCoords();
            triggerText.setCoords();
            cross_1.setCoords();
            cross_2.setCoords();
            deleteBtn.setCoords();

            deleteBtn.set('id', triggerIndex);

            deleteBtn.on('selected', (options) => {
                this.callback.getValue('trigger:remove')({
                    target_id: this.edgeData.getEdgeId(),
                    triggerIndex: triggerIndex,
                });
            });

            this.triggerDescription.addWithUpdate(triggerSvg);
            this.triggerDescription.addWithUpdate(triggerText);
        }


        // Update display text of each trigger
        for (const trigger of triggers) {
            const args = [];
            const triggerName = trigger.getTriggerParams('name');
            //const triggerInfo = TriggerHelper.findTriggerById(trigger.getTriggerId());
            // for (const paramName of triggerInfo.display_text_param) {
            //     args.push(trigger.getTriggerParams(paramName));
            // }
            // const text = triggerInfo.display_text.replace(/{(\d+)}/g, (match, number) => {
            //     return typeof args[number] !== 'undefined' ? args[number] : match;
            // });

            // group contains fabric.image follow by fabric.text so the index of fabric.text elements
            // in a group are (trigger's index * 2) +1
            (<fabric.IText><any>this.triggerDescription.item(trigger.getTriggerIndex() * 2 + 1)).setText(triggerName[0]);
        }

        let widthGroup: number = 0;
        this.triggerDescription.forEachObject((currentObject, index, allObjects) => {
            widthGroup += currentObject.getWidth();
        });

        // // calculate position of group
        // let [left, top, newAngle] = this.getTopLeftForDescription(angle);
        this.setObjectPositionWithinDescriptionGroup();

        // // Calculate offset from center of each object in a group
        // let numberOfTrigger = this.triggerDescription.size();

        // // Calculate this to add delBtn match with triggerSVG
        // let angleInDegree = (angle * (180 / Math.PI));
        // let k: number = 0;
        // let delBtnIndex = 0;
        // if (Math.abs(angleInDegree) > 90)
        //     k = this.triggerDeleteBtn.length - 1;

        // for (let i = 0; i < numberOfTrigger; i++) {
        //     let distance = (widthGroup / 2) - (this.triggerDescription.item(i).getWidth() / 2);
        //     for (let j = i + 1; j < numberOfTrigger; j++) {
        //         distance -= this.triggerDescription.item(j).getWidth();
        //     }
        //     this.triggerDescription.item(i).set({
        //         left: distance,
        //         top: 0
        //     });
        //     this.triggerDescription.item(i).setCoords();

        //     // Set delete btn position to locate at right-top of nodeSvg
        //     if (i % 2 == 0) {
        //         let leftBtn, topBtn: number;
        //         let angleDelBtn: number;

        //         if (Math.abs(angleInDegree) < 90) {
        //             if (distance < 0) {
        //                 leftBtn = left - Math.abs(distance) * Math.cos(-angle) + 30 * Math.cos(-(angle - 45));
        //                 topBtn = top + Math.abs(distance) * Math.sin(-angle) - 30 * Math.sin(-(angle - 45));
        //             }
        //             if (distance > 0) {
        //                 leftBtn = left + Math.abs(distance) * Math.cos(-angle) + 30 * Math.cos(-(angle - 45));
        //                 topBtn = top - Math.abs(distance) * Math.sin(-angle) - 30 * Math.sin(-(angle - 45));
        //             }
        //         } else {
        //             leftBtn = left + distance * Math.cos(-angle) + 30 * Math.cos(-angle - 45);
        //             topBtn = top - distance * Math.sin(-angle) - 30 * Math.sin(-angle - 45);
        //         }

        //         this.triggerDeleteBtn[/*btnIndex*/k].set({
        //             left: leftBtn,
        //             top: topBtn,
        //             angle: 45 + newAngle,
        //             perPixelTargetFind: true,
        //             hasControls: false,
        //             hasBorders: false,
        //             visible: false,
        //         });

        //         this.triggerDeleteBtn[k].setCoords();
        //         this.canvas.add(this.triggerDeleteBtn[k]);
        //         if (Math.abs(angleInDegree) > 90) {
        //             k--;
        //         } else {
        //             k++;
        //         }
        //     }
        // }

        // this.triggerDescription.set({
        //     width: widthGroup,
        //     hasControls: false,
        //     hasBorders: false,
        //     left: left,
        //     top: top,
        //     angle: newAngle,
        //     originX: 'center',
        //     originY: 'center',
        //     perPixelTargetFind: true
        // })
        // this.triggerDescription.setCoords();

        this.canvas.renderAll();
    }

    setObjectPositionWithinDescriptionGroup() {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));   // in radian

        console.log('HERE', this.triggerDescription.size());
        let widthGroup: number = 0;
        this.triggerDescription.forEachObject((currentObject, index, allObjects) => {
            widthGroup += currentObject.getWidth();
        });

        // calculate position of group
        let [left, top, newAngle] = this.getTopLeftForDescription(angle);

        // Calculate offset from center of each object in a group
        let numberOfTrigger = this.triggerDescription.size();

        // Calculate this to add delBtn match with triggerSVG
        let angleInDegree = (angle * (180 / Math.PI));
        let k: number = 0;
        if (Math.abs(angleInDegree) > 90)
            k = this.triggerDeleteBtn.length - 1;

        for (let i = 0; i < numberOfTrigger; i++) {
            let distance = (widthGroup / 2) - (this.triggerDescription.item(i).getWidth() / 2);
            for (let j = i + 1; j < numberOfTrigger; j++) {
                distance -= this.triggerDescription.item(j).getWidth();
            }
            this.triggerDescription.item(i).set({
                left: distance,
                top: 0
            });
            this.triggerDescription.item(i).setCoords();

            // Set delete btn position to locate at right-top of nodeSvg
            if (i % 2 == 0) {
                let leftBtn, topBtn: number;
                let angleDelBtn: number;

                if (Math.abs(angleInDegree) < 90) {
                    if (distance < 0) {
                        leftBtn = left - Math.abs(distance) * Math.cos(-angle) + 30 * Math.cos(-(angle - 45));
                        topBtn = top + Math.abs(distance) * Math.sin(-angle) - 30 * Math.sin(-(angle - 45));
                    }
                    if (distance > 0) {
                        leftBtn = left + Math.abs(distance) * Math.cos(-angle) + 30 * Math.cos(-(angle - 45));
                        topBtn = top - Math.abs(distance) * Math.sin(-angle) - 30 * Math.sin(-(angle - 45));
                    }
                } else {
                    leftBtn = left + distance * Math.cos(-angle) + 30 * Math.cos(-angle - 45);
                    topBtn = top - distance * Math.sin(-angle) - 30 * Math.sin(-angle - 45);
                }

                this.triggerDeleteBtn[k].set({
                    left: leftBtn,
                    top: topBtn,
                    angle: 45 + newAngle,
                    perPixelTargetFind: true,
                    hasControls: false,
                    hasBorders: false,
                    visible: false,
                });

                this.triggerDeleteBtn[k].setCoords();
                this.canvas.add(this.triggerDeleteBtn[k]);
                if (Math.abs(angleInDegree) > 90) {
                    k--;
                } else {
                    k++;
                }
            }
        }

        this.triggerDescription.set({
            width: widthGroup,
            hasControls: false,
            hasBorders: false,
            left: left,
            top: top,
            angle: newAngle,
            originX: 'center',
            originY: 'center',
            perPixelTargetFind: true
        })
        this.triggerDescription.setCoords();
    }

    getTopLeftForDescription(angle: number) {
        let top: number, left: number;
        let newTop: number, newLeft: number;

        left = this.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2;
        top = this.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2;
        let angleInDegree = (angle * (180 / Math.PI));

        if (Math.abs(angleInDegree) > 90)
            return [left + (EDGE_IMAGE_DISTANCE * Math.sin(-angle)), top + (EDGE_IMAGE_DISTANCE * Math.cos(-angle)), (angle * 180 / Math.PI) + 180];
        else
            return [left - (EDGE_IMAGE_DISTANCE * Math.sin(-angle)), top - (EDGE_IMAGE_DISTANCE * Math.cos(-angle)), (angle * 180 / Math.PI)];
    }

    findIntersectionPoint(x1: number, y1: number, x2: number, y2: number, shouldEmittedEvent: boolean): combineEdge {
        let x3, y3, x4, y4: number;
        let allEdge: EdgeData[] = this.graph.getEdges();
        let movingEdge: EdgeData;

        for (let edge of allEdge) {
            x3 = edge.getStartX(); y3 = edge.getStartY();
            x4 = edge.getEndX(); y4 = edge.getEndY();

            let a_dx = x2 - x1;
            let a_dy = y2 - y1;
            let b_dx = x4 - x3;
            let b_dy = y4 - y3;

            // This is the moving edge, must not compare with itself!
            // Otherwise it will paint itself to be red too.
            if (this.edgeData.getEdgeId() === edge.getEdgeId())
                continue;

            if (this.edgeData.getEdgeId() !== edge.getEdgeId()) {
                // For the case where two lines are parallel to each other
                if ((y1 === y2) && (y3 === y4) && ((x3 > x1 && x3 < x2) || (x4 > x1 && x4 < x2))) {
                    if (y1 - y3 >= -10 && y1 - y3 <= 10) {
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'red');
                            edgeView.triangle.set('fill', 'red');
                        }
                        return { toBeMissing: this.edgeData, toBeCombined: edge };
                    } else {
                        // No intersection point, paint arrow's color back to black
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'black');
                            edgeView.triangle.set('fill', 'black');
                        }
                    }
                } else if (x1 === x2 && x3 === x4 && ((y3 > y1 && y3 < y2) || (y4 > y1 && y4 < y2))) {
                    if (x1 - x3 >= -10 && x1 - x3 <= 10) {
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'red');
                            edgeView.triangle.set('fill', 'red');
                        }
                        return { toBeMissing: this.edgeData, toBeCombined: edge };
                    } else {
                        // No intersection point, paint arrow's color back to black
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'black');
                            edgeView.triangle.set('fill', 'black');
                        }
                    }
                } else if (y1 !== y2 || y3 !== y4 || x1 !== x2 || x3 !== x4) {
                    let s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
                    let t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
                    let a = (s >= 0 && s <= 1 && t >= 0 && t <= 1);
                    if (a === true) {
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'red');
                            edgeView.triangle.set('fill', 'red');
                        }
                        return { toBeMissing: this.edgeData, toBeCombined: edge };
                    } else {
                        // No intersection point, paint arrow's color back to black
                        let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                        if (!shouldEmittedEvent) {
                            edgeView.line.set('stroke', 'black');
                            edgeView.triangle.set('fill', 'black');
                        }
                    }
                }
            }
        }
    }

    combineEdge(edge: combineEdge) {
        this.callback.getValue('edge:combine')({
            toBeMissing: edge.toBeMissing,
            toBeCombined: edge.toBeCombined
        });
    }

    getCurrentPointAfterReinitialize() {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));
        return [startX, startY, endX, endY, angle];
    }

    moveEdge(startX: number, startY: number, endX: number, endY: number, angle: number) {
        // move every components to the new location
        this.line.set({
            x1: startX, y1: startY,
            x2: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            y2: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        });
        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            angle: 90 + (angle * 180 / Math.PI)
        });

        let top, left, newAngle: number;
        [left, top, newAngle] = this.getTopLeftForDescription(angle);

        this.triggerDescription.set({
            left: left,
            top: top,
            angle: newAngle,
        });

        this.dotHead.set({ left: startX, top: startY });
        this.dotTail.set({ left: endX, top: endY });

        for (let delBtn of this.triggerDeleteBtn) {
            delBtn.set({ visible: false });
        }
    }

    private deselectAllEdge() {
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            edgeView.dotHead.visible = false;
            edgeView.dotTail.visible = false;
        });
    }

    private deselectAllNode() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeSelectingIndicator.visible = false;
            nodeView.nodeRemoveButton.visible = false;
        });
    }

    processEdgeEvent(startX: number, startY: number, endX: number, endY: number, angle: number, shouldEmittedEvent: boolean = false) {
        // clear connecting indicator of every node
        this.clearNodeConnectingIndicator();

        // show node's connecting indicator when this edge is moving into the boundary of node(s) that
        // this edge hasn't connected to yet. The connecting indicator is shown only when we aren't
        // emitted an event (edge is moving) otherwise we won't have chance to clear the indicator.
        let headConnectionPoint: Coordinate, tailConnectionPoint: Coordinate;
        let nodeAtHead = this.graph.getNodeInRange(startX, startY);
        if (nodeAtHead !== undefined) {
            if (shouldEmittedEvent) {
                headConnectionPoint = this.calculateConnectionPoint(nodeAtHead.getX(), nodeAtHead.getY(), startX, startY);
                this.callback.getValue('edge:connectionSrc')({
                    target_id: this.edgeData.getEdgeId(),
                    start_x: headConnectionPoint.x,
                    start_y: headConnectionPoint.y,
                    end_x: endX,
                    end_y: endY,
                    src_node_id: nodeAtHead.getNodeId(),
                });
                // we only show the connecting indicator when we will not emit event (moving) otherwise
                // we won't have a chance to clear it
            } else {
                this.nodeFabricObject.getValue(nodeAtHead.getNodeId()).nodeConnectingIndicator.visible = true;
            }
        }
        let nodeAtTail = this.graph.getNodeInRange(endX, endY);
        if (nodeAtTail !== undefined) {
            if (shouldEmittedEvent) {
                tailConnectionPoint = this.calculateConnectionPoint(nodeAtTail.getX(), nodeAtTail.getY(), endX, endY);
                this.callback.getValue('edge:connectionDst')({
                    target_id: this.edgeData.getEdgeId(),
                    start_x: (nodeAtHead !== undefined) ? headConnectionPoint.x : startX,
                    start_y: (nodeAtHead !== undefined) ? headConnectionPoint.y : startY,
                    end_x: tailConnectionPoint.x,
                    end_y: tailConnectionPoint.y,
                    dst_node_id: nodeAtTail.getNodeId(),
                });
            } else {
                this.nodeFabricObject.getValue(nodeAtTail.getNodeId()).nodeConnectingIndicator.visible = true;
            }
        }

        // emitted edge:move when there wasn't any connection made otherwise the edge:connection_ 
        // callback is used and edge:move is not needed
        if (shouldEmittedEvent && (nodeAtHead === undefined) && (nodeAtTail === undefined)) {
            this.callback.getValue('edge:move')({
                target_id: this.edgeData.getEdgeId(),
                start_x: startX,
                start_y: startY,
                end_x: endX,
                end_y: endY,
            });
        }
    }

    // helper function

    // TODO: add type
    getLineCoordinateFromOrigin(currentOriginLineX: number, currentOriginLineY: number) {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];
        } else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        } else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];
        } else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        }
    }

    private getLineOriginFromTriangleOrigin(currentOriginTriangleX, currentOriginTriangleY) {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;
        // triangle origin offset ()
        let offsetX = EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
        let offsetY = EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginTriangleX - difX + offsetX, currentOriginTriangleY + difY + offsetY];
        } else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginTriangleX - difX + offsetX, currentOriginTriangleY - difY + offsetY];
        } else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginTriangleX + difX + offsetX, currentOriginTriangleY + difY + offsetY];
        } else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginTriangleX + difX + offsetX, currentOriginTriangleY - difY + offsetY];
        }
    }

    private getLineOriginFromDesOrigin(currentOriginDesX, currentOriginDesY) {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        let top = this.triggerDescription.getTop();
        let left = this.triggerDescription.getLeft();
        let angleInDegree = (angle * (180 / Math.PI));
        let offsetX, offsetY: number;

        if (Math.abs(angleInDegree) > 90) {
            offsetX = left + (EDGE_IMAGE_DISTANCE * Math.sin(angle));
            offsetY = top - (EDGE_IMAGE_DISTANCE * Math.cos(angle));
            return [offsetX, offsetY];
        } else {
            offsetX = left - (EDGE_IMAGE_DISTANCE * Math.sin(angle));
            offsetY = top + (EDGE_IMAGE_DISTANCE * Math.cos(angle));
            return [offsetX, offsetY];
        }

    }

    private calculateConnectionPoint(originX: number, originY: number, pointX: number, pointY: number): Coordinate {
        let angle = Math.atan2((pointY - originY), (pointX - originX));
        let x = originX + (NODE_SIZE / 2 - 2) * Math.cos(angle);
        let y = originY + (NODE_SIZE / 2 - 2) * Math.sin(angle);
        return { x: x, y: y };
    }

    private clearNodeConnectingIndicator() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeConnectingIndicator.visible = false;
        })
    }

    public deselect() {
        this.dotHead.visible = false;
        this.dotTail.visible = false;
    }
}

