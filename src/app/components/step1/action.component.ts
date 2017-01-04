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

  windowWidth: number;
  componentMenuWidth: string;
  componentMenuHeight: string;  
  maxActionHeight: number;
  maxTriggerHeight: number;
  actionCurrentHeight: number;
  triggerCurrentHeight: number;
  styles: any;

  constructor() {
    this.actions = require("./action.json");
    this.triggers = require("./trigger.json");

  }

  ngOnInit() {
    this.setElementWidth();
    this.setElementHeight();
/*
    $(window).on("resize", () => {
      this.setElementHeight();
    }).resize();*/
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
    //88 percent of window's height
    this.maxHeight = (this.windowHeight*8.8)/10;
    this.setFlexMenuStyles();
  }

  setActionStyles() {
    this.styles = {
      'overflow-y': 'scroll',
      'width': '100%',
      'max-height': this.maxActionHeight + 'px',
    };

    return this.styles;
  }

  setTriggerStyles() {

    this.styles = {
      'overflow-y': 'scroll',
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

      this.maxActionHeight = this.maxHeight - (this.triggerCurrentHeight) - 100;

      let getAction = document.getElementById("action");
      this.actionCurrentHeight = getAction.offsetHeight;

      this.maxTriggerHeight = this.maxHeight - (this.actionCurrentHeight) - 100;
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


/*******************************
 *  Output event handle        *
 *******************************/ 

  deleteState($event: any) {
    this.myEvent.emit($event);
  }

  selectedAction($event: any) {
    // Only emit event when the selected tree node isn't a header node
    if ($event.node.isLeaf) {
      this.myEvent.emit($event.node.data);
    }

    /* Tempolary; 
  if ($event.node.isLeaf) {
        this.myEvent.emit($event.node.data);
        
      }*/


  }


}
