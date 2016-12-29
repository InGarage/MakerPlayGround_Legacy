import 'fabric';

import { Action, ActionGroup } from './action';
import { GraphData, ActionData, TriggerData } from './graph';

/* display constants */
const NODE_SIZE: number = 75;
const NODE_NAME_YPOS: number = 50;
const NODE_NAME_FONTSIZE: number = 14;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

export class GraphView {
    private actionGroup: ActionGroup[];

    // TODO: refactor to read the json only once by create a global object or use dependency injection
    constructor() {
        this.actionGroup = require("./action.json");
    }

    // TODO: This function should be refactored into the action class / service
    private findActionById(id: number): Action {
        for (let actionGroup of this.actionGroup) {
            for (let action of actionGroup.children) {
                if (action.id === id)
                    return action;
            }
        }
        return undefined;
    }

    /**
     * 
     * @param {number} a - this is a value.
     * @return {fabric.IObject} result of the sum value.
     */
    private createNodeFabricObject(canvas: fabric.ICanvas, node: ActionData) {
        fabric.Image.fromURL(this.findActionById(node.action_id).image
            , (image) => { canvas.add(image) }
            , { width: NODE_SIZE, height: NODE_SIZE, left: node.display_params.x, top: node.display_params.y });

        canvas.add(new fabric.Text(node.action_params.name, {
            left: node.display_params.x,
            top: node.display_params.y + NODE_NAME_YPOS,
            fontSize: NODE_NAME_FONTSIZE
        }));
    }

    /**
     * 
     * @param {number} a - this is a value.
     * @return {fabric.IObject} result of the sum value.
     */
    private createTriggerFabricObject(canvas: fabric.ICanvas, trigger: TriggerData) {

    }

    /**
     * Function to crate array of fabric.IObject objects to be added to the canvas
     * @param graph graph's data    
     * @returns     array of fabric.IObject to be added to the canvas
     */
    initCanvasFromGraph(canvas: fabric.ICanvas, graph: GraphData) {
        let nodes: NodeView[] = [];

        console.log(graph);

        for (let node of graph.nodes) {
            nodes.push(new NodeView(canvas, node, this.findActionById(node.action_id)));
        }

        for (let edge of graph.edges) {
            new EdgeView(canvas, nodes, edge);
        }
    }
}

export class NodeView {
    private image: fabric.IImage;   // BEWARE: image is undefined until the callback is called
    private text: fabric.IText;

    constructor(private canvas: fabric.ICanvas, private node: ActionData, private action: Action) {
        fabric.Image.fromURL(action.image
            , (image) => { this.image = image; canvas.add(this.image); }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: node.display_params.x,
                top: node.display_params.y,
                originX: 'center',
                originY: 'center'
            });

        this.text = new fabric.Text(node.action_params.name, {
            left: node.display_params.x,
            top: node.display_params.y + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE
        });

        this.text.set('dirty', true);

        canvas.add(this.text);
    }

    getNode(): ActionData {
        return this.node;
    }

    getCenterX(): number {
        return this.node.display_params.x;
    }

    getCenterY(): number {
        return this.node.display_params.y;
    }
}

export class EdgeView {
    private line: fabric.ILine;
    private triangle: fabric.ITriangle;
    //private headCircle: fabric.ICircle;
    //private tailCircle: fabric.ICircle;

    private srcNode: NodeView;
    private dstNode: NodeView;

    constructor(private canvas: fabric.ICanvas, private node: NodeView[], private edge: TriggerData) {
        
        let startX: number, startY: number, endX: number, endY: number, angle: number;

        // calculate start and end point of the edge
        if (edge.src_node_id === 0) {    // TODO: find better way to check
            startX = edge.display_params.start_x;
            startY = edge.display_params.start_y;
            endX = edge.display_params.end_x;
            endY = edge.display_params.end_y;
            angle = Math.atan((endY - startY) / (endX - startX));   // in radian
        } else {
            this.srcNode = this.findNodeByActionId(edge.src_node_id);
            this.dstNode = this.findNodeByActionId(edge.dst_node_id);
            [startX, startY] = this.calculateStartPoint();
            [endX, endY] = this.calculateEndPoint();
            angle = this.calculateArrowAngle(); // in radian
        }

        this.line = new fabric.Line([
            startX,
            startY,
            endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        ], {
            originX: 'center',
            originY: 'center',
            strokeWidth: EDGE_ARROW_WIDTH,
            stroke: '#000'
        });

        this.triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
        });

        /*this.tailCircle = new fabric.Circle({
            left: startX,
            top: startY,
            originX: 'center',
            originY: 'center'
        });*/

        canvas.add(this.line, this.triangle);
    }

    // TODO: This function should be refactored into the node class / service
    private findNodeByActionId(id: number): NodeView {
        for (let node of this.node) {
            if (node.getNode().action_id === id)
                return node;
        }
        return undefined;
    }

    private calculateStartPoint(): [number, number] {
        let x = this.srcNode.getCenterX() + NODE_SIZE / 2 * Math.cos(this.edge.display_params.src_conn_deg * Math.PI / 180);
        let y = this.srcNode.getCenterY() + NODE_SIZE / 2 * Math.sin(this.edge.display_params.src_conn_deg * Math.PI / 180);
        return [x, y];
    }

    private calculateEndPoint(): [number, number] {
        let x = this.dstNode.getCenterX() + NODE_SIZE / 2 * Math.cos(this.edge.display_params.dst_conn_deg * Math.PI / 180);
        let y = this.dstNode.getCenterY() + NODE_SIZE / 2 * Math.sin(this.edge.display_params.dst_conn_deg * Math.PI / 180);
        return [x, y];
    }

    private calculateArrowAngle(): number {
        let startX: number, startY: number, endX: number, endY: number;
        [startX, startY] = this.calculateStartPoint();
        [endX, endY] = this.calculateEndPoint();
        return Math.atan((endY - startY) / (endX - startX));
    }

    redrawEdge() {

    }
}