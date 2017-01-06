
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
    private nodeFabricObject: {[node_id: number]: fabric.IObject} = {};  // TODO: refactor to more efficient datastructure
    private edgeFabricObject: {[edge_id: number]: fabric.IObject} = {};  // TODO: refactor to more efficient datastructure
    private callback: {[index: string]: () => void} = {};  // TODO: refactor to more efficient datastructure

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
            , (im) => { image = im; group.addWithUpdate(im); this.canvas.add(group); }
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
        group.addWithUpdate(text);
        
        // Send data to populate property window when this action is selected
        group.on('selected', (e) => {
            //this.myEvent.emit(action);
        });

        // Update location of action when modified
        group.on('modified', (e) => {
            //this.graphModel.moveNode(actionData,groupAction.getTop(),groupAction.getLeft());
        });

        group.hasControls = group.hasBorders = false;

        this.nodeFabricObject[nodeData.getNodeId()] = group;
    }

    private removeNode(nodeData: NodeData) {
        let obj = this.nodeFabricObject[nodeData.getNodeId()];
        this.nodeFabricObject[nodeData.getNodeId()] = undefined;
        this.canvas.remove(obj);
    }

    private drawEdge(triggerData: EdgeData) {
        let startX: number, startY: number, endX: number, endY: number, angle: number;

        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();
        angle = Math.atan2((endY - startY), (endX - startX));   // in radian

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

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
    
            if ((startX < endX) && (startY > endY)) {
                nStartX = currentOriginLineX - difX;
                nEndX = currentOriginLineX + difX;
                nStartY = currentOriginLineY + difY;
                nEndY = currentOriginLineY - difY;
            }
            else if ((startX < endX) && (startY < endY)) {
                nStartX = currentOriginLineX - difX;
                nEndX = currentOriginLineX + difX;
                nStartY = currentOriginLineY - difY;
                nEndY = currentOriginLineY + difY;
            }
            else if ((startX > endX) && (startY > endY)) {
                nStartX = currentOriginLineX + difX;
                nEndX = currentOriginLineX - difX;
                nStartY = currentOriginLineY + difY;
                nEndY = currentOriginLineY - difY;   
            }
            if ((startX > endX) && (startY < endY)) {
                nStartX = currentOriginLineX + difX;
                nEndX = currentOriginLineX - difX;
                nStartY = currentOriginLineY - difY;
                nEndY = currentOriginLineY + difY;  
            }
            else if ((startX < endX) && (startY === endY)) {
                nStartX = currentOriginLineX - difX;
                nEndX = currentOriginLineX + difX;
                nStartY = currentOriginLineY;
                nEndY = currentOriginLineY;              
            }
            else if ((startX > endX) && (startY === endY)) {
                nStartX = currentOriginLineX + difX;
                nEndX = currentOriginLineX - difX;
                nStartY = currentOriginLineY;
                nEndY = currentOriginLineY;   
            }
            else if ((startX === endX) && (startY < endY)) {
                nStartX = currentOriginLineX;
                nEndX = currentOriginLineX;
                nStartY = currentOriginLineY - difY;
                nEndY = currentOriginLineY + difY;   
            }
            else if ((startX === endX) && (startY > endY)) {
                nStartX = currentOriginLineX;
                nEndX = currentOriginLineX;
                nStartY = currentOriginLineY + difY;
                nEndY = currentOriginLineY - difY;   
            }

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
            //this.redrawCanvas();
        });

        let triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
        });

        let dotTail = new fabric.Circle({
            left: endX,
            top: endY,
            radius: 3,
            fill: 'red',
            originX: 'center',
            originY: 'center',
        });

        dotTail.on('moving', (options) => {
            let newEndX = dotTail.getLeft();
            let newEndY = dotTail.getTop();

        });

        dotTail.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            //this.redrawCanvas();
        });
        dotTail.hasControls = dotTail.hasBorders = false;

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
            let newStartX = dotHead.getLeft();
            let newStartY = dotHead.getTop();

            angle = Math.atan2((endY - newStartY), (endX - newStartX));


            let newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            let newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);
        
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

            this.canvas.renderAll();
            });


        dotHead.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            //this.redrawCanvas();
        });

        this.canvas.add(line, triangle, dotTail, dotHead);
    }

    private removeEdge(edgeData: EdgeData) {
        let obj = this.edgeFabricObject[edgeData.getEdgeId()];
        this.edgeFabricObject[edgeData.getEdgeId()] = undefined;
        this.canvas.remove(obj);
    }

    /**
     * (Re)draw the canvas with the data provided 
     * @param graph graph to be drawn onto the canvas
     */
    redraw(graph: GraphData) : void {
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
    on(event: 'node:select'|'node:move', callback: () => void) {
        this.callback[event] = callback;
    }
}