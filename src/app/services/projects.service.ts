import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Auth } from '../auth.service';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService {

    //url = 'https://makerplaygroundapi.azurewebsites.net/project/';
    url = 'http://localhost:3001/api/project/';

    constructor(private auth: Auth, private http: Http, private authHttp: AuthHttp) {
    }

    getAllProjects() {
        /*return this.http.get(this.url)
            .map(res => res.json());*/
        console.log('using authHttp');
        console.log(localStorage.getItem('id_token'));
        return this.authHttp.get(this.url)
            .map(res => res.json());
    }

    // post is new project's name
    newProject(post) {
        console.log('post = ', post);
        return this.authHttp.post(this.url, JSON.stringify(post), {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map(res => res.json());
    }

    getProject(id: string) {
        let getProjectUrl = this.url + id;
        return this.authHttp.get(getProjectUrl)
            .map(res => res.json());
    }

}

