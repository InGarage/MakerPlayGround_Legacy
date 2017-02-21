import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Auth } from '../auth.service';
import { AuthHttp } from 'angular2-jwt';
import { Project } from '../components/project';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService {

    url = 'https://makerplayground.azurewebsites.net/';
    //url = 'http://localhost:3001/';

    private currentProject: Project;

    constructor(private auth: Auth, private http: Http, private authHttp: AuthHttp) {
    }

    getAllProjects() {
        /*return this.http.get(this.url)
            .map(res => res.json());*/
        //console.log('using authHttp');
        //console.log(localStorage.getItem('id_token'));
        return this.authHttp.get(this.url + 'api/project/')
            .map(res => res.json());
    }

    // post is new project's name
    newProject(project: Project) {
        console.log('post = ', project);
        return this.authHttp.post(this.url + 'api/project/', JSON.stringify(project), {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map(res => res.json());
    }

    getProject(id: string) {
        return this.authHttp.get(this.url + 'api/project/' + id)
            .map(res => res.json());
    }

    saveProject(project: Project) {
        return this.authHttp.put(this.url + 'api/project', JSON.stringify(project), {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map(res => res.json());
    }

    generateCode(project: Project) {
        return this.authHttp.post(this.url + 'api/codegen/', JSON.stringify(project), {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map(res => res.json());
    }

    getCurrentProject(): Project {
        return this.currentProject;
    }

    setCurrentProject(project: Project) {
        this.currentProject = project;
    }

}

