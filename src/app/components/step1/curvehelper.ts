const MINIMUM_DIFF_X = 125;
const MINIMUM_DIFF_Y = 125;

export class BezierCurve {

    //private origControlPoints;
    //private controlPoints;

    private constructor(readonly controlPoints) {
    }

    static fromStartEndPoint(startX: number, startY: number, startDirection: string
        , endX: number, endY: number, endDirection: string): BezierCurve {
        // calculate the four control point based on the start and end point
        const origControlPoints = BezierCurve.calculateBezierCurve(startX, startY, startDirection, endX, endY, endDirection);
        // find the center point and split the curve
        const t = BezierCurve.getTOfBezierCurvebyDistance(origControlPoints, 0.5);
        const controlPoints = BezierCurve.splitCurve(origControlPoints, t);

        return new BezierCurve(controlPoints);
    }

    private static fromControlPoint(controlPoints) {
        // find the center point and split the curve
        const t = BezierCurve.getTOfBezierCurvebyDistance(controlPoints, 0.5);
        controlPoints = BezierCurve.splitCurve(controlPoints, t);
        return new BezierCurve(controlPoints);
    }

    /**
     * Get the center point of the curve
     * @returns coordinate of the center point of the curve as an array of point [x, y]
     */
    getCenterPoint() {
        return [this.controlPoints[0][3][0], this.controlPoints[0][3][1]];
    }

    /**
     * Get the tangent vector of the curve
     * @param t the interval of the curve from 0 to 1
     * @returns vector of the tangent of the curve at t 
     */
    getTangentVector(t) {
        if (t > 0.5)
            return BezierCurve.calculateBezierCurveTangent(this.controlPoints[1], (t - 0.5) * 2);
        else
            return BezierCurve.calculateBezierCurveTangent(this.controlPoints[0], t * 2);
    }

    /**
     * Get the compensated tangent vector of the curve (this function rotate the tangent vector
     * by 180 degree if the tangent is pointing down)
     * @param t the interval of the curve from 0 to 1
     * @returns vector of the tangent of the curve at t
     */
    getCompensatedTangentVector(t) {
        let tangent = this.getTangentVector(t);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (Math.abs(angle) > 90) {
            tangent = [-tangent[0], -tangent[1]];
        }
        return tangent;
    }

    /**
     * Get the normal vector of the curve
     * @param t the interval of the curve from 0 to 1
     * @returns normal vector of the curve at t 
     */
    getNormalVector(t) {
        if (t > 0.5)
            return BezierCurve.findPerpendicularVector(this.controlPoints[1], (t - 0.5) * 2);
        else
            return BezierCurve.findPerpendicularVector(this.controlPoints[0], t * 2);
    }

    /**
     * Get the compensated normal vector of the curve (this function rotate the normal vector
     * by 180 degree if the normal vector is pointing down)
     * @param t the interval of the curve from 0 to 1
     * @returns normal vector of the curve at t
     */
    getCompensatedNormalVector(t) {
        const tangent = this.getTangentVector(t);
        let normal = this.getNormalVector(t);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (Math.abs(angle) > 90) {
            normal = [-normal[0], -normal[1]];
        }
        return normal;
    }

    /**
     * Get the angle of the curve
     * @param t the interval of the curve from 0 to 1
     * @returns angle of the curve at t
     */
    getAngle(t) {
        const tangent = this.getTangentVector(t);
        const angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        return angle;
    }

    /**
     * Get the compensated angle of the curve (-90 to 90 degree)
     * @param t the interval of the curve from 0 to 1
     * @returns angle of the curve at t
     */
    getCompensatedAngle(t) {
        let tangent = this.getTangentVector(t);
        let angle = Math.atan2(tangent[1], tangent[0]) * 180 / Math.PI;
        if (angle > 90) {
            angle = angle - 180;
        } else if (angle < -90) {
            angle = angle + 180;
        }
        return angle;
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

    shiftCurve(dx, dy) {
        for (var row of this.controlPoints) {
            for (var point of row) {
                point[0] += dx;
                point[1] += dy;
            }
        }
    }

    getSVGArray() {
        const points = this.controlPoints;
        return [
            ['M', points[0][0][0], points[0][0][1]],
            ['C', points[0][1][0], points[0][1][1], points[0][2][0], points[0][2][1], points[0][3][0], points[0][3][1]],
            ['C', points[1][1][0], points[1][1][1], points[1][2][0], points[1][2][1], points[1][3][0], points[1][3][1]]
        ];
    }

    getStartPoint() {
        return this.controlPoints[0][0];
    }

    getEndPoint() {
        return this.controlPoints[1][3];
    }

    // recalculateCurve(startX, startY, startDirection, endX, endY, endDirection) {
    //     // calculate the four control point based on the start and end point
    //     const origControlPoints = BezierCurve.calculateBezierCurve(startX, startY, startDirection, endX, endY, endDirection);
    //     // find the center point and split the curve
    //     const t = BezierCurve.getTOfBezierCurvebyDistance(origControlPoints, 0.5);
    //     this.controlPoints = BezierCurve.splitCurve(origControlPoints, t);
    // }

    getBoundingBox() {
        const step = 16;

        let minX = 0, minY = 0, maxX = 0, maxY = 0;

        for (let i = 0; i <= step; i++) {
            let t = i * (1 / step);

            let x, y;
            if (t <= 0.5)
                [x, y] = BezierCurve.calculatePointInBezierCurve(this.controlPoints[0], t);
            else
                [x, y] = BezierCurve.calculatePointInBezierCurve(this.controlPoints[1], t - 0.5);

            if (i === 0) {
                minX = x; minY = y;
                maxX = x; maxY = y;
            }

            if (x < minX)
                minX = x;
            if (x > maxX)
                maxX = x;
            if (y < minY)
                minY = y;
            if (y > maxY)
                maxY = y;
        }

        return { left: minX, top: minY, right: maxX, bottom: maxY };
    }

    isIntersect(startX, startY, startDirection, centerX, centerY, endX, endY, endDirection) {
        const otherCurve = BezierCurve.fromStartEndPoint(startX, startY, startDirection, endX, endY, endDirection);
        otherCurve.moveCenterPoint(centerX, centerY);
        return BezierCurve.checkIntersection(this, otherCurve);
    }

    private static calculateBezierCurve(startX, startY, startDirection, endX, endY, endDirection) {
        var points = [];
        points.push([startX, startY]);

        let diffX = Math.abs((endX - startX) * 0.75);
        if ((endX - startX) > -(MINIMUM_DIFF_X * 1.33) && (endX - startX) < 0) {
            diffX = MINIMUM_DIFF_X;
        }

        let diffY = Math.abs((endY - startY) * 0.75);
        if ((endY - startY) > -(MINIMUM_DIFF_Y * 1.33) && (endY - startY) < (MINIMUM_DIFF_Y * 1.33)) {
            diffY = MINIMUM_DIFF_Y;
        }

        if (startDirection === 'r')
            points.push([startX + diffX, startY]);
        else if (startDirection === 't')
            points.push([startX, startY - diffY]);
        else if (startDirection === 'b')
            points.push([startX, startY + diffY]);
        else if (startDirection === 'l') // shouldn't happen
            points.push([startX - diffX, startY]);
        else
            points.push([startX + diffX, startY]);

        if (endDirection === 'l')
            points.push([endX - diffX, endY]);
        else if (endDirection === 't')
            points.push([endX, endY - diffY]);
        else if (endDirection === 'b')
            points.push([endX, endY + diffY]);
        else if (endDirection === 'r') // shouldn't happen
            points.push([endX + diffX, endY]);
        else
            points.push([endX - diffX, endY]);

        points.push([endX, endY]);
        return points;
    }

    private static calculatePointInBezierCurve(points, u) {
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

    private static getTOfBezierCurvebyDistance(points, d, numStep = 16) {
        var i = 0;
        var point = [];
        var segmentLength = [];
        // find point in curve at each step using the De Casteljau's Algorithm 
        var step = 1 / numStep;
        point.push(points[0]);
        for (i = 1; i <= numStep; i++) {
            var p = BezierCurve.calculatePointInBezierCurve(points, i * step);
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

    private static splitCurve(points, u) {
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
            [[tmp[0][0], tmp[0][1]], right[1], right[0], points[points.length - 1]]
        ];
    }

    private static calculateBezierCurveTangent(points, u) {
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

    private static findPerpendicularVector(points, u) {
        var tangent = this.calculateBezierCurveTangent(points, u);
        // rotate the tangent by PI/2 to get the normal vector
        // see: http://pomax.github.io/bezierinfo/#pointvectors
        return [-tangent[1], tangent[0]];
    }

    private static checkIntersection(c1: BezierCurve, c2: BezierCurve, threshold: number = 1) {
        // get both curve bounding box
        const r1 = c1.getBoundingBox();
        const r2 = c2.getBoundingBox();

        // if the bounding box is intersect, we split the curve and repeat all step for the pair
        // of subcurve bounding box that is intersected
        if (!(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)) {
            // we return immediately if the bounding box is smaller than the threshold
            if ((r1.right - r1.left) < threshold && (r1.bottom - r1.top) < threshold
                && (r2.right - r2.left) < threshold && (r2.bottom - r2.top) < threshold) {
                return true;
            }

            const c11 = BezierCurve.fromControlPoint(c1.controlPoints[0]);
            const c12 = BezierCurve.fromControlPoint(c1.controlPoints[1]);
            const c21 = BezierCurve.fromControlPoint(c2.controlPoints[0]);
            const c22 = BezierCurve.fromControlPoint(c2.controlPoints[1]);

            return BezierCurve.checkIntersection(c11, c21)
                || BezierCurve.checkIntersection(c11, c22)
                || BezierCurve.checkIntersection(c12, c21)
                || BezierCurve.checkIntersection(c12, c22);
        }

        return false;
    }
}