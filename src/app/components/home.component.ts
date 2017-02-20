import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth.service';
import { ProjectService } from '../services/projects.service';
import { Project } from './project';

@Component({
  selector: 'home',
  templateUrl: `./home.component.html`,
  styleUrls: ['../app.component.css', './step1/step1.component.css'],
  providers: [ProjectService, Auth]
})

export class HomeComponent {

  projects: Project[];
  displayProjectsTemplate;

  constructor(private auth: Auth, private ProjectService: ProjectService, private router: Router) { }


  // Id: {{project.project_id}}
  // <br>Name: {{project.project_name}}
  // <br>Modified: {{project.modified_date}}

  ngOnInit() {
    //this.getAllProjects();
    this.projects = [
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 1',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 2',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 3',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 4',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 5',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 6',
      },
      {
        project_id: 'xxxxxxxxxxxxxxxxxx',
        project_name: 'New Project 7',
      }
    ];

    this.displayProjectsTemplate = [];
    let projectInRow = {};
    let j = 0;
    for (let i = 0; i < this.projects.length; i++) {
      projectInRow['project'+j] = this.projects[i].project_name;
      projectInRow['id'+j] = this.projects[i].project_id;
      j++;
      if ((i % 3 === 0) && (i !== 0)) {
        this.displayProjectsTemplate.push(projectInRow);
        projectInRow = {};
        j = 0;
      }
    }
  }

  getAllProjects() {
    this.ProjectService.getAllProjects().subscribe(projects => {
      this.projects = projects.projects;
    });
  }

  newProject() {
    const name = "New Project";
    this.ProjectService.newProject({ project_name: name }).subscribe(projects => {
      console.log(projects);
      this.router.navigate(['/step1']);
    });
  }

  getProject(id: string) {
    console.log(id);
    this.ProjectService.getProject(id).subscribe(project => {
      console.log(project);
    });
  }

}
