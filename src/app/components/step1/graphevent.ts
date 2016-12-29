import { ActionData, TriggerData } from './graph';
import { GraphModel } from './graphmodel';
import { Event } from './eventmanager';

export class ConnectEdgeToSrcNodeEvent implements Event {
    constructor(private graph: GraphModel, private actionData: ActionData, private triggerData: TriggerData, private x: number, private y: number) {
    }
    
    undo() {
    }

    redo() {
        this.graph.connectEdgeToSrcNode(this.actionData, this.triggerData, this.x, this.y);
    }
}