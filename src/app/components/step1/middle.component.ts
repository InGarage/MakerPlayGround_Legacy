
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GraphData, NodeData } from './graphmodel';
import { GraphCanvas } from './graphcanvas';

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


    constructor() {
        this.model = GraphData.createGraphDataFromJSON(this.dummyGraph);
    }

    ngOnInit() {
        this.canvas = new GraphCanvas('c');
        this.canvas.redraw(this.model);
        this.canvas.on('edge:move', (options) => {
            this.model = this.model.moveEdge(options.target_id, options.start_x, options.end_x, options.start_y, options.end_y)
            this.canvas.redraw(this.model);
        });
        this.canvas.on('node:selected', (options) => {
            this.nodeSelect.emit(this.model.getNode(options.target_id));
        });
        this.canvas.on('object:deselected', (options) => {
            this.nodeSelect.emit(null);
        })
    }


    // TODO: dummy data to be removed
    dummyGraph: any = {
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
                'dst_node_id': 0,
                'start_x': 300,
                'start_y': 300,
                'end_x': 500,
                'end_y': 500
            }
        }
    };

}