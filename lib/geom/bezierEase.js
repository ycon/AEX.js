/**
 * Cubic Bezier timing function compatible with CSS3 transition-timing-function
 * <p>
 * The timing function is specified using a cubic Bezier curve,
 * which is defined by four control points.
 * The first and last control points are always set to (0,0) and (1,1),
 * so you just need to specify the two in-between control points.
 * The points are specified as a percentage of the overall duration
 * (percentage: interpolated as a real number between 0 and 1).
 * The timing function takes as its input the current elapsed percentage
 * of the transition duration and outputs a percentage that determines
 * how close the transition is to its goal state.
 * </p>
 * <p>
 * currently used function to determine time
 * conversion to js from webkit source files
 * js port from www.netzgesta.de/dev/cubic-bezier-timing-function.html
 * </p>
 */

 define(function () {

    function bezierEase (p1x, p1y, p2x, p2y, t, epsilon) {

        p1y = p1y || 0;
        p2y = p2y || 0;

        var t2 = solveCurveX(p1x || 0, p2x || 0, t || 0, epsilon),
            cy = p1y * 3,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;

        return ((ay * t2 + by) * t2 + cy) * t2;
    }

    // Given an x value, find a parametric value it came from.
    function solveCurveX (p1x, p2x, x, epsilon) {

        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            bx2 = bx * 2,
            ax3 = ax * 3,
            t0, t1, t2, x2, d2, i;

        if (!epsilon) {
            //epsilon = 1.0 / (100.0 * (precision||100));
            epsilon = 0.0001;
        }

        // First try a few iterations of Newton's method -- normally very fast.
        t2 = x;

        for (i = 0; i < 8; i += 1) {
            x2 = (((ax * t2 + bx) * t2 + cx) * t2) - x;
            if (fabs(x2) < epsilon) {
                return t2;
            }
            d2 = (ax3 * t2 + bx2) * t2 + cx;
            if (fabs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
        }

        // Fall back to the bisection method for reliability.
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t2 < t0) {
            return t0;
        }
        if (t2 > t1) {
            return t1;
        }
        i = 0;

        while (t0 < t1 && i < 10) {
            x2 = ((ax * t2 + bx) * t2 + cx) * t2;
            if (fabs(x2 - x) < epsilon) {
                return t2;
            }
            if (x > x2) {
                t0 = t2;
            } else {
                t1 = t2;
            }
            t2 = (t1 - t0) * 0.5 + t0;
            i += 1;
        }

        return t2;
    }

    function fabs (n) {

        if (n >= 0) {
            return n;
        }

        return 0 - n;
    }

    return bezierEase;
 });
