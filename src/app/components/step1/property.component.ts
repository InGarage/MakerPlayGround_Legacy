import { Component, Input } from '@angular/core';
//import { GraphData, ActionData, TriggerData } from './graph';
import { Action, ActionGroup, ActionProperty } from './action';
import * as fabric from 'fabric';
import { NodeData } from './graphmodel';


@Component({
  selector: 'property',
  templateUrl: `./property.component.html`,
  styleUrls: ['./step1.component.css']
})
export class PropertyComponent  {

  showProperties: boolean = false;
  ObjProperties: ActionProperty[];

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
    if (objData === null) {
      this.showProperties = false;
    }
    else {
      this.showProperties = true;
      let action = this.findActionById(objData.getActionId());
      this.ObjProperties = action.property;
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

}
