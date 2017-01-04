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

  ngOnInit(){
    this.setElementWidth();
  }

  setElementWidth() {
    this.windowWidth = $(window).width();
    // componentMenuWidth equal to 20 percent of windowWidth
    this.componentMenuWidth = (this.windowWidth/5) + 'px';
    this.setComponentMenuStyles();
  }

  setComponentMenuStyles() {
    let styles = {
      'position': 'fixed',
      'float': 'left',
      'margin-left': '30px',
      'margin-right': '30px',
      'z-index': '5',
      'width': this.componentMenuWidth,
    };
    return styles;
  }
  
}

