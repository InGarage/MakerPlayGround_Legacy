import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth.service';
import { ProjectService } from '../services/projects.service';
import { Project } from './project';
import * as UUID from 'uuid';

@Component({
  selector: 'home',
  templateUrl: `./home.component.html`,
  styleUrls: ['../app.component.css', './step1/step1.component.css'],
  //providers: [ProjectService, Auth]
})

export class HomeComponent {
  projects: Project[];

  constructor(private auth: Auth, private ProjectService: ProjectService, private router: Router) { }

  ngOnInit() {
    this.getAllProjects();
  }

  getAllProjects() {
    this.ProjectService.getAllProjects().subscribe(projects => {
      this.projects = projects.projects;
    });
  }

  newProject() {
    let newProject: Project = {
      project_name: "new project",
      project_data: {
        nodes: {},
        edges: {}
      }
    };
    // add 1 initial trigger
    newProject.project_data.edges[UUID.v4()] = {
      trigger: [],
      src_node_id: '',
      dst_node_id: '',
      start_x: 200,
      start_y: 400,
      end_x: 300,
      end_y: 400
    };

    this.ProjectService.newProject(newProject).subscribe(projects => {
      console.log('new project', projects);
      this.ProjectService.setCurrentProject(projects);
      this.router.navigate(['/step1']);
    });
  }

  getProject(id: string) {
    this.ProjectService.getProject(id).subscribe(project => {
      console.log('get project id ', project);
      (<Project>project).project_data = JSON.parse((<Project>project).project_data).project_data;
      this.ProjectService.setCurrentProject(project);
      this.router.navigate(['/step1']);
    });
  }

}
