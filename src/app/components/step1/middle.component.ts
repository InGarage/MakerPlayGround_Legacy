import { Component, Input, OnInit, OnChanges, ElementRef, Renderer } from '@angular/core';
import 'fabric';
import * as $ from 'jquery';

import { Action, ActionGroup } from './action';
import { GraphData, ActionData, TriggerData } from './graph';
import { GraphModel } from './graphmodel';
import { EventManager } from './eventmanager';
import { ConnectEdgeToSrcNodeEvent } from './graphevent';

/* display constants */
const NODE_SIZE: number = 75;
const NODE_NAME_YPOS: number = 50;
const NODE_NAME_FONTSIZE: number = 14;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

@Component({
    selector: 'middle',
    templateUrl: `./middle.component.html`,
    styleUrls: ['./step1.component.css']
})

export class MiddleComponent implements OnInit {

    private canvas: fabric.ICanvas;

    private graph: GraphModel;
    private event: EventManager;

    // TODO: remove in future version
    private actionGroup: ActionGroup[];

    ngOnInit() {
        // TODO: refactor to read the json only once by create a global object or use dependency injection
        this.actionGroup = require("./action.json");

        this.graph = new GraphModel(this.dummyGraph);
        this.event = new EventManager();
        this.canvas = new fabric.Canvas('c');

        this.redrawCanvas();
    }

    private drawNode(actionData: ActionData) {
        let action = this.findActionById(actionData.action_id);

        let image: fabric.IImage;
        fabric.Image.fromURL(action.image
            , (im) => { image = im; this.canvas.add(im); }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: actionData.display_params.x,
                top: actionData.display_params.y,
                originX: 'center',
                originY: 'center'
            });

        let text = new fabric.Text(actionData.action_params.name, {
            left: actionData.display_params.x,
            top: actionData.display_params.y + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE
        });

        this.canvas.add(text);
    }

    private drawEdge(triggerData: TriggerData) {
        let startX: number, startY: number, endX: number, endY: number, angle: number;

        //if (triggerData.src_node_id === 0) {    // TODO: find better way to check
            startX = triggerData.display_params.start_x;
            startY = triggerData.display_params.start_y;
            endX = triggerData.display_params.end_x;
            endY = triggerData.display_params.end_y;
            angle = Math.atan((endY - startY) / (endX - startX));   // in radian
        //} else {
        //    let srcNode = this.graph.getNodeData(triggerData.src_node_id);
        //    let dstNode = this.graph.getNodeData(triggerData.dst_node_id);
        //    startX = srcNode.display_params.x + NODE_SIZE / 2 * Math.cos(triggerData.display_params.src_conn_deg * Math.PI / 180);
        //    startY = srcNode.display_params.y + NODE_SIZE / 2 * Math.sin(triggerData.display_params.src_conn_deg * Math.PI / 180);
        //    endX = dstNode.display_params.x + NODE_SIZE / 2 * Math.cos(triggerData.display_params.dst_conn_deg * Math.PI / 180);
        //    endY = dstNode.display_params.y + NODE_SIZE / 2 * Math.sin(triggerData.display_params.dst_conn_deg * Math.PI / 180);
        //    angle = Math.atan((endY - startY) / (endX - startX)); // in radian
        //}

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

        let triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
        });

        // redraw arrow head when the line is moving
        line.on('moving', (options) => {
        });
        // connect if arrow intersect with node
        line.on('modified', (options) => {
            for (let actionData of this.graph.node()) {
                let distance = Math.sqrt(Math.pow(line.left - actionData.display_params.x, 2) + Math.pow(line.top - actionData.display_params.y, 2));
                if (distance < NODE_SIZE / 2) {
                    this.event.pushEvent(new ConnectEdgeToSrcNodeEvent(this.graph, actionData, triggerData, 400, 400));
                    this.redrawCanvas();
                    break;
                }
            }
        })

        this.canvas.add(line, triangle);
    }

    private redrawCanvas() {
        this.canvas.clear();

        for (let node of this.graph.node()) {
            this.drawNode(node);
        }

        for (let edge of this.graph.edge()) {
            this.drawEdge(edge);
        }
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
                    x: 100,
                    y: 100
                }
            },
            {
                node_id: 2,
                action_id: 2,
                action_params: {
                    name: 'Motor 2'
                },
                display_params: {
                    x: 300,
                    y: 100
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
                    start_y: 300,
                    end_x: 500,
                    end_y: 500
                }
            }
        ]
    };

}