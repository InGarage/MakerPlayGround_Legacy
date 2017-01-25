import { Component, Input } from '@angular/core';
import * as fabric from 'fabric';
import * as $ from 'jquery';

@Component({
  selector: 'step1',
  templateUrl: `./step1.component.html`,
  styleUrls: ['./step1.component.css']
})
export class Step1Component  {

  windowWidth: number;
  componentMenuWidth: string;
  windowHeight: number;
  componentMenuHeight: string;
  minWidthMenu: string;
  minWidthCanvas: string;

  ngOnInit(){
    this.setElement();
    this.windowWidth = $(window).width();
    this.minWidthMenu = this.windowWidth*0.2 + 'px';
    this.minWidthCanvas = this.windowWidth*0.8 + 'px';

    $(window).on("resize", () => {
      this.setElement();
    }).resize();
  }

  setElement() {
    this.windowWidth = $(window).width();
    this.windowHeight = $(window).height();
    this.componentMenuHeight = (this.windowHeight-100) + 'px';
    this.setComponentMenuStyles();
    this.setCanvasStyles();
  }

  setComponentMenuStyles() {
    let styles = {
      'float': 'left',
      'padding-left': '15px',
      'width': this.windowWidth*0.2 + 'px',
      'height': this.componentMenuHeight,
      'background-color': '#f6f7f8',
      'border-right': '1px solid lightgray',
    };
    return styles;
  }

  setCanvasStyles() {
    let styles = {
      'float': 'left',
      'width': this.windowWidth*0.8 + 20 + 'px',
      //'width': this.windowWidth*0.8 + 'px',
      'height': this.componentMenuHeight,
      'background-color': '#eff1f6',
      'overflow': 'scroll',
    };
    return styles;
  }
  
}

