
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GraphData, NodeData } from './graphmodel';
//import { GraphCanvas } from './graphcanvas';
import { GraphCanvas, CanvasEventOptions, CanvasEventTypes } from './newgraphcanvas';
import { Action } from './action';
import { UndoStack } from './undostack';


//import { EventManager } from './eventmanager';
//import { ConnectEdgeToSrcNodeEvent } from './graphevent';

import 'fabric';

@Component({
    selector: 'middle',
    templateUrl: `./middle.component.html`,
    styleUrls: ['./step1.component.css']
})

export class MiddleComponent implements OnInit {

    @Output() nodeSelect = new EventEmitter<NodeData>(); 
    private canvas: GraphCanvas;
    private model: GraphData;
    private undoStack: UndoStack<GraphData>;

    constructor() {
        this.model = GraphData.createGraphDataFromJSON(this.dummyGraph);
        this.undoStack = new UndoStack<GraphData>();
        this.undoStack.push(this.model);
    }

    addNewNode(newAction: Action) {
        this.model = this.model.addNode(newAction);
        this.undoStack.push(this.model);
        this.canvas.redraw(this.model);
    }

    updataPropData(data) {
        this.canvas.updateDataBinding(data);
        this.model = this.model.updateProperty(data);
    }

    updataPropDataFinish(data) {
        //if (data !== undefined) {
            //this.model = this.model.updateProperty(data);
            //this.canvas.redraw(this.model);
        //}
    }

    undo() {
        this.model = this.undoStack.undo();
        // Emit this event to hide properties window after undo button is clicked
        this.nodeSelect.emit(null);
        this.canvas.deselectAllNode();
        this.canvas.redraw(this.model);
    }

    ngOnInit() {
        this.canvas = new GraphCanvas('c');
        this.canvas.redraw(this.model);

        this.canvas.on('node:move', (options) => {
            this.model = this.model.moveNode(options.target_id, options.center_x, options.center_y);
            this.undoStack.push(this.model);
            this.canvas.redraw(this.model);
        });

        this.canvas.on('node:remove', (options) => {
            this.model = this.model.removeNode(options.target_id);
            this.undoStack.push(this.model);
            this.canvas.redraw(this.model);
        });

        this.canvas.on('edge:move', (options) => {
            this.model = this.model.moveEdge(options.target_id, options.start_x, options.end_x, options.start_y, options.end_y); 
            this.undoStack.push(this.model);
            this.canvas.redraw(this.model);
        });

        this.canvas.on('node:selected', (options) => {
            this.nodeSelect.emit(this.model.getNode(options.target_id));
        });

        this.canvas.on('object:deselected', (options) => {
            console.log('ei');
            this.nodeSelect.emit(null);
            this.canvas.redraw(this.model);
        });

        this.canvas.on('edge:connectionDst', (options) => {
            this.model = this.model.connectionEdgeOfDstNode(options.dst_node_id
            , options.target_id, options.start_x, options.end_x, options.start_y, options.end_y);
            this.undoStack.push(this.model);
            this.canvas.redraw(this.model);
        });

        this.canvas.on('edge:connectionSrc', (options) => {
            this.model = this.model.connectionEdgeOfSrcNode(options.src_node_id
            , options.target_id, options.start_x, options.end_x, options.start_y, options.end_y);
            this.undoStack.push(this.model);
            this.canvas.redraw(this.model);      
        });
    }


    // TODO: dummy data to be removed
    dummyGraph: any = {
        'nodes': {
            '23e8d5e9-7f0f-40bd-a60b-05a2aea4579b': {
                'action_id': 1,
                'display_x': 500,
                'display_y': 300,
                'params': {
                    'name': 'Motor 1'
                }
            },
            '3a27eaa4-7971-49d8-9d74-2e79a49054ed': {
                'action_id': 2,
                'display_x': 800,
                'display_y': 300,
                'params': {
                    'name': 'Motor 1',
                    'Periode': 'some value',
                }
            }
        },
        'edges': {
            '361cf758-db06-4c9d-9b31-2d88269554bb': {
                'trigger_id': 1,
                'params': {
                    'temp': 50
                },
                'src_node_id': '',
                'dst_node_id': '',
                'start_x': 300,
                'start_y': 300,
                'end_x': 500,
                'end_y': 500
            },
            '87755327-ece5-4b80-bbf1-37a09c350196': {
                'trigger_id': 2,
                'params': {
                    'temp': 50
                },
                'src_node_id': '',
                'dst_node_id': '',
                'start_x': 400,
                'start_y': 200,
                'end_x': 500,
                'end_y': 200
            }
        }       
    };
    /*dummyGraph: any = {
        'nodes': {
            1: {
                'action_id': 1,
                'display_x': 500,
                'display_y': 300,
                'params': {
                    'name': 'Motor 1'
                }
            },
            2: {
                'action_id': 2,
                'display_x': 800,
                'display_y': 300,
                'params': {
                    'name': 'Motor 1'
                }
            }
        },
        'edges': {
            1: {
                'trigger_id': 1,
                'params': {
                    'temp': 50
                },
                'src_node_id': 0,
                'src_angle': 0,
                'dst_node_id': 0,
                'dst_angle': 0,
                'start_x': 300,
                'start_y': 300,
                'end_x': 500,
                'end_y': 500
            },
            2: {
                'trigger_id': 2,
                'params': {
                    'temp': 50
                },
                'src_node_id': 0,
                'src_angle': 0,
                'dst_node_id': 0,
                'dst_angle': 0,
                'start_x': 400,
                'start_y': 200,
                'end_x': 500,
                'end_y': 200
            }
        }       
    };*/

}