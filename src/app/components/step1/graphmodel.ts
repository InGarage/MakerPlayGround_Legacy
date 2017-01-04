import { GraphData, ActionData, TriggerData } from './graph';
import { Action } from './action'

export class GraphModel {


    constructor(private graphData: GraphData) {
    }

    addNode(actionData: ActionData[], newAction: Action) {
        let obj: ActionData = new ActionData; 
        obj.action_id = newAction.id;
        obj.action_params = {name: ''};
        obj.display_params = {x: 0, y: 0};

        for (let property of newAction.property) {
                if (property.name === 'Name') {
                    obj.action_params.name = 'Motor 1';
                    //console.log(obj.action_params.name);
                }
                if (property.name === 'Speed') {
                    obj.action_params[property.name] = '';
                    //console.log(obj.action_params.name);
                }
            }
        obj.display_params.x = 500;
        obj.display_params.y = 100;

        actionData.push(obj);
    }


    removeNode(actionData: ActionData[], nodeData: ActionData) {
        // loop through whole array of actionData to find same node_id  nodeData
        // then delete it, and re-draw canvas
    }

    connectEdgeToSrcNode(actionData: ActionData, triggerData: TriggerData, x: number, y: number) {
        triggerData.src_node_id = actionData.node_id;
        triggerData.display_params.start_x = x;
        triggerData.display_params.start_y = y;
    }

    disconnectEdgeFromSrcNode(triggerData: TriggerData) {
    }

    moveNode(actionData: ActionData, topPos: number, leftPos: number) {
        /* In case node size is 100 */
        actionData.display_params.x = leftPos + 50;
        actionData.display_params.y = topPos + 50;
    }

    moveEdge() {

    }

    node(): ActionData[] {
        return this.graphData.nodes;
    }

    // TODO: should search more efficiently
    getNodeData(id: number): ActionData {
        for (let data of this.graphData.nodes) {
            if (data.node_id === id)
                return data;
        }
        return undefined;
    }

    edge(): TriggerData[] {
        return this.graphData.edges;
    }

    // TODO: should search more efficiently
    getEdgeData(id: number): TriggerData {
        for (let data of this.graphData.edges) {
            if (data.edge_id === id)
                return data;
        }
        return undefined;
    }
}