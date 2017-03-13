
import 'fabric';
import * as Collections from 'typescript-collections';

import { Action, ActionGroup, ActionHelper } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { GraphData, NodeData, EdgeData, TriggerData } from './graphmodel';
import { PropertyValue } from './propertyvalue';
import { BezierCurve } from './curvehelper';

/* display constants */
const NODE_SIZE_WIDTH: number = 120;
const NODE_SIZE_HEIGHT: number = 50;
const NODE_SIZE: number = 50;
const NODE_SVG_POS: number = 35;
const NODE_NAME_YPOS: number = 40;
const NODE_NAME_FONTSIZE: number = 14;
const NODE_SVG_SCALE: number = 0.7;
const NODE_ACTION_NAME_FONTSIZE: number = 14;
const NODE_REMOVEBTN_POSX: number = (NODE_SIZE_WIDTH / 2) - 8;
const NODE_REMOVEBTN_POSY: number = (NODE_SIZE_HEIGHT / 2) - 8;
const NODE_REMOVEBTN_SIZE: number = 5;
const EDGE_ARROW_HEAD_SIZE: number = 10;
const EDGE_ARROW_WIDTH: number = 2;
const EDGE_SVG_SCALE: number = 0.6;
const EDGE_IMAGE_SIZE: number = 50;
const EDGE_IMAGE_DISTANCE: number = 40;
const EDGE_DOT_RADIUS: number = 3;
const EDGE_DELBTN_DISTANCE: number = 15;
const TRIGGER_DESC_FONT_SIZE: number = 12;
const TRIGGER_NAME_DISTANCE: number = 20;
const TRIGGER_SPACE: number = 5;
const CROSS_WIDTH: number = 2;

export interface CanvasEventOptions {
    target_id?: string,
    src_node_id?: string, // Unique id of the source node
    dst_node_id?: string, // Unique id of the destination node
    start_x?: number,     // Parameters needed to display the edge on the screen
    start_y?: number,
    center_x?: number,      // display_x for node, and center_x for middle point of edge
    center_y?: number,      // display_y for node, and center_y for middle point of edge
    param?: string,
    end_x?: number,
    end_y?: number,
    toBeMissing?: EdgeData,     // EdgeData of edge that is going to disappear from canvas
    toBeCombined?: EdgeData,     // EdgeData of edge that is going to be combined
    triggerIndex?: number,
    connect_direction_src?: string,
    connect_direction_dst?: string
}

export type CanvasEventTypes = 'node:selected' | 'node:move' | 'node:remove' | 'action:update' | 'edge:move' | 'object:deselected'
    | 'edge:connectionDst' | 'edge:connectionSrc' | 'edge:selected' | 'edge:combine' | 'trigger:remove' | 'edge:remove' | 'trigger:update'
    | 'mouse:up' | 'mouse:down' | 'mouse:move';

type Coordinate = {
    x: number,
    y: number,
    d: string
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

        this.canvas.preserveObjectStacking = true;

        this.canvas.on('selection:cleared', (e) => {
            this.deselectAllNode();
            this.deselectAllEdge();
            console.log('selection:cleared');
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
                    //this.callback.getValue('object:deselected')({});
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
        // keep track of one edge that is selected in the group selection
        // so that we can calculate dx and dy and apply to other edge
        let edgeSelected: EdgeView;
        let oldLeft = 0;
        let oldTop = 0;

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

            // keep track of current left/top to calculate dx/dy in selection clear
            if (selectedEdge.size() !== 0) {
                edgeSelected = selectedEdge.toArray()[selectedEdge.toArray().length - 1];
                oldLeft = edgeSelected.triangle.getLeft();
                oldTop = edgeSelected.triangle.getTop();
                console.log('keep old', oldLeft, oldTop);
            }

            this.canvas.setActiveGroup(selectedGroup);
        });

        this.canvas.on('selection:cleared', (e) => {
            // Proceed only if user clear a group selection because selection:cleared is also emitted when we clear single object selection
            if (selectedGroup !== undefined) {

                let dx, dy;
                if (selectedEdge.size() !== 0) {
                    dx = edgeSelected.triangle.getLeft() - oldLeft;
                    dy = edgeSelected.triangle.getTop() - oldTop;
                    console.log('new', edgeSelected.triangle.getLeft() , edgeSelected.triangle.getTop() );
                    console.log('diff', dx, dy);
                }

                // We move the edge first otherwise moveNode will override edge.line position and we won't know
                selectedEdge.forEach((edge) => {

                    edge.shiftEdge(dx, dy);
                    edge.processEdgeEvent(true);


                    // let startX = edge.edgeData.getStartX();
                    // let startY = edge.edgeData.getStartY();
                    // let endX = edge.edgeData.getEndX();
                    // let endY = edge.edgeData.getEndY();
                    // let angle = Math.atan2((endY - startY), (endX - startX));
                    // [startX, endX, startY, endY] = edge.getLineCoordinateFromOrigin(edge.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2
                    //     , edge.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2);
                    // edge.moveEdge(startX, startY, endX, endY, angle);
                    // edge.processEdgeEvent(startX, startY, endX, endY, angle, true);
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
                            center_x: edgeData.getCenterX(),
                            center_y: edgeData.getCenterY(),
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
                            center_x: edgeData.getCenterX(),
                            center_y: edgeData.getCenterY(),
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
            nodeView.nodeRemoveButton.visible = false;
            nodeView.nodeActionImage.setShadow({
                color: '#fff',
            });
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

        if (this.edgeFabricObject.containsKey(data.uid)) {
            const triggerDesSize = this.edgeFabricObject.getValue(data.uid).triggerDescription.size();
            for (let i = 0; i < triggerDesSize; i++) {
                // change only text, odd index
                if (i % 2 === 1) {
                    for (let param of data.children[Math.floor(i / 2)].param) {
                        if (param.name === 'name')
                            continue;
                        else {
                            let operat = param.value[0];
                            let value = param.value[1];
                            let arg = param.value[2];
                            (<fabric.IText><any>this.edgeFabricObject.getValue(data.uid).triggerDescription.item(i)).setText(operat + ' ' + value + ' ' + arg);
                            let edge = this.edgeFabricObject.getValue(data.uid);
                            edge.setObjectPositionWithinDescriptionGroup();
                        }
                    }
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
    }

    removeEdge(edgeData: EdgeData) {
        let edgeView = this.edgeFabricObject.remove(edgeData.getEdgeId());
        for (const obj of edgeView.getAllFabricElement()) {
            console.log('x', obj);
            this.canvas.remove(obj);
        }
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
    readonly nodeNameText: fabric.IText;
    readonly nodeRemoveButton: fabric.IGroup;
    //actionGroup: ActionGroup[] = require("./action.json"); // TODO: refactor into the action class / service
    toggle: boolean;

    constructor(public graph: GraphData, readonly canvas: fabric.ICanvas,
        readonly nodeFabricObject: Collections.Dictionary<string, NodeView>,
        readonly edgeFabricObject: Collections.Dictionary<string, EdgeView>,
        readonly callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>,
        readonly id: string, public nodeData: NodeData) {

        // TODO: remove to its own class
        let action = ActionHelper.findActionById(nodeData.getActionId());

        this.nodeActionImage = new fabric.Group();

        const actionType = ActionHelper.getActionTypeById(action.id);
        fabric.loadSVGFromURL(action.img_path, (objects, options) => {
            let nodeSvg = fabric.util.groupSVGElements(objects, options);
            nodeSvg.set({
                originX: 'center',
                originY: 'center',
                hasControls: false,
                hasBorders: false,
                scaleX: NODE_SVG_SCALE,
                scaleY: NODE_SVG_SCALE,
                left: nodeData.getX() - NODE_SVG_POS,
                top: nodeData.getY()
            });


            let nodeSvgBorder = new fabric.Rect();
            nodeSvgBorder.set({
                width: NODE_SIZE_WIDTH,
                height: NODE_SIZE_HEIGHT,
                left: nodeData.getX(),
                top: nodeData.getY(),
                originX: 'center',
                originY: 'center',
                hasControls: false,
                hasBorders: false,
                stroke: '#85858f',
                fill: '#f4f4f5',
                rx: 5,
                ry: 5,
            });

            const text = action.name.replace(/ /g, "\n");

            let nodeDisplayText = new fabric.Text(text);
            nodeDisplayText.set({
                fontFamily: "Roboto",
                fontSize: NODE_ACTION_NAME_FONTSIZE,
                originX: 'center',
                originY: 'center',
                left: nodeData.getX() + (NODE_SVG_POS / 2),
                top: nodeData.getY(),
            });

            this.nodeActionImage.addWithUpdate(nodeSvgBorder);
            this.nodeActionImage.addWithUpdate(nodeSvg);
            this.nodeActionImage.addWithUpdate(nodeDisplayText);

            this.initNodeEvent();
            this.nodeActionImage.set('uid', this.id);
            this.nodeNameText.set('uid', this.id);
            this.nodeRemoveButton.set('uid', this.id);
            this.reinitializeFromModel(nodeData);
            this.canvas.add(this.nodeNameText, this.nodeActionImage, this.nodeRemoveButton);
        });

        this.nodeBorder = new fabric.Rect();

        this.nodeToggle = new fabric.Triangle();

        this.nodeNameText = new fabric.IText('');

        let cross_1 = new fabric.Line([
            0, 0, 8, 8
        ], {
                originX: 'center',
                originY: 'center',
                strokeWidth: CROSS_WIDTH,
                stroke: 'red'
            });

        let cross_2 = new fabric.Line([
            0, 8, 8, 0
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

        this.nodeActionImage.set({
            width: NODE_SIZE_WIDTH,
            height: NODE_SIZE_HEIGHT,
            left: nodeData.getX(),
            top: nodeData.getY(),
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
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

        this.nodeNameText.set({
            left: nodeData.getX(),
            top: nodeData.getY() + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE,
            hasControls: false,
            hasBorders: false,
            //text: nodeData.getActionParams('name')[0],
            fontFamily: "Roboto",
        });

        let args = [];
        const text = nodeData.getActionParams('name')[0].replace(/\n/g, (match, number) => {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });

        this.nodeNameText.setText(text);
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
        return [this.nodeBorder, this.nodeActionImage,
            , this.nodeNameText, this.nodeRemoveButton];
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
            this.nodeRemoveButton.visible = true;
            this.nodeActionImage.setShadow({
                color: '#66afe9',
                blur: 10,
            });

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        });

        this.nodeToggle.on('selected', (options) => {
            console.log("Toggle!");
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
            this.nodeRemoveButton.visible = true;

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        });

        this.nodeNameText.on('editing:exited', (options) => {
            this.callback.getValue('action:update')({
                target_id: this.nodeData.getNodeId(),
                param: this.nodeNameText.getText()
            });
        });

        this.nodeRemoveButton.on('selected', (options) => {
            this.deleteNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop());
        });
    }

    moveNode(originX: number, originY: number, shouldEmittedEvent: boolean = false) {
        this.nodeActionImage.setShadow({
            color: '#66afe9',
            blur: 10,
        });
        // move every components to the new location
        this.nodeActionImage.set({ left: originX, top: originY });
        this.nodeNameText.set({ left: originX, top: originY + NODE_NAME_YPOS });
        this.nodeRemoveButton.set({ left: originX + NODE_REMOVEBTN_POSX, top: originY - NODE_REMOVEBTN_POSY });

        // any edge that is already connected to this node, will be moved depends on this node new location
        // this must be done before connect to the new edge otherwise the new edge will also be moved according
        // to diffX and diffY calculate in calculateNewEdgePoint
        for (let edge of this.graph.getEdgesBySrcNode(this.nodeData.getNodeId())) {
            let [startX, startY] = this.calculateNewEdgePoint(edge.getStartX(), edge.getStartY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((edge.getEndY() - startY), (edge.getEndX() - startX));
            edgeView.moveEdge(startX, startY, edge.getEndX(), edge.getEndY());
            let connectionPoint = this.calculateConnectionPoint(originX, originY, startX, startY);
            if (shouldEmittedEvent) {
                this.callback.getValue('edge:connectionSrc')({
                    target_id: edge.getEdgeId(),
                    start_x: startX,
                    start_y: startY,
                    center_x: edgeView.curve.getCenterPoint()[0],
                    center_y: edgeView.curve.getCenterPoint()[1],
                    end_x: edge.getEndX(),
                    end_y: edge.getEndY(),
                    src_node_id: edge.getSourceNodeId(),
                    connect_direction_src: connectionPoint.d
                });
            }
        }
        for (let edge of this.graph.getEdgesByDstNode(this.nodeData.getNodeId())) {
            let [endX, endY] = this.calculateNewEdgePoint(edge.getEndX(), edge.getEndY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((endY - edge.getStartY()), (endX - edge.getStartX()));
            edgeView.moveEdge(edge.getStartX(), edge.getStartY(), endX, endY);
            let connectionPoint = this.calculateConnectionPoint(originX, originY, endX, endY);
            if (shouldEmittedEvent) {
                this.callback.getValue('edge:connectionDst')({
                    target_id: edge.getEdgeId(),
                    start_x: edge.getStartX(),
                    start_y: edge.getStartY(),
                    center_x: edgeView.curve.getCenterPoint()[0],
                    center_y: edgeView.curve.getCenterPoint()[1],
                    end_x: endX,
                    end_y: endY,
                    dst_node_id: edge.getDestinationNodeId(),
                    connect_direction_dst: connectionPoint.d
                });
            }
        }

        // show connecting indicator when this node is moving into the boundary of edge(s) that
        // this node hasn't connected to yet. The connecting indicator is shown only when we aren't
        // emitted an event (moving event) otherwise we won't have chance to clear the indicator.
        let edge = this.getEdgeInRange(originX, originY);
        for (let e of edge.src) {
            if (e.getSourceNodeId() !== this.nodeData.getNodeId()) {
                if (shouldEmittedEvent) {
                    let edgeView = this.edgeFabricObject.getValue(e.getEdgeId());
                    let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getStartX(), e.getStartY());
                    this.callback.getValue('edge:connectionSrc')({
                        target_id: e.getEdgeId(),
                        start_x: connectionPoint.x,
                        start_y: connectionPoint.y,
                        center_x: edgeView.curve.getCenterPoint()[0],
                        center_y: edgeView.curve.getCenterPoint()[1],
                        end_x: e.getEndX(),
                        end_y: e.getEndY(),
                        src_node_id: this.nodeData.getNodeId(),
                        connect_direction_src: connectionPoint.d
                    });
                } else {
                    this.nodeActionImage.setShadow({
                        color: 'yellow',
                        blur: 10,
                    });
                }
            }
        }
        for (let e of edge.dest) {
            if (e.getDestinationNodeId() !== this.nodeData.getNodeId()) {
                if (shouldEmittedEvent) {
                    let edgeView = this.edgeFabricObject.getValue(e.getEdgeId());
                    let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getEndX(), e.getEndY());
                    this.callback.getValue('edge:connectionDst')({
                        target_id: e.getEdgeId(),
                        start_x: e.getStartX(),
                        start_y: e.getStartY(),
                        center_x: edgeView.curve.getCenterPoint()[0],
                        center_y: edgeView.curve.getCenterPoint()[1],
                        end_x: connectionPoint.x,
                        end_y: connectionPoint.y,
                        dst_node_id: this.nodeData.getNodeId(),
                        connect_direction_dst: connectionPoint.d
                    });
                } else {
                    this.nodeActionImage.setShadow({
                        color: 'yellow',
                        blur: 10,
                    });
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
            nodeView.nodeActionImage.setShadow({
                color: '#fff',
            });
        });
    }

    private deselectAllEdge() {
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            edgeView.dotHead.visible = false;
            edgeView.dotTail.visible = false;
            edgeView.edgeDeleteBtn.visible = false;
            for (let delBtn of edgeView.triggerDeleteBtn)
                delBtn.visible = false;
        });
    }

    private deleteNode(originX: number, originY: number) {
        let edge = this.getEdgeInRange(originX, originY);

        // disconnect every edge connected to this node
        for (let e of edge.src) {
            if (e.getSourceNodeId() === this.nodeData.getNodeId()) {
                let edgeView = this.edgeFabricObject.getValue(e.getEdgeId());
                this.callback.getValue('edge:connectionSrc')({
                    target_id: e.getEdgeId(),
                    start_x: e.getStartX(),
                    start_y: e.getStartY(),
                    center_x: edgeView.curve.getCenterPoint()[0],
                    center_y: edgeView.curve.getCenterPoint()[1],
                    end_x: e.getEndX(),
                    end_y: e.getEndY(),
                    src_node_id: '',
                    connect_direction_src: ''
                });
            }
        }
        for (let e of edge.dest) {
            if (e.getDestinationNodeId() === this.nodeData.getNodeId()) {
                let edgeView = this.edgeFabricObject.getValue(e.getEdgeId());
                this.callback.getValue('edge:connectionDst')({
                    target_id: e.getEdgeId(),
                    start_x: e.getStartX(),
                    start_y: e.getStartY(),
                    center_x: edgeView.curve.getCenterPoint()[0],
                    center_y: edgeView.curve.getCenterPoint()[1],
                    end_x: e.getEndX(),
                    end_y: e.getEndY(),
                    dst_node_id: '',
                    connect_direction_dst: ''
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
        let additionX: number, additionY: number;

        // original position of node
        let originX = this.nodeData.getX();
        let originY = this.nodeData.getY();

        // calculate diff from original position
        let difX = originX - oldEdgeX;
        let difY = originY - oldEdgeY;;

        // Apply diffX/diffY to currentX/currentY to find new edge start point 
        // (diff is unchanged because node and egde are moved by the same amount)
        let currentX = this.nodeActionImage.getLeft();
        let currentY = this.nodeActionImage.getTop();
        if (difX < 0 && difY === 0) {
            return [currentX - difX, currentY];
        }
        if (difX === 0 && difY > 0) {
            return [currentX, currentY - difY];
        }
        if (difX > 0 && difY === 0) {
            return [currentX - difX, currentY];
        }
        if (difX === 0 && difY < 0) {
            return [currentX, currentY - difY];
        }
    }

    private calculateConnectionPoint(originX: number, originY: number, pointX: number, pointY: number): Coordinate {
        let x: number, y: number, d: string;

        let angle = Math.atan2((pointY - originY), (pointX - originX)) * 180 / Math.PI;
        if (angle >= -25 && angle <= 15) {
            //Connect at right side
            x = originX + 60;
            y = originY;
            d = 'r';
        } else if (angle > 15 && angle <= 160) {
            //Connect at bottom side
            x = originX;
            y = originY + 25;
            d = 'b';
        } else if ((angle > 160 && angle <= 180) || (angle < -160 && angle >= -180)) {
            //Connect at left side 
            x = originX - 60;
            y = originY;
            d = 'l';
        } else if (angle < -25 && angle >= -160) {
            //Connect at top side 
            x = originX;
            y = originY - 25;
            d = 't';
        }

        return { x: x, y: y, d: d };
    }

    private getEdgeInRange(newStartX: number, newStartY: number): { 'src': EdgeData[], 'dest': EdgeData[] } {
        let inRangeEdgeSrc: EdgeData[] = this.graph.getEdgeInRangeSrc(newStartX, newStartY);
        let inRangeEdgeDst: EdgeData[] = this.graph.getEdgeInRangeDst(newStartX, newStartY);
        return { 'src': inRangeEdgeSrc, 'dest': inRangeEdgeDst };
    }

    public deselect() {
        this.nodeRemoveButton.visible = false;
        this.nodeActionImage.setShadow({
            color: '#fff',
        });
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
        const trigger = TriggerHelper.findTriggerById(id);
        if (!this.image.has(id)) {
            fabric.loadSVGFromURL(trigger.img_path, (objects, options) => {
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
    readonly line: fabric.IPath;
    readonly curveControlPoint: fabric.ICircle;
    readonly triangle: fabric.ITriangle;
    readonly dotHead: fabric.ICircle;
    readonly dotTail: fabric.ICircle;
    readonly triggerDescription: fabric.IGroup;
    triggerName: fabric.IText[] = [];
    triggerDeleteBtn: Array<any> = [];
    edgeDeleteBtn: fabric.IGroup;
    gap: number[];
    path;

    curve: BezierCurve;

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
        let oldLeft, oldTop;

        this.line = new fabric.Path([
            ['M', 0, 0],
            ['C', 0, 0, 0, 0, 0, 0],
            ['C', 0, 0, 0, 0, 0, 0]
        ]);

        this.line.set({
            objectCaching: false,
            perPixelTargetFind: true,
        });

        this.curveControlPoint = new fabric.Circle();
        this.curveControlPoint.set({ visible: false });

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

        //remove trigger's name for each trigger from canvas
        if (this.triggerName.length !== 0) {
            for (let i = 0; i < this.triggerName.length; i++) {
                this.triggerName[i].setCoords();
                this.canvas.remove(this.triggerName[i]);
            }
        }

        this.triggerName = [];

        // Create each trigger's name and add its event
        for (let t of edgeData.getTrigger()) {
            let eachTrigger = new fabric.IText('');
            eachTrigger.set('uid', this.id);
            eachTrigger.on('editing:exited', (options) => {
                this.callback.getValue('trigger:update')({
                    target_id: this.edgeData.getEdgeId(),
                    triggerIndex: t.getTriggerIndex(),
                    param: eachTrigger.getText()
                });
            });
            eachTrigger.on('selected', (options) => {
                this.selectEdge();

                oldLeft = eachTrigger.getLeft();
                oldTop = eachTrigger.getTop();

                this.callback.getValue('edge:selected')({
                    target_id: this.edgeData.getEdgeId(),
                });
            });
            eachTrigger.on('moving', (options) => {
                this.deselectEdge();
                let dx = eachTrigger.getLeft() - oldLeft;
                let dy = eachTrigger.getTop() - oldTop;

                oldLeft = eachTrigger.getLeft();
                oldTop = eachTrigger.getTop();

                this.shiftEdge(dx, dy);

                // let edge: combineEdge = this.findIntersectionPoint(false);
                let edge = this.findIntersectionPoint(false);
                this.processEdgeEvent();
            });
            eachTrigger.on('modified', (options) => {
                let dx = eachTrigger.getLeft() - oldLeft;
                let dy = eachTrigger.getTop() - oldTop;

                this.shiftEdge(dx, dy);
                this.processEdgeEvent(true);
                this.selectEdge();
            });
            this.triggerName.push(eachTrigger);
        }



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
            this.curveControlPoint.set('uid', this.id);
            this.triangle.set('uid', this.id);
            this.dotHead.set('uid', this.id);
            this.dotTail.set('uid', this.id);

            // Set uid to all element in triggerName then add each one to canvas
            for (let i = 0; i < edgeData.getTrigger().length; i++) {
                this.canvas.add(this.triggerName[i]);
            }

            this.reinitializeFromModel(edgeData);
            this.canvas.add(this.edgeDeleteBtn, this.triggerDescription, this.line, this.curveControlPoint, this.triangle, this.dotTail, this.dotHead);
        });
    }

    getAllFabricElement(): fabric.IObject[] {
        return [this.edgeDeleteBtn, this.triggerDescription, this.line, this.curveControlPoint, this.triangle, this.dotHead, this.dotTail].concat(this.triggerDeleteBtn).concat(this.triggerName);
    }

    private initEdgeEvent() {
        let oldLeft, oldTop;

        this.line.on('moving', (options) => {
            this.deselectEdge();
            let dx = this.line.getLeft() - oldLeft;
            let dy = this.line.getTop() - oldTop;
            oldLeft = this.line.getLeft();
            oldTop = this.line.getTop();
            this.shiftEdge(dx, dy);
            // let edge: combineEdge = this.findIntersectionPoint(false);
            let edge: combineEdge = this.findIntersectionPoint(false);
            this.processEdgeEvent();
        });
        this.line.on('modified', (options) => {
            let dx = this.line.getLeft() - oldLeft;
            let dy = this.line.getTop() - oldTop;
            this.shiftEdge(dx, dy);
            let edge: combineEdge = this.findIntersectionPoint(true);
            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }
            this.processEdgeEvent(true);
            this.selectEdge();
        });
        this.line.on('selected', (options) => {
            this.selectEdge();
            oldLeft = this.line.getLeft();
            oldTop = this.line.getTop();
            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.triggerDescription.on('moving', (options) => {
            this.deselectEdge();
            let dx = this.triggerDescription.getLeft() - oldLeft;
            let dy = this.triggerDescription.getTop() - oldTop;
            oldLeft = this.triggerDescription.getLeft();
            oldTop = this.triggerDescription.getTop();
            this.shiftEdge(dx, dy);
            // let edge: combineEdge = this.findIntersectionPoint(false);
            let edge: combineEdge = this.findIntersectionPoint(false);
            this.processEdgeEvent();
        });
        this.triggerDescription.on('modified', (options) => {
            let dx = this.triggerDescription.getLeft() - oldLeft;
            let dy = this.triggerDescription.getTop() - oldTop;
            this.shiftEdge(dx, dy);
            let edge: combineEdge = this.findIntersectionPoint(true);
            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }
            this.processEdgeEvent(true);
            this.selectEdge();
        });
        this.triggerDescription.on('selected', (options) => {
            this.selectEdge();
            oldLeft = this.triggerDescription.getLeft();
            oldTop = this.triggerDescription.getTop();
            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.triangle.on('moving', (options) => {
            this.deselectEdge();
            let dx = this.triangle.getLeft() - oldLeft;
            let dy = this.triangle.getTop() - oldTop;
            oldLeft = this.triangle.getLeft();
            oldTop = this.triangle.getTop();
            this.shiftEdge(dx, dy);
            // let edge: combineEdge = this.findIntersectionPoint(false);
            let edge: combineEdge = this.findIntersectionPoint(false);
            this.processEdgeEvent();
        });
        this.triangle.on('modified', (options) => {
            let dx = this.triangle.getLeft() - oldLeft;
            let dy = this.triangle.getTop() - oldTop;
            this.shiftEdge(dx, dy);
            let edge: combineEdge = this.findIntersectionPoint(true);
            if (edge !== undefined) {
                this.combineEdge(edge);
                return;
            }
            this.processEdgeEvent(true);
            this.selectEdge();
        });
        this.triangle.on('selected', (options) => {
            this.selectEdge();
            oldLeft = this.triangle.getLeft();
            oldTop = this.triangle.getTop();
            this.callback.getValue('edge:selected')({
                target_id: this.edgeData.getEdgeId(),
            });
        });

        this.dotHead.on('moving', (options) => {
            this.deselectEdge();
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            this.moveEdge(newStartX, newStartY, endX, endY);
            this.processEdgeEvent();
        });
        this.dotHead.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            this.moveEdge(newStartX, newStartY, endX, endY);
            this.processEdgeEvent(true);
            this.selectEdge();
        });

        this.dotTail.on('moving', (options) => {
            this.deselectEdge();
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            this.moveEdge(startX, startY, currentEndX, currentEndY);
            this.processEdgeEvent();
        });
        this.dotTail.on('modified', (options) => {
            let [startX, startY, endX, endY, angle] = this.getCurrentPointAfterReinitialize();
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            this.moveEdge(startX, startY, currentEndX, currentEndY);
            this.processEdgeEvent(true);
            this.selectEdge();
        });

        this.curveControlPoint.on('moving', (options) => {
            let x = this.curveControlPoint.getLeft();
            let y = this.curveControlPoint.getTop();
            this.curve.moveCenterPoint(x, y);
            // move line
            this.line.path = this.curve.getSVGArray();
            this.updatePathDimension(this.line);
            this.line.setCoords();
            // Set all elements within group of trigger's description
            this.setObjectPositionWithinDescriptionGroup();
        });
        this.curveControlPoint.on('modified', (options) => {
            this.processEdgeEvent(true);
            this.selectEdge();
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
        let oldLeft, oldTop;

        this.curve = BezierCurve.fromStartEndPoint(startX, startY, edgeData.getConnectDirection_Src(), endX, endY, edgeData.getConnectDirection_Dst());
        this.curve.moveCenterPoint(edgeData.getCenterX(), edgeData.getCenterY());
        this.line.path[0] = this.curve.getSVGArray()[0];
        this.line.path[1] = this.curve.getSVGArray()[1];
        this.line.path[2] = this.curve.getSVGArray()[2];

        this.line.set({
            fill: '',
            strokeWidth: EDGE_ARROW_WIDTH,
            stroke: '#444a62',
            hasControls: true,
            hasBorders: true,
            perPixelTargetFind: true,
        });

        this.updatePathDimension(this.line);
        this.line.setCoords();

        this.curveControlPoint.set({
            left: this.curve.getCenterPoint()[0],
            top: this.curve.getCenterPoint()[1],
            radius: EDGE_DOT_RADIUS,
            fill: '#444a62',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false
        });
        this.curveControlPoint.setCoords();

        let triangleAngle = this.curve.getAngle(0.99);

        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2,
            top: endY,
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + triangleAngle,
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

        //remove trigger's name for each trigger from canvas
        if (this.triggerName.length !== 0) {
            for (let i = 0; i < this.triggerName.length; i++) {
                this.triggerName[i].setCoords();
                this.canvas.remove(this.triggerName[i]);
            }
            this.triggerName = [];
        }

        if (this.triggerName.length === 0) {
            // Create each trigger's name and add its event
            for (let t of edgeData.getTrigger()) {
                let eachTrigger = new fabric.IText('');
                eachTrigger.set('uid', this.id);
                eachTrigger.on('editing:exited', (options) => {
                    this.callback.getValue('trigger:update')({
                        target_id: this.edgeData.getEdgeId(),
                        triggerIndex: t.getTriggerIndex(),
                        param: eachTrigger.getText()
                    });
                });
                eachTrigger.on('selected', (options) => {
                    this.selectEdge();

                    oldLeft = eachTrigger.getLeft();
                    oldTop = eachTrigger.getTop();

                    this.callback.getValue('edge:selected')({
                        target_id: this.edgeData.getEdgeId(),
                    });
                });
                eachTrigger.on('moving', (options) => {
                    this.deselectEdge();
                    let dx = eachTrigger.getLeft() - oldLeft;
                    let dy = eachTrigger.getTop() - oldTop;

                    oldLeft = eachTrigger.getLeft();
                    oldTop = eachTrigger.getTop();

                    this.shiftEdge(dx, dy);

                    // let edge: combineEdge = this.findIntersectionPoint(false);
                    let edge = this.findIntersectionPoint(false);
                    this.processEdgeEvent();
                });
                eachTrigger.on('modified', (options) => {
                    let dx = eachTrigger.getLeft() - oldLeft;
                    let dy = eachTrigger.getTop() - oldTop;

                    this.shiftEdge(dx, dy);
                    this.processEdgeEvent(true);
                    this.selectEdge();
                });
                this.triggerName.push(eachTrigger);
            }

            // Set uid to all element in triggerName then add each one to canvas
            for (let i = 0; i < edgeData.getTrigger().length; i++) {
                this.canvas.add(this.triggerName[i]);
            }
        }

        // remove each element in trigger description group from canvas
        for (const obj of this.triggerDescription.getObjects().concat()) {
            obj.setCoords();
            this.triggerDescription.remove(obj);
        }

        // remove trigger's delete button for each trigger from canvas
        for (let i = 0; i < this.triggerDeleteBtn.length; i++) {
            for (const obj of this.triggerDeleteBtn[i].getObjects().concat()) {
                obj.setCoords();
                this.triggerDeleteBtn[i].remove(obj);
            }
        }

        this.triggerDeleteBtn = [];
        let svgAddSequence = [];
        const triggers: TriggerData[] = edgeData.getTrigger();

        // Create elements in triggerDescription (SVG and param display text)
        // also the delete button for each trigger of this edge
        for (let trigger of triggers) {
            let triggerType = TriggerHelper.getTriggerTypeById(trigger.getTriggerId());
            let triggerInfo = TriggerHelper.findTriggerById(trigger.getTriggerId());
            let triggerIndex = trigger.getTriggerIndex();

            let triggerSvg = TriggerImageLoader.getInstance().loadImage(trigger.getTriggerId());
            triggerSvg.set({
                originX: 'center',
                originY: 'center',
                scaleX: EDGE_SVG_SCALE,
                scaleY: EDGE_SVG_SCALE
            });

            triggerSvg.getWidth() / 2

            let triggerText = new fabric.IText('');
            triggerText.set({
                fontFamily: "Roboto",
                fontSize: TRIGGER_DESC_FONT_SIZE,
                originX: 'center',
                originY: 'center',
                padding: 5
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
            deleteBtn.set('uid', this.id);
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

        //Set trigger's name
        for (let i = 0; i < triggers.length; i++) {
            const triggerName = triggers[i].getTriggerParams('name')
            this.triggerName[i].setText(triggerName[0]);
            this.triggerName[i].set({
                fontFamily: "Roboto",
                fontSize: TRIGGER_DESC_FONT_SIZE,
                originX: 'left',
                originY: 'center',
                hasControls: false,
                hasBorders: false,
            });
        }

        // Update display param text of each trigger
        for (const trigger of triggers) {
            const args = [];
            const triggerInfo = TriggerHelper.findTriggerById(trigger.getTriggerId());
            for (const paramName of triggerInfo.display_text_param) {
                args.push(trigger.getTriggerParams(paramName).join(' '));
            }
            const text = triggerInfo.display_text.replace(/{(\d+)}/g, (match, number) => {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });

            // group contains fabric.image follow by fabric.text so the index of fabric.text elements
            // in a group are (trigger's index * 2) +1
            (<fabric.IText><any>this.triggerDescription.item(trigger.getTriggerIndex() * 2 + 1)).setText(text);
        }

        this.setObjectPositionWithinDescriptionGroup();

        this.canvas.calcOffset();
        this.canvas.renderAll();
    }

    updatePathDimension(line) {
        var dims = line._parseDimensions();
        line.setWidth(dims.width);
        line.setHeight(dims.height);
        line.pathOffset.x = line.width / 2;
        line.pathOffset.y = line.height / 2;
        line.setCoords();
        this.canvas.calcOffset();
        this.canvas.renderAll();
    }

    setObjectPositionWithinDescriptionGroup() {
        this.gap = [];
        let triggerWidth = 0;

        // find gap
        for (let i = 0; i < this.triggerDescription.size(); i += 2) {
            const g = this.triggerName[i / 2].getBoundingRect().width
                - this.triggerDescription.item(i).getBoundingRect().width
                - this.triggerDescription.item(i + 1).getBoundingRect().width;
            if (g < 0)
                this.gap.push(0);
            else
                this.gap.push(g);
        }

        // Find the width of this group (calculate only svg and its param)
        let widthGroup: number = 0;
        this.triggerDescription.forEachObject((currentObject, index, allObjects) => {
            widthGroup += currentObject.getBoundingRect().width;
        });

        for (let g of this.gap) {
            widthGroup += g;
        }

        widthGroup += (this.gap.length - 1) * TRIGGER_SPACE;

        // calculate position of group
        let [left, top, newAngle] = this.getTopLeftForDescription();

        // Calculate offset from center of each object in a group
        let numberOfTrigger = this.triggerDescription.size();

        for (let i = 0; i < numberOfTrigger; i++) {
            let distance = (widthGroup / 2) - (this.triggerDescription.item(i).getBoundingRect().width / 2);
            for (let j = i + 1; j < numberOfTrigger; j++) {
                distance -= this.triggerDescription.item(j).getBoundingRect().width;
            }
            for (let k = Math.floor(i / 2); k < this.gap.length; k++) {
                distance -= this.gap[k];
            }

            distance -= (this.gap.length - Math.floor(i / 2) - 1) * TRIGGER_SPACE;

            if (i % 2 === 0) {
                const tangent = this.curve.getCompensatedTangentVector(0.5);
                const normal = this.curve.getCompensatedNormalVector(0.5);
                this.triggerName[Math.floor(i / 2)].set({
                    left: left + ((distance - (this.triggerDescription.item(i).getBoundingRect().width / 2)) * tangent[0]) + (TRIGGER_NAME_DISTANCE * normal[0]),
                    top: top + ((distance - (this.triggerDescription.item(i).getBoundingRect().width / 2)) * tangent[1]) + (TRIGGER_NAME_DISTANCE * normal[1]),
                    angle: newAngle,

                });
                this.triggerName[Math.floor(i / 2)].setCoords();
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
                const tangent = this.curve.getCompensatedTangentVector(0.5);
                const normal = this.curve.getCompensatedNormalVector(0.5);

                this.triggerDeleteBtn[Math.floor(i / 2)].set({
                    left: left + ((distance + (this.triggerDescription.item(Math.floor(i / 2) * 2 + 1).getBoundingRect().width)) * tangent[0]) - (TRIGGER_NAME_DISTANCE * normal[0]),
                    top: top + ((distance + (this.triggerDescription.item(Math.floor(i / 2) * 2 + 1).getBoundingRect().width)) * tangent[1]) - (TRIGGER_NAME_DISTANCE * normal[1]),
                    angle: 45 + newAngle,
                    perPixelTargetFind: true,
                    hasControls: false,
                    hasBorders: false,
                    visible: false,
                });

                this.triggerDeleteBtn[Math.floor(i / 2)].setCoords();
                this.triggerDeleteBtn[Math.floor(i / 2)].set('uid', this.id);
                this.canvas.add(this.triggerDeleteBtn[Math.floor(i / 2)]);
            }
        }

        this.triggerDescription.set({
            left: left,
            top: top,
            angle: newAngle,
            originX: 'center',
            originY: 'center',
            perPixelTargetFind: true,
            width: widthGroup,
            hasControls: false,
            hasBorders: false,
        });
        this.triggerDescription.setCoords();
    }

    getTopLeftForDescription() {
        const centerPoint = this.curve.getCenterPoint();
        const tangent = this.curve.getTangentVector(0.5);
        let normal = this.curve.getNormalVector(0.5);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (angle > 90) {
            angle = angle - 180;
            normal = [-normal[0], -normal[1]];
        } else if (angle < -90) {
            angle = angle + 180;
            normal = [-normal[0], -normal[1]];
        }

        return [centerPoint[0] - EDGE_IMAGE_DISTANCE * normal[0], centerPoint[1] - EDGE_IMAGE_DISTANCE * normal[1], angle];
    }

    findIntersectionPoint(shouldEmittedEvent: boolean): combineEdge {
        let allEdge: EdgeData[] = this.graph.getEdges();
        let movingEdge: EdgeData;

        for (let edge of allEdge) {
            // We must not compare to ourself!!!
            if (this.edgeData.getEdgeId() === edge.getEdgeId())
                continue;

            let startX = edge.getStartX();
            let startY = edge.getStartY();
            let startDirection = edge.getConnectDirection_Src();
            let centerX = edge.getCenterX();
            let centerY = edge.getCenterY();
            let endX = edge.getEndX();
            let endY = edge.getEndY();
            let endDirection = edge.getConnectDirection_Dst();
            let intersect = this.curve.isIntersect(startX, startY, startDirection, centerX, centerY, endX, endY, endDirection);
            console.log("intersect result", intersect);
            if (intersect === true) {
                let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                if (!shouldEmittedEvent) {
                    edgeView.line.set('stroke', 'red');
                    edgeView.triangle.set('fill', 'red');
                }
                return { toBeMissing: this.edgeData, toBeCombined: edge };
            } else if (intersect === false) {
                let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
                if (!shouldEmittedEvent) {
                    edgeView.line.set('stroke', 'black');
                    edgeView.triangle.set('fill', 'black');
                }
            }
        }

        // for (let edge of allEdge) {
        //     x3 = edge.getStartX(); y3 = edge.getStartY();
        //     x4 = edge.getEndX(); y4 = edge.getEndY();

        //     let a_dx = x2 - x1;
        //     let a_dy = y2 - y1;
        //     let b_dx = x4 - x3;
        //     let b_dy = y4 - y3;

        //     // This is the moving edge, must not compare with itself!
        //     // Otherwise it will paint itself to be red too.
        //     if (this.edgeData.getEdgeId() === edge.getEdgeId())
        //         continue;

        //     if (this.edgeData.getEdgeId() !== edge.getEdgeId()) {
        //         // For the case where two lines are parallel to each other
        //         if ((y1 === y2) && (y3 === y4) && ((x3 > x1 && x3 < x2) || (x4 > x1 && x4 < x2))) {
        //             if (y1 - y3 >= -10 && y1 - y3 <= 10) {
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'red');
        //                     edgeView.triangle.set('fill', 'red');
        //                 }
        //                 return { toBeMissing: this.edgeData, toBeCombined: edge };
        //             } else {
        //                 // No intersection point, paint arrow's color back to black
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'black');
        //                     edgeView.triangle.set('fill', 'black');
        //                 }
        //             }
        //         } else if (x1 === x2 && x3 === x4 && ((y3 > y1 && y3 < y2) || (y4 > y1 && y4 < y2))) {
        //             if (x1 - x3 >= -10 && x1 - x3 <= 10) {
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'red');
        //                     edgeView.triangle.set('fill', 'red');
        //                 }
        //                 return { toBeMissing: this.edgeData, toBeCombined: edge };
        //             } else {
        //                 // No intersection point, paint arrow's color back to black
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'black');
        //                     edgeView.triangle.set('fill', 'black');
        //                 }
        //             }
        //         } else if (y1 !== y2 || y3 !== y4 || x1 !== x2 || x3 !== x4) {
        //             let s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
        //             let t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
        //             let a = (s >= 0 && s <= 1 && t >= 0 && t <= 1);
        //             if (a === true) {
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'red');
        //                     edgeView.triangle.set('fill', 'red');
        //                 }
        //                 return { toBeMissing: this.edgeData, toBeCombined: edge };
        //             } else {
        //                 // No intersection point, paint arrow's color back to black
        //                 let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
        //                 if (!shouldEmittedEvent) {
        //                     edgeView.line.set('stroke', 'black');
        //                     edgeView.triangle.set('fill', 'black');
        //                 }
        //             }
        //         }
        //   }
        //}
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

    moveEdge(startX, startY, endX, endY) {
        this.curve = BezierCurve.fromStartEndPoint(startX, startY, this.edgeData.getConnectDirection_Src(), endX, endY, this.edgeData.getConnectDirection_Dst());

        // move every components to the new location
        this.line.path = this.curve.getSVGArray();
        let triangleAngle = this.curve.getAngle(0.99);
        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2,
            top: endY,
            angle: 90 + triangleAngle
        });

        // Set all elements within group of trigger's description
        this.setObjectPositionWithinDescriptionGroup();

        this.dotHead.set({ left: startX, top: startY });
        this.dotTail.set({ left: endX, top: endY });

        for (let delBtn of this.triggerDeleteBtn) {
            delBtn.set({ visible: false });
        }
    }

    shiftEdge(dx, dy) {
        this.curve.shiftCurve(dx, dy);

        let [startX, startY] = this.curve.getStartPoint();
        let [endX, endY] = this.curve.getEndPoint();

        // move every components to the new location
        this.line.path = this.curve.getSVGArray();
        let triangleAngle = this.curve.getAngle(0.99);
        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2,
            top: endY,
            angle: 90 + triangleAngle
        });

        // Set all elements within group of trigger's description
        this.setObjectPositionWithinDescriptionGroup();

        this.dotHead.set({ left: startX, top: startY });
        this.dotTail.set({ left: endX, top: endY });

        for (let delBtn of this.triggerDeleteBtn) {
            delBtn.set({ visible: false });
        }
    }

    updateEdgeShape() {

    }

    private deselectAllEdge() {
        this.edgeFabricObject.forEach((edgeId, edgeView) => {
            edgeView.dotHead.visible = false;
            edgeView.dotTail.visible = false;
            edgeView.edgeDeleteBtn.visible = false;
            for (let delBtn of edgeView.triggerDeleteBtn)
                delBtn.visible = false;
        });
    }

    private deselectAllNode() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeRemoveButton.visible = false;
            nodeView.nodeActionImage.setShadow({
                color: '#fff',
            });
        });
    }

    processEdgeEvent(shouldEmittedEvent: boolean = false) {
        let [startX, startY] = this.curve.getStartPoint();
        let [endX, endY] = this.curve.getEndPoint();

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
                    center_x: this.curve.getCenterPoint()[0],
                    center_y: this.curve.getCenterPoint()[1],
                    end_x: endX,
                    end_y: endY,
                    src_node_id: nodeAtHead.getNodeId(),
                    connect_direction_src: headConnectionPoint.d,
                });
                // we only show the connecting indicator when we will not emit event (moving) otherwise
                // we won't have a chance to clear it
            } else {
                this.nodeFabricObject.getValue(nodeAtHead.getNodeId()).nodeActionImage.setShadow({
                    color: 'yellow',
                    blur: 10,
                });
            }
        }
        let nodeAtTail = this.graph.getNodeInRange(endX, endY);
        if (nodeAtTail !== undefined) {
            if (shouldEmittedEvent) {
                tailConnectionPoint = this.calculateConnectionPoint(nodeAtTail.getX(), nodeAtTail.getY(), endX, endY);
                console.log(tailConnectionPoint.x, tailConnectionPoint.y, tailConnectionPoint.d);
                this.callback.getValue('edge:connectionDst')({
                    target_id: this.edgeData.getEdgeId(),
                    start_x: (nodeAtHead !== undefined) ? headConnectionPoint.x : startX,
                    start_y: (nodeAtHead !== undefined) ? headConnectionPoint.y : startY,
                    center_x: this.curve.getCenterPoint()[0],
                    center_y: this.curve.getCenterPoint()[1],
                    end_x: tailConnectionPoint.x,
                    end_y: tailConnectionPoint.y,
                    dst_node_id: nodeAtTail.getNodeId(),
                    connect_direction_dst: tailConnectionPoint.d,
                });
            } else {
                this.nodeFabricObject.getValue(nodeAtTail.getNodeId()).nodeActionImage.setShadow({
                    color: 'yellow',
                    blur: 10,
                });
            }
        }

        // emitted edge:move when there wasn't any connection made otherwise the edge:connection_ 
        // callback is used and edge:move is not needed
        if (shouldEmittedEvent && (nodeAtHead === undefined) && (nodeAtTail === undefined)) {
            console.log(this.curve.getCenterPoint()[0], this.curve.getCenterPoint()[1]);
            this.callback.getValue('edge:move')({
                target_id: this.edgeData.getEdgeId(),
                start_x: startX,
                start_y: startY,
                center_x: this.curve.getCenterPoint()[0],
                center_y: this.curve.getCenterPoint()[1],
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
        let x: number, y: number, d: string;

        let angle = Math.atan2((pointY - originY), (pointX - originX)) * 180 / Math.PI;
        if (angle >= -25 && angle <= 15) {
            //Connect at right side
            x = originX + 60;
            y = originY;
            d = 'r';
        } else if (angle > 15 && angle <= 160) {
            //Connect at bottom side
            x = originX;
            y = originY + 25;
            d = 'b';
        } else if ((angle > 160 && angle <= 180) || (angle < -160 && angle >= -180)) {
            //Connect at left side 
            x = originX - 60;
            y = originY;
            d = 'l';
        } else if (angle < -25 && angle >= -160) {
            //Connect at top side 
            x = originX;
            y = originY - 25;
            d = 't';
        }

        return { x: x, y: y, d: d };
    }

    private clearNodeConnectingIndicator() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeActionImage.setShadow({
                color: '#fff',
            });
        })
    }

    public deselect() {
        this.dotHead.visible = false;
        this.dotTail.visible = false;
        this.curveControlPoint.visible = false;
        this.edgeDeleteBtn.visible = false;
        for (let delBtn of this.triggerDeleteBtn)
            delBtn.visible = false;
    }

    public deselectEdge() {
        this.dotHead.visible = false;
        this.dotTail.visible = false;
        this.curveControlPoint.visible = false;
        this.edgeDeleteBtn.visible = false;
        for (let delBtn of this.triggerDeleteBtn)
            delBtn.visible = false;
    }

    public selectEdge() {
        console.log('select edge');
        this.dotHead.visible = true;
        this.dotTail.visible = true;
        this.curveControlPoint.visible = true;
        this.edgeDeleteBtn.visible = true;
        for (let del of this.triggerDeleteBtn)
            del.visible = true;
    }
}

