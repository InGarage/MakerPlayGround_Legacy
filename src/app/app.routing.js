"use strict";
var router_1 = require('@angular/router');
var home_component_1 = require('./components/home.component');
var tutorial_component_1 = require('./components/tutorial.component');
var sample_project_component_1 = require('./components/sample-project.component');
var step1_component_1 = require('./components/step1/step1.component');
var appRoutes = [
    {
        path: '',
        component: home_component_1.HomeComponent
    },
    {
        path: 'tutorial',
        component: tutorial_component_1.TutorialComponent
    },
    {
        path: 'sample-project',
        component: sample_project_component_1.SampleProjectComponent
    },
    {
        path: 'step1',
        component: step1_component_1.Step1Component
    }
];
exports.routing = router_1.RouterModule.forRoot(appRoutes);
//# sourceMappingURL=app.routing.js.map