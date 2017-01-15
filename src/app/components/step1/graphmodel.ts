import * as Immutable from 'immutable';
import * as UUID from 'uuid';

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

    private constructor(public data: Immutable.Map<string, Immutable.Map<string, Immutable.Map<string, string>>>) {
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
            let val: { value: string, done: boolean };

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

    getNode(nodeID: string): NodeData {
        //console.log(nodeID);
        let check = this.data.getIn(['nodes', nodeID]);
        if (check !== undefined) {
            return new NodeData(nodeID, check);
        } else {
            return undefined;
        }
    }

    addNode(action: Action): GraphData {
        let newNode_key = UUID.v4();
        let newObj = {};
        let allParams = {};
        newObj = {
            "action_id": action.id,
            "display_x": '500',
            "display_y": '150',
        };

        for (let prop of action.property) {
            if (prop.name === 'name')
                allParams[prop.name] = action.name + ' 1';
            else
                allParams[prop.name] = '';
        }
        newObj['params'] = allParams;

        return new GraphData(this.data.setIn(['nodes', newNode_key], Immutable.fromJS(newObj)));
    }

    removeNode(actionData: NodeData): GraphData {
        return undefined;
    }

    getNodeInRange(endX: number, endY: number, range: number = 70): NodeData {
        //const NODE_SIZE: number = 100
        let result: NodeData;
        this.data.get('nodes').forEach((value, key) => {
            let display_x = parseFloat(value.get('display_x'));
            let display_y = parseFloat(value.get('display_y'));

            // 60 is radius of circle
            if (Math.sqrt((endX - display_x) * (endX - display_x) + (endY - display_y) * (endY - display_y)) < range) {
                result = new NodeData(key, value);
                return false;
            }
        });

        return result;
    }

    getEdgeInRangeSrc(originX: number, originY: number, range: number = 70): EdgeData[] {
        //const NODE_SIZE: number = 100
        let result: EdgeData[] = [];
        this.data.get('edges').forEach((value, key) => {
            let start_x = parseFloat(value.get('start_x'));
            let start_y = parseFloat(value.get('start_y'));

            // 60 is radius of circle
            if (Math.sqrt((start_x - originX) * (start_x - originX) + (start_y - originY) * (start_y - originY)) < range) {
                result.push(new EdgeData(key, value));
            }
        });

        return result;
    }

    getEdgeInRangeDst(originX: number, originY: number, range: number = 70): EdgeData[] {
        //const NODE_SIZE: number = 100
        let result: EdgeData[] = [];
        this.data.get('edges').forEach((value, key) => {
            let end_x = parseFloat(value.get('end_x'));
            let end_y = parseFloat(value.get('end_y'));

            // 60 is radius of circle
            if (Math.sqrt((end_x - originX) * (end_x - originX) + (end_y - originY) * (end_y - originY)) < range) {
                result.push(new EdgeData(key, value));
            }
        });

        return result;
    }

    /**
     * Get every edges that has source node's id equal to the node id provided
     * @param nodeId node's id to match to when searching
     * @return array of EdgeData instances
     */
    getEdgesBySrcNode(nodeId: string): EdgeData[] {
        let allEdgesSrc: EdgeData[] = [];
        console.log('start');
        this.data.get('edges').forEach((value, key) => {
            let srcId = value.get('src_node_id');
            console.log(key, srcId);
            if (nodeId === srcId) {
                allEdgesSrc.push(new EdgeData(key, value));
            }
        });
        return allEdgesSrc;
    }

    /**
     * Get every edges that has destination node's id equal to the node id provided
     * @param nodeId node's id to match to when searching
     * @return array of EdgeData instances
     */
    getEdgesByDstNode(nodeId: string): EdgeData[] {
        let allEdgesDst: EdgeData[] = [];
        this.data.get('edges').forEach((value, key) => {
            let dstId = value.get('dst_node_id');
            if (nodeId === dstId) {
                allEdgesDst.push(new EdgeData(key, value));
            }
        });
        return allEdgesDst;
    }

    connectionEdgeOfDstNode(nodeId, edgeId, x1, x2, y1, y2): GraphData {
        return new GraphData(this.data.withMutations(map => {
            map.setIn(['edges', edgeId, 'start_x'], x1)
                .setIn(['edges', edgeId, 'start_y'], y1)
                .setIn(['edges', edgeId, 'end_x'], x2)
                .setIn(['edges', edgeId, 'end_y'], y2)
                .setIn(['edges', edgeId, 'dst_node_id'], nodeId)
        }));
    }

    connectionEdgeOfSrcNode(nodeId, edgeId, x1, x2, y1, y2): GraphData {
        return new GraphData(this.data.withMutations(map => {
            map.setIn(['edges', edgeId, 'start_x'], x1)
                .setIn(['edges', edgeId, 'start_y'], y1)
                .setIn(['edges', edgeId, 'end_x'], x2)
                .setIn(['edges', edgeId, 'end_y'], y2)
                .setIn(['edges', edgeId, 'src_node_id'], nodeId)
        }));
    }

    moveNode(id: string, leftPos: number, topPos: number) {
        return new GraphData(this.data.withMutations(map => {
            map.setIn(['nodes', id, 'display_x'], leftPos)
                .setIn(['nodes', id, 'display_y'], topPos)
        }));
    }


    /**
     * Update location of edge, also remove any src/dst connection
     */
    moveEdge(id, x1, x2, y1, y2): GraphData {
        return new GraphData(this.data.withMutations(map => {
            map.setIn(['edges', id, 'start_x'], x1)
                .setIn(['edges', id, 'start_y'], y1)
                .setIn(['edges', id, 'end_x'], x2)
                .setIn(['edges', id, 'end_y'], y2)
                .setIn(['edges', id, 'dst_node_id'], '')
                .setIn(['edges', id, 'src_node_id'], '')
        }));
    }
}

/**
 * Small wrapper class to pass action data to the view (GraphCanvas).
 * It is designed to abstract the internal data structure use in GraphModel.
 */
export class NodeData {
    constructor(private uid: string, private data: Immutable.Map<string, string>) {
    }

    getNodeId(): string {
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
    constructor(private uid: string, private data: Immutable.Map<string, string>) {
    }

    getEdgeId(): string {
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

