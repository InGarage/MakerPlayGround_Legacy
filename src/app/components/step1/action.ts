
export interface ActionGroup {
  name : string;
  children : Action[];
}

export interface Action {
  id: number;
  name: string;
  type: ActionType[];
  description: string;
  property?: ActionProperty[];
  image: string;  // path to an image that will be used to represent this action in the canvas
}
export enum ActionType{
 Accel_X,
 Accel_Y,
 LED,
 REGLED,
 LCDbacklightcolour,
 Amplifiers,
 Buzzer,
 Motor,
 Clock,
 Sevensegment,
 Dotmatrix,
 Generic,
 Distance,
 LCD16X2,
 Barometer,
 SDcard,
 Gyroscope,	
 Magnetometer,	
 Orientation,	
 Temperature,
 Gesture,	
 UART,	
 Button,	
 LiquidLevel,
 AccelZ,	
 Colour,	
 UV,	
 IR, 
 Illuminance, 
 LiquidFlow,
 Unspecified 
 //to be removed
 // TODO: add new actions

}

export interface ActionProperty {
  name: string;
  control : ControlType;
  regex?: string;  // regex use to validate the property value 
}

export enum ControlType {
  TextBox,      // HTML5 input type text
  RadioButton,  // HTML5 input type radio
  CheckBox,     // HTML5 input type checkbox
  SpinBox,      // HTML5 input type number
  Color,        // HTML5 input type color
  Slider        // HTML5 input type range
}

/*export namespace ActionHelper {
  export function findActionById(id: number): Action {
        for (let actionGroup of this.actionGroup) {
            for (let action of actionGroup.children) {
                if (action.id === id)
                    return action;
            }
        }
        return undefined;
    }
}*/