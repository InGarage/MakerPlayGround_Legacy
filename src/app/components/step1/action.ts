
export interface ActionGroup {
  group_name : string;
  children : Action[];
}

export interface Action {
  name: string;
  type: ActionType;
  property: ActionProperty[];
  image: string;  // path to an image that will be used to represent this action in the canvas
}

export enum ActionType {
  Accel_X,
  Accel_Y
  // TODO: add new actions
}

export interface ActionProperty {
  name: string;
  control : ControlType;
  regex?: string;  // regex use to validate the property value 
}

export enum ControlType {
  TextBox,
  RadioButton,
  CheckBox,
  SpinBox,  // HTML5 input type number
  Color,
  Slider  // HTML5 input type range
}