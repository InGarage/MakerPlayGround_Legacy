import { Component, Input } from '@angular/core';
//import { Action } from './action';
import * as fabric from 'fabric';
import * as $ from 'jquery';

@Component({
  //moduleId: module.id,
  selector: 'step1',
  templateUrl: `./step1.component.html`,
  styleUrls: ['./step1.component.css']
})
export class Step1Component  {
  //@Input()
  //post: Action;

  ngOnInit(){
    var setElementHeight = function () {
      var height = $(window).height();
      $('.autoheight').css('min-height', (height));
      };

    $(window).on("resize", function () {
      setElementHeight();
      }).resize();
  }
}
