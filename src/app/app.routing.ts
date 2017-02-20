import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import { LoginComponent } from './login.component';
import {HomeComponent} from './components/home.component';
import {TutorialComponent} from './components/tutorial.component';
import {SampleProjectComponent} from './components/sample-project.component';
import { Step1Component }  from './components/step1/step1.component';
import { Step3Component }  from './components/step1/step3.component';

const appRoutes: Routes = [
    {
        path: '',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'tutorial',
        component: TutorialComponent
    },
    {
        path: 'sample-project',
        component: SampleProjectComponent
    },
    {
        path: 'step1',
        component: Step1Component
    },
    {
        path: 'step3',
        component: Step3Component
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);