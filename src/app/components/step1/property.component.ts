import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { NgModule }      from '@angular/core';
//import { GraphData, ActionData, TriggerData } from './graph';

import { Action, ActionGroup, ActionProperty, Trigger, TriggerGroup } from './action';
import { GraphData, NodeData, EdgeData } from './graphmodel';


@Component({
  selector: 'property',
  templateUrl: `./property.component.html`,
  styleUrls: ['./step1.component.css']
})
export class PropertyComponent  {
  @Input() selectedNode: NodeData;
  @Input() selectedEdge: EdgeData;
  @Output() updateDataFinish = new EventEmitter();
  @Output() updateData = new EventEmitter(); 

  showPropertiesNode: boolean = false;
  showPropertiesEdge: boolean = false;
  //ObjProperties: ActionProperty[];
  ObjPropertiesNode = [];
  ObjPropertiesEdge = [];
  previousObjDataNode: NodeData;
  previousObjDataEdge: EdgeData;
  dirty: boolean;

  valueToBeUpdated;

  name: string;

  actions: ActionGroup[];
  triggers: TriggerGroup[];

  constructor() {
    this.actions = require("./action.json");
    this.triggers = require("./trigger.json"); 
  }

  ngOnChanges(changes: SimpleChange) { 
    if (this.selectedNode !== undefined)
      this.populatePropertyWindowNode(this.selectedNode);
    if (this.selectedEdge !== undefined)
      this.populatePropertyWindowEdge(this.selectedEdge);
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

    private findTriggerById(id: number): Trigger {
        for (let triggerGroup of this.triggers) {
            for (let trigger of triggerGroup.children) {
                if (trigger.id === id)
                    return trigger;
            }
        }
        return undefined;
    }

  populatePropertyWindowNode(objData: NodeData) {
    // Update data to data structure
    if (objData === null) {
      if (this.dirty)
        this.updateDataFinish.emit(this.ObjPropertiesNode);

      this.showPropertiesNode = false;
    }
    // Only show data
    else {
      // click friend
      if ((this.previousObjDataNode !== null) && (this.dirty)) { 
          console.log('Save');
          this.updateDataFinish.emit(this.ObjPropertiesNode);
      }
      this.dirty = false;
      this.previousObjDataNode = objData;
      this.ObjPropertiesNode = [];
      this.showPropertiesNode = true;
      let action = this.findActionById(objData.getActionId());

      let obj = {};
      for (let prop of action.property) {
        obj = {
          uid: objData.getNodeId(),
          name: prop.name,
          value: objData.getActionParams(prop.name),
          control: prop.control,
        }
        this.ObjPropertiesNode.push(obj);
      }
    }
  }

  populatePropertyWindowEdge(objData: EdgeData) {
    if (objData === null) {
      this.showPropertiesEdge = false;
    }
    else {
      // click friend
      // if ((this.previousObjData !== null) && (this.dirty)) { 
      //     console.log('Save');
      //     this.updateDataFinish.emit(this.ObjProperties);
      // }
      // this.dirty = false;
      this.previousObjDataEdge = objData;
      this.ObjPropertiesEdge = [];
      this.showPropertiesEdge = true;
      let trigger = this.findActionById(objData.getTriggerId());

      console.log(objData.getEdgeId());
      console.log(objData.getTriggerParams("Temperature"));

      let obj = {};
      for (let prop of trigger.property) {
        console.log(prop.control);
        obj = {
          uid: objData.getEdgeId(),
          name: prop.name,
          value: objData.getTriggerParams(prop.name),
          control: prop.control,
        }
        this.ObjPropertiesEdge.push(obj);
  
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
    if (this.showPropertiesNode === true)
      this.showPropertiesNode = false;
    if (this.showPropertiesEdge === true)
      this.showPropertiesEdge = false;
  }

  onKey(objData) {
    this.dirty = true;
    this.updateData.emit(objData);
  }

  onOutOfFocus() {
    this.dirty = false;
    this.updateDataFinish.emit(this.ObjPropertiesNode);
  }

}
