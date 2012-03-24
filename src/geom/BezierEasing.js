
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
	 * UnitBezier.h, WebCore_animation_AnimationBase.cpp
	 * js port from www.netzgesta.de/dev/cubic-bezier-timing-function.html
	 * </p>
	 */

var BezierEasing = function(_p1x, _p1y, _p2x, _p2y, precision){
	
	this.p1x = _p1x;
	this.p1y = _p1y;
	this.p2x = _p2x;
	this.p2y = _p2y;
	this.cx = 3.0 * _p1x;
	this.bx = 3.0 * (_p2x - _p1x) - this.cx;
	this.ax = 1.0 - this.cx - this.bx;
	this.cy = 3.0 * _p1y;
	this.by = 3.0 * (_p2y - _p1y) - this.cy;
	this.ay = 1.0 - this.cy - this.by;
	this.ax3 = this.ax * 3.0;
	this.bx2 = this.bx * 2.0;
	
	this.epsilon = 1.0 / (100.0 * (precision||100));
	
};

BezierEasing.prototype = {
		
		constructor : BezierEasing,
		
		sampleCurveX : function (t) {
			return ((this.ax * t + this.bx) * t + this.cx) * t;
		},
		
		sampleCurveY : function (t) {
			return ((this.ay * t + this.by) * t + this.cy) * t;
		},
		
		ease : function (t) {
			return this.sampleCurveY(this.solveCurveX(t));
		},
		
		// Given an x value, find a parametric value it came from.
		solveCurveX : function (x) {
			var fabs = this.fabs,
				epsilon = this.epsilon,
				ax3 = this.ax3,
				bx2 = this.bx2,
				cx = this.cx,
				t0,t1,t2,x2,d2,i;

			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++) {
				x2 = this.sampleCurveX(t2) - x;
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

			t0 = 0.0;
			t1 = 1.0;
			t2 = x;
			if (t2 < t0) {
				return t0;
			}
			if (t2 > t1) {
				return t1;
			}
			while (t0 < t1) {
				x2 = this.sampleCurveX(t2);
				if (fabs(x2 - x) < epsilon) {
					return t2;
				}
				if (x > x2) {
					t0 = t2;
				} else {
					t1 = t2;
				}
				t2 = (t1 - t0) * .5 + t0;
			}
			return t2;
			// Failure.
		},
		
		fabs : function (n) {
			if (n >= 0) {
				return n;
			} else {
				return 0 - n;
			}
		}
		
};
