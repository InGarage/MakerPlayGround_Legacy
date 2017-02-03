export interface TriggerGroup {
  name : string;
  children : Trigger[];
}

export interface Trigger {
  id: string;
  name: string;
  short_description: string;
  display_text: string;
  params?: TriggerParameter[];
}

export interface TriggerParameter {
    name: string;
    control: string;
    default_value: string;
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

    export const triggerData: TriggerGroup[] = [
  {
    "name": "Accelerometer",
    "children": [
      {
        "id": "Accel_1",
        "name": "Accelerate X",
        "short_description": "Accelerate on x axis",
        "display_text": "AccelX {condition} {value} {unit}",
        "params": [
          {
            "name": "Accelerate",
            "control": "NumberExpression",
            "default_value": "1",
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Accel_2",
        "name": "Accelerate Y",
        "short_description": "Accelerate on y axis",
        "display_text": "AccelY {condition} {value} {unit}",
        "params": [
          {
            "name": "Accelerate",
            "control": "NumberExpression",
            "default_value": "1",
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Accel_3",
        "name": "Accelerate Z",
        "short_description": "Accelerate on z axis",
        "display_text": "AccelZ {condition} {value} {unit}",
        "params": [
          {
            "name": "Accelerate",
            "control": "NumberExpression",
            "default_value": "1",
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Accel_4",
        "name": "Slope X",
        "short_description": "Measure slope on x axis",
        "display_text": "SlopeX {condition} {value} {unit}",
        "params": [
          {
            "name": "Angle",
            "control": "NumberExpression",
            "default_value": "180",
            "args": [
              "degree"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
          }
        ]
      },
      {
        "id": "Accel_5",
        "name": "Slope Y",
        "short_description": "Measure slope on y axis",
        "display_text": "SlopeY {condition} {value} {unit}",
        "params": [
          {
            "name": "Angle",
            "control": "NumberExpression",
            "default_value": "180",
            "args": [
              "degree"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
          }
        ]
      },
      {
        "id": "Accel_6",
        "name": "Slope Z",
        "short_description": "Measure slope z axis",
        "display_text": "SlopeZ {condition} {value} {unit}",
        "params": [
          {
            "name": "Angle",
            "control": "NumberExpression",
            "default_value": "180",
            "args": [
              "degree"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|[1-2]\\d\\d([.]\\d{1,})?|3[0-5]\\d([.]\\d{1,})?|360)$"
          }
        ]
      },
      {
        "id": "Accel_7",
        "name": "Tap",
        "short_description": "Tap detection",
        "display_text": "Tap",
        "params": []
      },
      {
        "id": "Accel_8",
        "name": "Double Tap",
        "short_description": "Double Tap detection",
        "display_text": "Double Tap",
        "params": []
      },
      {
        "id": "Accel_9",
        "name": "Free fall",
        "short_description": "Free fall detection",
        "display_text": "Free fall",
        "params": []
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
        "display_text": "Pressure {condition} {value} {unit}",
        "params": [
          {
            "name": "Pressure",
            "control": "NumberExpression",
            "default_value": "1000",
            "args": [
              "hPa"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Barometer_2",
        "name": "Altitude",
        "short_description": "Measure Altitude by using barometer",
        "display_text": "Altitude {condition} {value} {unit}",
        "params": [
          {
            "name": "Altitude",
            "control": "NumberExpression",
            "default_value": "10",
            "args": [
              "cm"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
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
        "display_text": "Temp {condition} {value} {unit}",
        "params": [
          {
            "name": "Temperature",
            "control": "NumberExpression",
            "default_value": "25",
            "args": [
              "C"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      }
    ]
  },
  {
    "name": "Button",
    "children": [
      {
        "id": "Button_1",
        "name": "Press",
        "short_description": "Press the button",
        "display_text": "Press",
        "params": []
      },
      {
        "id": "Button_2",
        "name": "Release",
        "short_description": "Release the button",
        "display_text": "Release",
        "params": []
      },
      {
        "id": "Button_3",
        "name": "Press x times",
        "short_description": "Press the button x times",
        "display_text": "Press {value} {unit}",
        "params": [
          {
            "name": "Times",
            "control": "NumberExpression",
            "default_value": "3",
            "args": [
              "times"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      },
      {
        "id": "Button_4",
        "name": "Hold",
        "short_description": "Hold the button",
        "display_text": "Hold {value} {unit}",
        "params": [
          {
            "name": "Time",
            "control": "NumberExpression",
            "default_value": "3",
            "args": [
              "seconds"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      }
    ]
  },
  {
    "name": "Time",
    "children": [
      {
        "id": "Time_1",
        "name": "Check time",
        "short_description": "Check time in real world",
        "display_text": "When {value}",
        "params": [
          {
            "name": "Time",
            "control": "NumberExpression",
            "default_value": "13:59:44",
            "args": [
              ""
            ],
            "regex": "^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$"
          }
        ]
      }
    ]
  },
  {
    "name": "General",
    "children": [
      {
        "id": "General_1",
        "name": "Delay",
        "short_description": "Delay time",
        "display_text": "Delay {value} {unit}",
        "params": [
          {
            "name": "Time",
            "control": "NumberExpression",
            "default_value": "1000",
            "args": [
              "milliseconds"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      },
      {
        "id": "General_2",
        "name": "General Analog",
        "short_description": "Compare voltage from the whole analog input",
        "display_text": "Voltage {condition} {value} {unit}",
        "params": [
          {
            "name": "Voltage",
            "control": "NumberExpression",
            "default_value": "3000",
            "args": [
              "millivolts"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "General_3",
        "name": "General Digital",
        "short_description": "Compare logic from the digital device",
        "display_text": "State {condition} {value}",
        "params": [
          {
            "name": "State",
            "control": "HighLow",
            "default_value": "HIGH",
            "args": [
              ""
            ],
            "regex": ""
          }
        ]
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
        "display_text": "RotateX {condition} {value} {unit}",
        "params": [
          {
            "name": "Rotation",
            "control": "NumberExpression",
            "default_value": "100",
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Gyro_2",
        "name": "Rotate Y",
        "short_description": "Detect rotation on y axis in dps units",
        "display_text": "RotateY {condition} {value} {unit}",
        "params": [
          {
            "name": "Rotation",
            "control": "NumberExpression",
            "default_value": "100",
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Gyro_3",
        "name": "Rotate Z",
        "short_description": "Detect rotation on z axis in dps units",
        "display_text": "RotateZ {condition} {value} {unit}",
        "params": [
          {
            "name": "Rotation",
            "control": "NumberExpression",
            "default_value": "100",
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
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
        "display_text": "Humidity {condition} {value} {unit}",
        "params": [
          {
            "name": "Humidity",
            "control": "Percentage",
            "default_value": "30",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      }
    ]
  },
  {
    "name": "Light",
    "children": [
      {
        "id": "Light_1",
        "name": "Illuminance",
        "short_description": "Measure Illuminance",
        "display_text": "Light {condition} {value} {unit}",
        "params": [
          {
            "name": "Illuminance",
            "control": "NumberExpression",
            "default_value": "",
            "args": [
              "Lux"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Light_2",
        "name": "Color",
        "short_description": "Detect color",
        "display_text": "Color {condition} {value}",
        "params": [
          {
            "name": "Color",
            "control": "Color",
            "default_value": "#FFFFFF",
            "args": [
              ""
            ],
            "regex": "^#(\\d|[A-F]){6,6}$"
          }
        ]
      }
    ]
  },
  {
    "name": "LiquidLevel",
    "children": [
      {
        "id": "Liquid_1",
        "name": "Liquid Level",
        "short_description": "Measure Liquid level",
        "display_text": "LiquidLevel {condition} {value} {unit}",
        "params": [
          {
            "name": "Level",
            "control": "NumberExpression",
            "default_value": "15",
            "args": [
              "cm"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Liquid_2",
        "name": "Liquid Pressure",
        "short_description": "Measure Liquid Pressure",
        "display_text": "LiquidPressure {condition} {value} {unit}",
        "params": [
          {
            "name": "Pressure",
            "control": "NumberExpression",
            "default_value": "500",
            "args": [
              "pa"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Liquid_3",
        "name": "Liquid Flow",
        "short_description": "Measure Liquid Flow",
        "display_text": "Liquid Flow {condition} {value} {unit}",
        "params": [
          {
            "name": "Volume per sec",
            "control": "NumberExpression",
            "default_value": "0.000301",
            "args": [
              "m^3/s"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
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
        "display_text": "Compass {condition} {value}",
        "params": [
          {
            "name": "Direction",
            "control": "Direction",
            "default_value": "NE",
            "args": [
              ""
            ],
            "regex": ""
          }
        ]
      },
      {
        "id": "Mag_2",
        "name": "Magnetic X",
        "short_description": "Detect Magnetic on x axis",
        "display_text": "MagneticX {condition} {value} {unit}",
        "params": [
          {
            "name": "Magnetic",
            "control": "NumberExpression",
            "default_value": "0.0003",
            "args": [
              "t"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Mag_3",
        "name": "Magnetic Y",
        "short_description": "Detect Magnetic on y axis",
        "display_text": "MagneticY {condition} {value} {unit}",
        "params": [
          {
            "name": "Magnetic",
            "control": "NumberExpression",
            "default_value": "0.0003",
            "args": [
              "t"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      },
      {
        "id": "Mag_4",
        "name": "Magnetic Z",
        "short_description": "Detect Magnetic on z axis",
        "display_text": "MagneticZ {condition} {value} {unit}",
        "params": [
          {
            "name": "Magnetic",
            "control": "NumberExpression",
            "default_value": "0.0003",
            "args": [
              "t"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
      }
    ]
  },
  {
    "name": "Gesture",
    "children": [
      {
        "id": "Gesture_1",
        "name": "Gesture",
        "short_description": "Detect Gesture",
        "display_text": "Gesture {condition} {value}",
        "params": [
          {
            "name": "Gesture",
            "control": "Gesture",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": ""
          }
        ]
      }
    ]
  },
  {
    "name": "Orientation",
    "children": [
      {
        "id": "Orientation_1",
        "name": "Orientation",
        "short_description": "Orientation 3 Dimensions",
        "display_text": "Orientation {condition} {value}",
        "params": [
          {
            "name": "Orientation",
            "control": "Orientation",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": ""
          }
        ]
      }
    ]
  },
  {
    "name": "Proximity",
    "children": [
      {
        "id": "Proximity_1",
        "name": "PIR",
        "short_description": "Detect motion and heat",
        "display_text": "PIR {condition} {value}",
        "params": [
          {
            "name": "Sensitive",
            "control": "NumberExpression",
            "default_value": "700",
            "args": [
              ""
            ],
            "regex": "^(\\d|[1-9]\\d{1,2}|10([0-1]\\d)|(102[0-3]))$"
          }
        ]
      },
      {
        "id": "Proximity_2",
        "name": "Distance",
        "short_description": "Measure distance",
        "display_text": "Distance {condition} {value} {unit}",
        "params": [
          {
            "name": "Distance",
            "control": "NumberExpression",
            "default_value": "70",
            "args": [
              "cm"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ]
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
        "display_text": "Volume {condition} {value} {unit}",
        "params": [
          {
            "name": "Volume",
            "control": "NumberExpression",
            "default_value": "30",
            "args": [
              "db"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|1[0-1]\\d([.]\\d{1,})?|120)$"
          }
        ]
      }
    ]
  },
  {
    "name": "Communication",
    "children": [
      {
        "id": "Comm_1",
        "name": "Text Receive",
        "short_description": "Check Text Receive",
        "display_text": "Text Receive is {value}",
        "params": [
          {
            "name": "Text",
            "control": "Textbox",
            "default_value": "Hello Arduino",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "Comm_2",
        "name": "RFID",
        "short_description": "Check RFID",
        "display_text": "RFID is {value}",
        "params": [
          {
            "name": "ID",
            "control": "Textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": ""
          }
        ]
      }
    ]
  }
];

}