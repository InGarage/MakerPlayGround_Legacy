import { Component, Input, OnInit, AfterContentChecked } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { Action } from './action';
import * as fabric from 'fabric';

let ACTION = [
  {
    group_name: "Motor",
    action: [
      {
        name: "Dummy Motor 1",
        datatype: "int",
        img: "/img/slide1.jpeg"
      },
      {
        name: "Dummy Motor 2",
        datatype: "string",
        img: ""
      }
    ]
  },
  {
    group_name: "Led",
    action: [
      {
        name: "Dummy Led 1",
        datatype: "int",
        img: ""
      },
      {
        name: "Dummy Led 2",
        datatype: "string",
        img: ""
      },
      {
        name: "Dummy Led 3",
        datatype: "string",
        img: ""
      }
    ]
  }
];

@Component({
  //moduleId: module.id,
  selector: 'action',
  templateUrl: `./action.component.html`,
  styleUrls: ['./step1.component.css'],
  providers: [ActionsService]
})

export class ActionComponent {
  //actions: Action[];
  actions = ACTION;
  types: any[];
  searchKeyword: string;
  content: any;

  constructor(private actionsService: ActionsService) {
    this.searchKeyword = "";
  }

  ngOnInit() {
    console.log(this.actions);
  }

  searchAction(search: string) {
    console.log(search);
    this.searchKeyword = search;
  }

  actionFilter(each: string) {
    console.log(each);
    if (this.searchKeyword !== "")
      return each.indexOf(this.searchKeyword) !== -1;
    else
      return true;
  }

  actionHeadFilter(type: any) {
    if (this.searchKeyword !== "") {
      // Show the header if at least one child exists
      for (let component of type.action) {
        if (component.name.indexOf(this.searchKeyword) !== -1)
          return true;
      }
      return false;
    }
    else {
      return true;
    }
  }

  displayImage(img: string) {
    //<img src="'+img+'" />'
  }

  /* action menu 
  ngAfterViewInit() {
    $('.tree-toggle').click(function () {
      $(this).parent().children('ul.tree').toggle(200);
    });

    $(function () {
      $('.tree-toggle').parent().children('ul.tree').toggle(200);
    })
  }*/
}
