import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { NgModule } from '@angular/core';
//import { GraphData, ActionData, TriggerData } from './graph';

import { Action, ActionGroup, ActionHelper } from './action';
import { Trigger, TriggerGroup, TriggerHelper } from './trigger';
import { GraphData, NodeData, EdgeData } from './graphmodel';
import { PropertyValue } from './propertyvalue';

@Component({
    selector: 'property',
    templateUrl: `./property.component.html`,
    styleUrls: ['./step1.component.css']
})

export class PropertyComponent {
    @Input() objectSelected: NodeData | EdgeData;
    @Output() updateDataFinish = new EventEmitter<PropertyValue[]>();
    @Output() updateData = new EventEmitter<PropertyValue[]>();

    showProperties: boolean = false;
    objProperties: PropertyValue[] = [];
    previousObjDataNode: NodeData;
    previousObjDataEdge: EdgeData;
    dirty: boolean;

    ngOnChanges(changes: SimpleChange) {
        if (this.objectSelected instanceof NodeData) {
            this.populatePropertyWindowNode(this.objectSelected);
        } else if (this.objectSelected instanceof EdgeData) {
            this.populatePropertyWindowEdge(this.objectSelected);
        } // else this.objectSelected is undefined so we won't do anything
    }

    populatePropertyWindowNode(objData: NodeData) {
        // Update data to data structure
        if (objData === null) {
            if (this.dirty)
                this.updateDataFinish.emit(this.objProperties);

            this.showProperties = false;
        }
        // Only show data
        else {
            // other node is being selected so we need to save it's data before
            // populate property window with property of new node
            if ((this.previousObjDataNode !== null) && (this.dirty)) {
                console.log('Save');
                this.updateDataFinish.emit(this.objProperties);
            }
            this.dirty = false;
            this.previousObjDataNode = objData;
            this.objProperties = [];
            this.showProperties = true;
            let action = ActionHelper.findActionById(objData.getActionId());

            let obj: PropertyValue;
            for (let prop of action.params) {
                console.log(prop.control);
                obj = {
                    uid: objData.getNodeId(),
                    name: prop.name,
                    value: objData.getActionParams(prop.name),
                    control: prop.control,
                }
                this.objProperties.push(obj);
            }
        }
    }

    populatePropertyWindowEdge(objData: EdgeData) {
        if (objData === null) {
            if (this.dirty)
                this.updateDataFinish.emit(this.objProperties);

            this.showProperties = false;
        } else {
            // other trigger is being selected so we need to save it's data before
            // populate property window with property of new trigger
            if ((this.previousObjDataNode !== null) && (this.dirty)) {
                console.log('Save');
                this.updateDataFinish.emit(this.objProperties);
            }
            this.dirty = false;
            this.previousObjDataEdge = objData;
            this.objProperties = [];
            this.showProperties = true;
            
            const triggleId = objData.getTriggerId();
            for (const id of triggleId) {
                let trigger = TriggerHelper.findTriggerById(id);

                let obj: PropertyValue;
                for (let prop of trigger.params) {
                    console.log(prop.control);
                    obj = {
                        uid: objData.getEdgeId(),
                        name: prop.name,
                        value: objData.getTriggerParams(id, prop.name),
                        control: prop.control,
                    }
                    this.objProperties.push(obj);
                }
            }
        }
    }

    setFormStyles() {
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
        this.dirty = true;
        this.updateData.emit(objData);
    }

    onOutOfFocus() {
        this.dirty = false;
        this.updateDataFinish.emit(this.objProperties);
    }

}
