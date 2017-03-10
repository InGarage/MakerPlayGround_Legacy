import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions, JsonpModule } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { TreeModule } from 'angular2-tree-component';
import { MdGridListModule } from '@angular/material';
import { AccordionModule } from './custom-bootstrap/accordion';
import { DropdownModule } from 'ng2-bootstrap/dropdown';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';

import { LoginComponent } from './login.component';
import { HomeComponent } from './components/home.component';
import { TutorialComponent } from './components/tutorial.component';
import { SampleProjectComponent } from './components/sample-project.component';
import { Step1Component } from './components/step1/step1.component';
import { Step3Component } from './components/step1/step3.component';
import { ActionComponent } from './components/step1/action.component';
import { MiddleComponent } from './components/step1/middle.component';
import { PropertyComponent } from './components/step1/property.component';
import { KeysPipe } from './components/step1//pipe';
import { PageNotFoundComponent } from './not-found.component';

import { Auth } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { ProjectService } from './services/projects.service';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
    return new AuthHttp(new AuthConfig({
        tokenName: 'id_token',
    }), http, options);
}

@NgModule({
    imports: [BrowserModule, FormsModule, HttpModule, JsonpModule, TreeModule,
        MdGridListModule, AccordionModule.forRoot(), DropdownModule.forRoot(), AppRoutingModule],
    declarations: [AppComponent, LoginComponent, HomeComponent, TutorialComponent,
        SampleProjectComponent, Step1Component, ActionComponent,
        MiddleComponent, PropertyComponent, Step3Component, KeysPipe, PageNotFoundComponent],
    providers: [
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        },
        ProjectService,
        Auth,
        AuthGuard
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }