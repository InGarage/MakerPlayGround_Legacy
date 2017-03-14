import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { ProjectService } from '../../services/projects.service';
import 'fabric';

import * as $ from 'jquery';

@Component({
    selector: 'step3',
    templateUrl: `./step3.component.html`,
    styleUrls: ['./step1.component.css']
})
export class Step3Component implements OnInit, AfterViewInit {

    devices = { devices: [], diagram: '', sourcecode: '' };
    projectName: string;
    private canvas: fabric.ICanvas;

    constructor(private router: Router, private projectService: ProjectService) {
        this.projectName = projectService.getCurrentProject().project_name;
    }

    ngOnInit() {
        $(window).on("resize", () => {
            this.setHeight();
        }).resize();
    }

    ngAfterViewInit() {
        this.canvas = new fabric.Canvas('diagram');

        this.projectService.generateCode(this.projectService.getCurrentProject()).subscribe((res) => {
            console.log(res);
            this.devices.sourcecode = this.devices.sourcecode.replace('\n', '<br>');
            this.devices = res;

            this.drawDiagram();
        });
    }

    drawDiagram() {
        // const response = {
        //     breadboard: {
        //         name: 'breadboard_large.svg',
        //         position: { x: 0, y: 0 }
        //     },
        //     mcu: {
        //         name: 'MCU_1',
        //         position: { x: 0, y: 0 }
        //     },
        //     devices: [
        //         {
        //             name: ['Temp1', 'Humidity'],
        //             type: 'DEV_1'
        //             position: { x: 0, y: 0 }
        //         }
        //     ],
        //     connections: [
        //         {
        //             type: 'PWR',    // PWR GPIO SDA SCL ANALOG PWM
        //             startx: 100,
        //             starty: 100,
        //             endx: 50,
        //             endy: 50
        //         },
        //         {
        //             type: 'I2C',
        //             startx: 100,
        //             starty: 100,
        //             endx: 50,
        //             endy: 50
        //         }
        //     ]
        // };

        const wireColor = {
            PWR: 'red',
            GND: 'black',
            GPIO: 'green',
            SDA: 'yellow',
            SCL: 'blue',
            Analog: 'green',
            PWM: 'green'
        }

        const diagram: any = JSON.parse(this.devices.diagram);
        console.log(diagram);
        // draw a breadboard
        fabric.Image.fromURL('/assets/diagram/' + diagram.breadboard.name + '.png', (img) => {
            //fabric.loadSVGFromURL('/assets/diagram/' + diagram.breadboard.name + '.svg', (objects, options) => {
            //let img = fabric.util.groupSVGElements(objects, options);
            img.set({
                left: diagram.breadboard.position.x,
                top: diagram.breadboard.position.y
            });
            this.canvas.add(img);

            // draw devices
            for (const device of diagram.devices) {
                fabric.Image.fromURL('/assets/diagram/' + device.type + '.png', (img) => {
                    //fabric.loadSVGFromURL('/assets/diagram/' + device.type + '.svg', (objects, options) => {
                    //    let img = fabric.util.groupSVGElements(objects, options);
                    img.set({
                        left: device.position.x,
                        top: device.position.y
                    })
                    this.canvas.add(img);
                });
            }

            // draw mcu
            fabric.Image.fromURL('/assets/diagram/' + diagram.mcu.name + '.png', (img) => {
                img.set({
                    left: diagram.mcu.position.x,
                    top: diagram.mcu.position.y
                })
                this.canvas.add(img);

                // draw connections
                for (const line of diagram.connections) {
                    const l = new fabric.Line([line.startx, line.starty, line.endx, line.endy], {
                        stroke: wireColor[line.type],
                        strokeWidth: 2,
                    });
                    this.canvas.add(l);
                }
            });
        });
    }

    setHeight() {
        let windowHeight = $(window).height();
        let styles = {
            'height': (windowHeight - 200) + 'px',
            'overflow-y': 'scroll',
        };
        return styles;
    }
}