import {
    Component, Input, Output, EventEmitter,
    OnInit, OnChanges, ElementRef, Renderer
} from '@angular/core';
import 'fabric';
import * as $ from 'jquery';

import { Action, ActionGroup } from './action';
import { GraphData, ActionData, TriggerData } from './graph';
import { GraphModel } from './graphmodel';
import { EventManager } from './eventmanager';
import { ConnectEdgeToSrcNodeEvent } from './graphevent';

/* display constants */
const NODE_SIZE: number = 100;
const NODE_NAME_YPOS: number = 70;
const NODE_NAME_FONTSIZE: number = 20;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

@Component({
    selector: 'middle',
    templateUrl: `./middle.component.html`,
    styleUrls: ['./step1.component.css']
})

export class MiddleComponent implements OnInit {

    @Output() myEvent = new EventEmitter<Action>();

    private canvas: fabric.ICanvas;

    private graphModel: GraphModel;
    private eventManager: EventManager;

    // TODO: remove in future version
    private actionGroup: ActionGroup[];


    ngOnInit() {
        // TODO: refactor to read the json only once by create a global object or use dependency injection
        this.actionGroup = require("./action.json");

        this.graphModel = new GraphModel(this.dummyGraph);
        this.eventManager = new EventManager();
        this.canvas = new fabric.Canvas('c');
        this.canvasBoundaryLimit();

        this.redrawCanvas();
    }

    private canvasBoundaryLimit() {
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

    private drawNode(actionData: ActionData) {
        let action = this.findActionById(actionData.action_id);

        let text = new fabric.Text(actionData.action_params.name, {
            left: actionData.display_params.x,
            top: actionData.display_params.y + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE
        });

        let image: fabric.IImage;
        fabric.Image.fromURL(action.image
            , (im) => {
                image = im;
                /* Group image and text together so it will move together */
                let groupAction = new fabric.Group([image, text], {});

                /* Send data to populate property window when this action is selected */
                groupAction.on('selected', (e) => {
                    this.myEvent.emit(action);
                });

                /* Update location of action when modified */
                groupAction.on('modified', (e) => {
                    this.graphModel.moveNode(actionData, groupAction.getTop(), groupAction.getLeft());
                });

                groupAction.hasControls = groupAction.hasBorders = false;

                this.canvas.add(groupAction);
            }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: actionData.display_params.x,
                top: actionData.display_params.y,
                originX: 'center',
                originY: 'center'
            });
    }

    private drawEdge(triggerData: TriggerData) {
        let startX: number, startY: number, endX: number, endY: number, angle: number;

        startX = triggerData.display_params.start_x;
        startY = triggerData.display_params.start_y;
        endX = triggerData.display_params.end_x;
        endY = triggerData.display_params.end_y;
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
                nStartX = triggerData.display_params.start_x = currentOriginLineX - difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX + difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY + difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY - difY;
            }
            else if ((startX < endX) && (startY < endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX - difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX + difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY - difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY + difY;
            }
            else if ((startX > endX) && (startY > endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX + difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX - difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY + difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY - difY;   
            }
            if ((startX > endX) && (startY < endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX + difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX - difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY - difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY + difY;  
            }
            else if ((startX < endX) && (startY === endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX - difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX + difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY;              
            }
            else if ((startX > endX) && (startY === endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX + difX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX - difX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY;   
            }
            else if ((startX === endX) && (startY < endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY - difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY + difY;   
            }
            else if ((startX === endX) && (startY > endY)) {
                nStartX = triggerData.display_params.start_x = currentOriginLineX;
                nEndX = triggerData.display_params.end_x = currentOriginLineX;
                nStartY = triggerData.display_params.start_y = currentOriginLineY + difY;
                nEndY = triggerData.display_params.end_y = currentOriginLineY - difY;   
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
            this.redrawCanvas();

            for (let actionData of this.graphModel.node()) {
                let distance = Math.sqrt(Math.pow(line.left - actionData.display_params.x, 2) + Math.pow(line.top - actionData.display_params.y, 2));
                if (distance < NODE_SIZE / 2) {
                    this.eventManager.pushEvent(new ConnectEdgeToSrcNodeEvent(this.graphModel, actionData, triggerData, 400, 400));
                    this.redrawCanvas();
                    break;
                }
            }
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
            let newEndX = triggerData.display_params.end_x = dotTail.getLeft();
            let newEndY = triggerData.display_params.end_y = dotTail.getTop();

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
            let newStartX = triggerData.display_params.start_x = dotHead.getLeft();
            let newStartY = triggerData.display_params.start_y = dotHead.getTop();

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
            this.redrawCanvas();
        });

        this.canvas.add(line, triangle, dotTail, dotHead);
    }

    private redrawCanvas() {
        this.canvas.clear();

        for (let node of this.graphModel.node()) {
            this.drawNode(node);
        }

        setTimeout(() => {
            for (let edge of this.graphModel.edge()) {
                this.drawEdge(edge);
            }
        }, 50)
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

    private addNewNode(newAction: Action) {
        this.graphModel.addNode(this.graphModel.node(), newAction);
        this.redrawCanvas();
    }

    private removeNode(nodeData: ActionData) {
        // remove Non-connected node, just remove only node itself
        this.graphModel.removeNode(this.graphModel.node(), nodeData);
    }


    // TODO: dummy data to be removed
    dummyGraph: GraphData = {
        nodes: [
            {
                node_id: 1,
                action_id: 1,
                action_params: {
                    name: 'Motor 1'
                },
                display_params: {
                    x: 500,
                    y: 300
                }
            },
            {
                node_id: 2,
                action_id: 2,
                action_params: {
                    name: 'Motor 2'
                },
                display_params: {
                    x: 800,
                    y: 300
                }
            }
        ],
        /*edges: [
            {
                edge_id: 1,
                trigger_id: 1,
                action_params: [
                    {
                        name: 'Temp',
                        value: '50'
                    }
                ],
                src_node_id: 1,
                dst_node_id: 2,
                display_params: {
                    src_conn_deg: 0,
                    dst_conn_deg: 220,
                    start_x: 0,
                    start_y: 0,
                    end_x: 0,
                    end_y: 0
                }
            }
        ]*/
        edges: [
            {
                edge_id: 1,
                trigger_id: 1,
                action_params: [
                    {
                        name: 'Temp',
                        value: '50'
                    }
                ],
                src_node_id: 0,
                dst_node_id: 0,
                display_params: {
                    start_x: 300,
                    start_y: 500,
                    end_x: 500,
                    end_y: 500
                }
            }
        ]
    };

}