import * as Immutable from 'immutable';

import { Action } from './action';

export class GraphData {

    /** 
     * Create model from JSON representation of the graph according to the following format
     * ``` 
     * { 
     *   "nodes": {
     *     1 : {                // Node's unique id
     *       "action_id": 1,    // Action's unique id based on action.json
     *       "display_x": 100,  // Center position of the node on the screen 
     *       "display_y": 100,
     *       "params" : {       // Action's parameters based on each action requirement
     *         "name": "XXX",
     *         // other params
     *       }
     *     },
     *     2 : {
     *       // other nodes
     *     }
     *   },
     *   "edges": {
     *     1 : {
     *       "trigger_id": 1,   // Trigger's unique id based on trigger.json 
     *       "params: {         // Trigger's parameters based on each trigger requirement
     *         "key": "value",
     *         // other params
     *       },
     *       "src_node_id": number, // Unique id of the source node    
     *       "dst_node_id": number, // Unique id of the destination node
     *       "start_x": number,     // Parameters needed to display the edge on the screen
     *       "start_y": number,
     *       "end_x": number,
     *       "end_y": number
     *     },
     *     2 : {
     *       // other edges
     *     }  
     *   }
     * }
     * ```
     * @param json JSON string represent of the graph
     * @return 
     */
    static createGraphDataFromJSON(json: string): GraphData {
        let data = Immutable.fromJS(json, (key, value) => {
            var isIndexed = Immutable.Iterable.isIndexed(value);
            return isIndexed ? value.toList() : value.toOrderedMap();
        });
        return new GraphData(data);
    }

    private constructor(public data: Immutable.Map<string, Immutable.Map<number, Immutable.Map<string, string>>>) {
    }

    /**
     * Helper function to compare two GraphData instances and provide the caller list of changes through the callback
     * @param graph the graph data to compare with
     * @param callback 
     */
    compareGraphModel(otherGraph: GraphData, callback: (type: 'addition' | 'deletion' | 'update', target: NodeData | EdgeData) => void) {
        if (otherGraph === undefined) {
            console.log('compare:', this.data.get('nodes').forEach((value, key) => {
                callback('addition', new NodeData(key, value));
            }));
            this.data.get('edges').forEach((value, key) => {
                callback('addition', new EdgeData(key, value));
            });
        }
    }

    addNode(action: Action) : GraphData{
        return undefined;
    }

    removeNode(actionData: NodeData) : GraphData {
        return undefined;
    }

    connectEdgeToSrcNode() {
    }

    disconnectEdgeFromSrcNode() {
    }

    moveNode(actionData: NodeData, topPos: number, leftPos: number) {
    }

    moveEdge() {

    }
}

/**
 * Small wrapper class to pass action data to the view (GraphCanvas).
 * It is designed to abstract the internal data structure use in GraphModel.
 */
export class NodeData {
    constructor(private uid: number, private data: Immutable.Map<string, string>) {
    }

    getNodeId() : number {
        return this.uid;
    }

    getActionId(): number {
        return parseInt(this.data.get('action_id'));
    }

    getActionParams(name: string): string {
        return this.data.getIn(['params', name]);
    }

    getX(): number {
        return parseFloat(this.data.get('display_x'));
    }

    getY(): number {
        return parseFloat(this.data.get('display_y'));
    }
}

/**
 * Small wrapper class to pass trigger data to the view (GraphCanvas).
 * It is designed to abstract the internal data structure use in GraphModel.
 */
export class EdgeData {
    constructor(private uid: number, private data: Immutable.Map<string, string>) {
    }

    getEdgeId() : number {
        return this.uid;
    }

    getTriggerId(): number {
        return parseInt(this.data.get('trigger_id'));
    }

    getTriggerParams(name: string): string {
        return this.data.getIn(['params', name]);
    }

    getSourceNodeId(): string {
        return this.data.get('src_node_id');
    }

    getDestinationNodeId(): string {
        return this.data.get('dst_node_id');
    }

    getStartX(): number {
        return parseFloat(this.data.get('start_x'));
    }

    getStartY(): number {
        return parseFloat(this.data.get('start_y'));
    }

    getEndX(): number {
        return parseFloat(this.data.get('end_x'));
    }

    getEndY(): number {
        return parseFloat(this.data.get('end_y'));
    }
}

