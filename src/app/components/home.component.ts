import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth.service';
import { ProjectService } from '../services/projects.service';
import { Project } from './project';
import * as UUID from 'uuid';
import * as $ from 'jquery';

@Component({
  selector: 'home',
  templateUrl: `./home.component.html`,
  styleUrls: ['../app.component.css', './step1/step1.component.css']
})

export class HomeComponent {

  projects: Project[];
  displayProjectsTemplate;
  displayDel = [];
  dirty: boolean;
  myButton;

  constructor(private auth: Auth, private ProjectService: ProjectService, private router: Router) { }


  // Id: {{project.project_id}}
  // <br>Name: {{project.project_name}}
  // <br>Modified: {{project.modified_date}}

  ngOnInit() {
    console.log('refresh page');
    this.dirty = true;
    this.getAllProjects();
  }

  getAllProjects() {
    this.ProjectService.getAllProjects().subscribe(projects => {
      this.projects = projects.projects;

      // for displaying the delete project button
      for (let project of this.projects) {
        this.displayDel.push({ delBtn: false });
      }
    });
  }

  // getAllProjects() {
  //   this.ProjectService.getAllProjects().subscribe(projects => {
  //     this.projects = projects.projects;

  //     this.displayProjectsTemplate = [];
  //     let projectInRow = {};
  //     let i, j = 0;
  //     for (i = 0; i < this.projects.length; i++) {
  //       console.log('Here');
  //       projectInRow['project' + j] = this.projects[i].project_name;
  //       projectInRow['id' + j] = this.projects[i].project_id;
  //       j++;
  //       if (((i+1) % 4 === 0) && (i !== 0)) {
  //         this.displayProjectsTemplate.push(projectInRow);
  //         projectInRow = {};
  //         j = 0;
  //       }
  //     }
  //     if ((i % 4) !== 0) {
  //       this.displayProjectsTemplate.push(projectInRow);
  //     }
  //     console.log(this.displayProjectsTemplate);
  //   });
  // }

  newProject(project_name: string) {
    console.log('xxx', project_name);

    const uuid = UUID.v4();

    let newProject: Project = {
      project_name: project_name,
      project_data: {
        nodes: {},
        edges: {},
        entry_edge: uuid
      }
    };
    // add 1 initial trigger
    newProject.project_data.edges[uuid] = {
      trigger: [],
      src_node_id: '',
      dst_node_id: '',
      start_x: 200,
      start_y: 400,
      end_x: 300,
      end_y: 400
    };

    this.ProjectService.newProject(newProject).subscribe(projects => {
      this.ProjectService.setCurrentProject(projects);
      this.router.navigate(['/step1']);
    });
  }

  getProject(id: string) {
    if (this.dirty === true) {
      this.ProjectService.getProject(id).subscribe(project => {
        console.log('get project id ', project);
        (<Project>project).project_data = JSON.parse((<Project>project).project_data).project_data;
        this.ProjectService.setCurrentProject(project);
        this.router.navigate(['/step1']);
      });
    }
  }

  deleteProject(id: string) {
    console.log('delete', id);
    this.dirty = false;
    // delete project

    // re-populate all projects table
    window.location.reload();
  }

  displayDelBtn(index) {
    console.log('mouseover');
    this.displayDel[index].delBtn = true;
  }

  fadeDelBtn(index) {
    console.log('mouseout');
    this.displayDel[index].delBtn = false;
  }

}
