import 'fabric';
import { Action } from './action';
import { State } from './state';

export class Trigger extends fabric.Group {

    private line: fabric.ILine;
    private triangle: fabric.ITriangle;
    private circle: fabric.ICircle;
    private srcAction: State;
    private desAction: State;
    private srcAngle: number;
    private desAngle: number;

    connectSrcAction(srcAction: State,srcAngle: number) {
        this.srcAction = srcAction;
        this.srcAngle = srcAngle;

        let x = srcAction.getCenterX() + 37.5 * Math.cos(srcAngle);
        let y = srcAction.getCenterY() + 37.5 * Math.sin(srcAngle);
        console.log(x,y);
        this.line.set('x1',x);
        this.line.set('y1',y);
    }


    constructor(private startX: number, private startY: number, private endX: number, private endY: number) {
        super();


        this.line = new fabric.Line([startX, startY, endX, endY], {
            strokeWidth: 3,
            stroke: '#000',
        });

        this.triangle = new fabric.Triangle({
            fill: '#000',
            top: endY,
            left: endX,
            height: 15,
            width: 15,
            originX: 'top',
            originY: 'left',
            angle: 90,
            opacity: 0.2
        });
        this.circle = new fabric.Circle({
            radius: 5,
            left: 300,
            top: 300,

        });
    }
}