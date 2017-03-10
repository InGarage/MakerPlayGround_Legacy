import { Bezier } from 'bezier-js';

export class BezierCurve {

    private origControlPoints;
    private controlPoints;

    constructor(readonly startX: number, readonly startY: number, readonly startDirection: string
        , readonly endX: number, readonly endY: number, readonly endDirection: string) {
        // calculate the four control point based on the start and end point
        this.origControlPoints = this.calculateBezierCurve(startX, startY, startDirection, endX, endY, endDirection);
        // find the center point and split the curve
        const t = this.getTOfBezierCurvebyDistance(this.origControlPoints, 0.5);
        this.controlPoints = this.splitCurve(this.origControlPoints, t);
    }

    getCenterPoint() {
        return [this.controlPoints[0][3][0], this.controlPoints[0][3][1]];
    }

    getTangentVector(t) {
        return this.calculateBezierCurveTangent(this.controlPoints[0], 1);
    }

    getCompensatedTangentVector(t) {
        let tangent = this.getTangentVector(0.5);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (angle > 90) {
            angle = angle - 180;
            tangent = [-tangent[0], -tangent[1]];
        } else if (angle < -90) {
            angle = angle + 180;
            tangent = [-tangent[0], -tangent[1]];
        }
        return tangent;
    }

    getNormalVector(t) {
        return this.findPerpendicularVector(this.controlPoints[0], 1);
    }

    getCompensatedNormalVector(t) {
        const tangent = this.getTangentVector(0.5);
        let normal = this.getNormalVector(0.5);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (angle > 90) {
            angle = angle - 180;
            normal = [-normal[0], -normal[1]];
        } else if (angle < -90) {
            angle = angle + 180;
            normal = [-normal[0], -normal[1]];
        }
        return normal;
    }

    moveCenterPoint(newX, newY) {
        const dx = newX - this.controlPoints[0][3][0];
        const dy = newY - this.controlPoints[0][3][1];

        this.controlPoints[0][2][0] += dx;
        this.controlPoints[0][2][1] += dy;
        this.controlPoints[0][3][0] += dx;
        this.controlPoints[0][3][1] += dy;

        this.controlPoints[1][1][0] += dx;
        this.controlPoints[1][1][1] += dy;
    }

    getSVGArray() {
        const points = this.controlPoints;
        return [
            ['M', points[0][0][0], points[0][0][1]],
            ['C', points[0][1][0], points[0][1][1], points[0][2][0], points[0][2][1], points[0][3][0], points[0][3][1]],
            ['C', points[1][1][0], points[1][1][1], points[1][2][0], points[1][2][1], points[1][3][0], points[1][3][1]]
        ];
    }

    private calculateBezierCurve(startX, startY, startDirection, endX, endY, endDirection) {
        var points = [];
        points.push([startX, startY]);

        let diffX = Math.abs((endX - startX) * 0.75);
        if (diffX < 20) {
            diffX = 20;
        }

        if (startDirection === 'r')
            points.push([startX + diffX, startY]);
        else if (startDirection === 't')
            points.push([startX, startY - Math.abs((startY - endY) * 0.75)]);
        else if (startDirection === 'b')
            points.push([startX, startY + Math.abs((startY - endY) * 0.75)]);
        else if (startDirection === 'l') // shouldn't happen
            points.push([startX - diffX, startY]);

        if (endDirection === 'l')
            points.push([endX - diffX, endY]);
        else if (endDirection === 't')
            points.push([endX, endY - Math.abs((startY - endY) * 0.75)]);
        else if (endDirection === 'b')
            points.push([endX, endY + Math.abs((startY - endY) * 0.75)]);
        else if (endDirection === 'r') // shouldn't happen
            points.push([endX + diffX, endY]);

        points.push([endX, endY]);
        return points;
    }

    private calculatePointInBezierCurve(points, u) {
        if (u === 0)
            return points[0];
        if (u === 1)
            return points[points.length - 1];
        if (points.lenght === 1)
            return points[0];

        // using the De Casteljau's Algorithm 
        // see: https://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/de-casteljau.html
        // or https://en.wikipedia.org/wiki/De_Casteljau's_algorithm
        var tmp = [];
        for (var p of points) {
            tmp.push([p[0], p[1]]);
        }
        for (var k = 1; k < points.length; k++) {
            for (var i = 0; i < points.length - k; i++) {
                tmp[i][0] = (1 - u) * tmp[i][0] + u * tmp[i + 1][0]; // x
                tmp[i][1] = (1 - u) * tmp[i][1] + u * tmp[i + 1][1]; // y
            }
        }
        return tmp[0];
    }

    private getTOfBezierCurvebyDistance(points, d, numStep = 16) {
        var i = 0;
        var point = [];
        var segmentLength = [];
        // find point in curve at each step using the De Casteljau's Algorithm 
        var step = 1 / numStep;
        point.push(points[0]);
        for (i = 1; i <= numStep; i++) {
            var p = this.calculatePointInBezierCurve(points, i * step);
            point.push(p);
        }
        // find the cumulative lenght of each curve segment and store in a list
        // we compute euclidean distance without sqrt to save some computations
        var distance = 0;
        for (i = 0; i < numStep; i++) {
            distance += Math.pow(point[i + 1][0] - point[i][0], 2) + Math.pow(point[i + 1][1] - point[i][1], 2);
            segmentLength.push(distance);
        }
        // return the point that yield closest distance to target distance
        var targetLength = distance * d;
        for (i = 0; i < segmentLength.length; i++) {
            if (segmentLength[i] >= targetLength)
                return (i + 1) * step;
        }
    }

    private splitCurve(points, u) {
        // TODO: Handle error

        // using the De Casteljau's Algorithm 
        // see: https://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/de-casteljau.html
        // or https://en.wikipedia.org/wiki/De_Casteljau's_algorithm
        var tmp = [];
        for (var p of points) {
            tmp.push([p[0], p[1]]);
        }
        var left = [];
        var right = [];
        for (var k = 1; k < points.length; k++) {
            for (var i = 0; i < points.length - k; i++) {
                tmp[i][0] = (1 - u) * tmp[i][0] + u * tmp[i + 1][0]; // x
                tmp[i][1] = (1 - u) * tmp[i][1] + u * tmp[i + 1][1]; // y
                // see: http://pomax.github.io/bezierinfo/#splitting
                if (i === 0)
                    left.push([tmp[i][0], tmp[i][1]]);
                else if (i === points.length - k - 1)
                    right.push([tmp[i][0], tmp[i][1]]);
            }
        }
        // generate output array
        return [
            [points[0], left[0], left[1], tmp[0]],
            [tmp[0], right[1], right[0], points[points.length - 1]]
        ];
    }

    private calculateBezierCurveTangent(points, u) {
        // find the derivative based on http://pomax.github.io/bezierinfo/#derivatives
        var derivativePoints = [
            [3 * (points[1][0] - points[0][0]), 3 * (points[1][1] - points[0][1])],
            [3 * (points[2][0] - points[1][0]), 3 * (points[2][1] - points[1][1])],
            [3 * (points[3][0] - points[2][0]), 3 * (points[3][1] - points[2][1])]
        ];

        // since the derivative of the bezier curve is a bezier curve use the De Casteljau's Algorithm 
        // to find the tangent at the center of the curve
        var tangent = this.calculatePointInBezierCurve(derivativePoints, u);

        // normalize the tangent vector
        var d = Math.sqrt(tangent[0] * tangent[0] + tangent[1] * tangent[1]);
        tangent[0] = tangent[0] / d;
        tangent[1] = tangent[1] / d;

        return tangent;
    }

    private findPerpendicularVector(points, u) {
        var tangent = this.calculateBezierCurveTangent(points, u);
        // rotate the tangent by PI/2 to get the normal vector
        // see: http://pomax.github.io/bezierinfo/#pointvectors
        return [-tangent[1], tangent[0]];
    }

}