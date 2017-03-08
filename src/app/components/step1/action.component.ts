import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { Action, ActionGroup, ActionHelper } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import * as $ from 'jquery';
import { KeysPipe } from './pipe';

@Component({
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {

  @Output() addNode = new EventEmitter<Action>();
  @Output() addEdge = new EventEmitter<Trigger>();

  actions: ActionGroup[];
  triggers: any[];
  showActionMenu: boolean = false;
  showTriggerMenu: boolean = false;
  windowHeight: number;
  maxHeight: number;

  windowWidth: number;
  componentMenuWidth: string;
  componentMenuHeight: string;  
  maxActionHeight: number;
  maxTriggerHeight: number;
  actionCurrentHeight: number;
  triggerCurrentHeight: number;
  styles: any;

  constructor() {
    this.actions = ActionHelper.actionData;
    this.triggers = TriggerHelper.triggerData;

  }

  ngOnInit() {
    this.setElementWidth();
    this.setElementHeight();

    $(window).on("resize", () => {
      this.setElementWidth();
      this.setElementHeight();
    }).resize();
  }

  setElementWidth() {
    this.windowWidth = $(window).width();
    // componentMenuWidth equal to 20 percent of windowWidth
    this.componentMenuWidth = (this.windowWidth/5) + 'px';
    this.setFlexMenuStyles();
  }

  setFlexMenuStyles() {
    let styles = {
      'display': 'flex',
      'flex-flow': 'column nowrap',
      'justify-content': 'flex-start',
      'align-items': 'stretch',
    };
    return styles;
  }


/************************************************
 *    Deal with height of left-side menu        *
 *    depends on user's window                  *
 *    (execute on resizing and zooming)         *
 ************************************************/ 
  setElementHeight() {
    this.windowHeight = $(window).height();
    this.maxHeight = this.windowHeight;
    this.setFlexMenuStyles();
  }

  setActionStyles() {
    this.styles = {
      'overflow-y': 'auto',
      'width': '100%',
      'max-height': this.maxActionHeight + 'px',
    };

    return this.styles;
  }

  setTriggerStyles() {

    this.styles = {
      'overflow-y': 'auto',
      'width': '100%',
      'max-height': this.maxTriggerHeight + 'px',
    };

    return this.styles;
  }


/**********************************************************
 *    Deal with tree component in Action/Trigger menu     *
 *********************************************************/ 

  toggleTreeview() {
    this.manageFlexBox();
  }

  manageFlexBox() {
    setTimeout(() => {
      let getTrigger = document.getElementById("trigger");
      this.triggerCurrentHeight = getTrigger.offsetHeight;

      this.maxActionHeight = this.maxHeight - (this.triggerCurrentHeight) - 100 - 150;

      let getAction = document.getElementById("action");
      this.actionCurrentHeight = getAction.offsetHeight;

      this.maxTriggerHeight = this.maxHeight - (this.actionCurrentHeight) - 100 - 150;
    }, 50);

    this.setActionStyles();
    this.setTriggerStyles();
  }

  showTreeAction() {
    if (this.showActionMenu === true) {
      this.showActionMenu = false;
      this.manageFlexBox();
    }
    else {
      this.showActionMenu = true;
      this.manageFlexBox();
    }
  }

  showTreeTrigger() {
    if (this.showTriggerMenu === true) {
      this.showTriggerMenu = false;
      this.manageFlexBox();
    }
    else {
      this.showTriggerMenu = true;
      this.manageFlexBox();
    }
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  filterEdges(text, tree) {
    tree.treeModel.filterEdges(text, true);
  }


/*******************************
 *  Output event handle        *
 *******************************/ 

  // deleteState($event: any) {
  //   this.myEvent.emit($event);
  // }

  selectedAction(action: any) {

    this.addNode.emit(action);
    // Only emit event when the selected tree node isn't a header node
    // if ($event.node.isLeaf) {
    //   this.addNode.emit($event.node.data);
    // }
  }

  selectedTrigger(trigger: any) {
    this.addEdge.emit(trigger);
  //   console.log($event.node.data);
  //   if ($event.node.isLeaf) {
  //     this.addEdge.emit($event.node.data);
  //   }
  }
}



