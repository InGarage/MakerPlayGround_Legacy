import { Component, Input } from '@angular/core';
import { Action,ActionGroup,ActionProperty } from './action';
import * as fabric from 'fabric';


@Component({
  selector: 'property',
  templateUrl: `./property.component.html`,
  styleUrls: ['./step1.component.css']
})
export class PropertyComponent  {

  showProperties: boolean = false;
  ObjProperties: ActionProperty[];

  populatePropertyWindow(ObjData: Action) {
    this.showProperties = true;
    this.ObjProperties = ObjData.property;
  }

  setFormStyles() {
    let styles = {
      'padding-left': '30px',
      'padding-right': '30px',
      'padding-top': '10px',
    };
    return styles;
  }

  hideProperties() {
    this.showProperties = false;
  }

}
