import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgModule }      from '@angular/core';
//import { GraphData, ActionData, TriggerData } from './graph';
import { Action, ActionGroup, ActionProperty } from './action';
import * as fabric from 'fabric';
import { GraphData, NodeData } from './graphmodel';


@Component({
  selector: 'property',
  templateUrl: `./property.component.html`,
  styleUrls: ['./step1.component.css']
})
export class PropertyComponent  {
  @Input() count = 0;
  @Output() countChange = new EventEmitter();
  @Output() updateData = new EventEmitter(); 

  showProperties: boolean = false;
  //ObjProperties: ActionProperty[];
  ObjProperties = [];
  previousObjData: NodeData;

  name: string;

  actions: ActionGroup[];
  triggers: any[];

  constructor() {
    this.actions = require("./action.json");
    this.triggers = require("./trigger.json"); 
  }

    private findActionById(id: number): Action {
        for (let actionGroup of this.actions) {
            for (let action of actionGroup.children) {
                if (action.id === id)
                    return action;
            }
        }
        return undefined;
    }

  populatePropertyWindow(objData: NodeData) {
    // Update data to data structure
    if (objData === null) {
      this.showProperties = false;


      // for (let o of this.ObjProperties) {
      //   console.log(o.value);
      // }

      // Get value from latest selected object
      // for (let obj of this.ObjProperties) {
      //   let data = [];
      //   data.push(obj.name);
      //   let x = (<HTMLInputElement>document.getElementById(obj.name)).value;
      //   data.push(x);
      //   this.updateData.emit(data);
      // }

    }
    // Only show data
    else {
      console.log(objData);
      this.previousObjData = objData;
      this.ObjProperties = [];
      this.showProperties = true;
      let action = this.findActionById(objData.getActionId());

      let obj = {};
      for (let prop of action.property) {
        obj = {
          uid: objData.getNodeId(),
          name: prop.name,
          value: objData.getActionParams(prop.name),
          control: prop.control,
        }
        this.ObjProperties.push(obj);
      }
    }
  }

  setFormStyles() {
    let styles = {
      'padding-left': '30px',
      'padding-right': '30px',
      'padding-bottom': '15px',
    };
    return styles;
  }

  hideProperties() {
    this.showProperties = false;
  }

  onKey(objData, newValue) {
    objData.value = newValue;
    this.updateData.emit(objData);
  }

}
