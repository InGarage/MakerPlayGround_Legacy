
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GraphData, NodeData, EdgeData } from './graphmodel';
import { GraphCanvas, CanvasEventOptions, CanvasEventTypes } from './newgraphcanvas';
import { Action } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { UndoStack } from './undostack';
import { PropertyValue } from './propertyvalue';
import { Auth } from '../../auth.service';
import { ProjectService } from '../../services/projects.service';

@Component({
    selector: 'middle',
    templateUrl: `./middle.component.html`,
    styleUrls: ['./step1.component.css'],
    //providers: [ProjectService, Auth]
})

export class MiddleComponent implements OnInit, OnDestroy {

    objectSelected: NodeData | EdgeData;
    typeOfObjectSelected: typeof NodeData | typeof EdgeData;
    private canvas: GraphCanvas;
    private model: GraphData;
    interval: any;
    panning = false;

    constructor(private projectService: ProjectService) {
        console.log('project', projectService.getCurrentProject());
        //console.log('project', JSON.parse(projectService.getCurrentProject().project_data));
        this.model = GraphData.createGraphDataFromJSON(projectService.getCurrentProject().project_data/*JSON.parse(projectService.getCurrentProject().project_data)*/);
        // this.undoStack = new UndoStack<GraphData>();
        // this.undoStack.push(this.model);

        // Autosave every 15 seconds
        this.interval = setInterval(() => {
            let project = projectService.getCurrentProject();
            project.project_data = this.model.toJSON();
            projectService.saveProject(project).toPromise().then(() => {
                console.log('save complete');
            }, () => {
                console.log('save reject');
            });
        }, 15000);
    }

    ngOnDestroy() {
        console.log('clear interval');
        clearInterval(this.interval);
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

    redo() {
        this.objectSelected = undefined;
        this.canvas.deselectAllNode();
        this.model.redo();
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

        this.canvas.on('trigger:remove', (options) => {
            this.model.removeTrigger(options.triggerIndex, options.target_id);
            this.canvas.redraw();
        })

        this.canvas.on('edge:remove', (options) => {
            this.model.removeEdge(options.target_id)
            this.canvas.redraw();
        })

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
            this.model.mergeEdge(options.toBeMissing.getEdgeId(), options.toBeCombined.getEdgeId());
            this.canvas.redraw();
        });
    }

    setUndoBtnPosition() {
        let styles = {
            'position': 'absolute',
            'padding-left': '10px',
            'padding-top': '10px',
            'width': '70px',
            'height': '40px',
            'z-index': '5',
        };
        return styles;
    }

    setRedoBtnPosition() {
        let styles = {
            'position': 'absolute',
            'margin-left': '50px',
            'padding-top': '10px',
            'width': '70px',
            'height': '40px',
            'z-index': '5',
        };
        return styles;
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
                    'brightness': ["30", "%"]
                }
            },
            '3a27eaa4-7971-49d8-9d74-2e79a49054ed': {
                'action_id': 'LED_2',
                'display_x': 800,
                'display_y': 300,
                'params': {
                    'name': ['Blink 1'],
                    'frequency': ["10", "Hz"]
                }
            }
        },
        'edges': {
            '361cf758-db06-4c9d-9b31-2d88269554bb': {
                'trigger': [
                    {
                        'id': 'Button_3',
                        'params': { 'name': ['aaa'], 'time': ['3', 'times'] }
                    },
                    {
                        'id': 'Button_3',
                        'params': { 'name': ['bbb'], 'time': ['4', 'times'] }
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
                'trigger': [
                    {
                        'id': 'Button_3',
                        'params': { 'name': ['xxx'], 'time': ['5', 'times'] }
                    },
                    {
                        'id': 'Button_3',
                        'params': { 'name': ['yyy'], 'time': ['6', 'times'] }
                    }
                ],
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