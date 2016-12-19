import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {HomeComponent} from './components/home.component';
import {TutorialComponent} from './components/tutorial.component';
import {SampleProjectComponent} from './components/sample-project.component';
import { Step1Component }  from './components/step1/step1.component';

const appRoutes: Routes = [
    {
        path: '',
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
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);