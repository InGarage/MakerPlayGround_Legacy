import { Component, Input, OnInit } from '@angular/core';
import { Action } from './action';
import 'fabric';

@Component({
  selector: 'middle',
  templateUrl: `./middle.component.html`,
  styleUrls: ['./step1.component.css']
})
export class MiddleComponent implements OnInit {

  canvas: fabric.ICanvas;

  ngOnInit() {
    this.canvas = new fabric.Canvas('c');
  }

  addAction(selectedAction: Action) {
    let imgObj = new Image();
    imgObj.src = selectedAction.image;
    imgObj.onload = () => {
      let imgInstance = new fabric.Image(imgObj, {
          left: 200,
          top: 200,
        });
      this.canvas.add(imgInstance);
    }
  }

}
