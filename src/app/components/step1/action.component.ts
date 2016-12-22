import { Component, Input, OnInit, AfterContentChecked, AfterViewInit } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionsService } from '../../services/actions.service';
import { ActionGroup, Action, ActionProperty, ActionType, ControlType } from './action';

@Component({
  //moduleId: module.id,
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {
  //actions: Action[];
  //actions = ACTION;
  //test = Test;
  //types: any[];
  node: ActionGroup[];
  searchKeyword: string;
  content: any;
  options = { childrenField: 'cus_children' }  

  constructor() {
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }
}
