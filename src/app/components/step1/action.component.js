"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var actions_service_1 = require('../../services/actions.service');
var ACTION = [
    {
        group_name: "Motor",
        action: [
            {
                name: "Dummy Motor 1",
                datatype: "int",
                img: "/img/slide1.jpeg"
            },
            {
                name: "Dummy Motor 2",
                datatype: "string",
                img: ""
            }
        ]
    },
    {
        group_name: "Led",
        action: [
            {
                name: "Dummy Led 1",
                datatype: "int",
                img: ""
            },
            {
                name: "Dummy Led 2",
                datatype: "string",
                img: ""
            },
            {
                name: "Dummy Led 3",
                datatype: "string",
                img: ""
            }
        ]
    }
];
var ActionComponent = (function () {
    function ActionComponent(actionsService) {
        this.actionsService = actionsService;
        //actions: Action[];
        this.actions = ACTION;
        this.searchKeyword = "";
    }
    ActionComponent.prototype.ngOnInit = function () {
        console.log(this.actions);
    };
    ActionComponent.prototype.searchAction = function (search) {
        console.log(search);
        this.searchKeyword = search;
    };
    ActionComponent.prototype.actionFilter = function (each) {
        console.log(each);
        if (this.searchKeyword !== "")
            return each.indexOf(this.searchKeyword) !== -1;
        else
            return true;
    };
    ActionComponent.prototype.actionHeadFilter = function (type) {
        if (this.searchKeyword !== "") {
            // Show the header if at least one child exists
            for (var _i = 0, _a = type.action; _i < _a.length; _i++) {
                var component = _a[_i];
                if (component.name.indexOf(this.searchKeyword) !== -1)
                    return true;
            }
            return false;
        }
        else {
            return true;
        }
    };
    ActionComponent.prototype.displayImage = function (img) {
        //<img src="'+img+'" />'
    };
    // action menu 
    ActionComponent.prototype.ngAfterViewInit = function () {
        $('.tree-toggle').click(function () {
            $(this).parent().children('ul.tree').toggle(200);
        });
        $(function () {
            $('.tree-toggle').parent().children('ul.tree').toggle(200);
        });
    };
    ActionComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'action',
            templateUrl: "action.component.html",
            styleUrls: ['step1.component.css'],
            providers: [actions_service_1.ActionsService]
        }), 
        __metadata('design:paramtypes', [actions_service_1.ActionsService])
    ], ActionComponent);
    return ActionComponent;
}());
exports.ActionComponent = ActionComponent;
//# sourceMappingURL=action.component.js.map