import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ProjectService } from '../services/projects.service';
import { Project } from './project';

@Component({
  selector: 'home',
  templateUrl: `./home.component.html`,
  providers: [ProjectService],
})
export class HomeComponent {

  projects: Project[];

  constructor(private ProjectService: ProjectService) { }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.ProjectService.getProjects().subscribe(projects => {
      this.projects = projects.projects;
    });
  }

  newProject() {
    // send new project's name as POST then get id back
  }

}
