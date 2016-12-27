import 'fabric';
import { Action } from './action';

export class State extends fabric.Group {


    constructor(private action: Action,private x: number, private y: number, private action_name: string) {
        super();
        let imgObj = new Image();
        imgObj.src = action.image;
        imgObj.onload = () => {
            let imgInstance = new fabric.Image(imgObj, {
                left: x-37.5,
                top: y-37.5,
                width: 75,
                height: 75,
            });

            this.addWithUpdate(imgInstance);
        }

        let text = new fabric.Text(action_name,{
            left: x,
            top: y + 50,
        });
        this.addWithUpdate(text);
    }

    getCenterX(): number {
        return this.x;
    }
    getCenterY(): number {
        return this.y;
    }
}