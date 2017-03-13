
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
              ""
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
        "img_path": "",
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
            "control": "percentage",
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
      }
    ]
  },
  {
    "name": "Audio",
    "children": [
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
            "control": "radio",
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
        "img_path": "/assets/img-action/DC_setSpeed.svg",
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
    "name": "Cloud",
    "children": [
      {
        "id": "Cloud_1",
        "name": "Tweeter",
        "short_description": "Tweet some text on tweeter",
        "img_path": "",
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
          "type": "Cloud",
          "fn_name": "tweet"
        }
      },
      {
        "id": "Cloud_2",
        "name": "AzureUpload",
        "short_description": "AzureUpload",
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
          "type": "Cloud",
          "fn_name": "azureUp"
        }
      },
      {
        "id": "Cloud_3",
        "name": "AzureDown",
        "short_description": "AzureDown",
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
          }
        ],
        "require": {
          "type": "Cloud",
          "fn_name": "azureDown"
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
        "img_path": "",
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
        "img_path": "",
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
  }
];
}