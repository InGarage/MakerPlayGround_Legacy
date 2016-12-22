import { Component, Input, OnInit, AfterContentChecked, AfterViewInit } from '@angular/core';
import { TreeModule } from 'angular2-tree-component';
import { ActionsService } from '../../services/actions.service';
//import { Action } from './action';
import { Test } from './action';
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
  test = Test;
  types: any[];
  searchKeyword: string;
  content: any;
  options = { childrenField: 'cus_children' }  

 nodes = [
    {
      id: 1,
      name: 'Motor',
      cus_children: [
        { id: 2, name: 'Active motor' },
        { id: 3, name: 'Inactive motor' }
      ]
    },
    {
      id: 4,
      name: 'LED',
      cus_children: [
        { id: 5, name: 'Active LED' },
        { id: 6, name: 'Inactive LED'},
        {
          id: 7,
          name: 'child2.2',
          cus_children: [
            { id: 8, name: 'subsub' }
          ]
        }
      ]
    }
  ];


  constructor(private actionsService: ActionsService) {
    this.searchKeyword = "";
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
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

}
