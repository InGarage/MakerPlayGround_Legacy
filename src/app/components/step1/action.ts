
export interface ActionGroup {
  name: string;
  children: Action[];
}

export interface Action {
  id: string;
  name: string;
  short_description: string;
  params: ActionParameter[];
  compatibility: any;
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
            "name": "brightness",
            "control": "slider",
            "default_value": [
              "50"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "compatibility": {
          "interface": "MP_LED",
          "fn_name": "dim"
        }
      },
      {
        "id": "LED_2",
        "name": "Blink",
        "short_description": "Blink an LED",
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
            "name": "frequency",
            "control": "spinbox",
            "default_value": [
              "2"
            ],
            "args": [
              "Hz"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "compatibility": {
          "interface": "MP_LED",
          "fn_name": "blink"
        }
      },
      {
        "id": "LED_3",
        "name": "On",
        "short_description": "Turn an LED on",
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
            "name": "brightness",
            "control": "slider",
            "default_value": [
              "100"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "compatibility": {
          "interface": "MP_LED",
          "fn_name": "on"
        }
      },
      {
        "id": "LED_4",
        "name": "Off",
        "short_description": "Turn an LED off",
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
          "interface": "MP_LED",
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
        "name": "Backlight\nOn",
        "short_description": "Turn the LCD backlight on",
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
          "interface": "MP_LCD",
          "fn_name": "backlight_on"
        }
      },
      {
        "id": "AN_LCD_2",
        "name": "Backlight\nOff",
        "short_description": "Turn the LCD backlight off",
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
          "interface": "MP_LCD",
          "fn_name": "backlight_off"
        }
      },
      {
        "id": "AN_LCD_3",
        "name": "Show Text",
        "short_description": "Show text",
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
            "name": "text",
            "control": "textbox",
            "default_value": [
              ""
            ],
            "args": [
              ""
            ],
            "regex": "^[\\S ]{0,16}+\\n+[\\S ]{0,16}$"
          }
        ],
        "compatibility": {
          "interface": "MP_LCD",
          "fn_name": "show"
        }
      },
      {
        "id": "AN_LCD_4",
        "name": "Clear\nscreen",
        "short_description": "Erase all content in the screen",
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
          "interface": "MP_LCD",
          "fn_name": "clear"
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
            "name": "frequency",
            "control": "spinbox",
            "default_value": [
              "1000"
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
              "100"
            ],
            "args": [
              "ms"
            ],
            "regex": "^(\\d{1,})$"
          }
        ],
        "compatibility": {
          "interface": "MP_Amplifier",
          "fn_name": "beep"
        }
      }
    ]
  },
  {
    "name": "DCMotor",
    "children": [
      {
        "id": "DCMotor_1",
        "name": "On",
        "short_description": "Turn a motor on",
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
            "name": "direction",
            "control": "Dropdown",
            "default_value": [
              ""
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
              "50"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "compatibility": {
          "interface": "MP_DCMotor",
          "fn_name": "on"
        }
      },
      {
        "id": "DCMotor_2",
        "name": "reverse",
        "short_description": "Change motor direction",
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
          "interface": "MP_DCMotor",
          "fn_name": "reverse"
        }
      },
      {
        "id": "DCMotor_3",
        "name": "set speed",
        "short_description": "Change motor speed",
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
            "name": "speed",
            "control": "slider",
            "default_value": [
              "50"
            ],
            "args": [
              "%"
            ],
            "regex": "^(\\d([.]\\d{1,})?|[1-9]\\d([.]\\d{1,})?|100)$"
          }
        ],
        "compatibility": {
          "interface": "MP_DCMotor",
          "fn_name": "set_speed"
        }
      },
      {
        "id": "DCMotor_4",
        "name": "stop",
        "short_description": "Turn a motor off",
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
          "interface": "MP_DCMotor",
          "fn_name": "stop"
        }
      }
    ]
  }
];

}