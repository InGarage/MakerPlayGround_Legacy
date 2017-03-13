export interface TriggerGroup {
  name: string;
  children: Trigger[];
}

export interface Trigger {
  id: string;
  name: string;
  short_description: string;
  img_path: string;
  display_text: string;
  //display_text_param?: display_text_param[];
  display_text_param?: string[];
  params?: TriggerParameter[];
  require: require;
}

export interface require {
  type: string,
  fn_name: string
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
        "name": "Accelerate X",
        "short_description": "Accelerate on x axis",
        "img_path": "/assets/img-trigger/AcceleX.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Acceleration"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Acceleration",
            "control": "NumberExpression",
            "default_value": [
              ">",
              "1",
              "m/s^2"
            ],
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Accelerometer",
          "fn_name": "accel_x"
        }
      },
      {
        "id": "Accel_2",
        "name": "Accelerate Y",
        "short_description": "Accelerate on y axis",
        "img_path": "/assets/img-trigger/AcceleY.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Acceleration"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Acceleration",
            "control": "NumberExpression",
            "default_value": [
              ">",
              "1",
              "m/s^2"
            ],
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Accelerometer",
          "fn_name": "accel_y"
        }
      },
      {
        "id": "Accel_3",
        "name": "Accelerate Z",
        "short_description": "Accelerate on z axis",
        "img_path": "/assets/img-trigger/AcceleZ.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Acceleration"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Acceleration",
            "control": "NumberExpression",
            "default_value": [
              ">",
              "1",
              "m/s^2"
            ],
            "args": [
              "m/s^2"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Accelerometer",
          "fn_name": "accel_z"
        }
      },
      {
        "id": "Accel_4",
        "name": "Tap",
        "short_description": "Tap detection",
        "img_path": "/assets/img-trigger/Accele_Tap.svg",
        "display_text": "Tapped",
        "display_text_param": [],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Accelerometer",
          "fn_name": "tap"
        }
      },
      {
        "id": "Accel_5",
        "name": "Double Tap",
        "short_description": "Double Tap detection",
        "img_path": "/assets/img-trigger/Accele_Tap.svg",
        "display_text": "Double Tapped",
        "display_text_param": [],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Accelerometer",
          "fn_name": "doubletap"
        }
      },
      {
        "id": "Accel_6",
        "name": "Free fall",
        "short_description": "Free fall detection",
        "img_path": "/assets/img-trigger/Accele_fall.svg",
        "display_text": "Free fall",
        "display_text_param": [],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Accel ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Accelerometer",
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
        "img_path": "/assets/img-trigger/Barometer_pressure.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Pressure"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Barometer ?"
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
              ">",
              "1000",
              "hPa"
            ],
            "args": [
              "hPa"
            ],
            "regex": "^\\-?(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Pressure",
          "fn_name": "pressure"
        }
      },
      {
        "id": "Barometer_2",
        "name": "Altitude",
        "short_description": "Measure Altitude by using barometer",
        "img_path": "/assets/img-trigger/Barometer_Altitude.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Altitude"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Barometer ?"
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
              ">",
              "10",
              "cm"
            ],
            "args": [
              "cm"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Pressure",
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
        "img_path": "/assets/img-trigger/Templature.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Temperature"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Temp ?"
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
              ">",
              "25",
              "C"
            ],
            "args": [
              "C"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Temperature",
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
        "name": "Press",
        "short_description": "Release the button",
        "img_path": "/assets/img-trigger/Button_press.svg",
        "display_text": "Pressed",
        "display_text_param": [],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Button ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Button",
          "fn_name": "release"
        }
      },
      {
        "id": "Button_2",
        "name": "Double Press",
        "short_description": "Release the button 2 times",
        "img_path": "/assets/img-trigger/Button_doublePress.svg",
        "display_text": "Pressed 2 times",
        "display_text_param": [],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Button ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Button",
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
        "name": "Roll",
        "short_description": "Detect rotation on x axis in dps units",
        "img_path": "/assets/img-trigger/Gyro_roll.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Rotation"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Gyro ?"
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
              ">",
              "100",
              "dps"
            ],
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Gyroscope",
          "fn_name": "rotate_x"
        }
      },
      {
        "id": "Gyro_2",
        "name": "Pitch",
        "short_description": "Detect rotation on y axis in dps units",
        "img_path": "/assets/img-trigger/Gyro_pitch.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Rotation"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Gyro ?"
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
              ">",
              "100",
              "dps"
            ],
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Gyroscope",
          "fn_name": "rotate_y"
        }
      },
      {
        "id": "Gyro_3",
        "name": "Yaw",
        "short_description": "Detect rotation on z axis in dps units",
        "img_path": "/assets/img-trigger/Gyro_Yaw.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Rotation"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Gyro ?"
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
              ">",
              "100",
              "dps"
            ],
            "args": [
              "dps"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Gyroscope",
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
        "img_path": "/assets/img-trigger/Humidity.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Humidity"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Humid ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Humidity",
            "control": "NumberExpression",
            "default_value": [
              ">",
              "30",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "Humidity",
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
        "img_path": "/assets/img-trigger/Sound.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Volume"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Sound ?"
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
              "50",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "Sound",
          "fn_name": "checkVol"
        }
      }
    ]
  },
  {
    "name": "General",
    "children": [
      {
        "id": "Gen_1",
        "name": "Delay",
        "short_description": "Delay time",
        "img_path": "/assets/img-trigger/Delay.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Time"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Delay ?"
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
              "1000",
              "ms"
            ],
            "args": [
              "milliseconds"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "require": {
          "type": "General",
          "fn_name": "delay"
        }
      },
      {
        "id": "Gen_2",
        "name": "Read analog",
        "short_description": "Read analog",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Value"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Analog ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Value",
            "control": "Slider",
            "default_value": [
              "50",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "General",
          "fn_name": "analogRead"
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
        "img_path": "/assets/img-trigger/Compass.svg",
        "display_text": "{0}",
        "display_text_param": [
          "Direction"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Compass ?"
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
              "NE"
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
        "require": {
          "type": "Magnetometer",
          "fn_name": "compass"
        }
      },
      {
        "id": "Mag_2",
        "name": "Magnetic X",
        "short_description": "Detect Magnetic on x axis",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Magnetic"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Mag ?"
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
              ">",
              "300",
              "ut"
            ],
            "args": [
              "ut"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Magnetometer",
          "fn_name": "mag_x"
        }
      },
      {
        "id": "Mag_3",
        "name": "Magnetic Y",
        "short_description": "Detect Magnetic on y axis",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Magnetic"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Mag ?"
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
              ">",
              "300",
              "ut"
            ],
            "args": [
              "ut"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Magnetometer",
          "fn_name": "mag_y"
        }
      },
      {
        "id": "Mag_4",
        "name": "Magnetic Z",
        "short_description": "Detect Magnetic on z axis",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Magnetic"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Mag ?"
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
              ">",
              "300",
              "ut"
            ],
            "args": [
              "ut"
            ],
            "regex": "^(\\d{1,}([.]\\d{1,})?)$"
          }
        ],
        "require": {
          "type": "Magnetometer",
          "fn_name": "mag_z"
        }
      }
    ]
  },
  {
    "name": "Distance",
    "children": [
      {
        "id": "Dis_1",
        "name": "Distance",
        "short_description": "Measure distance",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Distance"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Ultra ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Distance",
            "control": "Slider",
            "default_value": [
              "1000",
              "cm"
            ],
            "args": [
              "cm"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "require": {
          "type": "Ultrasonic",
          "fn_name": "distance"
        }
      }
    ]
  },
  {
    "name": "Light",
    "children": [
      {
        "id": "Lig_1",
        "name": "Light",
        "short_description": "Measure light",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Value"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Light ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Value",
            "control": "Slider",
            "default_value": [
              "50",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "Light",
          "fn_name": "light"
        }
      }
    ]
  },
  {
    "name": "Motion",
    "children": [
      {
        "id": "Mot_1",
        "name": "Motion",
        "short_description": "Measure motion",
        "img_path": "",
        "display_text": "{0}",
        "display_text_param": [
          "Sensitivity"
        ],
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "PIR ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "Sensitivity",
            "control": "Slider",
            "default_value": [
              "50",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "PIR",
          "fn_name": "motion"
        }
      }
    ]
  }
]
}