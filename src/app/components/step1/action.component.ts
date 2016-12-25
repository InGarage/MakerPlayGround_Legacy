import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionGroup, Action } from './action';

@Component({
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {

  @Output() myEvent = new EventEmitter<Action>();

  actions: ActionGroup[];

  constructor() {
    this.actions = require("./action.json");
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  selectedAction($event: any) {
    // Only emit event when the selected tree node isn't a header node
    if ($event.node.isLeaf) {
      this.myEvent.emit($event.node.data);
    }
  }
}
