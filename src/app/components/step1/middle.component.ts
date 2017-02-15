
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GraphData, NodeData, EdgeData } from './graphmodel';
import { GraphCanvas, CanvasEventOptions, CanvasEventTypes } from './newgraphcanvas';
import { Action } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { UndoStack } from './undostack';
import { PropertyValue } from './propertyvalue';


@Component({
    selector: 'middle',
    templateUrl: `./middle.component.html`,
    styleUrls: ['./step1.component.css']
})

export class MiddleComponent implements OnInit {

    objectSelected: NodeData | EdgeData;
    typeOfObjectSelected: typeof NodeData | typeof EdgeData;
    private canvas: GraphCanvas;
    private model: GraphData;

    constructor() {
        this.model = GraphData.createGraphDataFromJSON(this.dummyGraph);
        // this.undoStack = new UndoStack<GraphData>();
        // this.undoStack.push(this.model);

        const test = '{0} is pressed {1} times';    
        const args = ['test1', 'test2'];
        const test2 = test.replace(/{(\d+)}/g, (match,number) => {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
        console.log(test2);
    }

    addNewNode(newAction: Action) {
        this.model.addNode(newAction);
        this.canvas.redraw();
    }

    addNewEdge(newTrigger: Trigger) {
        this.model.addEdge(newTrigger);
        this.canvas.redraw();      
    }

    updataPropData(data: PropertyValue) {
        this.canvas.updateDataBinding(data);
    }

    updataPropDataFinish(data: PropertyValue) {
        // We call the proper method to update property in graph model by looking
        // at type of object we are selecting
        if (this.typeOfObjectSelected === NodeData)
            this.model.updateNodeProperty(data);
        else {
            this.model.updateEdgeProperty(data);
        }
        this.canvas.redraw();
    }

    undo() {
        this.objectSelected = undefined;
        this.canvas.deselectAllNode();
        this.model.undo();
        this.canvas.redraw();
    }

    ngOnInit() {
        this.canvas = new GraphCanvas(this.model, 'c');
        this.canvas.redraw();

        this.canvas.on('node:move', (options) => {
            this.model.moveNode(options.target_id, options.center_x, options.center_y);
            this.canvas.redraw();
        });

        this.canvas.on('node:remove', (options) => {
            console.log('remove');
            this.model.removeNode(options.target_id);
            this.canvas.redraw();
        });

        this.canvas.on('edge:move', (options) => {
            this.model.moveEdge(options.target_id, options.start_x, options.end_x, options.start_y, options.end_y); 
            this.canvas.redraw();
        });

        this.canvas.on('node:selected', (options) => {
            this.objectSelected = this.model.getNodeById(options.target_id);
            this.typeOfObjectSelected = NodeData;
        });

        this.canvas.on('edge:selected', (options) => { 
            this.objectSelected = this.model.getEdgeById(options.target_id);
            this.typeOfObjectSelected = EdgeData;
        });

        this.canvas.on('object:deselected', (options) => {
            console.log('deselect');
            this.objectSelected = undefined;
            this.canvas.redraw();
        });

        this.canvas.on('edge:connectionDst', (options) => {
            this.model.connectionEdgeOfDstNode(options.dst_node_id
            , options.target_id, options.start_x, options.end_x, options.start_y, options.end_y);
            this.canvas.redraw();
        });

        this.canvas.on('edge:connectionSrc', (options) => {
            this.model.connectionEdgeOfSrcNode(options.src_node_id
            , options.target_id, options.start_x, options.end_x, options.start_y, options.end_y);
            this.canvas.redraw();      
        });

        this.canvas.on('edge:combine', (options) => {
            //let triggerId = options.toBeMissing.getTriggerId();
            let params = {};
            //for (const id of triggerId) {
            for (let i=0; i<options.toBeMissing.getNumberOfTrigger(); i++) {
                let trigger = TriggerHelper.findTriggerById(options.toBeMissing.getTriggerId(i)); // Get this trigger from json
                let obj = {};
                trigger.params.forEach((param, index) => {
                    const param_name = param.name;
                    obj[param_name] = options.toBeMissing.getTriggerParams(i, param.name);
                });
                params[i] = obj;
            }

            //triggerId = options.toBeCombined.getTriggerId();
            //for (const id of triggerId) {
            for (let i=0; i<options.toBeCombined.getNumberOfTrigger(); i++) {
                let trigger = TriggerHelper.findTriggerById(options.toBeCombined.getTriggerId(i)); // Get this trigger from json
                let obj = {};
                trigger.params.forEach((param, index) => {
                    const param_name = param.name;
                    obj[param_name] = options.toBeCombined.getTriggerParams(i, param.name);
                });
                params[i] = obj;
            }
            
            //this.model.mergeEdge(options.toBeMissing.getEdgeId(), options.toBeMissing.getTriggerId(), params, options.toBeCombined.getEdgeId(), options.toBeCombined.getTriggerId());
            this.canvas.redraw();  
        });
    }


    // TODO: dummy data to be removed
    dummyGraph: any = {
        'nodes': {
            '23e8d5e9-7f0f-40bd-a60b-05a2aea4579b': {
                'action_id': 'LED_1',
                'display_x': 500,
                'display_y': 300,
                'params': {
                    'name': ['Dim 1'],
                    'brightness': ["30","%"]
                }
            },
            '3a27eaa4-7971-49d8-9d74-2e79a49054ed': {
                'action_id': 'LED_2',
                'display_x': 800,
                'display_y': 300,
                'params': {
                    'name': ['Blink 1'],
                    'frequency': ["10","Hz"]
                }
            }
        },
        'edges': {
            '361cf758-db06-4c9d-9b31-2d88269554bb': {
                // 'trigger_id': ['Button_3','Button_3'],
                // 'params': {
                //     'Button_3': { 'name': ["xxx"], 'time': ["3","times"] },
                //     'Button_3': { 'name': ["yyy"], 'time': ["4","times"]  },
                // },
                'trigger': [
                    {
                        'id': 'Button_3',
                        'params': {'name': ['xxx'], 'time': ['3', 'times']}
                    },
                    {
                        'id': 'Button_3',
                        'params': {'name': ['yyy'], 'time': ['4', 'times']}
                    }
                ],
                'src_node_id': '',
                'dst_node_id': '',
                'start_x': 300,
                'start_y': 300,
                'end_x': 500,
                'end_y': 500
            },
            '877cf758-ece5-4b80-bbf1-37a09c350196': {
                'trigger_id': ['Button_3'],
                'params': {
                    'Button_3': { 'name': ["zzz"], 'time': ["3","times"] },
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
   
}