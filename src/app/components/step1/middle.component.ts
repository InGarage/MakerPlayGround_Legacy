import { Component, Input, OnInit } from '@angular/core';
import { Action } from './action';
import 'fabric';

@Component({
  selector: 'middle',
  templateUrl: `./middle.component.html`,
  styleUrls: ['./step1.component.css']
})
export class MiddleComponent implements OnInit {

  //canvas: fabric.ICanvas;
  canvas: any;

  ngOnInit() {
    this.canvas = new fabric.Canvas('c');
  }

  addAction(selectedAction: any) {
    console.log('hi');
    /*var imgObj = new Image();
    fabric.Image.fromURL(selectedAction.image, function (img) {
        // deal with image
       img.left = 100,
       img.top = 100,
       this.canvas.add(img);
       console.log('hi');
      });
    var ctx= this.canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(100,75,50,0,2*Math.PI);
    ctx.stroke();
    
    var canvas = new fabric.Canvas('c');
    var imgObj = new Image();
    */

/*
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
    */
/*
    var canvas = <HTMLCanvasElement> document.getElementById("c");
    var context = canvas.getContext('2d');

    var base_image =  new Image();
    base_image.src = selectedAction.image;
    base_image.onload = function(){
      var imageWidth = base_image.width;
      var imageHeight = base_image.height;
      context.drawImage(base_image, 100, 100);
      console.log(imageWidth);
      console.log(imageHeight);
    }*/

  }

}
