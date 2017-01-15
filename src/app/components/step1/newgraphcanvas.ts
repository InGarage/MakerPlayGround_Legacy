
import 'fabric';
import * as Collections from 'typescript-collections';

import { Action, ActionGroup } from './action';
import { GraphData, NodeData, EdgeData } from './graphmodel';

/* display constants */
const NODE_SIZE: number = 100;
const NODE_NAME_YPOS: number = 70;
const NODE_NAME_FONTSIZE: number = 20;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

export interface CanvasEventOptions {
    target_id: string,
    src_node_id?: string, // Unique id of the source node
    dst_node_id?: string, // Unique id of the destination node
    start_x?: number,     // Parameters needed to display the edge on the screen
    start_y?: number,
    center_x?: number,
    center_y?: number,
    end_x?: number,
    end_y?: number
}

export type CanvasEventTypes = 'node:selected' | 'node:move' | 'edge:move' | 'object:deselected'
    | 'edge:connectionDst' | 'edge:connectionSrc';

export class GraphCanvas {
    private graph: GraphData;

    private canvas: fabric.ICanvas;
    private nodeFabricObject: Collections.Dictionary<string, NodeView>;
    private edgeFabricObject: Collections.Dictionary<string, EdgeView>;
    private callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>;

    constructor(element: HTMLCanvasElement | string, options?: fabric.ICanvasOptions) {
        this.canvas = new fabric.Canvas(element, options);
        this.nodeFabricObject = new Collections.Dictionary<string, NodeView>();
        this.edgeFabricObject = new Collections.Dictionary<string, EdgeView>();
        this.callback = new Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>();
        this.initCanvas();
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
        this.canvas.remove(nodeView.nodeActionImage, nodeView.nodeNameText
            , nodeView.nodeSelectingIndicator, nodeView.nodeConnectingIndicator);
    }

    removeEdge(edgeData: EdgeData) {
        let edgeView = this.edgeFabricObject.remove(edgeData.getEdgeId());
        this.canvas.remove(edgeView.line, edgeView.triangle, edgeView.dotHead, edgeView.dotTail);
    }

    /**
     * (Re)draw the canvas with the data provided 
     * @param graph graph to be drawn onto the canvas
     */
    redraw(graph: GraphData): void {
        let oldGraph = this.graph;
        this.graph = graph;
        graph.compareGraphModel(oldGraph, (type, target) => {
            console.log(type, target);
            if (type === "addition") {
                if (target instanceof NodeData) {
                    this.drawNode(target);
                } else {
                    this.drawEdge(target);
                }
            } else if (type === "deletion") {
                if (target instanceof NodeData) {
                    this.removeNode(target);
                } else {
                    this.removeEdge(target);
                }
            } else if (type === "update") { // remove then add it again
                if (target instanceof NodeData) {
                    this.removeNode(target);
                    this.drawNode(target);
                } else {
                    this.removeEdge(target);
                    this.drawEdge(target);
                }
            }
        });
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
    }
}

type Coordinate = {
    x: number,
    y: number
}

class NodeView {
    nodeActionImage: fabric.IImage;  // TODO: should be readonly if posible
    readonly nodeConnectingIndicator: fabric.ICircle;
    readonly nodeSelectingIndicator: fabric.ICircle;
    readonly nodeNameText: fabric.IText;
    actionGroup: ActionGroup[] = require("./action.json"); // TODO: refactor into the action class / service

    constructor(readonly graph: GraphData, readonly canvas: fabric.ICanvas,
        readonly nodeFabricObject: Collections.Dictionary<string, NodeView>,
        readonly edgeFabricObject: Collections.Dictionary<string, EdgeView>,
        readonly callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>,
        readonly id: string, readonly nodeData: NodeData) {

        let action = this.findActionById(nodeData.getActionId());

        fabric.Image.fromURL(action.image
            , (im) => {
                this.nodeActionImage = im;
                this.initNodeEvent();
                this.canvas.add(this.nodeConnectingIndicator, this.nodeSelectingIndicator, this.nodeNameText, this.nodeActionImage);
            }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: nodeData.getX(),
                top: nodeData.getY(),
                originX: 'center',
                originY: 'center',
                hasControls: false,
                hasBorders: false
            });

        this.nodeConnectingIndicator = new fabric.Circle({
            left: nodeData.getX(),
            top: nodeData.getY(),
            radius: NODE_SIZE / 2,
            stroke: '#66afe9',
            strokeWidth: 15,
            opacity: 0.5,
            fill: 'rgba(0,0,0,0)',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        });

        this.nodeSelectingIndicator = new fabric.Circle({
            left: nodeData.getX(),
            top: nodeData.getY(),
            radius: NODE_SIZE / 2,
            stroke: 'black',
            strokeWidth: 8,
            opacity: 0.2,
            fill: 'rgba(0,0,0,0)',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        });

        this.nodeNameText = new fabric.Text(nodeData.getActionParams('name'), {
            left: nodeData.getX(),
            top: nodeData.getY() + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE,
            hasControls: false,
            hasBorders: false
        });
    }

    private initNodeEvent() {
        this.nodeActionImage.on('moving', (e) => {
            this.moveNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop());
        });

        this.nodeActionImage.on('modified', (e) => {
            this.moveNode(this.nodeActionImage.getLeft(), this.nodeActionImage.getTop(), true);
        });

        this.nodeActionImage.on('selected', (e) => {
            this.deselectAllNode();
            this.nodeSelectingIndicator.visible = true;

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        });

        this.nodeNameText.on('moving', (options) => {
            this.moveNode(this.nodeNameText.getLeft(), this.nodeNameText.getTop() - NODE_NAME_YPOS);
        });

        this.nodeNameText.on('modified', (options) => {
            this.moveNode(this.nodeNameText.getLeft(), this.nodeNameText.getTop() - NODE_NAME_YPOS, true);
        });

        this.nodeNameText.on('selected', (options) => {
            this.deselectAllNode();
            this.nodeSelectingIndicator.visible = true;

            this.callback.getValue('node:selected')({
                target_id: this.nodeData.getNodeId(),
            });
        })
    }

    private moveNode(originX: number, originY: number, shouldEmittedEvent: boolean = false) {
        // move every components to the new location
        this.nodeActionImage.set({ left: originX, top: originY });
        this.nodeNameText.set({ left: originX, top: originY + NODE_NAME_YPOS });
        this.nodeConnectingIndicator.set({ left: originX, top: originY });
        this.nodeSelectingIndicator.set({ left: originX, top: originY });

        if (shouldEmittedEvent) {
            this.callback.getValue('node:move')({
                target_id: this.nodeData.getNodeId(),
                center_x: originX,
                center_y: originY,
            });
        }

        // show connecting indicator when this node is moving into edge's boundary
        // and is not emitted event (otherwise the indicator won't be cleared)
        let edge = this.getEdgeInRange(originX, originY);
        if (!shouldEmittedEvent && (edge !== undefined) && (edge.src.length != 0 || edge.dest.length != 0)) {
            this.nodeConnectingIndicator.visible = true;
        } else {
            this.nodeConnectingIndicator.visible = false;
        }

        if (shouldEmittedEvent) {
            for (let e of edge.src) {
                let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getStartX(), e.getStartY());
                this.callback.getValue('edge:connectionSrc')({
                    target_id: e.getEdgeId(),
                    start_x: connectionPoint.x,
                    start_y: connectionPoint.y,
                    end_x: e.getEndX(),
                    end_y: e.getEndY(),
                    src_node_id: this.nodeData.getNodeId(),
                });
            }
            for (let e of edge.dest) {
                let connectionPoint = this.calculateConnectionPoint(originX, originY, e.getEndX(), e.getEndY());
                this.callback.getValue('edge:connectionDst')({
                    target_id: e.getEdgeId(),
                    start_x: e.getStartX(),
                    start_y: e.getStartY(),
                    end_x: connectionPoint.x,
                    end_y: connectionPoint.y,
                    dst_node_id: this.nodeData.getNodeId(),
                });
            }
        }

        // any edge connected to this node, will be moved depends on this node location
        for (let edge of this.graph.getEdgesBySrcNode(this.nodeData.getNodeId())) {
            let [startX, startY] = this.calculateNewEdgePoint(edge.getStartX(), edge.getStartY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((edge.getEndY() - startY), (edge.getEndX() - startX));
            edgeView.moveEdge(startX, startY, edge.getEndX(), edge.getEndY(), angle, shouldEmittedEvent);
        }
        for (let edge of this.graph.getEdgesByDstNode(this.nodeData.getNodeId())) {
            let [endX, endY] = this.calculateNewEdgePoint(edge.getEndX(), edge.getEndY());
            let edgeView = this.edgeFabricObject.getValue(edge.getEdgeId());
            let angle = Math.atan2((endY - edge.getStartY()), (endX - edge.getStartX()));
            edgeView.moveEdge(edge.getStartX(), edge.getStartY(), endX, endY, angle, shouldEmittedEvent);
        }
    }

    private deselectAllNode() {
        this.nodeFabricObject.forEach((nodeId, nodeView) => {
            nodeView.nodeSelectingIndicator.visible = false;
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

    // TODO: move to other class
    private findActionById(id: number): Action {
        for (let actionGroup of this.actionGroup) {
            for (let action of actionGroup.children) {
                if (action.id === id)
                    return action;
            }
        }
        return undefined;
    }
}

class EdgeView {

    readonly line: fabric.ILine;
    readonly triangle: fabric.ITriangle;
    readonly dotHead: fabric.ICircle;
    readonly dotTail: fabric.ICircle;

    constructor(readonly graph: GraphData, readonly canvas: fabric.ICanvas,
        readonly nodeFabricObject: Collections.Dictionary<string, NodeView>,
        readonly edgeFabricObject: Collections.Dictionary<string, EdgeView>,
        readonly callback: Collections.Dictionary<CanvasEventTypes, (options: CanvasEventOptions) => void>,
        readonly id: string, readonly edgeData: EdgeData) {

        let startX = edgeData.getStartX();
        let startY = edgeData.getStartY();
        let endX = edgeData.getEndX();
        let endY = edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));   // in radian
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        this.line = new fabric.Line([
            startX,
            startY,
            endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        ], {
                originX: 'center',
                originY: 'center',
                strokeWidth: EDGE_ARROW_WIDTH,
                stroke: '#000',
                hasControls: false,
                hasBorders: false
            });

        this.triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
            hasControls: false,
            hasBorders: false
        });

        this.dotHead = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 6,
            fill: 'black',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        });

        this.dotTail = new fabric.Circle({
            left: endX,
            top: endY,
            radius: 6,
            fill: 'black',
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            visible: false
        });

        this.initEdgeEvent();
        this.canvas.add(this.line, this.triangle, this.dotTail, this.dotHead);
    }

    private initEdgeEvent() {
        let startX = this.edgeData.getStartX();
        let startY = this.edgeData.getStartY();
        let endX = this.edgeData.getEndX();
        let endY = this.edgeData.getEndY();
        let angle = Math.atan2((endY - startY), (endX - startX));

        this.line.on('moving', (options) => {
            let currentOriginLineX = this.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2;
            let currentOriginLineY = this.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2;
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
        });
        this.line.on('modified', (options) => {
            let currentOriginLineX = this.line.getLeft() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle)) / 2;
            let currentOriginLineY = this.line.getTop() + (EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)) / 2;
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle, true);
        });
        this.line.on('selected', (options) => {
            this.dotHead.visible = true;
            this.dotTail.visible = true;
        })

        this.triangle.on('moving', (options) => {
            let currentOriginTriangleX = this.triangle.getLeft();
            let currentOriginTriangleY = this.triangle.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromTriangleOrigin(currentOriginTriangleX, currentOriginTriangleY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle);
        });
        this.triangle.on('modified', (options) => {
            let currentOriginTriangleX = this.triangle.getLeft();
            let currentOriginTriangleY = this.triangle.getTop();
            let [currentOriginLineX, currentOriginLineY] = this.getLineOriginFromTriangleOrigin(currentOriginTriangleX, currentOriginTriangleY);
            let [nStartX, nEndX, nStartY, nEndY] = this.getLineCoordinateFromOrigin(currentOriginLineX, currentOriginLineY);
            this.moveEdge(nStartX, nStartY, nEndX, nEndY, angle, true);
        });
        this.triangle.on('selected', (options) => {
            this.dotHead.visible = true;
            this.dotTail.visible = true;
        });

        this.dotHead.on('moving', (options) => {
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            let angle = Math.atan2((endY - newStartY), (endX - newStartX));
            let newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            let newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);
            this.moveEdge(newStartX, newStartY, newEndX, newEndY, angle);
        });
        this.dotHead.on('modified', (options) => {
            let newStartX = this.dotHead.getLeft();
            let newStartY = this.dotHead.getTop();
            let angle = Math.atan2((endY - newStartY), (endX - newStartX));
            let newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            let newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);
            this.moveEdge(newStartX, newStartY, newEndX, newEndY, angle, true);
        });

        this.dotTail.on('moving', (options) => {
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            let angle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            let newEndX = currentEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            let newEndY = currentEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);
            this.moveEdge(startX, startY, newEndX, newEndY, angle);
        });
        this.dotTail.on('modified', (options) => {
            let currentEndX = this.dotTail.getLeft();
            let currentEndY = this.dotTail.getTop();
            let angle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            let newEndX = currentEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            let newEndY = currentEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);
            this.moveEdge(startX, startY, newEndX, newEndY, angle, true);
        });
    }

    moveEdge(startX: number, startY: number, endX: number, endY: number, angle: number, shouldEmittedEvent: boolean = false) {
        // move every components to the new location
        this.line.set({ 
            x1: startX, y1: startY, 
            x2: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle), 
            y2: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle) 
        });
        this.triangle.set({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        });
        this.dotHead.set({ left: startX, top: startY });
        this.dotTail.set({ left: endX, top: endY });

        // clear connecting indicator of every node
        this.clearNodeConnectingIndicator();

        // show connecting indicator when this edge is moving into node's boundary
        // and we currently not emitted an event (otherwise we won't be able to clear it)
        let nodeAtHead = this.graph.getNodeInRange(startX, startY);
        if (nodeAtHead !== undefined) {
            console.log(nodeAtHead.getNodeId());
            if (shouldEmittedEvent) {
                let connectionPoint = this.calculateConnectionPoint(nodeAtHead.getX(), nodeAtHead.getY(), startX, startY);
                this.callback.getValue('edge:connectionSrc')({
                    target_id: this.edgeData.getEdgeId(),
                    start_x: connectionPoint.x,
                    start_y: connectionPoint.y,
                    end_x: endX,
                    end_y: endY,
                    src_node_id: nodeAtHead.getNodeId(),
                });
            } else {
                this.nodeFabricObject.getValue(nodeAtHead.getNodeId()).nodeConnectingIndicator.visible = true;
            }
        }
        let nodeAtTail = this.graph.getNodeInRange(endX, endY);
        if (nodeAtTail !== undefined) {
            if (shouldEmittedEvent) {
                let connectionPoint = this.calculateConnectionPoint(nodeAtTail.getX(), nodeAtTail.getY(), endX, endY);
                this.callback.getValue('edge:connectionDst')({
                    target_id: this.edgeData.getEdgeId(),
                    start_x: startX,
                    start_y: startY,
                    end_x: connectionPoint.x,
                    end_y: connectionPoint.y,
                    dst_node_id: nodeAtTail.getNodeId(),
                });
            } else {
                this.nodeFabricObject.getValue(nodeAtTail.getNodeId()).nodeConnectingIndicator.visible = true;
            }
        }

        // emitted edge:move when there wasn't any connection made
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
    private getLineCoordinateFromOrigin(currentOriginLineX: number, currentOriginLineY: number) {
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
        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginTriangleX - difX, currentOriginTriangleY + difY];
        } else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginTriangleX - difX, currentOriginTriangleY - difY];
        } else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginTriangleX + difX, currentOriginTriangleY + difY];
        } else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginTriangleX + difX, currentOriginTriangleY - difY];
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
}

