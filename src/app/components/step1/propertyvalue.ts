export interface PropertyValue {
    uid: string,
    children: ParameterList[]
}

export interface ParameterList {
    name: string,
    id?: string,        // For using with action
    index?: number,     // For using with trigger
    param: Parameter[]
}

export interface Parameter {
    name: string,       // name of each trigger (user defines by himself)
    value: string[],
    control: string,
    args: string[]
}