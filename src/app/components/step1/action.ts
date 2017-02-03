
export interface ActionGroup {
    name: string;
    children: Action[];
}

export interface Action {
    id: string;
    name: string;
    short_description: string;
    params: ActionParameter[];
}

export interface ActionParameter {
    name: string;
    control: string;
    default_value: string;
    args: string[];
    regex: string;  // regex use to validate the property value 
}

export namespace ActionHelper {

    export function findActionById(id: string): Action {
        for (const category of actionData) {
            for (const action of category.children) {
                if (action.id === id)
                    return action;
            }
        }
    }

    export const actionData: ActionGroup[] = [
  {
    "name": "LED",
    "children": [
      {
        "id": "LED_1",
        "name": "Dim",
        "short_description": "Adjust an LED brightness",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "LED_2",
        "name": "Blink",
        "short_description": "Blink an LED",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "frequency",
            "control": "spinbox",
            "default_value": "2",
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      },
      {
        "id": "LED_3",
        "name": "On",
        "short_description": "Turn an LED on",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
            "default_value": "100",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "LED_4",
        "name": "Off",
        "short_description": "Turn an LED off",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      }
    ]
  },
  {
    "name": "RGBLED",
    "children": [
      {
        "id": "RGBLED_1",
        "name": "Dim",
        "short_description": "Adjust an LED brightness",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "RGBLED_2",
        "name": "Blink",
        "short_description": "Blink an LED",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "frequency",
            "control": "spinbox",
            "default_value": "2",
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      },
      {
        "id": "RGBLED_3",
        "name": "On",
        "short_description": "Turn an LED on",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
            "default_value": "100",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          },
          {
            "name": "color",
            "control": "color",
            "default_value": "#FFFFFF",
            "args": [
              ""
            ],
            "regex": "^#(\\d|[A-F]){6,6}$"
          }
        ]
      },
      {
        "id": "RGBLED_4",
        "name": "Off",
        "short_description": "Turn an LED off",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "RGBLED_5",
        "name": "Set Color",
        "short_description": "Set the color of an RGB LED",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "color",
            "control": "color",
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
    "name": "Alphanumeric LCD",
    "children": [
      {
        "id": "AN_LCD_1",
        "name": "Backlight On",
        "short_description": "Turn the LCD backlight on",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_2",
        "name": "Backlight Off",
        "short_description": "Turn the LCD backlight off",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_3",
        "name": "Show Text",
        "short_description": "Show text",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}+\\n+[\\S ]{0,16}$"
          }
        ]
      },
      {
        "id": "AN_LCD_4",
        "name": "Clear screen",
        "short_description": "Erase all content in the screen",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_5",
        "name": "Temperature",
        "short_description": "Temperature",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_6",
        "name": "Liquid Flow",
        "short_description": "LiquidFlow",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_7",
        "name": "Pressure",
        "short_description": "Barometer",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_8",
        "name": "Liquid Pressure",
        "short_description": "LiquidPressure",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_9",
        "name": "Orientation",
        "short_description": "Orientation",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_10",
        "name": "Illumination",
        "short_description": "Illuminance",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_11",
        "name": "Distance",
        "short_description": "Distance",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_12",
        "name": "Humanity",
        "short_description": "Humanity",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_13",
        "name": "Color",
        "short_description": "Color",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_14",
        "name": "Gesture",
        "short_description": "Gesture",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_15",
        "name": "UART",
        "short_description": "UART",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_16",
        "name": "Button state",
        "short_description": "Button",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_17",
        "name": "Liquid Level",
        "short_description": "LiquidLevel",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_18",
        "name": "Voltage",
        "short_description": "Generic",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_19",
        "name": "Logic",
        "short_description": "Generic",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_20",
        "name": "Accelerometer_X",
        "short_description": "AccelX",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_21",
        "name": "Accelerometer_Y",
        "short_description": "AccelY",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_22",
        "name": "Accelerometer_Z",
        "short_description": "AccelZ",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_23",
        "name": "Gyroscope_X",
        "short_description": "GyroX",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_24",
        "name": "Gyroscope_Y",
        "short_description": "GyroY",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_25",
        "name": "Gyroscope_Z",
        "short_description": "GyroZ",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_26",
        "name": "Magnetic_X",
        "short_description": "MagneticX",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_27",
        "name": "Magnetic_Y",
        "short_description": "MagneticY",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "AN_LCD_28",
        "name": "Magnetic_Z",
        "short_description": "MagneticZ",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "sensor name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      }
    ]
  },
  {
    "name": "Audio",
    "children": [
      {
        "id": "Audio_1",
        "name": "Play audio",
        "short_description": "Play an audio file from a SD card",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "filename",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "volume",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "Audio_2",
        "name": "Volume Up",
        "short_description": "Increase volume by 10%",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "Audio_3",
        "name": "Volume Down",
        "short_description": "Decrease volume by 10%",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "Audio_4",
        "name": "Set Volume",
        "short_description": "Set audio playback volume",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "volume",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "Audio_5",
        "name": "Stop",
        "short_description": "Stop playing an audio file",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "Audio_6",
        "name": "Beep",
        "short_description": "Play a beep sound",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "frequency",
            "control": "spinbox",
            "default_value": "1000",
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          },
          {
            "name": "duration",
            "control": "spinbox",
            "default_value": "100",
            "args": [
              "ms"
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      }
    ]
  },
  {
    "name": "DC Motor",
    "children": [
      {
        "id": "DCMotor_1",
        "name": "On",
        "short_description": "Turn a motor on",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "direction",
            "control": "radio",
            "default_value": "",
            "args": [
              "CW",
              "CCW"
            ],
            "regex": ""
          },
          {
            "name": "speed",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "DCMotor_2",
        "name": "Reverse",
        "short_description": "Change motor direction",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ]
      },
      {
        "id": "DCMotor_3",
        "name": "Set Speed",
        "short_description": "Change motor speed",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "speed",
            "control": "slider",
            "default_value": "50",
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ]
      },
      {
        "id": "DCMotor_4",
        "name": "Stop",
        "short_description": "Turn a motor off",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
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
        "name": "Set time",
        "short_description": "Set the current time",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "time",
            "control": "textbox",
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
    "name": "Segment LED",
    "children": [
      {
        "id": "SegmentLED_1",
        "name": "Show number",
        "short_description": "Display digit(s) on the segment LED",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "number",
            "control": "textbox",
            "default_value": "0",
            "args": [
              ""
            ],
            "regex": "^(\\d{1,})$"
          }
        ]
      }
    ]
  },
  {
    "name": "Dotmatrix",
    "children": [
      {
        "id": "Dotmatrix_1",
        "name": "Display",
        "short_description": "Display data on dot matrix",
        "params": [
          {
            "name": "name",
            "control": "TextBox",
            "default_value": "",
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "data",
            "control": "DOTMATRIX_CONTROL",
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