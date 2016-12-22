import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionGroup } from './action';

@Component({
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {

  @Output() myEvent = new EventEmitter();

  actions: ActionGroup[];

  constructor() {
    this.actions = require("./action.json");
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  selectedAction(selectedAction: any) {
    /* Only emit data when selectedAction isn't a parent */
    if (selectedAction.node.level !== 1) {
      this.myEvent.emit(selectedAction.node.data);
    }
  }
}
