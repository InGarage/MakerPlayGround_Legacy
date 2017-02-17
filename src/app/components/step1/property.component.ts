import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { NgModule } from '@angular/core';

import { Action, ActionGroup, ActionHelper } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { GraphData, NodeData, EdgeData } from './graphmodel';
import { PropertyValue, ParameterList, Parameter } from './propertyvalue';

@Component({
    selector: 'property',
    templateUrl: `./property.component.html`,
    styleUrls: ['./step1.component.css']
})

export class PropertyComponent {
    @Input() objectSelected: NodeData | EdgeData;
    @Output() updateDataFinish = new EventEmitter<PropertyValue>();
    @Output() updateData = new EventEmitter<PropertyValue>();

    showProperties: boolean = false;
    objProperties: PropertyValue;
    previousObjDataNode: NodeData;
    previousObjDataEdge: EdgeData;
    dirty: boolean;

    operators = [ {value: '>', text: '>'}, {value: '<', text: '<'}, {value: '>=', text: '>='}, 
            {value: '<=', text: '<='}, {value: '==', text: '='}, {value: '!=', text: '!='}];

    ngOnChanges(changes: SimpleChange) {
        if (this.objectSelected instanceof NodeData) {
            this.populatePropertyWindowNode(this.objectSelected);
        } else if (this.objectSelected instanceof EdgeData) {
            this.populatePropertyWindowEdge(this.objectSelected);
        } else if (this.objectSelected === undefined) {
            if (this.dirty) {
                console.log('dirty');
                this.updateDataFinish.emit(this.objProperties);
                this.dirty = false;
            }
            this.showProperties = false;
        }
    }

    populatePropertyWindowNode(objData: NodeData) {
        // other node is being selected so we need to save it's data before
        // populate property window with property of new node
        if ((this.previousObjDataNode !== null) && (this.dirty)) {
            console.log('Save');
            this.updateDataFinish.emit(this.objProperties);
        }
        this.dirty = false;
        this.previousObjDataNode = objData;
        this.showProperties = true;

        let action = ActionHelper.findActionById(objData.getActionId());
        let paramObj: Parameter;
        let listParamObj: Parameter[] = [];
        let eachAction: ParameterList;
        let listEachAction: ParameterList[] = [];

        action.params.forEach((param, index) => {
            paramObj = {
                name: param.name,
                value: objData.getActionParams(param.name),
                control: param.control,
                args: param.args
            }
            listParamObj.push(paramObj);
        });
        eachAction = {
            name: action.name,
            id: objData.getActionId(),
            param: listParamObj,
        }
        listEachAction.push(eachAction);

        this.objProperties = {
            uid: objData.getNodeId(),
            children: listEachAction
        }
    }

    populatePropertyWindowEdge(objData: EdgeData) {
        // other trigger is being selected so we need to save it's data before
        // populate property window with property of new trigger
        if ((this.previousObjDataNode !== null) && (this.dirty)) {
            console.log('Save');
            this.updateDataFinish.emit(this.objProperties);
        }
        this.dirty = false;
        this.previousObjDataEdge = objData;
        this.showProperties = true;

        let listEachTrigger: ParameterList[] = [];

        //const triggleId = objData.getTriggerId(); // obtain array of id
        //for (const id of triggleId) {
        const triggers = objData.getTrigger();
        for (const trigger of triggers) {
        //for (let i=0; i<objData.getNumberOfTrigger(); i++) {
            let triggerInfo = TriggerHelper.findTriggerById(trigger.getTriggerId()); // Get this trigger from json
            let paramObj: Parameter;
            let listParamObj: Parameter[] = [];
            let eachTrigger: ParameterList;

            triggerInfo.params.forEach((param, index) => {
                paramObj = {
                    name: param.name,
                    value: trigger.getTriggerParams(param.name),
                    control: param.control,
                    args: param.args
                }
                listParamObj.push(paramObj);
            });
            eachTrigger = {
                name: triggerInfo.name,
                id: <any>trigger.getTriggerIndex(),
                param: listParamObj,
            }
            listEachTrigger.push(eachTrigger);

        }

        this.objProperties = {
            uid: objData.getEdgeId(),
            children: listEachTrigger
        }
    }

    setInnerFormStyles() {
        let styles = {
            'margin-bottom': '15px',
        };
        return styles;
    }

    setInputStylesNumberExpression() {
        let styles = {
            'width': '30%',
            'display': 'inline',
        };
        return styles;
    }

    setInputStyles() {
        let styles = {
            'width': '60%',
            'display': 'inline',
        };
        return styles;
    }


    setOutmostFormStyles() {
        let styles = {
            'padding-left': '30px',
            'padding-right': '30px',
            'padding-bottom': '15px',
        };
        return styles;
    }

    /**
     * This method will be called by the close button of the property window.
     * We should save the content that has been edited (by checking the dirty bit)
     * before hide it from the screen.
     */
    hideProperties() {
        this.showProperties = false;
        if (this.dirty) {
            this.updateDataFinish.emit(this.objProperties);
            this.dirty = false;
        }
    }

    onKey(objData) {
        console.log('on key');
        this.dirty = true;
        this.updateData.emit(objData);
    }

    onOutOfFocus() {
        console.log('out of focus');
        this.dirty = false;
        this.updateDataFinish.emit(this.objProperties);
    }

    onChangeOperat(selected: any, obj: any) {
        obj.value[0] = selected;
        this.updateDataFinish.emit(this.objProperties);
    }

}
