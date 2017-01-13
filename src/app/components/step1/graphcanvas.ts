
import 'fabric';

import { Action, ActionGroup } from './action';
import { GraphData, NodeData, EdgeData } from './graphmodel';

/* display constants */
const NODE_SIZE: number = 100;
const NODE_NAME_YPOS: number = 70;
const NODE_NAME_FONTSIZE: number = 20;
const EDGE_ARROW_HEAD_SIZE: number = 15;
const EDGE_ARROW_WIDTH: number = 2;

export class GraphCanvas {

    private graph: GraphData;
    private actionGroup: ActionGroup[]; // TODO: remove in future version

    private canvas: fabric.ICanvas;
    private nodeFabricObject: { [node_id: number]: fabric.IObject[] } = {};  // TODO: refactor to more efficient datastructure
    private edgeFabricObject: { [edge_id: number]: fabric.IObject[] } = {};  // TODO: refactor to more efficient datastructure
    private callback: { [index: string]: (CanvasEventOptions) => void } = {};  // TODO: refactor to more efficient datastructure

    private difXbetweenEdgePointandNodeOrigin: number;
    private difYbetweenEdgePointandNodeOrigin: number;

    constructor(element: HTMLCanvasElement | string, options?: fabric.ICanvasOptions) {
        this.canvas = new fabric.Canvas(element, options);
        // do not allow any object to move out of canvas area
        this.canvas.on('object:moving', (e) => {
            let obj = e.target;
            // if object is too big ignore
            if (obj.height > this.canvas.getHeight() || obj.width > this.canvas.getWidth()) {
                return;
            }
            obj.setCoords();
            // top-left corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > this.canvas.getHeight() || obj.getBoundingRect().left + obj.getBoundingRect().width > this.canvas.getWidth()) {
                obj.top = Math.min(obj.top, this.canvas.getHeight() - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, this.canvas.getWidth() - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });

        // TODO: refactor to read the json only once by create a global object or use dependency injection
        this.actionGroup = require("./action.json");

        this.handleSelectionGroup();

        this.canvas.on('selection:cleared', (e) => {
            //let group : any = e.target;
            //console.log(group._objects[0].getLeft(), group._objects[0].getTop());
            //console.log(this.nodeFabricObject[1][3].getLeft(), this.nodeFabricObject[1][3].getTop());
            this.setVisiblePatrolToFalse();
            this.callback['object:deselected']({
            });
        });
    }

    private handleSelectionGroup() {
        let selectedObject: fabric.IObject[] = [];

        this.canvas.on('selection:created', (e) => {
            selectedObject = [];
            for (const o of (<any>e.target)._objects) {
                selectedObject.push(o);
            }

            //this.canvas.setActiveGroup(this.canvas.getActiveGroup().addWithUpdate(this.nodeFabricObject[1][3]));

            //e.target instanceof fabric.Group
            /*if (e.target !== null)  {
                let group : any = e.target;
                console.log(e.target === this.canvas.getActiveGroup());
                console.log(group._objects);

                e.target.on('moving', (options) => {

                for (let i=1; i<=Object.keys(this.nodeFabricObject).length; i++) {
                    for (let temp of this.nodeFabricObject[i]){
                        if ( temp === group._objects[0]){
                            console.log('Found');
                        }
                        }
                    }
                });
            }*/
        });
        this.canvas.on('selection:cleared', (e) => {
            //let group : any = e.target;
            //console.log(group._objects[0].getLeft(), group._objects[0].getTop());
            //console.log(this.nodeFabricObject[1][3].getLeft(), this.nodeFabricObject[1][3].getTop());
            //this.setVisiblePatrolToFalse();


            console.log('clear');
            for (const o of selectedObject) {
                console.log(o.getLeft(), o.getTop());
                if (o.type === 'image') {
                    let node: NodeData = this.getNodeId(o);
                    this.manipulateMovingConnectedNode_UpdateData(node, o);

                    this.callback['node:move']({
                        target_id: node.getNodeId(),
                        center_x: o.getLeft(),
                        center_y: o.getTop(),
                    });
                    o.visible = false;
                }
                if (o.type === 'text') {

                }
                //console.log(o.type);
            }

            this.callback['object:deselected']({
            });
        });
    }

    private getNodeId(obj: fabric.IObject): NodeData {
        for (const key of Object.keys(this.nodeFabricObject)) {
            for (const o of this.nodeFabricObject[key]) {
                if (obj === o)
                    return this.graph.getNode(parseInt(key));
            }
        }

        return undefined;
    }

    private setVisiblePatrolToFalse() {
        for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
            if (this.nodeFabricObject[i] === undefined) {
                continue;
            }
            else {
                let highlight = this.nodeFabricObject[i][1];
                highlight.visible = false;
            }
        }
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

    private getNewEndXYForMovingNodeWithConnection(nodeData, edgeDst, image) {
        let originX: number, originY: number, edgeEndX: number, edgeEndY: number;
        let difX: number, difY: number, currentX: number, currentY: number;
        let newEndX: number, newEndY: number;
        originX = nodeData.getX();
        originY = nodeData.getY();
        edgeEndX = edgeDst.getEndX();
        edgeEndY = edgeDst.getEndY()

        difX = Math.abs(originX - edgeEndX);
        difY = Math.abs(originY - edgeEndY);

        currentX = image.getLeft();
        currentY = image.getTop();

        if ((edgeEndX < originX) && (edgeEndY > originY)) {
            return [currentX - difX, currentY + difY];
        }
        if ((edgeEndX < originX) && (edgeEndY < originY)) {
            return [currentX - difX, currentY - difY];
        }
        if ((edgeEndX > originX) && (edgeEndY < originY)) {
            return [currentX + difX, currentY - difY];
        }
        if ((edgeEndX > originX) && (edgeEndY > originY)) {
            return [currentX + difX, currentY + difY];
        }
    }

    private manupulateMovingDstNode(nodeData: NodeData, edgeDst: EdgeData, image) {
        let newEndX: number, newEndY: number;

        [newEndX, newEndY] = this.getNewEndXYForMovingNodeWithConnection(nodeData, edgeDst, image);

        let edgeStartX = edgeDst.getStartX();
        let edgeStartY = edgeDst.getStartY();
        let angle = Math.atan2((newEndY - edgeStartY), (newEndX - edgeStartX));   // in radian

        // 0 = line, 1 = triangle, 2 = dotTail, 3 = dotHead
        let dotTail = this.edgeFabricObject[edgeDst.getEdgeId()][2];
        dotTail.set({
            top: newEndY,
            left: newEndX,
        });

        let line = this.edgeFabricObject[edgeDst.getEdgeId()][0];
        line.set({
            'x2': newEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            'y2': newEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        });

        let triangle = this.edgeFabricObject[edgeDst.getEdgeId()][1];
        triangle.set({
            left: newEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: newEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            angle: 90 + (angle * 180 / Math.PI),
        });
    }

    private getNewStartXYForMovingNodeWithConnection(nodeData, edgeSrc, image) {
        let originX: number, originY: number, edgeStartX: number, edgeStartY: number;
        let difX: number, difY: number, currentX: number, currentY: number;
        let newEndX: number, newEndY: number;
        originX = nodeData.getX();
        originY = nodeData.getY();
        edgeStartX = edgeSrc.getStartX();
        edgeStartY = edgeSrc.getStartY()

        difX = Math.abs(originX - edgeStartX);
        difY = Math.abs(originY - edgeStartY);

        currentX = image.getLeft();
        currentY = image.getTop();

        if ((edgeStartX < originX) && (edgeStartY > originY)) {
            return [currentX - difX, currentY + difY];
        }
        if ((edgeStartX < originX) && (edgeStartY < originY)) {
            return [currentX - difX, currentY - difY];
        }
        if ((edgeStartX > originX) && (edgeStartY < originY)) {
            return [currentX + difX, currentY - difY];
        }
        if ((edgeStartX > originX) && (edgeStartY > originY)) {
            return [currentX + difX, currentY + difY];
        }
    }

    private manupulateMovingSrcNode(nodeData: NodeData, edgeSrc: EdgeData, image) {
        let newStartX: number, newStartY: number;

        [newStartX, newStartY] = this.getNewStartXYForMovingNodeWithConnection(nodeData, edgeSrc, image);

        let edgeEndX = edgeSrc.getEndX();
        let edgeEndY = edgeSrc.getEndY();
        let angle = Math.atan2((edgeEndY - newStartY), (edgeEndX - newStartX));   // in radian

        // 0 = line, 1 = triangle, 2 = dotTail, 3 = dotHead
        let dotHead = this.edgeFabricObject[edgeSrc.getEdgeId()][3];
        dotHead.set({
            top: newStartY,
            left: newStartX,
        });

        let line = this.edgeFabricObject[edgeSrc.getEdgeId()][0];
        line.set({
            'x1': newStartX,
            'y1': newStartY,
            'x2': edgeEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            'y2': edgeEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle)
        });

        let triangle = this.edgeFabricObject[edgeSrc.getEdgeId()][1];
        triangle.set({
            left: edgeEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: edgeEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            angle: 90 + (angle * 180 / Math.PI),
        });
    }

    private manipulateMovingConnectedNode_Display(nodeData: NodeData, image) {
        let allEdgesDst: EdgeData[], allEdgesSrc: EdgeData[];
        allEdgesDst = this.graph.getAllEdgesDstNode(nodeData.getNodeId(), nodeData.getX(), nodeData.getY());
        allEdgesSrc = this.graph.getAllEdgesSrcNode(nodeData.getNodeId(), nodeData.getX(), nodeData.getY());

        if (allEdgesDst.length !== 0) {
            for (let i = 0; i < allEdgesDst.length; i++) {
                this.manupulateMovingDstNode(nodeData, allEdgesDst[i], image);
            }
        }
        if (allEdgesSrc.length !== 0) {
            for (let i = 0; i < allEdgesSrc.length; i++) {
                this.manupulateMovingSrcNode(nodeData, allEdgesSrc[i], image);
            }
        }
    }

    private manipulateMovingConnectedNode_UpdateData(nodeData: NodeData, image) {
        let allEdgesDst: EdgeData[], allEdgesSrc: EdgeData[];
        allEdgesDst = this.graph.getAllEdgesDstNode(nodeData.getNodeId(), nodeData.getX(), nodeData.getY());
        allEdgesSrc = this.graph.getAllEdgesSrcNode(nodeData.getNodeId(), nodeData.getX(), nodeData.getY());

        if (allEdgesDst.length !== 0) {
            for (let i = 0; i < allEdgesDst.length; i++) {
                this.manupulateMovingDstNode(nodeData, allEdgesDst[i], image);
                this.callback['edge:connectionDst']({
                    target_id: allEdgesDst[i].getEdgeId(),
                    start_x: this.edgeFabricObject[allEdgesDst[i].getEdgeId()][3].getLeft(),
                    start_y: this.edgeFabricObject[allEdgesDst[i].getEdgeId()][3].getTop(),
                    end_x: this.edgeFabricObject[allEdgesDst[i].getEdgeId()][2].getLeft(),
                    end_y: this.edgeFabricObject[allEdgesDst[i].getEdgeId()][2].getTop(),
                    dst_node_id: allEdgesDst[i].getDestinationNodeId(),
                });
            }
        }
        if (allEdgesSrc.length !== 0) {
            for (let i = 0; i < allEdgesSrc.length; i++) {
                this.manupulateMovingSrcNode(nodeData, allEdgesSrc[i], image);
                this.callback['edge:connectionSrc']({
                    target_id: allEdgesSrc[i].getEdgeId(),
                    start_x: this.edgeFabricObject[allEdgesSrc[i].getEdgeId()][3].getLeft(),
                    start_y: this.edgeFabricObject[allEdgesSrc[i].getEdgeId()][3].getTop(),
                    end_x: this.edgeFabricObject[allEdgesSrc[i].getEdgeId()][2].getLeft(),
                    end_y: this.edgeFabricObject[allEdgesSrc[i].getEdgeId()][2].getTop(),
                    src_node_id: allEdgesSrc[i].getSourceNodeId(),
                });
            }
        }
    }

    private getInRangeEdge(newStartX, newStartY, nodeData): EdgeData[] {
        let inRangeEdgeSrc: EdgeData = this.graph.getEdgeInRangeSrc(newStartX, newStartY)
        let inRangeEdgeDst: EdgeData = this.graph.getEdgeInRangeDst(newStartX, newStartY)
        if ((inRangeEdgeSrc !== undefined) || (inRangeEdgeDst !== undefined)) {
            let highlight = this.nodeFabricObject[nodeData.getNodeId()][0];
            highlight.visible = true;

        }
        else {
            for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
                let highlight = this.nodeFabricObject[nodeData.getNodeId()][0];
                highlight.visible = false;
            }
        }
        return [inRangeEdgeSrc, inRangeEdgeDst];
    }

    private drawNode(nodeData: NodeData) {
        let action = this.findActionById(nodeData.getActionId());

        let image: fabric.IImage;
        fabric.Image.fromURL(action.image
            , (im) => {
                image = im;

                /**
                 * HANDLE IMAGE EVENT
                 */
                image.on('moving', (e) => {
                    let newStartX: number, newStartY: number;
                    newStartX = image.getLeft();
                    newStartY = image.getTop();
                    text.set({
                        left: newStartX,
                        top: newStartY + NODE_NAME_YPOS,
                    });
                    circlePatrolInRange.set({
                        left: newStartX,
                        top: newStartY,
                    });
                    circlePatrolSelected.set({
                        left: newStartX,
                        top: newStartY,
                    });

                    // highlight this node when it is moving within edge boundary
                    this.getInRangeEdge(newStartX, newStartY, nodeData);

                    // any edge connected to this node, will be moved depends on this node location
                    this.manipulateMovingConnectedNode_Display(nodeData, image);
                });

                image.on('modified', (e) => {
                    let newOriginX: number, newOriginY: number;
                    let newStartX: number, newStartY: number, newEndX: number, newEndY: number;
                    newOriginX = image.getLeft();
                    newOriginY = image.getTop();
                    let inRangeEdgeDst: EdgeData, inRangeEdgeSrc: EdgeData;

                    this.manipulateMovingConnectedNode_UpdateData(nodeData, image);

                    [inRangeEdgeSrc, inRangeEdgeDst] = this.getInRangeEdge(newOriginX, newOriginY, nodeData);

                    if (inRangeEdgeSrc !== undefined) {
                        [newStartX, newStartY] = this.getNewTopLeftForConnecting(newOriginX, newOriginY, inRangeEdgeSrc.getStartX(), inRangeEdgeSrc.getStartY());
                        this.callback['edge:connectionSrc']({
                            target_id: inRangeEdgeSrc.getEdgeId(),
                            start_x: newStartX,
                            start_y: newStartY,
                            end_x: inRangeEdgeSrc.getEndX(),
                            end_y: inRangeEdgeSrc.getEndY(),
                            src_node_id: nodeData.getNodeId(),
                        });
                    }

                    if (inRangeEdgeDst !== undefined) {
                        [newEndX, newEndY] = this.getNewTopLeftForConnecting(newOriginX, newOriginY, inRangeEdgeDst.getEndX(), inRangeEdgeDst.getEndY());

                        this.callback['edge:connectionDst']({
                            target_id: inRangeEdgeDst.getEdgeId(),
                            start_x: inRangeEdgeDst.getStartX(),
                            start_y: inRangeEdgeDst.getStartY(),
                            end_x: newEndX,
                            end_y: newEndY,
                            dst_node_id: nodeData.getNodeId(),
                        });
                    }


                    this.callback['node:move']({
                        target_id: nodeData.getNodeId(),
                        center_x: newOriginX,
                        center_y: newOriginY,
                    });

                    image.visible = false;

                });

                image.on('selected', (e) => {
                    this.setVisiblePatrolToFalse();
                    circlePatrolSelected.visible = true;

                    this.callback['node:selected']({
                        target_id: nodeData.getNodeId(),
                    });
                });

                image.hasControls = image.hasBorders = false;
                text.hasControls = text.hasBorders = false;
                circlePatrolInRange.hasControls = circlePatrolInRange.hasBorders = false;
                circlePatrolInRange.visible = false;
                circlePatrolSelected.hasControls = circlePatrolSelected.hasBorders = false;
                circlePatrolSelected.visible = false;

                this.canvas.add(circlePatrolInRange, circlePatrolSelected, text, image);
                this.nodeFabricObject[nodeData.getNodeId()] = [circlePatrolInRange, circlePatrolSelected, text, image];
            }
            , {
                width: NODE_SIZE,
                height: NODE_SIZE,
                left: nodeData.getX(),
                top: nodeData.getY(),
                originX: 'center',
                originY: 'center',
            });


        let circlePatrolInRange = new fabric.Circle({
            left: nodeData.getX(),
            top: nodeData.getY(),
            radius: NODE_SIZE / 2,
            stroke: '#66afe9',
            strokeWidth: 15,
            opacity: 0.5,
            fill: 'rgba(0,0,0,0)',
            originX: 'center',
            originY: 'center',
        });

        let circlePatrolSelected = new fabric.Circle({
            left: nodeData.getX(),
            top: nodeData.getY(),
            radius: NODE_SIZE / 2,
            stroke: 'black',
            strokeWidth: 8,
            opacity: 0.2,
            fill: 'rgba(0,0,0,0)',
            originX: 'center',
            originY: 'center',
        });

        let text = new fabric.Text(nodeData.getActionParams('name'), {
            left: nodeData.getX(),
            top: nodeData.getY() + NODE_NAME_YPOS,
            originX: 'center',
            originY: 'center',
            fontSize: NODE_NAME_FONTSIZE
        });

        /**
         * HANDLE TEXT EVENT
         */
        text.on('moving', (options) => {
            let newStartX: number, newStartY: number;
            newStartX = text.getLeft();
            newStartY = text.getTop() - NODE_NAME_YPOS;
            image.set({
                left: newStartX,
                top: newStartY,
            });

            circlePatrolInRange.set({
                left: newStartX,
                top: newStartY,
            });

            circlePatrolSelected.set({
                left: newStartX,
                top: newStartY,
            });

            // highlight this node when it is moving within edge boundary
            this.getInRangeEdge(newStartX, newStartY, nodeData);

            // any edge connected to this node, will be moved depends on this node location
            this.manipulateMovingConnectedNode_Display(nodeData, image);
        });

        text.on('modified', (options) => {
            let newStartX: number, newStartY: number, newEndX: number, newEndY: number;
            let inRangeEdgeDst: EdgeData, inRangeEdgeSrc: EdgeData;
            let originX = text.getLeft();
            let originY = text.getTop() - NODE_NAME_YPOS;

            this.manipulateMovingConnectedNode_UpdateData(nodeData, image);

            [inRangeEdgeSrc, inRangeEdgeDst] = this.getInRangeEdge(originX, originY, nodeData);

            if (inRangeEdgeSrc !== undefined) {
                [newStartX, newStartY] = this.getNewTopLeftForConnecting(originX, originY, inRangeEdgeSrc.getStartX(), inRangeEdgeSrc.getStartY());
                this.callback['edge:connectionSrc']({
                    target_id: inRangeEdgeSrc.getEdgeId(),
                    start_x: newStartX,
                    start_y: newStartY,
                    end_x: inRangeEdgeSrc.getEndX(),
                    end_y: inRangeEdgeSrc.getEndY(),
                    src_node_id: nodeData.getNodeId(),
                });
            }

            if (inRangeEdgeDst !== undefined) {
                [newEndX, newEndY] = this.getNewTopLeftForConnecting(originX, originY, inRangeEdgeDst.getEndX(), inRangeEdgeDst.getEndY());

                this.callback['edge:connectionDst']({
                    target_id: inRangeEdgeDst.getEdgeId(),
                    start_x: inRangeEdgeDst.getStartX(),
                    start_y: inRangeEdgeDst.getStartY(),
                    end_x: newEndX,
                    end_y: newEndY,
                    dst_node_id: nodeData.getNodeId(),
                });
            }


            this.callback['node:move']({
                target_id: nodeData.getNodeId(),
                center_x: originX,
                center_y: originY,
            });

            text.visible = false;
        });

        text.on('selected', (options) => {
            this.callback['node:selected']({
                target_id: nodeData.getNodeId(),
            });
        })
    }

    private setTextLocation(text, newLeft, newTop) {
        text.set({
            left: newLeft,
            top: newTop + NODE_NAME_YPOS,
        })
    }

    private setCirclePatrolInRangeLocation(circle, newLeft, newTop) {
        circle.set({
            left: newLeft,
            top: newTop,
        })
    }

    private setCirclePatrolSelectedLocation(circle, newLeft, newTop) {
        circle.set({
            left: newLeft,
            top: newTop,
        })
    }

    private setImageLocation(image, newLeft, newTop) {
        image.set({
            left: newLeft,
            top: newTop,
        })
    }

    private drawEdge(triggerData: EdgeData) {
        let startX: number, startY: number, endX: number, endY: number, angle: number, difX: number, difY: number;
        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();
        angle = Math.atan2((endY - startY), (endX - startX));   // in radian
        difX = Math.abs(startX - endX) / 2;
        difY = Math.abs(startY - endY) / 2;

        /**
         * START OF LINE
         */
        let line = new fabric.Line([
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
        line.hasControls = line.hasBorders = false;

        // redraw arrow head when the line is moving
        line.on('moving', (options) => {
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
            let currentOriginLineX = line.getLeft();;
            let currentOriginLineY = line.getTop();

            [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            let triangle = this.edgeFabricObject[triggerData.getEdgeId()][1];
            triangle.set({
                left: nEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
                top: nEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            })

            let dotTail = this.edgeFabricObject[triggerData.getEdgeId()][2];
            dotTail.set({
                left: nEndX,
                top: nEndY,
            });

            let dotHead = this.edgeFabricObject[triggerData.getEdgeId()][3];
            dotHead.set({
                left: nStartX,
                top: nStartY,
            });

        });

        // connect if arrow intersect with node
        line.on('modified', (options) => {
            // Need to re-draw canvas, so that dot can be clicked
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
            let currentOriginLineX = line.getLeft();;
            let currentOriginLineY = line.getTop();

            [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: nStartX,
                start_y: nStartY,
                end_x: nEndX,
                end_y: nEndY,
            });
        });
        /**
         * END OF LINE
         */

        /**
         * START OF TRIANGLE
         */
        let triangle = new fabric.Triangle({
            left: endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle),
            top: endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle),
            width: EDGE_ARROW_HEAD_SIZE,
            height: EDGE_ARROW_HEAD_SIZE,
            originX: 'center',  // rotate using center point of the triangle as the origin
            originY: 'center',
            angle: 90 + (angle * 180 / Math.PI),
        });
        triangle.hasControls = triangle.hasBorders = false;

        triangle.on('moving', (options) => {
            let currentOriginTriangleX = triangle.getLeft();
            let currentOriginTriangleY = triangle.getTop();
            let newLeft: number, newTop: number;
            [newLeft, newTop] = this.getLeftTopLine(triggerData, currentOriginTriangleX, currentOriginTriangleY);

            line.set({
                left: newLeft,
                top: newTop
            });

            let currentOriginLineX = line.getLeft();
            let currentOriginLineY = line.getTop();
            let nStartX: number, nStartY: number, nEndX: number, nEndY: number;
            [nStartX, nEndX, nStartY, nEndY] = this.getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY);

            dotHead.setLeft(nStartX);
            dotHead.setTop(nStartY);
            dotTail.setLeft(nEndX + EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle));
            dotTail.setTop(nEndY + EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle));
        });

        triangle.on('modified', (options) => {
            let newStartX: number, newStartY: number, newEndX: number, newEndY: number;
            newStartX = dotHead.getLeft();
            newStartY = dotHead.getTop();
            newEndX = dotTail.getLeft();
            newEndY = dotTail.getTop();

            this.callback['edge:move']({
                target_id: triggerData.getEdgeId(),
                start_x: newStartX,
                start_y: newStartY,
                end_x: newEndX,
                end_y: newEndY,
            });
        })
        /**
         * END OF TRIANGLE
         */

        /**
         * START OF DOT-HEAD
         */
        let dotHead = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 6,
            fill: 'red',
            originX: 'center',
            originY: 'center',
        });
        dotHead.hasControls = dotHead.hasBorders = false;

        /* redraw line when dotHead is moving */
        dotHead.on('moving', (options) => {
            let newStartX: number, newStartY: number, newEndX: number, newEndY: number;
            newStartX = dotHead.getLeft();
            newStartY = dotHead.getTop();

            angle = Math.atan2((endY - newStartY), (endX - newStartX));
            newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            triangle.set({
                'left': newEndX,
                'top': newEndY,
                'angle': 90 + (angle * 180 / Math.PI),
            })

            line.set({
                'x1': newStartX,
                'y1': newStartY,
                'x2': newEndX,
                'y2': newEndY,
            });

            let inRangeNode: NodeData = this.graph.getNodeInRange(newStartX, newStartY, (NODE_SIZE / 2) + 20);
            if (inRangeNode !== undefined) {
                let highlight = this.nodeFabricObject[inRangeNode.getNodeId()][0];
                highlight.visible = true;
            }
            else {
                for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
                    let highlight = this.nodeFabricObject[i][0];
                    highlight.visible = false;
                }
            }
        });

        dotHead.on('modified', (options) => {
            for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
                let highlight = this.nodeFabricObject[i][0];
                highlight.visible = false;
            }
            // Need to re-draw canvas, so that dot can be clicked
            let currentStartX: number, currentStartY: number;
            let newStartX: number, newStartY: number, newEndX: number, newEndY: number;
            currentStartX = dotHead.getLeft();
            currentStartY = dotHead.getTop();

            /* Find end_x and end_y for using with line */
            angle = Math.atan2((endY - currentStartY), (endX - currentStartX));
            newEndX = endX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = endY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            let inRangeNode: NodeData = this.graph.getNodeInRange(currentStartX, currentStartY, (NODE_SIZE / 2) + 20);
            // Intersect between dotTail and node, connect to destination node
            if (inRangeNode !== undefined) {
                let newEndX: number, newEndY: number;
                [newStartX, newStartY] = this.getNewTopLeftForConnecting(inRangeNode.getX(), inRangeNode.getY(), currentStartX, currentStartY);



                dotHead.set({
                    top: newStartY,
                    left: newStartX,
                    originX: 'center',
                    originY: 'center',
                });

                this.callback['edge:connectionSrc']({
                    target_id: triggerData.getEdgeId(),
                    start_x: newStartX,
                    start_y: newStartY,
                    end_x: endX,
                    end_y: endY,
                    src_node_id: inRangeNode.getNodeId(),
                });
            }
            // No intersection found, just update location of edge
            else {
                this.callback['edge:connectionSrc']({
                    target_id: triggerData.getEdgeId(),
                    start_x: currentStartX,
                    start_y: currentStartY,
                    end_x: endX,
                    end_y: endY,
                    src_node_id: 0,
                });
            }
        });
        /**
         * END OF DOT-HEAD
         */

        /**
         * START OF DOT-TAIL
         */
        let dotTail = new fabric.Circle({
            left: endX,
            top: endY,
            radius: 6,
            fill: 'red',
            originX: 'center',
            originY: 'center',
        });
        dotTail.hasControls = dotTail.hasBorders = false;

        dotTail.on('moving', (options) => {
            let currentEndX: number, currentEndY: number, newEndX: number, newEndY: number;
            currentEndX = dotTail.getLeft();
            currentEndY = dotTail.getTop();

            angle = Math.atan2((currentEndY - startY), (currentEndX - startX));
            newEndX = currentEndX - EDGE_ARROW_HEAD_SIZE / 2 * Math.cos(angle);
            newEndY = currentEndY - EDGE_ARROW_HEAD_SIZE / 2 * Math.sin(angle);

            triangle.set({
                'left': newEndX,
                'top': newEndY,
                'angle': 90 + (angle * 180 / Math.PI),
            })

            line.set({
                'x1': startX,
                'y1': startY,
                'x2': newEndX,
                'y2': newEndY,
            });

            let inRangeNode: NodeData = this.graph.getNodeInRange(newEndX, newEndY, (NODE_SIZE / 2) + 20);
            if (inRangeNode !== undefined) {
                let highlight = this.nodeFabricObject[inRangeNode.getNodeId()][0];
                highlight.visible = true;
            }
            else {
                for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
                    let highlight = this.nodeFabricObject[i][0];
                    highlight.visible = false;
                }
            }
        });

        dotTail.on('modified', (options) => {
            for (let i = 1; i <= Object.keys(this.nodeFabricObject).length; i++) {
                let highlight = this.nodeFabricObject[i][0];
                highlight.visible = false;
            }

            // Need to re-draw canvas, so that dot can be clicked
            let currentEndX: number, currentEndY: number, newEndX: number, newEndY: number;
            currentEndX = dotTail.getLeft();
            currentEndY = dotTail.getTop();

            let inRangeNode: NodeData = this.graph.getNodeInRange(currentEndX, currentEndY, (NODE_SIZE / 2) + 20);
            // Intersect between dotTail and node, connect to destination node
            if (inRangeNode !== undefined) {
                let newEndX: number, newEndY: number;
                [newEndX, newEndY] = this.getNewTopLeftForConnecting(inRangeNode.getX(), inRangeNode.getY(), currentEndX, currentEndY);


                dotTail.set({
                    top: newEndY,
                    left: newEndX,
                    originX: 'center',
                    originY: 'center',
                });

                this.callback['edge:connectionDst']({
                    target_id: triggerData.getEdgeId(),
                    start_x: startX,
                    start_y: startY,
                    end_x: newEndX,
                    end_y: newEndY,
                    dst_node_id: inRangeNode.getNodeId(),
                });
            }
            // No intersection found, update location of edge and remove any connection
            else {
                this.callback['edge:connectionDst']({
                    target_id: triggerData.getEdgeId(),
                    start_x: startX,
                    start_y: startY,
                    end_x: currentEndX,
                    end_y: currentEndY,
                    dst_node_id: 0,
                });
            }
        });
        /**
         * END OF DOT-TAIL
         */

        this.edgeFabricObject[triggerData.getEdgeId()] = [line, triangle, dotTail, dotHead];
        this.canvas.add(line, triangle, dotTail, dotHead);
    }


    private getNewTopLeftForConnecting(originX, originY, pointX, pointY) {
        let angle = Math.atan2((pointY - originY), (pointX - originX));
        let x = originX + (NODE_SIZE / 2 - 2) * Math.cos(angle);
        let y = originY + (NODE_SIZE / 2 - 2) * Math.sin(angle);
        return [x, y];
    }

    private getLeftTopLine(triggerData, currentOriginTriangleX, currentOriginTriangleY) {
        let startX: number, startY: number, endX: number, endY: number;

        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginTriangleX - difX
                , currentOriginTriangleY + difY];
        }
        else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginTriangleX - difX
                , currentOriginTriangleY - difY];
        }
        else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginTriangleX + difX
                , currentOriginTriangleY + difY];
        }
        else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginTriangleX + difX
                , currentOriginTriangleY - difY];
        }
    }

    private getCurrentPoint(triggerData, currentOriginLineX, currentOriginLineY) {
        let startX: number, startY: number, endX: number, endY: number;

        startX = triggerData.getStartX();
        startY = triggerData.getStartY();
        endX = triggerData.getEndX();
        endY = triggerData.getEndY();

        let difX = Math.abs(startX - endX) / 2;
        let difY = Math.abs(startY - endY) / 2;

        if ((startX < endX) && (startY >= endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];

        }
        else if ((startX <= endX) && (startY < endY)) {
            return [currentOriginLineX - difX
                , currentOriginLineX + difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        }
        else if ((startX > endX) && (startY >= endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY + difY
                , currentOriginLineY - difY];
        }
        else if ((startX >= endX) && (startY < endY)) {
            return [currentOriginLineX + difX
                , currentOriginLineX - difX
                , currentOriginLineY - difY
                , currentOriginLineY + difY];
        }
    }

    private removeNode(nodeData: NodeData) {
        let obj = this.nodeFabricObject[nodeData.getNodeId()];
        this.nodeFabricObject[nodeData.getNodeId()] = undefined;

        for (let o of obj)
            this.canvas.remove(o);
    }

    private removeEdge(edgeData: EdgeData) {
        let obj = this.edgeFabricObject[edgeData.getEdgeId()];
        this.edgeFabricObject[edgeData.getEdgeId()] = undefined;
        for (let o of obj)
            this.canvas.remove(o);
    }

    /**
     * (Re)draw the canvas with the data provided 
     * @param graph graph to be drawn onto the canvas
     */
    redraw(graph: GraphData): void {
        graph.compareGraphModel(this.graph, (type, target) => {
            if (type === "addition") {
                if (target instanceof NodeData) {
                    this.drawNode(target);
                } else {
                    this.drawEdge(target);
                }
            } else if (type === "deletion") {
                if (target instanceof NodeData) {
                    this.removeNode(target);
                } else {
                    this.removeEdge(target);
                }
            } else if (type === "update") { // remove then add it again
                if (target instanceof NodeData) {
                    this.removeNode(target);
                    this.drawNode(target);
                } else {
                    this.removeEdge(target);
                    this.drawEdge(target);
                }
            }
        });
        this.graph = graph;

    }

    /**
     * Register a callback for a specific event
     * @param event event to register to which should be 'node:select', 'node:move' or ...
     * @param callback a callback function to be called when that specific event is occured
     */
    on(event: 'node:selected' | 'node:move' | 'edge:move' | 'object:deselected' | 'edge:connectionDst' | 'edge:connectionSrc'
        , callback: (options: CanvasEventOptions) => void) {
        this.callback[event] = callback;
    }
}

export interface CanvasEventOptions {
    target_id: number,
    src_node_id?: number, // Unique id of the source node
    dst_node_id?: number, // Unique id of the destination node
    start_x?: number,     // Parameters needed to display the edge on the screen
    start_y?: number,
    center_x?: number,
    center_y?: number,
    end_x?: number,
    end_y?: number
}