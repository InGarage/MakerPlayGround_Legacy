import * as Immutable from 'immutable';

import { Action } from './action';
import { CanvasEventOptions } from './graphcanvas';

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
            this.data.get('nodes').forEach((value, key) => {
                callback('addition', new NodeData(key, value));
            });
            this.data.get('edges').forEach((value, key) => {
                callback('addition', new EdgeData(key, value));
            });
        } else {
            let val: { value: number, done: boolean };

            let iter = otherGraph.data.get('nodes').keys();
            while (!(val = iter.next()).done) {
                let newData = this.data.getIn(['nodes', val.value]);
                let oldData = otherGraph.data.getIn(['nodes', val.value]);

                if (newData === undefined)
                    callback('deletion', new NodeData(val.value, oldData));
                if (!Immutable.is(oldData, newData))
                    callback('update', new NodeData(val.value, newData));
            }

            iter = this.data.get('nodes').keys();
            while (!(val = iter.next()).done) {
                let newData = this.data.getIn(['nodes', val.value]);
                let oldData = otherGraph.data.getIn(['nodes', val.value]);

                if (oldData === undefined)
                    callback('addition', new NodeData(val.value, newData));
            }

            // Edge compare
            iter = otherGraph.data.get('edges').keys();
            while (!(val = iter.next()).done) {
                let newData = this.data.getIn(['edges', val.value]);
                let oldData = otherGraph.data.getIn(['edges', val.value]);

                if (newData === undefined)
                    callback('deletion', new EdgeData(val.value, oldData));
                if (!Immutable.is(oldData, newData))
                    callback('update', new EdgeData(val.value, newData));
            }

            iter = this.data.get('edges').keys();
            while (!(val = iter.next()).done) {
                let newData = this.data.getIn(['edges', val.value]);
                let oldData = otherGraph.data.getIn(['edges', val.value]);

                if (oldData === undefined)
                    callback('addition', new EdgeData(val.value, newData));
            }
        }
    }

    getNode(nodeID: number): NodeData {
        let check = this.data.getIn(['nodes', nodeID]);
        if (check !== undefined)
            return new NodeData(nodeID, check);
        else
            return undefined;
    }

    addNode(action: Action): GraphData {
        
        //console.log(action);
        let newObj = {};
        newObj = {
            "action_id": 6,
            "display_x": '500',
            "display_y": '150',
            "params": {
                "name": "XXX",
            }
        };
        return new GraphData(this.data.setIn(['nodes', 6], Immutable.fromJS(newObj)));
    }

    removeNode(actionData: NodeData): GraphData {
        return undefined;
    }

    connectEdgeToSrcNode() {
    }

    disconnectEdgeFromSrcNode() {
    }

    moveNode(actionData: NodeData, topPos: number, leftPos: number) {
    }

    moveEdge(id, x1, x2, y1, y2): GraphData {
        return new GraphData(this.data.withMutations(map => {
            map.setIn(['edges', id, 'start_x'], x1)
                .setIn(['edges', id, 'start_y'], y1)
                .setIn(['edges', id, 'end_x'], x2)
                .setIn(['edges', id, 'end_y'], y2)
        }));
    }
}

/**
 * Small wrapper class to pass action data to the view (GraphCanvas).
 * It is designed to abstract the internal data structure use in GraphModel.
 */
export class NodeData {
    constructor(private uid: number, private data: Immutable.Map<string, string>) {
    }

    getNodeId(): number {
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

    getEdgeId(): number {
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

