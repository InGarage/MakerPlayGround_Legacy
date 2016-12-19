import { Component, AfterViewInit } from '@angular/core';
import * as fabric from 'fabric';

@Component({
  moduleId: module.id,
  selector: 'home',
  templateUrl: `home.component.html`,
})
export class HomeComponent implements AfterViewInit  {
  private canvas: fabric.ICanvas;
  ngAfterViewInit(){
    this.canvas = new fabric.Canvas('c');
    let rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: 'red',
      width: 75,
      height: 75
    });
    this.canvas.add(rect);
  }
}
