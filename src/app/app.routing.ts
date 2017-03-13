import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { AuthGuard } from './auth-guard.service';

import { LoginComponent } from './login.component';
import { PageNotFoundComponent } from './not-found.component';
import { HomeComponent } from './components/home.component';
// import { TutorialComponent } from './components/tutorial.component';
// import { SampleProjectComponent } from './components/sample-project.component';
import { Step1Component } from './components/step1/step1.component';
import { Step2Component } from './components/step1/step2.component';
import { Step3Component } from './components/step1/step3.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'step1',
        component: Step1Component,
        canActivate: [AuthGuard]
    },
    {
        path: 'step2',
        component: Step2Component,
        canActivate: [AuthGuard]
    },
    {
        path: 'step3',
        component: Step3Component,
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }