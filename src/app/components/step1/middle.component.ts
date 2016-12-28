import { Component, Input, OnInit, OnChanges, ElementRef, Renderer } from '@angular/core';
import 'fabric';
import * as $ from 'jquery';
import { Action, ActionGroup } from './action';
import { GraphData, ActionData, TriggerData } from './graph';
import { GraphView } from './graphview';

@Component({
  selector: 'middle',
  templateUrl: `./middle.component.html`,
  styleUrls: ['./step1.component.css']
})

export class MiddleComponent implements OnInit {
  canvas: fabric.ICanvas;

  ngOnInit() {
    this.canvas = new fabric.Canvas('c');
    new GraphView().initCanvasFromGraph(this.canvas, this.dummyGraph);
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
        src_node_id: 1,
        dst_node_id: 2,
        display_params: {
          src_conn_deg: 0,
          dst_conn_deg: 150,
          start_x: 0,
          start_y: 0,
          end_x: 0,
          end_y: 0
        }
      }
    ]
  };

}
