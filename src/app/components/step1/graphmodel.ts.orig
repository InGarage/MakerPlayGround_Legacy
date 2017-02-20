import * as Immutable from 'immutable';
import * as UUID from 'uuid';

import { Action, ActionHelper } from './action';
import { Trigger, TriggerHelper } from './trigger';
import { PropertyValue } from './propertyvalue';
import { UndoStack } from './undostack';

export class GraphData {

    private undoStack: UndoStack<Immutable.Map<string, any>>;
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
     *         "name": ["Motor 1"],
     *         // other params
     *       }
     *     },
     *     2 : {
     *       // other nodes
     *     }
     *   },
     *   "edges": {
     *     1 : {
     *       "trigger_id": [],   // Trigger's unique id based on trigger.json 
     *       "params: {         // Trigger's parameters based on each trigger requirement
     *         "trigger_id1": {"key": ["value"], "key": ["value"] },
     *         "trigger_id2": {"key": ["value"], },
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

    private constructor(public data: Immutable.Map<string, Immutable.Map<string, any>>) {
        this.undoStack = new UndoStack<Immutable.Map<string, any>>();
        this.undoStack.push(data);
    }

    undo() {
        this.data = this.undoStack.undo();
    }

    getNodeById(nodeID: string): NodeData {
        let check = this.data.getIn(['nodes', nodeID]);
        if (check !== undefined) {
            return new NodeData(nodeID, check);
        } else {
            return undefined;
        }
    }

    getEdgeById(edgeID: string): EdgeData {
        let check = this.data.getIn(['edges', edgeID]);
        if (check !== undefined) {
            return new EdgeData(edgeID, check);
        } else {
            return undefined;
        }
    }

    getNodes() {
        let allNode: NodeData[] = [];

        this.data.get('nodes').forEach((value, key) => {
            allNode.push(new NodeData(key, value));
        });

        return allNode;
    }

    getEdges() {
        let allEdge: EdgeData[] = [];

        this.data.get('edges').forEach((value, key) => {
            allEdge.push(new EdgeData(key, value));
        });

        return allEdge;
    }

    addNode(action: Action) {
        let newNode_key = UUID.v4();
        let newObj = {};
        let allParams = {};
        newObj = {
            "action_id": action.id,
            "display_x": '100',
            "display_y": '100',
        };

        const default_name = ActionHelper.getActionTypeById(action.id);

        for (let prop of action.params) {
            if (prop.name === 'name')
                allParams[prop.name] = [default_name + ' 1'];
            else
                allParams[prop.name] = prop.default_value;
        }
        newObj['params'] = allParams;

        this.data = this.data.setIn(['nodes', newNode_key], Immutable.fromJS(newObj));
        this.undoStack.push(this.data);
    }

    removeNode(nodeId: string) {
        this.data = this.data.deleteIn(['nodes', nodeId]);
        this.undoStack.push(this.data);
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
        //console.log('start');
        this.data.get('edges').forEach((value, key) => {
            let srcId = value.get('src_node_id');
            //console.log(key, srcId);
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

    connectionEdgeOfDstNode(nodeId, edgeId, x1, x2, y1, y2) {
        this.data = this.data.withMutations(map => {
            map.setIn(['edges', edgeId, 'start_x'], x1)
                .setIn(['edges', edgeId, 'start_y'], y1)
                .setIn(['edges', edgeId, 'end_x'], x2)
                .setIn(['edges', edgeId, 'end_y'], y2)
                .setIn(['edges', edgeId, 'dst_node_id'], nodeId)
        });

        this.undoStack.push(this.data);
    }

    connectionEdgeOfSrcNode(nodeId, edgeId, x1, x2, y1, y2) {
        this.data = this.data.withMutations(map => {
            map.setIn(['edges', edgeId, 'start_x'], x1)
                .setIn(['edges', edgeId, 'start_y'], y1)
                .setIn(['edges', edgeId, 'end_x'], x2)
                .setIn(['edges', edgeId, 'end_y'], y2)
                .setIn(['edges', edgeId, 'src_node_id'], nodeId)
        });

        this.undoStack.push(this.data);
    }

    moveNode(id: string, leftPos: number, topPos: number) {
        this.data = this.data.withMutations(map => {
            map.setIn(['nodes', id, 'display_x'], leftPos)
                .setIn(['nodes', id, 'display_y'], topPos)
        });

        this.undoStack.push(this.data);
    }


    /**
     * Update location of edge, also remove any src/dst connection
     */
    moveEdge(id, x1, x2, y1, y2) {
        this.data = this.data.withMutations(map => {
            map.setIn(['edges', id, 'start_x'], x1)
                .setIn(['edges', id, 'start_y'], y1)
                .setIn(['edges', id, 'end_x'], x2)
                .setIn(['edges', id, 'end_y'], y2)
                .setIn(['edges', id, 'dst_node_id'], '')
                .setIn(['edges', id, 'src_node_id'], '')
        });

        this.undoStack.push(this.data);
    }

    updateNodeProperty(data: PropertyValue) {
        this.data = this.data.asMutable();
        const node = data.children[0];  // This is an action, data contains only one child
        for (let param of node.param) {
            this.data = this.data.setIn(['nodes', data.uid, 'params', param.name], Immutable.fromJS(param.value));
        }
        this.data = this.data.asImmutable();
        this.undoStack.push(this.data);
    }

    updateEdgeProperty(data: PropertyValue) {
        this.data = this.data.asMutable();
        for (let trigger of data.children) {
            for (let param of trigger.param) {
                console.log('model (secound should be array)', param.name, param.value);
                this.data = this.data.setIn(['edges', data.uid, 'trigger', trigger.id, 'params', param.name], Immutable.fromJS(param.value));
            }
        }
        this.data = this.data.asImmutable();
        this.undoStack.push(this.data);
    }

    addEdge(trigger: Trigger) {
        let param = {};
        for (let prop of trigger.params) {
            if (prop.name === 'name')
                param[prop.name] = [trigger.name + ' 1'];
            else
                param[prop.name] = prop.default_value;
        }

        const newEdge = {
            "trigger": [{'id': trigger.id, 'params': param}],
            "src_node_id": '',
            "dst_node_id": '',
            "start_x": '100',
            "start_y": '100',
            "end_x": '300',
            "end_y": '100',
        };

        this.data = this.data.setIn(['edges', UUID.v4()], Immutable.fromJS(newEdge));
        this.undoStack.push(this.data);
    }

    removeEdge(edgeId: string) {
        this.data = this.data.deleteIn(['edges', edgeId]);
        this.undoStack.push(this.data);
    }

    /**
     * This method is called when the source edge is merging to the dest edge.
     * Trigger of the src edge is move and merge into dest edge thus the src edge
     * will be removed from the graph.
     */
    mergeEdge(srcEdgeId: string, destEdgeId: string) {
        this.data = this.data.setIn(['edges', destEdgeId, 'trigger'], this.data.getIn(['edges', destEdgeId, 'trigger'])
            .concat(this.data.getIn(['edges', srcEdgeId, 'trigger'])));
        this.data = this.data.deleteIn(['edges', srcEdgeId]);
        console.log(this.data.toJS());
        this.undoStack.push(this.data);
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

    getActionId(): string {
        return this.data.get('action_id');
    }

    getActionParams(name: string): string[] {
        return (<Immutable.List<string>><any>this.data.getIn(['params', name])).toJS();
    }

    getX(): number {
        return parseFloat(this.data.get('display_x'));
    }

    getY(): number {
        return parseFloat(this.data.get('display_y'));
    }

    isEqual(other: NodeData): boolean {
        return Immutable.is(other.data, this.data);
    }


}

/**
 * Small wrapper class to pass trigger data to the view (GraphCanvas).
 * It is designed to abstract the internal data structure use in GraphModel.
 */
export class EdgeData {
    constructor(private uid: string, private data: Immutable.Map<string, any>) {
    }

    getEdgeId(): string {
        return this.uid;
    }

    getNumberOfTrigger() : number {
        return this.data.get('trigger').count();
    }

    // getTriggerId(triggerIndex: number): string {
    //     return this.data.getIn(['trigger', triggerIndex, 'id']);
    // }

    // getTriggerParams(triggerIndex: number, name: string): string[] {
    //     console.log(name, this.data.getIn(['trigger', triggerIndex, 'params', name]).toJS());
    //     return this.data.getIn(['trigger', triggerIndex, 'params', name]).toJS();
    // }

    getTrigger() : TriggerData[] {
        let data = [];
        console.log('here');
        (<Immutable.List<any>>this.data.get('trigger')).forEach((value, key) => {
            console.log(value.toJS(), key);
            data.push(new TriggerData(key, value));
        })
        return data;
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

    isEqual(other: EdgeData): boolean {
        return Immutable.is(other.data, this.data);
    }
}

export class TriggerData {
    constructor(private index: number, private data: Immutable.Map<string, any>) {
        //console.log('number', index);
    }

    getTriggerIndex() : number {
        return this.index;
    }

    getTriggerId(): string {
        return this.data.get('id');
    }

    getTriggerParams(name: string): string[] {
        return this.data.getIn(['params', name]).toJS();
    }
}
