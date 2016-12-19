import { Component } from '@angular/core';
import * as fabric from 'fabric';
import * as $ from 'jquery';

@Component({
  moduleId: module.id,
  selector: 'tutorial',
  templateUrl: `tutorial.component.html`,
})
export class TutorialComponent  {
  ngAfterViewInit(){
     $('#gring').click(function(){
        $(this).hide();
     });
  }

}
