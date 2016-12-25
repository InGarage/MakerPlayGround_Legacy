import { Component } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionGroup } from './action';

@Component({
  //moduleId: module.id,
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {
  actions: ActionGroup[];

  constructor() {
    this.actions = require("./action.json");
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }
}
