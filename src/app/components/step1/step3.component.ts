import { Component, Input } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { ProjectService } from '../../services/projects.service';

import * as $ from 'jquery';

@Component({
  selector: 'step3',
  templateUrl: `./step3.component.html`,
  styleUrls: ['./step1.component.css']
})
export class Step3Component {

  devices = {devices:[],sourcecode: ''};
  projectName: string;

  constructor(private router: Router, private projectService: ProjectService) {
    this.projectName = projectService.getCurrentProject().project_name;
    
    this.projectService.generateCode(this.projectService.getCurrentProject()).subscribe((res) => {
      console.log(res);
      this.devices.sourcecode = this.devices.sourcecode.replace('\n', '<br>');
      this.devices = res;
    });
  }


  ngOnInit() {
    $(window).on("resize", () => {
      this.setHeight();
    }).resize();
  }

  setHeight() { 
    let windowHeight = $(window).height();
    let styles = {
      'height': (windowHeight-200) + 'px',
      'overflow-y': 'scroll',
    };
    return styles;
  }

  uploadToCloud() {
    this.projectService.get
  }



}