import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionGroup, Action } from './action';
import * as $ from 'jquery';

@Component({
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: []
})

export class ActionComponent {

  @Output() myEvent = new EventEmitter<Action>();

  actions: ActionGroup[];
  triggers: any[];
  showActionMenu: boolean = false;
  showTriggerMenu: boolean = false;
  windowHeight: number;
  maxHeight: number;

  constructor() {
    this.actions = require("./action.json");
    this.triggers = require("./trigger.json");

  }

  ngOnInit() {
    $(window).on("resize", () => {
      this.setElementHeight();
    }).resize();

    $(window).on("zoom", () => {
      this.setElementHeight();
    }).resize();
  }

/************************************************
 *    Deal with height of left-side menu        *
 *    depends on user's window                  *
 *    (execute on resizing and zooming)         *
 ************************************************/ 
  setElementHeight() {
    this.windowHeight = $(window).height();
    this.maxHeight = (this.windowHeight / 4) + 30;
    this.setStyles();
  }

  setStyles() {
    let styles = {
      'overflow-y': 'scroll',
      'width': '100%',
      'max-height': this.maxHeight + 'px',
    };
    return styles;
  }


/**********************************************************
 *    Deal with tree component in Action/Trigger menu     *
 *********************************************************/ 

  showTreeAction() {
    if (this.showActionMenu === true) {
      this.showActionMenu = false;
    }
    else {
      this.showActionMenu = true;
    }
  }

  showTreeTrigger() {
    if (this.showTriggerMenu === true) {
      this.showTriggerMenu = false;
    }
    else {
      this.showTriggerMenu = true;
    }
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }


/*******************************
 *  Output event handle        *
 *******************************/ 

  deleteState($event: any) {
    this.myEvent.emit($event);
  }

  selectedAction($event: any) {
    // Only emit event when the selected tree node isn't a header node
    /*if ($event.node.isLeaf) {
      this.myEvent.emit($event.node.data);
    }*/

    /* Tempolary; */
  if ($event.node.isLeaf) {
        this.myEvent.emit($event.node.data);
        
      }


  }


}
