
import 'fabric';

import { Action, ActionGroup } from './action';
import { GraphData, NodeData, EdgeData } from './graphmodel';

/* display constants */
const NODE_SIZE: number = 100;
const NODE_NAME_YPOS: number = 70;
const NODE_NAME_FONTSIZE: number = 20;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

export class GraphCanvas {

    private graph: GraphData;
    private actionGroup: ActionGroup[]; // TODO: remove in future version

    private canvas: fabric.ICanvas;
    private nodeFabricObject: { [node_id: number]: fabric.IObject[] } = {};  // TODO: refactor to more efficient datastructure
    private edgeFabricObject: { [edge_id: number]: fabric.IObject[] } = {};  // TODO: refactor to more efficient datastructure
    private callback: { [index: string]: (CanvasEventOptions) => void } = {};  // TODO: refactor to more efficient datastructure

    private activeObject: any;

    constructor(element: HTMLCanvasElement | string, options?: fabric.ICanvasOptions) {
        this.canvas = new fabric.Canvas(element, options);
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

        // TODO: refactor to read the json only once by create a global object or use dependency injection
        this.actionGroup = require("./action.json");

        this.canvas.on('selection:cleared', (e) => {
            if (e.target !== null) {
                this.callback['object:deselected']({  
                });
            }
        });
    }

    // TODO: This function should be refactored into the action class / service
    private findActionById(id: number): Action {
        for (let actionGroup of this.actionGroup) {
            for (let action of actionGroup.children) {
                if (action.id === id)
                    return action;
            }
        }
        return undefined;
    }

    private drawNode(nodeData: NodeData) {
        let action = this.findActionById(nodeData.getActionId());
        let group = new fabric.Group();

        let image: fabric.IImage;
        fabric.Image.fromURL(action.image
            , (im) => 
            { 
                image = im; 

                /**
                 * HANDLE IMAGE EVENT
                 */
                image.on('moving', (e) => {
                    let newStartX: number, newStartY: number;
                    newStartX = image.getLeft();
                    newStartY = image.getTop();
                    text.set({
                        left: newStartX,
                        top: newStartY + NODE_NAME_YPOS,
                    });   
                });

                image.on('modified', (e) => {
                    let newStartX: number, newStartY: number;
                    newStartX = image.getLeft();
                    newStartY = image.getTop();

                    this.callback['node:move']({
                        target_id: nodeData.getNodeId(),
                        center_x: newStartX,
                        center_y: newStartY,
                    });

                    image.visible = false;
                    this.canvas.setActiveObject(image);   
                });

                image.on('selected', (e) => {
                    this.callback['node:selected']({
                        target_id: nodeData.getNodeId(),
                    });
                });

                image.hasControls = image.hasBorders = false;
                text.hasControls = text.hasBorders = false;
                
                this.canvas.add(image,text);
                this.nodeFabricObject[nodeData.getNodeId()] = [image,text];
            }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: nodeData.getX(),
                top: nodeData.getY(),
                originX: 'center',
                originY: 'center'
            });

        let text = new fabric.Text(nodeData.getActionParams('name'), {
            left: nodeData.getX(),
            top: nodeData.getY() + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE
        });

        /**
         * HANDLE TEXT EVENT
         */
        text.on('moving', (options) => {
            let newStartX: number, newStartY: number;
            newStartX = text.getLeft();
            newStartY = text.getTop();
            image.set({
                left: newStartX,
                top: newStartY - NODE_NAME_YPOS,
            });
        });

        text.on('modified', (options) => {
            let newStartX: number, newStartY: number;
            newStartX = text.getLeft();
            newStartY = text.getTop();

            this.callback['node:move']({
                target_id: nodeData.getNodeId(),
                center_x: newStartX,
                center_y: newStartY - NODE_NAME_YPOS,
            });

            text.visible = false;
            this.canvas.setActiveObject(text); 
        });

        text.on('selected', (options) => {
            this.callback['node:selected']({
                target_id: nodeData.getNodeId(),
            });
        })
    }

    private drawEdge(triggerData: EdgeData) {
        let startX: number, startY: number, endX: number, endY: number, angle: number, difX: number, difY: number;
        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();
        angle = Math.atan2((endY - startY), (endX - startX));   // in radian
        difX = Math.abs(startX - endX) / 2;
        difY = Math.abs(startY - endY) / 2;

        /**
         * START OF LINE
         */
        let line = new fabric.Line([
            startX,
            startY,
            endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        ], {
                originX: 'center',
                originY: 'center',
                strokeWidth: EDGE_ARROW_WIDTH,
                stroke: '#000'
            });
        line.hasControls = line.hasBorders = false;

        // redraw arrow head when the line is moving
        line.on('moving', (options) => {
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
            let currentOriginLineX = line.getLeft();;
            let currentOriginLineY = line.getTop();

            [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            dotHead.setLeft(nStartX);
            dotHead.setTop(nStartY);
            dotTail.setLeft(nEndX);
            dotTail.setTop(nEndY);

            triangle.set({
                left: nEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
                top: nEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            });

        });
        // connect if arrow intersect with node
        line.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
            let currentOriginLineX = line.getLeft();;
            let currentOriginLineY = line.getTop();

            [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: nStartX,
                start_y: nStartY,
                end_x: nEndX,
                end_y: nEndY,
            });
        });
        /**
         * END OF LINE
         */

        /**
         * START OF TRIANGLE
         */
        let triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
        });
        triangle.hasControls = triangle.hasBorders = false;

        triangle.on('moving', (options) => {
            let currentOriginTriangleX = triangle.getLeft();
            let currentOriginTriangleY = triangle.getTop();
            let newLeft: number, newTop: number;
            [newLeft,newTop] = this.getLeftTopLine(triggerData, currentOriginTriangleX, currentOriginTriangleY);

            line.set({
                left: newLeft,
                top: newTop
            });
            
            let currentOriginLineX = line.getLeft();
            let currentOriginLineY = line.getTop();
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
           [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            dotHead.setLeft(nStartX);
            dotHead.setTop(nStartY);
            dotTail.setLeft(nEndX + EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle));
            dotTail.setTop(nEndY + EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle));
        });

        triangle.on('modified', (options) => {
            let newStartX:number, newStartY:number,newEndX:number, newEndY:number;
            newStartX = dotHead.getLeft();
            newStartY = dotHead.getTop();
            newEndX = dotTail.getLeft();
            newEndY = dotTail.getTop();

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: newStartX,
                start_y: newStartY,
                end_x: newEndX,
                end_y: newEndY,
            });
        })
        /**
         * END OF TRIANGLE
         */

        /**
         * START OF DOT-HEAD
         */
        let dotHead = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 4,
            fill: 'red',
            originX: 'center',
            originY: 'center',
        });
        dotHead.hasControls = dotHead.hasBorders = false;

        /* redraw line when dotHead is moving */
        dotHead.on('moving', (options) => {
            let newStartX:number, newStartY:number,newEndX:number, newEndY:number;
            newStartX = dotHead.getLeft();
            newStartY = dotHead.getTop();

            angle = Math.atan2((endY - newStartY), (endX - newStartX));
            newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            triangle.set({
                'left': newEndX,
                'top': newEndY,
                'angle': 90 + (angle * 180 / Math.PI),
            })

            line.set({
                'x1': newStartX,
                'y1': newStartY,
                'x2': newEndX,
                'y2': newEndY,
            });
        });

        dotHead.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            let newStartX:number, newStartY:number,newEndX:number, newEndY:number;
            newStartX = dotHead.getLeft();
            newStartY = dotHead.getTop();

            angle = Math.atan2((endY - newStartY), (endX - newStartX));
            newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: newStartX,
                start_y: newStartY,
                end_x: endX,
                end_y: endY,
            });
        });
        /**
         * END OF DOT-HEAD
         */

        /**
         * START OF DOT-TAIL
         */
        let dotTail = new fabric.Circle({
            left: endX,
            top: endY,
            radius: 3,
            fill: 'red',
            originX: 'center',
            originY: 'center',
        });
        dotTail.hasControls = dotTail.hasBorders = false;

        dotTail.on('moving', (options) => {
            let currentEndX:number, currentEndY:number,newEndX:number, newEndY:number;
            currentEndX = dotTail.getLeft();
            currentEndY = dotTail.getTop();

            angle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            newEndX = currentEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = currentEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            triangle.set({
                'left': newEndX,
                'top': newEndY,
                'angle': 90 + (angle * 180 / Math.PI),
            })

            line.set({
                'x1': startX,
                'y1': startY,
                'x2': newEndX,
                'y2': newEndY,
            });
        });

        dotTail.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            let currentEndX:number, currentEndY:number,newEndX:number, newEndY:number;
            currentEndX = dotTail.getLeft();
            currentEndY = dotTail.getTop();

            angle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            newEndX = currentEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = currentEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: startX,
                start_y: startY,
                end_x: currentEndX,
                end_y: currentEndY,
            });
        });
        /**
         * END OF DOT-TAIL
         */

        this.edgeFabricObject[triggerData.getEdgeId()] = [line, triangle, dotTail, dotHead];
        this.canvas.add(line, triangle, dotTail, dotHead);
    }

    private getLeftTopLine(triggerData, currentOriginTriangleX, currentOriginTriangleY) {
        let startX: number, startY: number, endX: number, endY: number;

        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginTriangleX - difX
                , currentOriginTriangleY + difY];
        }
        else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginTriangleX - difX
                , currentOriginTriangleY - difY];
        }
        else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginTriangleX + difX
                , currentOriginTriangleY + difY];
        }
        else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginTriangleX + difX
                , currentOriginTriangleY - difY];
        }
    }

    private getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY) {
        let startX: number, startY: number, endX: number, endY: number;

        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];

        }
        else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        }
        else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];
        }
        else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        }
    }

    private removeNode(nodeData: NodeData) {
        let obj = this.nodeFabricObject[nodeData.getNodeId()];
        this.nodeFabricObject[nodeData.getNodeId()] = undefined;
        for (let o of obj)
            this.canvas.remove(o);
    }

    private removeEdge(edgeData: EdgeData) {
        let obj = this.edgeFabricObject[edgeData.getEdgeId()];
        this.edgeFabricObject[edgeData.getEdgeId()] = undefined;
        for (let o of obj)
            this.canvas.remove(o); 
    }

    /**
     * (Re)draw the canvas with the data provided 
     * @param graph graph to be drawn onto the canvas
     */
    redraw(graph: GraphData): void {
        graph.compareGraphModel(this.graph, (type, target) => {
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
        this.graph = graph;
    }

    /**
     * Register a callback for a specific event
     * @param event event to register to which should be 'node:select', 'node:move' or ...
     * @param callback a callback function to be called when that specific event is occured
     */
    on(event: 'node:selected' | 'node:move' | 'edge:move' | 'object:deselected', callback: (options: CanvasEventOptions) => void) {
        this.callback[event] = callback;
    }
}

export interface CanvasEventOptions {
    target_id: number,
    src_node_id?: number, // Unique id of the source node    
    dst_node_id?: number, // Unique id of the destination node
    start_x?: number,     // Parameters needed to display the edge on the screen
    start_y?: number,
    center_x?: number,
    center_y?: number,
    end_x?: number,
    end_y?: number
}