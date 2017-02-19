import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService{

    url = 'https://makerplaygroundapi.azurewebsites.net/project/';

    constructor(private http: Http){
        
    }
/*
    getPosts(): Promise<Action[]>{
        return this.http.get('https://jsonplaceholder.typicode.com/posts')
            .toPromise()
            .then(response => response.json().data as Action[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);      
    }*/


    getAllProjects(){
        return this.http.get(this.url)
            .map(res => res.json());
    }

    // post is new project's name
    newProject(post: string){
        console.log('post = ', post);
        return this.http.post(this.url, post)
            .map(res => res.json());
    }

    getProject(id: string) {
        let getProjectUrl = this.url + id;
        return this.http.get(getProjectUrl)
            .map(res => res.json());
    }
    
}

