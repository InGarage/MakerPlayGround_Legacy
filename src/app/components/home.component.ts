import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth.service';
import { ProjectService } from '../services/projects.service';
import { Project } from './project';

@Component({
  selector: 'home',
  templateUrl: `./home.component.html`,
  styleUrls: ['../app.component.css','./step1/step1.component.css'],
  providers: [ProjectService, Auth]
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
    const name = "New Project";
    this.ProjectService.newProject({ project_name: name }).subscribe(projects => {
      console.log(projects);
      this.router.navigate(['/step1']);
    });
  }

  getProject(id: string) {
    this.ProjectService.getProject(id).subscribe(project => {
      console.log(project);
    });
  }

}
