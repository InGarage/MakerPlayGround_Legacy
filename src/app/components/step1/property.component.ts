import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
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
  @Input() selectedNode: NodeData;
  @Output() updateDataFinish = new EventEmitter();
  @Output() updateData = new EventEmitter(); 

  showProperties: boolean = false;
  //ObjProperties: ActionProperty[];
  ObjProperties = [];
  previousObjData: NodeData;
  dirty: boolean;

  valueToBeUpdated;

  name: string;

  actions: ActionGroup[];
  triggers: any[];

  constructor() {
    this.actions = require("./action.json");
    this.triggers = require("./trigger.json"); 
  }

  ngOnChanges(changes: SimpleChange) { 
    if (this.selectedNode !== undefined)
      this.populatePropertyWindow(this.selectedNode);
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
      if (this.dirty)
        this.updateDataFinish.emit(this.ObjProperties);

      this.showProperties = false;
    }
    // Only show data
    else {
      // click friend
      if ((this.previousObjData !== null) && (this.dirty)) { 
          console.log('Save');
          this.updateDataFinish.emit(this.ObjProperties);
      }
      this.dirty = false;
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

  onKey(objData) {
    this.dirty = true;
    this.updateData.emit(objData);
  }

  onOutOfFocus() {
    this.dirty = false;
    this.updateDataFinish.emit(this.ObjProperties);
  }

}
