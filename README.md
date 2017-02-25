# Maker PlayGround

The source code of Maker PlayGround, a web application for designing hardware projects
through a simple state diagram. From the diagram, Maker Playground can generate sourcecode 
for many series of microcontroller. It is also compatible with numerous sensors and output 
devices to satisfied user's need.

<!--## Browser Compatibility-->

## Build Instruction

### On Windows (tested on Windows 10 x64)
1. install node via [the pre-built installer](https://nodejs.org/en/download/)
2. install CLI tool for Angular

    `npm install -g @angular/cli`

3. clone this repository
4. `npm install`

<!--### On Linux (tested on Ubuntu 16.04 LTS)-->

### On OS X (tested on OS X EI Capitan)
1. install Xcode's command line tool 
        
    `xcode-select --install`

2. install required dependency using homebrew
    
    `brew install pkg-config cairo pango libpng jpeg giflib`

3. install node via nvm
4. install CLI tool for Angular

    `npm install -g @angular/cli`

5. clone this repository
6. `npm install`

## Notes

To develop the frontend using the cloud development server use

        `ng serve --environment=dev --targer=development`

or just

        `ng serve`

To develop using the local server as a backend use

        `ng serve --environment=dev-local --target=development`

To build for production (using the cloud production server) use 

        `ng serve --environment=prod --target=production`

