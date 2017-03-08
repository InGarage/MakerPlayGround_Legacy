export interface TriggerGroup {
  name: string;
  children: Trigger[];
}

export interface Trigger {
  id: string;
  name: string;
  short_description: string;
  display_text: string;
  display_text_param?: string[];
  params?: TriggerParameter[];
  compatibility: any;
}

export interface TriggerParameter {
  name: string;
  control: string;
  default_value: string[];
  args: string[];
  regex: string;  // regex use to validate the property value 
}

export namespace TriggerHelper {

  export function findTriggerById(id: string): Trigger {
    for (const category of triggerData) {
      for (const trigger of category.children) {
        if (trigger.id === id)
          return trigger;
      }
    }
  }


  export function getTriggerTypeById(id: string): string {
    for (const category of triggerData) {
      for (const trigger of category.children) {
        if (trigger.id === id)
          return category.name;
      }
    }
  }

  export const triggerData: TriggerGroup[] = [
    {
      "name": "Accelerometer",
      "children": [
        {
          "id": "Accel_1",
          "name": "Accelerate\n\nX",
          "short_description": "Accelerate on x axis",
          "display_text": "{name} {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Accelerate",
              "control": "NumberExpression",
              "default_value": [
                '>','3'
              ],
              "args": [
                "m/s^2"
              ],
              "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "accel_x"
          }
        },
        {
          "id": "Accel_2",
          "name": "Accelerate Y",
          "short_description": "Accelerate on y axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Accelerate",
              "control": "NumberExpression",
              "default_value": [
                "1"
              ],
              "args": [
                "m/s^2"
              ],
              "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "accel_y"
          }
        },
        {
          "id": "Accel_3",
          "name": "Accelerate Z",
          "short_description": "Accelerate on z axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Accelerate",
              "control": "NumberExpression",
              "default_value": [
                "1"
              ],
              "args": [
                "m/s^2"
              ],
              "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "accel_z"
          }
        },
        {
          "id": "Accel_4",
          "name": "Slope X",
          "short_description": "Measure slope on x axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Angle",
              "control": "NumberExpression",
              "default_value": [
                "180"
              ],
              "args": [
                "degree"
              ],
              "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "slop_x"
          }
        },
        {
          "id": "Accel_5",
          "name": "Slope Y",
          "short_description": "Measure slope on y axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Angle",
              "control": "NumberExpression",
              "default_value": [
                "180"
              ],
              "args": [
                "degree"
              ],
              "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "slop_y"
          }
        },
        {
          "id": "Accel_6",
          "name": "Slope Z",
          "short_description": "Measure slope z axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Angle",
              "control": "NumberExpression",
              "default_value": [
                "180"
              ],
              "args": [
                "degree"
              ],
              "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "slop_z"
          }
        },
        {
          "id": "Accel_7",
          "name": "Tap",
          "short_description": "Tap detection",
          "display_text": "{name}  is taped",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "tap"
          }
        },
        {
          "id": "Accel_8",
          "name": "Double Tap",
          "short_description": "Double Tap detection",
          "display_text": "{name} is double taped",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "doubletap"
          }
        },
        {
          "id": "Accel_9",
          "name": "Free fall",
          "short_description": "Free fall detection",
          "display_text": "{name}  is free fell",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            }
          ],
          "compatibility": {
            "interface": "MP_Accel",
            "fn_name": "freefall"
          }
        }
      ]
    },
    {
      "name": "Barometer",
      "children": [
        {
          "id": "Barometer_1",
          "name": "Pressure",
          "short_description": "Measure Pressure",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Pressure",
              "control": "NumberExpression",
              "default_value": [
                "1000"
              ],
              "args": [
                "hPa"
              ],
              "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Baro",
            "fn_name": "pressure"
          }
        },
        {
          "id": "Barometer_2",
          "name": "Altitude",
          "short_description": "Measure Altitude by using barometer",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Altitude",
              "control": "NumberExpression",
              "default_value": [
                "10"
              ],
              "args": [
                "cm"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Baro",
            "fn_name": "attitude"
          }
        }
      ]
    },
    {
      "name": "Temperature",
      "children": [
        {
          "id": "Temp_1",
          "name": "Temperature",
          "short_description": "Measure temperature",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Temperature",
              "control": "NumberExpression",
              "default_value": [
                "25"
              ],
              "args": [
                "C"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Temp",
            "fn_name": "checkTemp"
          }
        }
      ]
    },
    {
      "name": "Button",
      "children": [
        {
          "id": "Button_1",
          "name": "Release",
          "short_description": "Release the button",
          "display_text": "{name} is released",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            }
          ],
          "compatibility": {
            "interface": "MP_Button",
            "fn_name": "release"
          }
        },
        {
          "id": "Button_2",
          "name": "DoubleRelease",
          "short_description": "Release the button 2 times",
          "display_text": "{name} is released 2 times",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            }
          ],
          "compatibility": {
            "interface": "MP_Button",
            "fn_name": "doubleRelease"
          }
        }
      ]
    },
    {
      "name": "Gyroscope",
      "children": [
        {
          "id": "Gyro_1",
          "name": "Rotate X",
          "short_description": "Detect rotation on x axis in dps units",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Rotation",
              "control": "NumberExpression",
              "default_value": [
                "100"
              ],
              "args": [
                "dps"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Gyro",
            "fn_name": "rotate_x"
          }
        },
        {
          "id": "Gyro_2",
          "name": "Rotate Y",
          "short_description": "Detect rotation on y axis in dps units",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Rotation",
              "control": "NumberExpression",
              "default_value": [
                "100"
              ],
              "args": [
                "dps"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Gyro",
            "fn_name": "rotate_y"
          }
        },
        {
          "id": "Gyro_3",
          "name": "Rotate Z",
          "short_description": "Detect rotation on z axis in dps units",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Rotation",
              "control": "NumberExpression",
              "default_value": [
                "100"
              ],
              "args": [
                "dps"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Gyro",
            "fn_name": "rotate_z"
          }
        }
      ]
    },
    {
      "name": "Humidity",
      "children": [
        {
          "id": "Humid_1",
          "name": "Humidity",
          "short_description": "Measure Humidity",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Humidity",
              "control": "Slider",
              "default_value": [
                "30"
              ],
              "args": [
                "%"
              ],
              "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Humidity",
            "fn_name": "humidity"
          }
        }
      ]
    },
    {
      "name": "Sound",
      "children": [
        {
          "id": "Sound_1",
          "name": "Volume",
          "short_description": "Measure volume",
          "display_text": "{name} {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Volume",
              "control": "Slider",
              "default_value": [
                "30"
              ],
              "args": [
                "%"
              ],
              "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Sound",
            "fn_name": "checkVol"
          }
        }
      ]
    },
    {
      "name": "General",
      "children": [
        {
          "id": "Delay_1",
          "name": "Delay",
          "short_description": "Delay time",
          "display_text": "Delay {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Time",
              "control": "NumberExpression",
              "default_value": [
                "1000"
              ],
              "args": [
                "milliseconds"
              ],
              "regex": "^(\\d{1,})$"
            }
          ],
          "compatibility": {
            "interface": "MP_General",
            "fn_name": "delay"
          }
        }
      ]
    },
    {
      "name": "Magnetometer",
      "children": [
        {
          "id": "Mag_1",
          "name": "Compass",
          "short_description": "Detect 8 directions",
          "display_text": "{name} {condition} {value}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Direction",
              "control": "Dropdown",
              "default_value": [
                ""
              ],
              "args": [
                "NE",
                "N",
                "E",
                "W",
                "NW",
                "S",
                "SW",
                "SE"
              ],
              "regex": ""
            }
          ],
          "compatibility": {
            "interface": "MP_Mag",
            "fn_name": "compass"
          }
        },
        {
          "id": "Mag_2",
          "name": "Magnetic X",
          "short_description": "Detect Magnetic on x axis",
          "display_text": "{name} {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Magnetic",
              "control": "NumberExpression",
              "default_value": [
                "300"
              ],
              "args": [
                "ut"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Mag",
            "fn_name": "mag_x"
          }
        },
        {
          "id": "Mag_3",
          "name": "Magnetic Y",
          "short_description": "Detect Magnetic on y axis",
          "display_text": "{name} {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Magnetic",
              "control": "NumberExpression",
              "default_value": [
                "300"
              ],
              "args": [
                "ut"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Mag",
            "fn_name": "mag_y"
          }
        },
        {
          "id": "Mag_4",
          "name": "Magnetic Z",
          "short_description": "Detect Magnetic on z axis",
          "display_text": "{name}  {condition} {value} {unit}",
          "params": [
            {
              "name": "name",
              "control": "textbox",
              "default_value": [
                ""
              ],
              "args": [
                ""
              ],
              "regex": "^[\\S]+$"
            },
            {
              "name": "Magnetic",
              "control": "NumberExpression",
              "default_value": [
                "300"
              ],
              "args": [
                "ut"
              ],
              "regex": "^(\\d{1,}([.]\\d{1,})?)$"
            }
          ],
          "compatibility": {
            "interface": "MP_Mag",
            "fn_name": "mag_z"
          }
        }
      ]
    }
  ];

}