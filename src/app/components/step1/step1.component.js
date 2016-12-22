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
var Step1Component = (function () {
    function Step1Component() {
    }
    /* @Input()
     post: Action;
   */
    Step1Component.prototype.ngOnInit = function () {
        var setElementHeight = function () {
            var height = $(window).height();
            $('.autoheight').css('min-height', (height));
        };
        $(window).on("resize", function () {
            setElementHeight();
        }).resize();
    };
    Step1Component = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'step1',
            templateUrl: "step1.component.html",
            styleUrls: ['step1.component.css']
        }), 
        __metadata('design:paramtypes', [])
    ], Step1Component);
    return Step1Component;
}());
exports.Step1Component = Step1Component;
//# sourceMappingURL=step1.component.js.map