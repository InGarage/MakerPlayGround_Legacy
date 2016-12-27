import { Component, Input, OnInit, OnChanges, ElementRef, Renderer } from '@angular/core';
import { Action,ActionGroup } from './action';
import 'fabric';
import * as $ from 'jquery';
import { Trigger } from './trigger';
import { State } from './state';

@Component({
  selector: 'middle',
  templateUrl: `./middle.component.html`,
  styleUrls: ['./step1.component.css']
})
export class MiddleComponent {

  canvas: fabric.ICanvas;
  stateCount: number = 0;
  startTriggleCount: number = 0;
  hideControls_triggle: any = {
            'tl':false,
            'tr':false,
            'bl':false,
            'br':false,
            'ml':false,
            'mt':true,
            'mr':false,
            'mb':true,
            'mtr':true
        };
  hideControls_action: any = {
            'tl':true,
            'tr':true,
            'bl':true,
            'br':true,
            'ml':true,
            'mt':true,
            'mr':true,
            'mb':true,
            'mtr':true
        };

  createStartArrow() {



    this.startTriggleCount = this.startTriggleCount + 1;
    let id = 'start' + this.startTriggleCount;
    console.log(id);
    /*let line = new fabric.Line([200,100,200,200],{
      strokeWidth: 3,
      stroke: '#000',
      originX: 'center',
      originY: 'center',
      });

    let triangle = new fabric.Triangle({
      fill: '#000',
      top: 100,
      left: 200,
      height: 15,
      width: 15,
      originX: 'center',
      originY: 'center',
      });

    let arrow = new fabric.Group([ line, triangle ], {
        left: 200,
        top: 100,
        angle: 90,
        opacity: 0.2
      });

          let arrow2 = new fabric.Group([ line, triangle ], {
        left: 400,
        top: 300,
        angle: 90,
        opacity: 0.2
      });*/

    let arrow = new Trigger(100,100,200,100);


    arrow.set('id',id);
    arrow.set('left',500);
    arrow.set('top',100);
    arrow.setControlsVisibility(this.hideControls_triggle);
    this.canvas.add(arrow);
  }

  // Execute this when object is moving on canvas 
  objMoving() {
    this.canvas.on({
      'object:moving': function(selectedObj) {
        //$(".deleteBtn").remove(); 
        if (selectedObj.target) {
          //selectedObj.target
          console.log('an object was clicked and Moving! ');
        }  
      }
    });
  }

  mouseUp() {
    this.canvas.on({
      'mouse:up': function(selectedObj) {
        //$(".deleteBtn").remove(); 
        if (selectedObj.target) {
          //selectedObj.target
          console.log('mouse up');
        }  
      }
    });
  }

  // Execute this function when mouse hovered object on canvas 
  mouseOver() {
    this.canvas.on({
      'mouse:over': function(selectedObj) {
        if (selectedObj.target) {
          //console.log('an object was hovering!', selectedObj.target);
          }  
        }
      });

    /*'mouse:over': function(hoveredObj) {
        if (hoveredObj.target) {
          //console.log('an object is hovered')
          // Add code to call draggable anchor over this object

          // Show bin icon to allow user deleting this object 
          /*$(".deleteBtn").remove();
          let btnLeft = hoveredObj.target.oCoords.tr.x-10;
          let btnTop = hoveredObj.target.oCoords.tr.y-10;
          let deleteBtn = '<div class="deleteBtn"'
                  +'style="position:absolute;top:'+btnTop+'px;left:'+btnLeft
                  +'px;cursor:pointer;">'
                  + '<i class="fa fa-trash fa-lg" aria-hidden="true"></i></div>'
          $(".canvas-container").append(deleteBtn);
          }
        }*/
    }
  
  // Execute this when object is selected on canvas 
  objSelected() {
    this.canvas.on({
      'object:selected': (selectedObj) => {
        if (selectedObj) {
          // disable blurred when user clicked starting line 
          if (selectedObj.target.id.startsWith("start")) {
            selectedObj.target.opacity = 1;
            //console.log('You click triggle');
            this.createStartArrow();
            }
          if (selectedObj.target.id.startsWith("state")) {
            //add code to call edit property window of this object
            //console.log('you click state');
            }
          }
        }
      });
    }

    drawCanvas(data: Graph) {
      this.canvas.clear();
      for (var d of data) {
        this.canvas.add(d);
      }
      console.log(this.canvas.renderOnAddRemove);
    }

  ngOnInit() {
    this.canvas = new fabric.Canvas('c');

    let rect = new fabric.Rect();
    rect.set('top', 100);
    rect.set('left', 100);
    rect.set('fill', '#f00');
    rect.set('width', 200);
    rect.set('height',200);

    let testGroup = new fabric.Group([rect], {
        left: 400,
        top: 300,
        angle: 90,
        opacity: 0.2
      });

    this.canvas.add(testGroup);

   testGroup.setOpacity(1);

            this.canvas.renderAll();



    /*
    this.createStartArrow();

    this.objMoving();
    this.mouseOver();
    this.objSelected();
    this.mouseUp();

    let actions: ActionGroup[] = require("./action.json");
    let data: Graph = [];
    let state1 = new State(actions[0].children[0], 100, 100, 'dummy1');
    let state2 = new State(actions[0].children[1], 200, 100, 'dummy2');
    data.push(state1);
    data.push(state2);
    let arrow = new Trigger(200,300,300,300);
    data.push(arrow);

    this.drawCanvas(data);

    setTimeout(()=>{arrow.connectSrcAction(state1,45);console.log('hi');
    this.canvas.add(arrow);console.log(arrow);
    },2000);*/
    }


  deleteObj() {
    let activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.remove(activeObject);
      }
    }

  /* Add selected action to canvas */
  addAction(selectedAction: any) {
    console.log(selectedAction);
    this.stateCount = this.stateCount + 1;
    /*let id = 'state' + this.stateCount;
    let imgObj = new Image();
    imgObj.src = selectedAction.image;
    imgObj.onload = () => {
      let imgInstance = new fabric.Image(imgObj, {
          left: 100,
          top: 100,
          width: 75,
          height: 75,
        });
      imgInstance.set('id',id);
      imgInstance.set('data',selectedAction);
      imgInstance.setControlsVisibility(this.hideControls_action);
      this.canvas.add(imgInstance);
    }*/
    let action = new State(selectedAction,100,100,'dummy1');
    this.canvas.add(action);
  }



  /* Called by eventEmitter from action.component
   * argument event: specify what function is needed to Execute
   */
  getEvent(event: any) {
    // delete action
    if (event === 1) {
      this.deleteObj();
    }
    // add action
    else {
      this.addAction(event);
    }
  }


}


  type Graph = fabric.IObject[];

