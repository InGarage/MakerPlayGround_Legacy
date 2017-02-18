import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService{
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


    getProjects(){
        return this.http.get('https://makerplaygroundapi.azurewebsites.net/project/')
            .map(res => res.json());
        //return this.http.post
    }
}

