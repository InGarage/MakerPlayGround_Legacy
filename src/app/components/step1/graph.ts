
export interface GraphData {
    nodes: ActionData[], /* List of graph nodes */
    edges: TriggerData[]  /* List of graph edges */
}

export interface ActionData {
    /* Node's unique id */
    node_id: number,
    /* Action's unique id based on action.json */
    action_id: number,
    /* Action's parameters based on each action requirement*/
    //action_params: {
    //    name: string,   /* parameter's name */
    //    value: string   /* parameter's value */
    //} [],
    action_params: {
        name: string,
        [index: string]: string
    }
    /* Parameters needed to display the node on the screen */
    display_params: { 
        x: number,      /* center coordinate of the 75*75px node */
        y: number 
    }
}
/* List of nodes */
export interface TriggerData {
    /* Edge's unique id */
    edge_id: number,
    /* Trigger's unique id based on trigger.json */
    trigger_id: number,
    /* Trigger's parameters based on each trigger requirement*/
    action_params: {
        name: string,   /* parameter's name */
        value: string   /* parameter's value */
    } [],
    /* Unique id of the source node */
    src_node_id: number,    
    /* Unique id of the destination node */
    dst_node_id: number,    
    /* Parameters needed to display the node on the screen */
    display_params: { 
        src_conn_deg: number,   /* angle that the arrow's tail connects to the source node */
        dst_conn_deg: number,    /* angle that the arrow's head connects to the destination node */
        start_x: number,
        start_y: number,
        end_x: number,
        end_y: number
    }
}