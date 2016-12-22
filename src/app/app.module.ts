import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import { TreeModule } from 'angular2-tree-component';

import { AppComponent }  from './app.component';
import { HomeComponent }  from './components/home.component';
import { TutorialComponent }  from './components/tutorial.component';
import { SampleProjectComponent }  from './components/sample-project.component';
import { Step1Component }  from './components/step1/step1.component';
import { ActionComponent }  from './components/step1/action.component';
import { MiddleComponent }  from './components/step1/middle.component';

import { ActionsService }  from './services/actions.service';

import {routing} from './app.routing';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, routing, TreeModule ],
  declarations: [ AppComponent, HomeComponent, TutorialComponent, 
                  SampleProjectComponent, Step1Component, ActionComponent,
                  MiddleComponent ],
  providers:    [ ActionsService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }