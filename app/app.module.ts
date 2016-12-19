import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import { AppComponent }  from './app.component';
import { HomeComponent }  from './components/home.component';
import { TutorialComponent }  from './components/tutorial.component';
import { SampleProjectComponent }  from './components/sample-project.component';
import { Step1Component }  from './components/step1/step1.component';
import { ActionComponent }  from './components/step1/action.component';

import { ActionsService }  from './services/actions.service';

import {routing} from './app.routing';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, routing ],
  declarations: [ AppComponent, HomeComponent, TutorialComponent, 
                  SampleProjectComponent, Step1Component, ActionComponent ],
  providers:    [ ActionsService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }