
export interface ActionGroup {
  name: string;
  children: Action[];
}

export interface Action {
  id: string;
  name: string;
  short_description: string;
  img_path: string;
  params: ActionParameter[];
  require: require;
}

export interface require {
  type: string;
  fn_name: string;
}

export interface ActionParameter {
  name: string;
  control: string;
  default_value: string[];
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

  export function getActionTypeById(id: string): string {
    for (const category of actionData) {
      for (const action of category.children) {
        if (action.id === id)
          return category.name;
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
        "img_path": "/assets/img-action/LED_Dim.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LED ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
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
          "type": "Led",
          "fn_name": "dim"
        }
      },
      {
        "id": "LED_2",
        "name": "Blink",
        "short_description": "Blink an LED",
        "img_path": "/assets/img-action/LED_Blink.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LED ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "frequency",
            "control": "spinbox",
            "default_value": [
              "2",
              "Hz"
            ],
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "require": {
          "type": "Led",
          "fn_name": "blink"
        }
      },
      {
        "id": "LED_3",
        "name": "On",
        "short_description": "Turn an LED on",
        "img_path": "/assets/img-action/LED_ON.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LED ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "brightness",
            "control": "slider",
            "default_value": [
              "100",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "require": {
          "type": "Led",
          "fn_name": "on"
        }
      },
      {
        "id": "LED_4",
        "name": "Off",
        "short_description": "Turn an LED off",
        "img_path": "/assets/img-action/LED_OFF.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LED ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Led",
          "fn_name": "off"
        }
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
        "img_path": "/assets/img-action/LCD_Backlight_ON.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "backlight_on"
        }
      },
      {
        "id": "AN_LCD_2",
        "name": "Backlight Off",
        "short_description": "Turn the LCD backlight off",
        "img_path": "/assets/img-action/LCD_Backlight_OFF.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "backlight_off"
        }
      },
      {
        "id": "AN_LCD_3",
        "name": "Show Text",
        "short_description": "Show text",
        "img_path": "/assets/img-action/LCD_ShowText.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "Text here"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}+\\n+[\\S ]{0,16}$"
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "show"
        }
      },
      {
        "id": "AN_LCD_4",
        "name": "Clear screen",
        "short_description": "Erase all content in the screen",
        "img_path": "/assets/img-action/LCD_Clear.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "clear"
        }
      },
      {
        "id": "AN_LCD_5",
        "name": "Backlight Color",
        "short_description": "Set Backlight Color",
        "img_path": "/assets/img-action/backlight_color.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "color",
            "control": "textbox",
            "default_value": [
              "#FFFFFF"
            ],
            "args": [
              ""
            ],
            "regex": "^#(\\d|[A-F]){6,6}$"
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "backlight_color"
        }
      },
      {
        "id": "AN_LCD_6",
        "name": "Display Accel_x",
        "short_description": "Display Accel_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showAccel_x"
        }
      },
      {
        "id": "AN_LCD_7",
        "name": "Display Accel_y",
        "short_description": "Display Accel_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showAccel_y"
        }
      },
      {
        "id": "AN_LCD_8",
        "name": "Display Accel_z",
        "short_description": "Display Accel_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showAccel_z"
        }
      },
      {
        "id": "AN_LCD_9",
        "name": "Display Attitude",
        "short_description": "Display Attitude",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showAttitude"
        }
      },
      {
        "id": "AN_LCD_10",
        "name": "Display Compass",
        "short_description": "Display Compass",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showCompass"
        }
      },
      {
        "id": "AN_LCD_11",
        "name": "Display DoubleRelease",
        "short_description": "Display DoubleRelease",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showDoubleRelease"
        }
      },
      {
        "id": "AN_LCD_12",
        "name": "Display Humidity",
        "short_description": "Display Humidity",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showHumidity"
        }
      },
      {
        "id": "AN_LCD_13",
        "name": "Display Mag_x",
        "short_description": "Display Mag_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showMag_x"
        }
      },
      {
        "id": "AN_LCD_14",
        "name": "Display Mag_y",
        "short_description": "Display Mag_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showMag_y"
        }
      },
      {
        "id": "AN_LCD_15",
        "name": "Display Mag_z",
        "short_description": "Display Mag_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showMag_z"
        }
      },
      {
        "id": "AN_LCD_16",
        "name": "Display Pressure",
        "short_description": "Display Pressure",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showPressure"
        }
      },
      {
        "id": "AN_LCD_17",
        "name": "Display Release",
        "short_description": "Display Release",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showRelease"
        }
      },
      {
        "id": "AN_LCD_18",
        "name": "Display Rotate_x",
        "short_description": "Display Rotate_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showRotate_x"
        }
      },
      {
        "id": "AN_LCD_19",
        "name": "Display Rotate_y",
        "short_description": "Display Rotate_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showRotate_y"
        }
      },
      {
        "id": "AN_LCD_20",
        "name": "Display Rotate_z",
        "short_description": "Display Rotate_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showRotate_z"
        }
      },
      {
        "id": "AN_LCD_21",
        "name": "Display Temp",
        "short_description": "Display Temp",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showTemp"
        }
      },
      {
        "id": "AN_LCD_22",
        "name": "Display Volume",
        "short_description": "Display Volume",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "LCD ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "your text"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Lcd",
          "fn_name": "showVolume"
        }
      }
    ]
  },
  {
    "name": "Audio",
    "children": [
      {
        "id": "Audio_1",
        "name": "beep",
        "short_description": "Play a beep sound",
        "img_path": "/assets/img-action/Audio_playSound.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Speaker ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "volume",
            "control": "slider",
            "default_value": [
              "50",
              "%"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          },
          {
            "name": "duration",
            "control": "spinbox",
            "default_value": [
              "100",
              "ms"
            ],
            "args": [
              "ms"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "require": {
          "type": "Audio",
          "fn_name": "beep"
        }
      },
      {
        "id": "Audio_2",
        "name": "tone",
        "short_description": "Play a tone sound",
        "img_path": "/assets/img-action/Audio_playTone.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Speaker ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "frequency",
            "control": "spinbox",
            "default_value": [
              "1000",
              "Hz"
            ],
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          },
          {
            "name": "duration",
            "control": "spinbox",
            "default_value": [
              "100",
              "ms"
            ],
            "args": [
              "ms"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "require": {
          "type": "Audio",
          "fn_name": "tone"
        }
      }
    ]
  },
  {
    "name": "DC Motor",
    "children": [
      {
        "id": "DCMotor_1",
        "name": "on",
        "short_description": "Turn a motor on",
        "img_path": "/assets/img-action/DC_ON.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Motor ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "direction",
            "control": "Dropdown",
            "default_value": [
              "CW"
            ],
            "args": [
              "CW",
              "CCW"
            ],
            "regex": ""
          },
          {
            "name": "speed",
            "control": "slider",
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
          "type": "Motor",
          "fn_name": "on"
        }
      },
      {
        "id": "DCMotor_2",
        "name": "reverse",
        "short_description": "Change motor direction",
        "img_path": "/assets/img-action/DC_reverse.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Motor ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Motor",
          "fn_name": "reverse"
        }
      },
      {
        "id": "DCMotor_3",
        "name": "set_speed",
        "short_description": "Change motor speed",
        "img_path": "/assets/img-action/DC_SetSpeed.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Motor ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "speed",
            "control": "slider",
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
          "type": "Motor",
          "fn_name": "set speed"
        }
      },
      {
        "id": "DCMotor_4",
        "name": "stop",
        "short_description": "Turn a motor off",
        "img_path": "/assets/img-action/DC_stop.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Motor ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Motor",
          "fn_name": "stop"
        }
      }
    ]
  },
  {
    "name": "7Seg",
    "children": [
      {
        "id": "7Seg_1",
        "name": "show",
        "short_description": "show",
        "img_path": "/assets/img-action/7-seg-showDigit.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "7Seg ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "number1",
            "control": "textbox",
            "default_value": [
              "1"
            ],
            "args": [
              ""
            ],
            "regex": "^(\\d|A|B|C|D|F|a|b|c|d|e|f)?$"
          },
          {
            "name": "number2",
            "control": "textbox",
            "default_value": [
              "A"
            ],
            "args": [
              ""
            ],
            "regex": "^(\\d|A|B|C|D|F|a|b|c|d|e|f)?$"
          },
          {
            "name": "number3",
            "control": "textbox",
            "default_value": [
              "B"
            ],
            "args": [
              ""
            ],
            "regex": "^(\\d|A|B|C|D|F|a|b|c|d|e|f)?$"
          },
          {
            "name": "number4",
            "control": "textbox",
            "default_value": [
              "F"
            ],
            "args": [
              ""
            ],
            "regex": "^(\\d|A|B|C|D|F|a|b|c|d|e|f)?$"
          },
          {
            "name": "colon",
            "control": "checkbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "7Seg",
          "fn_name": "show"
        }
      },
      {
        "id": "7Seg_2",
        "name": "off",
        "short_description": "off",
        "img_path": "/assets/img-action/7-seg-noShowDigit.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "7Seg ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "7Seg",
          "fn_name": "off"
        }
      }
    ]
  },
  {
    "name": "Twitter",
    "children": [
      {
        "id": "Twit_1",
        "name": "Tweeter",
        "short_description": "Tweet some text on tweeter",
        "img_path": "/assets/img-action/Cloud_twitter.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Tweet ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "text",
            "control": "textbox",
            "default_value": [
              "hello world"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Twitter",
          "fn_name": "tweet"
        }
      },
      {
        "id": "Twit_2",
        "name": "setup",
        "short_description": "Initial the twitter's value",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Azure ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "consumer_key",
            "control": "textbox",
            "default_value": [
              "your consumer_key"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "consumer_secret",
            "control": "textbox",
            "default_value": [
              "your consumer_secret"
            ],
            "args": [
              ""
            ],
            "regex": ""
          },
          {
            "name": "access_token_key",
            "control": "textbox",
            "default_value": [
              "your access_token_key"
            ],
            "args": [
              ""
            ],
            "regex": ""
          },
          {
            "name": "access_token_secret",
            "control": "textbox",
            "default_value": [
              "your access_token_secret"
            ],
            "args": [
              ""
            ],
            "regex": ""
          },
          {
            "name": "intro_str",
            "control": "textbox",
            "default_value": [
              "shortly intro"
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Twitter",
          "fn_name": "setup"
        }
      }
    ]
  },
  {
    "name": "Relay",
    "children": [
      {
        "id": "Relay_1",
        "name": "on",
        "short_description": "on",
        "img_path": "/assets/img-action/Relay_ON.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Relay ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Relay",
          "fn_name": "on"
        }
      },
      {
        "id": "Relay_2",
        "name": "off",
        "short_description": "off",
        "img_path": "/assets/img-action/Relay_OFF.svg",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Relay ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Relay",
          "fn_name": "off"
        }
      }
    ]
  },
  {
    "name": "Cloud",
    "children": [
      {
        "id": "Cloud_1",
        "name": "setup",
        "short_description": "Initial the cloud's value",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Azure ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "IO_USERNAME",
            "control": "textbox",
            "default_value": [
              "your adafruitIO username"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "IO_KEY",
            "control": "textbox",
            "default_value": [
              "your adafruitIO key"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "WIFI_SSID",
            "control": "textbox",
            "default_value": [
              "your wifi name"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "WIFI_PASS",
            "control": "textbox",
            "default_value": [
              "your wifi password"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "setup"
        }
      },
      {
        "id": "Cloud_2",
        "name": "Display Rotate_x",
        "short_description": "Cloud Display Rotate_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaRotate_x"
        }
      },
      {
        "id": "Cloud_3",
        "name": "Display Rotate_y",
        "short_description": "Cloud Display Rotate_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaRotate_y"
        }
      },
      {
        "id": "Cloud_4",
        "name": "Display Rotate_z",
        "short_description": "Cloud Display Rotate_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaRotate_z"
        }
      },
      {
        "id": "Cloud_5",
        "name": "Display Temp",
        "short_description": "Cloud Display Temp",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaTemp"
        }
      },
      {
        "id": "Cloud_6",
        "name": "Display Accel_x",
        "short_description": "Cloud Display Accel_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaAccel_x"
        }
      },
      {
        "id": "Cloud_7",
        "name": "Display Accel_y",
        "short_description": "Cloud Display Accel_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaAccel_y"
        }
      },
      {
        "id": "Cloud_8",
        "name": "Display Accel_z",
        "short_description": "Cloud Display Accel_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaAccel_z"
        }
      },
      {
        "id": "Cloud_9",
        "name": "Display Attitude",
        "short_description": "Cloud Display Attitude",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaAttitude"
        }
      },
      {
        "id": "Cloud_10",
        "name": "Display Compass",
        "short_description": "Cloud Display Compass",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaCompass"
        }
      },
      {
        "id": "Cloud_11",
        "name": "Display DoubleRelease",
        "short_description": "Cloud Display DoubleRelease",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaDoubleRelease"
        }
      },
      {
        "id": "Cloud_12",
        "name": "Display Humidity",
        "short_description": "Cloud Display Humidity",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaHumidity"
        }
      },
      {
        "id": "Cloud_13",
        "name": "Display Mag_x",
        "short_description": "Cloud Display Mag_x",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaMag_x"
        }
      },
      {
        "id": "Cloud_14",
        "name": "Display Mag_y",
        "short_description": "Cloud Display Mag_y",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaMag_y"
        }
      },
      {
        "id": "Cloud_15",
        "name": "Display Mag_z",
        "short_description": "Cloud Display Mag_z",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaMag_z"
        }
      },
      {
        "id": "Cloud_16",
        "name": "Display Pressure",
        "short_description": "Cloud Display Pressure",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaPressure"
        }
      },
      {
        "id": "Cloud_17",
        "name": "Display Release",
        "short_description": "Cloud Display Release",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaRelease"
        }
      },
      {
        "id": "Cloud_18",
        "name": "Display Volume",
        "short_description": "Cloud Display Volume",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "device",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": ""
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaVolume"
        }
      },
      {
        "id": "Cloud_19",
        "name": "Control Led",
        "short_description": "Control Led on cloud by percentage",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaControlLED"
        }
      },
      {
        "id": "Cloud_20",
        "name": "Control Motor",
        "short_description": "Control Motor on cloud by percentage",
        "img_path": "",
        "params": [
          {
            "name": "name",
            "control": "textbox",
            "default_value": [
              "Cloud ?"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          },
          {
            "name": "feed",
            "control": "textbox",
            "default_value": [
              "feed name(lable of cloud panel)"
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S]+$"
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "adaControlMotor"
        }
      }
    ]
  }
];
}