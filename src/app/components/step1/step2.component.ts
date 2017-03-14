import { Component, Input } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { ProjectService } from '../../services/projects.service';
import * as $ from 'jquery';

@Component({
  selector: 'step2',
  templateUrl: `./step2.component.html`,
  styleUrls: ['./step1.component.css']
})
export class Step2Component {

  devices = {devices:[],sourcecode: ''};
  projectName: string;
  fitListHeight = '450px';
  backgroundStyle = ['white','white','white','white','white'];

  constructor(private router: Router, private projectService: ProjectService) {
    this.projectName = projectService.getCurrentProject().project_name;
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

  BlueprintSelected() {
    console.log('click Blueprint');
    this.router.navigate(['/step3']);
  }

  selectDevice(index) {
    for (let i=0; i<this.backgroundStyle.length; i++) {
      this.backgroundStyle[i] = 'white';
    }

    this.backgroundStyle[index] = 'lightblue';
  }


}