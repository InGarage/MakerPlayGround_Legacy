import { GraphData, ActionData, TriggerData } from './graph';

export class GraphModel {

    constructor(private graphData: GraphData) {
    } 

    addNode() {

    }

    removeNode() {

    }

    connectEdgeToSrcNode(actionData: ActionData, triggerData: TriggerData, x: number, y: number) {
        triggerData.src_node_id = actionData.node_id;
        triggerData.display_params.start_x = x;
        triggerData.display_params.start_y = y;
    }

    disconnectEdgeFromSrcNode(triggerData: TriggerData) {
    }

    moveNode() {

    }

    moveEdge() {

    }

    node() : ActionData[] {
        return this.graphData.nodes;
    }

    // TODO: should search more efficiently
    getNodeData(id: number) : ActionData {
        for (let data of this.graphData.nodes) {
            if (data.node_id === id)
                return data;
        }
        return undefined;
    }

    edge() : TriggerData[] {
        return this.graphData.edges;   
    }

    // TODO: should search more efficiently
    getEdgeData(id: number) : TriggerData {
        for (let data of this.graphData.edges) {
            if (data.edge_id === id)
                return data;
        }
        return undefined;
    }
}