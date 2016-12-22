import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Action } from '../components/step1/action';

@Injectable()
export class ActionsService{
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


    getPosts(){
        return this.http.get('https://jsonplaceholder.typicode.com/posts')
            .map(res => res.json());

    }
}

