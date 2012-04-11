
/** @license
 * Released under the MIT license
 * Author: Yannick Connan
 * Version: 0.1.1 - Build: 17383 (2012/04/11 03:13 PM)
 */



(function(global){

/**
* @namespace AE namespace - Kick ass Animation Library
* @name AE
*/

var externs = /** @lends AE */{
	/**
	* AE Version Number
	* @type String
	* @const
	*/
	VERSION : '0.1.1'
};
	
/*

 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 0.7.1 - Build: 244 (2011/11/29 12:33 PM)
*/
var obj
(function(g){function f(a,b,d,h,c){this._listener=b;this._isOnce=d;this.context=h;this._signal=a;this._priority=c||0}function e(a,b){if(typeof a!=="function")throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}",b));}var c={VERSION:"0.7.1"};f.prototype={active:!0,params:null,execute:function(a){var b;this.active&&this._listener&&(a=this.params?this.params.concat(a):a,b=this._listener.apply(this.context,a),this._isOnce&&this.detach());return b},detach:function(){return this.isBound()?
this._signal.remove(this._listener):null},isBound:function(){return!!this._signal&&!!this._listener},getListener:function(){return this._listener},_destroy:function(){delete this._signal;delete this._listener;delete this.context},isOnce:function(){return this._isOnce},toString:function(){return"[SignalBinding isOnce:"+this._isOnce+", isBound:"+this.isBound()+", active:"+this.active+"]"}};c.Signal=function(){this._bindings=[];this._prevParams=null};c.Signal.prototype={memorize:!1,_shouldPropagate:!0,
active:!0,_registerListener:function(a,b,d,c){var e=this._indexOfListener(a);if(e!==-1){if(a=this._bindings[e],a.isOnce()!==b)throw Error("You cannot add"+(b?"":"Once")+"() then add"+(!b?"":"Once")+"() the same listener without removing the relationship first.");}else a=new f(this,a,b,d,c),this._addBinding(a);this.memorize&&this._prevParams&&a.execute(this._prevParams);return a},_addBinding:function(a){var b=this._bindings.length;do--b;while(this._bindings[b]&&a._priority<=this._bindings[b]._priority);
this._bindings.splice(b+1,0,a)},_indexOfListener:function(a){for(var b=this._bindings.length;b--;)if(this._bindings[b]._listener===a)return b;return-1},has:function(a){return this._indexOfListener(a)!==-1},add:function(a,b,d){e(a,"add");return this._registerListener(a,!1,b,d)},addOnce:function(a,b,d){e(a,"addOnce");return this._registerListener(a,!0,b,d)},remove:function(a){e(a,"remove");var b=this._indexOfListener(a);b!==-1&&(this._bindings[b]._destroy(),this._bindings.splice(b,1));return a},removeAll:function(){for(var a=
this._bindings.length;a--;)this._bindings[a]._destroy();this._bindings.length=0},getNumListeners:function(){return this._bindings.length},halt:function(){this._shouldPropagate=!1},dispatch:function(a){if(this.active){var b=Array.prototype.slice.call(arguments),d=this._bindings.length,c;if(this.memorize)this._prevParams=b;if(d){c=this._bindings.slice();this._shouldPropagate=!0;do d--;while(c[d]&&this._shouldPropagate&&c[d].execute(b)!==!1)}}},forget:function(){this._prevParams=null},dispose:function(){this.removeAll();
delete this._bindings;delete this._prevParams},toString:function(){return"[Signal active:"+this.active+" numListeners:"+this.getNumListeners()+"]"}};typeof define==="function"&&define.amd?define("signals",[],c):typeof module!=="undefined"&&module.exports?module.exports=c:g.signals=c})(this);

var signals = this.signals;

// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Sch�fer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta Copyright (C) 2011 MIT Licence
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy (C) 2011 Creative Commons Zero (public domain)
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola Copyright (C) 2011 MIT License
// -- xavierm02 Montillet Xavier Copyright (C) 2011 MIT License
// -- Raynos Jake Verbaten Copyright (C) 2011 MIT Licence
// -- samsonjs Sami Samhuri Copyright (C) 2010 MIT License
// -- rwldrn Rick Waldron Copyright (C) 2011 MIT License
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/


if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }

        var args = slice.call(arguments, 1);

        var bound = function () {

            if (this instanceof bound) {

                var F = function(){};
                F.prototype = target.prototype;
                var self = new F;

                var result = target.apply(
                    self,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return self;

            } else {

                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };

        return bound;
    };
}



if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    };
}


if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }
        
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}


var TRANSFORM = 'WebkitTransform';
var TRANSFORM_STYLE = 'WebkitTransformStyle';
var PERSPECTIVE = 'WebkitPerspective';
var PERSPECTIVE_ORIGIN = 'WebkitPerspectiveOrigin';
var BGCOLOUR = 'BackgroundColour';

/* getGaussLength
 * this may seem mysterious, but this is just an implementation of a Gaussian quadrature
 * algorithm to calculate the length of a quadratic curve
 * for can find out more here: http://algorithmist.wordpress.com/2009/01/05/quadratic-bezier-arc-length/
 * I just unrolled it to death for speed purposes.
 */
var getGaussLength = function(min,max,c1,c2) {

	var mult = 0.5*(max-min),
		ab2 = 0.5*(min+max),
		vec = c2.clone();

	sum = vec.multiplyScalar(2*(ab2 + mult*-0.8611363116)).add(c1).lengthSq()*0.3478548451;
	
	sum += vec.copy(c2).multiplyScalar(2*(ab2 + mult*0.8611363116)).add(c1).lengthSq()*0.3478548451;
	
	sum += vec.copy(c2).multiplyScalar(2*(ab2 + mult*-0.3399810436)).add(c1).lengthSq()*0.6521451549;
	
	sum += vec.copy(c2).multiplyScalar(2*(ab2 + mult*0.3399810436)).add(c1).lengthSq()*0.6521451549;
	
	return sum;
			
};

var getPositionAt = function (t,inv) {
	
	
	var i,tt,smoothing,pos,
		r1 = inv[0],
		r2 = inv[1],
		r3 = inv[2],
		smoothing1 = inv[3],
		smoothing2 = inv[4];
	
	
	if (t>=r3){
		i = (t-r3)/(1-r3);
		smoothing = smoothing2;
		pos = .75;
	} else if (t>=r2){
		i = (t-r2)/(r3-r2);
		pos = .5;
		smoothing = smoothing2;
	} else if (t>=r1){
		i = (t-r1)/(r2-r1);
		pos = .25;
		smoothing = smoothing1;
	} else {
		i = t/r1;
		pos = 0;
		smoothing = smoothing1;
	}
	tt = 2*(1-i)*i;
	return (tt*smoothing+(i*i))*.25+pos;
	
};




/**
 * cubicToQuadratic
 * Will divide a cubic curve into a set of quadratic curves.
 * this is based on the adaptive division algorythm defined here :
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
 */

var cubicToQuadratic = function(p1,c1,c2,p2,path,precision){
	
	var res1 = p1.clone();
	var res2 = p2.clone();
	
	if (c2.equals(p2)){
		//exception made when an anchor is the same as end point, we just 1 quad curve to approximate that.
		path.curveTo(res1.lerp(c1,.89), p2);
		return path;
	}
	
	if (c1.equals(p1)){
		//same as before
		path.curveTo(res2.lerp(c2,.89), p2);
		return path;
	}
	
	
	// we first guess where the quadratic mid-points candidate are

	res1.lerp(c1,1.5);
	res2.lerp(c2,1.5);
	
	if (!precision){
		// if precision isn't set, we come up with one. 
		// This one is a guess based on overall curve haul width and height.
		
		precision = (Math.max(
						Math.max(res1.max(),res2.max()),
						Math.max(p1.max(),p2.max())		
					)-Math.min(
						Math.min(res1.min(),res2.min()),
						Math.min(p1.min(),p2.min())	
					))/350;
	}

	// d will define where we will need to split the curve.
	// d is the distance between the 2 possible quadratic approximations.
	// the closer they are, the less curves we need.
	// if (d >= 1) = we only need one quadratic curve
	// if (d < 1 && >=.5) = We'll split it in 2 at d point
	// if (d < .5) = We'll split the curve is 3, one will be 0>d the other (1-d)>1.
	// we will then iterate the algorithm in the remaining bit.
	
	var d = Math.sqrt(10.3923048/res1.distance(res2)*precision);
	
	if (d>1){

		path.curveTo(res1.lerp(res2,.5),p2);
		
	} else {
		// Lets do some curve spliting!
		/*
		var begin =p1.clone();
		var end = p2.clone();
		var mid = c1.clone().lerp(c2,d);
		
		var d1_c1 = begin.lerp(c1,d).clone();
		var d1_c2 = begin.lerp(mid,d).clone();
		
		var d2_c2 = end.lerp(c2,1-d).clone();
		var d2_c1 = mid.lerp(end,d).clone();
		
		mid.lerp(begin,1-d);
		end.set(p2);
		begin.set(p1);
		*/
		
		
		
		var d1_p1 = p1.clone(),
			d1_c1 = d1_p1.clone().lerp(c1,d),
			d2_p2 = p2,
			d2_c2 = c2.clone().lerp(p2,d),
			temp_c = c1.clone().lerp(c2,d),
			d1_c2 = d1_c1.clone().lerp(temp_c,d),
			d2_c1 = temp_c.lerp(d2_c2,d),
			p = d1_c2.clone().lerp(d2_c1,d);
			
		//trace(d);
		
		res1 = d1_p1.clone().lerp(d1_c1,1.5);
		res2.copy(p).lerp(d1_c2,1.5);

		
		path.curveTo(res1.lerp(res2,.5),p.clone());
		
		if (d<.5){
			// mmm, we need to split it again.
			d = 1-(d/(1-d));
			
			c1 = d2_c1.clone();
			c2 = d2_c2.clone();
			
			p1 = d1_p1.copy(p);
			
			
			d1_c1.copy(d1_p1).lerp(c1,d);
			d2_c2.copy(c2).lerp(p2,d);
			temp_c.copy(c1).lerp(c2,d);
			d1_c2.copy(d1_c1).lerp(temp_c,d);
			d2_c1 = temp_c.lerp(d2_c2,d);
			p.copy(d1_c2).lerp(d2_c1,d);
			
			//path.curveTo(p.clone(),p.clone());
			cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision);
			
			//cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision*3);
		}
		
		res1 = p.clone().lerp(d2_c1,1.5);
		res2 = d2_p2.clone().lerp(d2_c2,1.5);
		
		// and finally the remaining
		path.curveTo(res1.lerp(res2,.5),p2.clone());
		
	}
	return path;
};


var _Stack = {
		
	add : function(item,pos){
		this.on.add.dispatch(item,pos,this);
	},
	check : function(item){
		if (!(item instanceof this.type_)){
			throw("not the right type");
		}
	}
	
};

/** @constructor */
var Stack = function(type){
	
	this.items_ = [];

	this.type_ = Object;
	if (type && type.prototype instanceof this.type_){
		this.type_ = type;
	}
	
	this.on = {
		add:new signals.Signal(),
		remove:new signals.Signal(),
		swap:new signals.Signal()
	};
};


Stack.prototype = {

	constructor : Stack,
	
	/** @private */
	items_ : null,
	
	/** @private */
	type_ : null,
	
	/**
	 * @param item
	 * @returns {Number}
	 */
	index : function(item){
		return this.items_.indexOf(item);
	},

	/**
	 * @param item
	 * @returns {Boolean}
	 */
	have : function(item){
		return this.index(item) !== -1;
	},

	/**
	 * 
	 * @param i
	 * @returns {Object}
	 */
	get : function(i){
		return this.items_[i];
	},
	
	/**
	 * 
	 * @returns {Number}
	 */
	getLength : function(){
		return this.items_.length;
	},
	
	/**
	 *
	 * @param item
	 * @throws item already present
	 */
	add : function(item){
		
		_Stack.check.call(this,item);
		
		if (!this.have(item)){
			this.items_.push(item);
			_Stack.add.call(this,item,this.length-1);
		} else {
			throw("item already present");
		}
	},
	
	/**
	 * 
	 * @param {Object} item
	 * @param {Number} pos
	 */
	insert : function(item,pos){
		
		_Stack.check.call(this,item);
		
		var items = this.items_;
		
		
		
		if (!this.have(item)){
			var l = items.length;
			if (pos < l){
				items.splice(pos,0,item);
			} else {
				items.push(item);
			}
			_Stack.add.call(this,item,Math.max(pos,this.length-1));
		} else {
			throw("item already present");
		}
		
	},
	
	/**
	 * 
	 * @param item
	 * @throws item not present
	 */
	remove : function(item){
		
		var items = this.items_;
		var pos = items.indexOf(item);
		
		if (pos !== -1){
			
			items.splice(pos,1);
			this.on.remove.dispatch(item,pos,this);
			
		} else {
			throw("item not present");
		}
		
	},
	
	/**
	 * 
	 * @param item1
	 * @param item2
	 * @throws one of the items not present
	 */
	swap : function(item1,item2){
		
		var items = this.items_;
		var pos1 = items.indexOf(item1);
		var pos2 = items.indexOf(item2);
		
		if (pos1 !== -1 && pos2 !== -1){
			
			items[pos1] = item2;
			items[pos2] = item1;
			this.on.swap.dispatch(pos1,pos2,this);
			
		} else {
			throw("one of the items not present");
		}
	},
	
	/**
	 * @param {function} func
	 */
	each : function(func){
		var items = this.items_;
		var l = items.length;
		
		for ( var i = 0; i < l; i++) {
			func(items[i]);
		}
	}
	
};

externs['Stack'] = Stack;

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


var BezierEasing = {
	
	ease : function (p1x, p1y, p2x, p2y,t,epsilon) {
		
		p1y = p1y || 0;
		p2y = p2y || 0;
		
		var t2 = this.solveCurveX(p1x||0,p2x||0,t||0,epsilon),
			cy = p1y * 3,
			by = 3 * (p2y - p1y) - cy,
			ay = 1 - cy - by;

		return ((ay * t2 + by) * t2 + cy) * t2;

	},
	
	// Given an x value, find a parametric value it came from.
	solveCurveX : function (p1x, p2x, x, epsilon) {
		
		
		var fabs = this.fabs,
			
			cx = 3 * p1x,
			bx = 3 * (p2x - p1x) - cx,
			ax = 1 - cx - bx,
			bx2 = bx * 2,
			ax3 = ax * 3,
			t0,t1,t2,x2,d2,i;
		
		if (!epsilon){
			//epsilon = 1.0 / (100.0 * (precision||100));
			epsilon = 0.0001;
		}
		
		// First try a few iterations of Newton's method -- normally very fast.
		t2 = x;
		
		
		newton_loop: for (i = 0; i < 8; i++) {
			
			x2 = (((ax * t2 + bx) * t2 + cx) * t2)-x;
			//x2 = this.sampleCurveX(t2) - x;
			if (fabs(x2) < epsilon) {
				return t2;
			}
			d2 = (ax3 * t2 + bx2) * t2 + cx;
			if (fabs(d2) < 1e-6) {
				
				break newton_loop;
			}
			t2 = t2 - x2 / d2;
			
			//return x;
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
			//x2 = this.sampleCurveX(t2);
			if (fabs(x2 - x) < epsilon) {
				return t2;
			}
			if (x > x2) {
				t0 = t2;
			} else {
				t1 = t2;
			}
			t2 = (t1 - t0) * .5 + t0;
			i++;
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



/** @constructor */
var Matrix = function(){
	if (arguments.length){
		this.injectArray(arguments);
	}
};

Matrix.prototype = {
		
		constructor : Matrix,
		
		m11:1,m12:0,m13:0,m14:0,
		m21:0,m22:1,m23:0,m24:0,
		m31:0,m32:0,m33:1,m34:0,
		m41:0,m42:0,m43:0,m44:1,
		
		/**
		 * @param {number} n11
		 * @param {number} n12
		 * @param {number} n13
		 * @param {number} n14
		 * @param {number} n21
		 * @param {number} n22
		 * @param {number} n23
		 * @param {number} n24
		 * @param {number} n31
		 * @param {number} n32
		 * @param {number} n33
		 * @param {number} n34
		 * @param {number} n41
		 * @param {number} n42
		 * @param {number} n43
		 * @param {number} n44
		 * 
		 * @returns {Matrix}
		 */
		set:function(n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44){
			
			var m = this;
			
			m.m11 = n11;m.m12 = n12;m.m13 = n13;m.m14 = n14;
			
			m.m21 = n21;m.m22 = n22;m.m23 = n23;m.m24 = n24;
			
			m.m31 = n31;m.m32 = n32;m.m33 = n33;m.m34 = n34;
			
			m.m41 = n41;m.m42 = n42;m.m43 = n43;m.m44 = n44;
			
			return this;
		},
		
		/**
		 * 
		 * @param {Array.<Number>} a
		 * @returns {Matrix}
		 */
		injectArray:function(a){
			
			return this.set.apply(this,a);
		},
		
		/**
		 * 
		 * @param {Matrix} m
		 * @returns {Matrix}
		 */
		injectMatrix:function(m){
			
			/** @type Matrix */
			var t = this;
			
			t.m11 = m.m11;t.m12 = m.m12;t.m13 = m.m13;t.m14 = m.m14;
			
			t.m21 = m.m21;t.m22 = m.m22;t.m23 = m.m23;t.m24 = m.m24;
			
			t.m31 = m.m31;t.m32 = m.m32;t.m33 = m.m33;t.m34 = m.m34;
			
			t.m41 = m.m41;t.m42 = m.m42;t.m43 = m.m43;t.m44 = m.m44;
			
			return t;
		},
		
		/** @returns {Matrix} */
		identity:function(){
			
			this.set(
					
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1
				
			);
			
			return this;
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		translation:function(x,y,z){
			
			this.set(	
					
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				x||0,y||0,z||0,1
				
			);
			
			return this;
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		translate:function(x, y, z){
			
			this.m41 += x||0;
			this.m42 += y||0;
			this.m43 += z||0;
			
			return this;
			
		},
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @param {number} scaleZ
		 * @returns {Matrix}
		 */
		scaling:function(scaleX, scaleY, scaleZ){
			
			this.set(
					
				scaleX||0,0,0,0,
				0,scaleY||0,0,0,
				0,0,scaleZ||0,0,
				0,0,0,1
				
			);
			
			return this;
			
		},
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @param {number} scaleZ
		 * @returns {Matrix}
		 */
		scale:function(scaleX, scaleY, scaleZ){
			
			scaleX = scaleX||0.000001;
			scaleY = scaleY||0.000001;
			scaleZ = scaleZ||0.000001;
			
			var t = this;
			
			if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1){
				
				t.m11*=scaleX;t.m21*=scaleX;t.m31*=scaleX;t.m41*=scaleX;
				
				t.m12*=scaleY;t.m22*=scaleY;t.m32*=scaleY;t.m42*=scaleY;
				
				t.m13*=scaleZ;t.m23*=scaleZ;t.m33*=scaleZ;t.m43*=scaleZ;
			}

			return t;
			
		},
		
		/**
		 * @param {number} rotationX
		 * @param {number} rotationY
		 * @param {number} rotationZ
		 * @returns {Matrix}
		 */
		rotation:function(rotationX,rotationY,rotationZ){
			
			this.identity();
			
			var p = Math.PI/180,
				t = this;
			
			rotationX = (rotationX||0)*p;
			rotationY = (rotationY||0)*p;
			rotationZ = (-rotationZ||0)*p;
			
			var	cos = Math.cos,
				sin = Math.sin,
				a = cos( rotationX ), b = sin( rotationX ),
				c = cos( rotationY ), d = sin( rotationY ),
				e = cos( rotationZ ), f = sin( rotationZ );
			
			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			t.m11 = c * e;
			t.m12 = be * d - af;
			t.m13 = ae * d + bf;

			t.m21 = c * f;
			t.m22 = bf * d + ae;
			t.m23 = af * d - be;

			t.m31 = - d;
			t.m32 = b * c;
			t.m33 = a * c;
			
			t.m41 = t.m42 = t.m43 = 0;
			
			return this;
			
		},
		
		/**
		 * @param {number} rotationX
		 * @param {number} rotationY
		 * @param {number} rotationZ
		 * @returns {Matrix}
		 */
		rotate:function(rotationX, rotationY, rotationZ){

			if (!this.temp_){
				this.temp_ = new Matrix();
			}
			
			return (rotationX || rotationY || rotationZ) ? this.multiply(this.temp_.rotation(rotationX, rotationY, rotationZ)) : this;
			
		},
		
		/**
		 * 
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @param {number} w
		 * @returns {Matrix}
		 */
		quaternionRotation: function( x, y, z, w ) {

			/*
			var t = this,
				x2 = x + x,  y2 = y + y,  z2 = z + z,
				xx = x * x2, xy = x * y2, xz = x * z2,
				yy = y * y2, yz = y * z2, zz = z * z2,
				wx = w * x2, wy = w * y2, wz = w * z2;

			t.m11 = 1 - ( yy + zz );
			t.m12 = xy - wz;
			t.m13 = xz + wy;

			t.m21 = xy + wz;
			t.m22 = 1 - ( xx + zz );
			t.m23 = yz - wx;

			t.m31 = xz - wy;
			t.m32 = yz + wx;
			t.m33 = 1 - ( xx + yy );
			
			t.m41 = t.m42 = t.m43 = 0;
			*/
			
			
			var t = this,
				sqw = w * w,
				sqx = x * x,
				sqy = y * y,
				sqz = z * z,
				invs = 1 / (sqx + sqy + sqz + sqw);
			
			
			t.m11 = ( sqx - sqy - sqz + sqw)*invs ;
		    t.m22 = (-sqx + sqy - sqz + sqw)*invs ;
		    t.m33 = (-sqx - sqy + sqz + sqw)*invs ;
		    
		    
		    
		    var tmp1 = x*y;
		    var tmp2 = z*w;
		    t.m21 = 2 * (tmp1 + tmp2)*invs ;
		    t.m12 = 2 * (tmp1 - tmp2)*invs ;
		    
		    tmp1 = x*z;
		    tmp2 = y*w;
		    t.m31 = 2 * (tmp1 - tmp2)*invs ;
		    t.m13 = 2 * (tmp1 + tmp2)*invs ;
		    tmp1 = y*z;
		    tmp2 = x*w;
		    t.m32 = 2 * (tmp1 + tmp2)*invs ;
		    t.m23 = 2 * (tmp1 - tmp2)*invs ;  
			
		    
			/*
			
			var t = this,
				xx = x * x,
				xy = x * y,
		    	xz = x * z,
		    	xw = x * w,
		    	yy = y * y,
		    	yz = y * z,
		    	yw = y * w,
		    	zz = z * z,
		    	zw = z * w;
			
			t.m11  = 1 - 2 * ( yy + zz );
			t.m12  =     2 * ( xy - zw );
			t.m12 =     2 * ( xz + yw );

			t.m21  =     2 * ( xy + zw );
			t.m22  = 1 - 2 * ( xx + zz );
			t.m23  =     2 * ( yz - xw );

			t.m31  =     2 * ( xz - yw );
			t.m32  =     2 * ( yz + xw );
			t.m33 = 1 - 2 * ( xx + yy );

			t.m14  = t.m24 = t.m34 = t.m41 = t.m42 = t.m43 = 0;
			t.m44 = 1;
			*/
			
			return this;

		},
		
		/**
		 * 
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @param {number} w
		 * @returns {Matrix}
		 */
		quaternionRotate:function(x, y, z, w){

			if (!this.temp_){
				this.temp_ = new Matrix();
			}
			w = (!w && w !== 0) ? 1 : w;
			
			
			return  this.multiply(this.temp_.quaternionRotation(x, y, z, w));
			//return (x && y && z && w === 1) ? this : this.multiply(this.temp_.quaternionRotation(x, y, z, w));
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		lookingAt:function(x,y,z){
			
			
			x = x||0;
			y = y||0;
			z = -z||0;
			
			var l = Math.sqrt((x * x) + (y * y) + (z * z));
			if (l){

				x /= l;
				y /= l;
				z /= l;
				
				this.set(
						
					-z,    0,        x,    0,
					-x*y,  x*x+z*z, -z*y,  0,
					-x,   -y,       -z,    0,
					 0,    0,        0,    1
						
				);
			}
			
			return this;
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		lookAt:function(x, y, z){
			
			if (!this.temp_){
				this.temp_ = new Matrix();
			}
			
			return (x || y) ? this.multiply(this.temp_.lookingAt(x, y, z)) : this;
			
		},
		
		/**
		 * @returns {Matrix}
		 */
		invert:function(){
			var m = this,
				n11 = m.m11, n12 = m.m12, n13 = m.m13,
				n21 = m.m21, n22 = m.m22, n23 = m.m23,
				n31 = m.m31, n32 = m.m32, n33 = m.m33,
				n41 = m.m41, n42 = m.m42, n43 = m.m43,
				d = 1/(-n13 * n22 * n31+
					    n12 * n23 * n31+
					    n13 * n21 * n32-
					    n11 * n23 * n32-
					    n12 * n21 * n33+
					    n11 * n22 * n33 );

			m.m11 = (-n23*n32 + n22*n33)*d;
			m.m12 = ( n13*n32 - n12*n33)*d;
			m.m13 = (-n13*n22 + n12*n23)*d;
			m.m14 = 0;
			m.m21 = ( n23*n31 - n21*n33)*d;
			m.m22 = (-n13*n31 + n11*n33)*d;
			m.m23 = ( n13*n21 - n11*n23)*d;
			m.m24 = 0;
			m.m31 = (-n22*n31 + n21*n32)*d;
			m.m32 = ( n12*n31 - n11*n32)*d;
			m.m33 = (-n12*n21 + n11*n22)*d;
			m.m34 = 0;

			m.m41 = (n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43)*d;
			m.m42 = (n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43)*d;
			m.m43 = (n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43)*d;
			m.m44 = 1;
			    
			return m;
		},

		/**
		 * @returns {Matrix}
		 */
		createInvert:function(){
			return this.clone().invert();
		},
		
		/**
		 * @returns {Matrix}
		 */
		clone:function(){
			var m = this;
			
			return new Matrix().set(
					
				m.m11,m.m12,m.m13,m.m14,
				m.m21,m.m22,m.m23,m.m24,
				m.m31,m.m32,m.m33,m.m34,
				m.m41,m.m42,m.m43,m.m44
				
			);
			
		},
		
		/**
		 * @param {Matrix} a
		 * @param {Matrix} b
		 * @returns {Matrix}
		 */
		join:function(a,b){
			
			var a11 = a.m11, a12 = a.m12, a13 = a.m13, a14 = a.m14,
				a21 = a.m21, a22 = a.m22, a23 = a.m23, a24 = a.m24,
				a31 = a.m31, a32 = a.m32, a33 = a.m33, a34 = a.m34,
				a41 = a.m41, a42 = a.m42, a43 = a.m43, a44 = a.m44,
		
				b11 = b.m11, b12 = b.m12, b13 = b.m13, b14 = b.m14,
				b21 = b.m21, b22 = b.m22, b23 = b.m23, b24 = b.m24,
				b31 = b.m31, b32 = b.m32, b33 = b.m33, b34 = b.m34,
				b41 = b.m41, b42 = b.m42, b43 = b.m43, b44 = b.m44;

			this.m11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
			this.m12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
			this.m13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
			this.m14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

			this.m21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
			this.m22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
			this.m23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
			this.m24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

			this.m31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
			this.m32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
			this.m33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
			this.m34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

			this.m41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
			this.m42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
			this.m43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
			this.m44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
			
			return this;
			
		},
		
		/**
		 * @param {Matrix} matrix
		 * @returns {Matrix}
		 */
		multiply:function(matrix){
			
			return this.join(this, matrix);
			
		},
		
		/**
		 * @param {Matrix} matrix
		 * @returns {Matrix}
		 */
		preMultiply:function(matrix){
			
			return this.join(matrix, this);
			
			
		},
		
		/**
		 * @returns {String}
		 */
		toString:function(){
			var m = this;
			if (this.m13 || this.m23 || this.m33 !== 1 || this.m43){
				return "matrix3d("+m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+m.m13.toFixed(4)+","+m.m14.toFixed(4)+","+
								m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+m.m23.toFixed(4)+","+m.m24.toFixed(4)+","+
								m.m31.toFixed(4)+","+m.m32.toFixed(4)+","+m.m33.toFixed(4)+","+m.m34.toFixed(4)+","+
								m.m41.toFixed(4)+","+m.m42.toFixed(4)+","+m.m43.toFixed(4)+","+m.m44.toFixed(4)+")";
			} else {
				return "matrix("+m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+m.m41.toFixed(4)+","+m.m42.toFixed(4)+")";
			}
			
		},
		
		/**
		 * @returns {Array}
		 */
		toArray:function(){
			var m = this;
			return [
			        m.m11, m.m12, m.m13, m.m14,
			        m.m21, m.m22, m.m23, m.m24,
			        m.m31, m.m32, m.m33, m.m34,
			        m.m41, m.m42, m.m43, m.m44
			        ];
		}
};


externs['Matrix'] = Matrix;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */


var Vector = function(x,y,z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

Vector.isVector = function(v){
	
	return (v && typeof v.x === 'number' && typeof v.y === 'number');

};

Vector.prototype = {
		
		constructor : Vector,
		
		set: function ( x, y, z ) {

			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		},

		setX: function ( x ) {

			this.x = x;

			return this;

		},

		setY: function ( y ) {

			this.y = y;

			return this;

		},

		setZ: function ( z ) {

			this.z = z;

			return this;

		},

		copy: function ( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z || 0;

			return this;

		},

		clone: function () {

			return new Vector( this.x, this.y, this.z );

		},

		add: function ( v ) {

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;

			return this;

		},

		addScalar: function ( s ) {

			this.x += s;
			this.y += s;
			this.z += s;

			return this;

		},

		sub: function ( v ) {

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;

			return this;

		},

		multiply: function ( v ) {

			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;

			return this;

		},

		multiplyScalar: function ( s ) {

			this.x *= s;
			this.y *= s;
			this.z *= s;

			return this;

		},

		divide: function ( v ) {

			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;

			return this;

		},

		divideScalar: function ( s ) {

			if ( s ) {

				this.x /= s;
				this.y /= s;
				this.z /= s;

			} else {

				this.x = 0;
				this.y = 0;
				this.z = 0;

			}

			return this;

		},

		dot: function ( v ) {

			return this.x * v.x + this.y * v.y + this.z * v.z;

		},

		lengthSq: function () {

			return this.x * this.x + this.y * this.y + this.z * this.z;

		},

		length: function () {

			return Math.sqrt( this.lengthSq() );

		},

		normalize: function () {

			return this.divideScalar( this.length() );

		},
		
		lerp: function ( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;
			this.z += ( v.z - this.z ) * alpha;

			return this;

		},

		cross: function ( v ) {

			var x = this.x, y = this.y, z = this.z;

			this.x = y * v.z - z * v.y;
			this.y = z * v.x - x * v.z;
			this.z = x * v.y - y * v.x;

			return this;

		},

		distance: function ( v ) {

			return Math.sqrt( this.distanceSq( v ) );

		},

		distanceSq: function ( v ) {

			return this.clone().sub( v ).lengthSq();

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

		},

		isZero: function () {

			return ( this.lengthSq() < 0.0001 /* almostZero */ );

		},
		
		max: function () {

			return Math.max(this.x,Math.max(this.y,this.z));

		},
		
		min: function ( v ) {

			return Math.min(this.x,Math.min(this.y,this.z));

		},
		
		setFromQuaternion: function ( q ) {

			this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z ) );
			this.y = Math.asin( 2 *  ( q.x * q.z + q.y * q.w ) );
			this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z ) );

		},
		
};

externs['Vector'] = Vector;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */


var Vector4 = function(x,y,z,w){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w || 1;
};

Vector4.isVector4 = function(v){
	
	var n = 'number';
	
	return (v && typeof v.x === n && typeof v.y === n && typeof v.w === n);

};

Vector4.prototype = {
		
		constructor : Vector,
		
		set: function ( x, y, z, w ) {

			this.x = x;
			this.y = y;
			this.z = z || 0;
			this.w = (!w && w !== 0) ? 1 : w;

			return this;

		},

		copy: function ( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z || 0;
			this.w = v.w || 1;

			return this;

		},

		clone: function () {

			return new Vector4( this.x, this.y, this.z, this.w );

		},
		
		lerp: function ( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;
			this.z += ( v.z - this.z ) * alpha;
			this.w += ( v.w - this.w ) * alpha;

			return this;

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ));

		},

		setQuaternion: function( v ){
			
			var sin = Math.sin,
				cos = Math.cos,
				t = this,
				sx = sin(v.x * .5),
				cx = cos(v.x * .5),
				sy = sin(v.y * .5),
				cy = cos(v.y * .5),
				sz = sin(v.z * .5),
				cz = cos(v.z * .5),
				cxy = cx * cy,
				sxy = sx * sy;
			
			t.x = sz * cxy     - cz * sxy;
			t.y = cz * sx * cy + sz * cx * sy;
			t.z = cz * cx * sy - sz * sx * cy;
			t.w = cz * cxy     + sz * sxy;
			
			return this;
			
		},
		
		divideScalar: function ( s ) {

			if ( s ) {

				this.x /= s;
				this.y /= s;
				this.z /= s;
				this.w /= s;

			} else {

				this.x = 0;
				this.y = 0;
				this.z = 0;
				this.w = 0;

			}

			return this;

		},
		
		lengthSq: function () {

			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;

		},

		length: function () {

			return Math.sqrt( this.lengthSq() );

		},
		
		normalize: function () {

			return this.divideScalar( this.length() );

		},
		
		
		
};

externs['Vector4'] = Vector4;

/** @constructor */
var Rectangle = function(_x,_y,_width,_height){
	
	this.x = _x || 0;
	this.y = _y || 0;
	this.width = _width || 100;
	this.height = _height || 100;
	
};



Rectangle.prototype = {
		
		constructor : Rectangle,
		
		clone : function(){
			return new Rectangle(this.x,this.y,this.width,this.height);
		},
		
		compare : function(obj){
			
			if (obj === null) return false;
			
			if (	obj.x !== this.x
				 || obj.y !== this.y 
				 || obj.width !== this.width 
				 || obj.height !== this.height
			){
				return false;
			}
			return true;
		}
};




var Line = function(start,end){
	
	this.start = start;
	this.end = end;
	
	this.update = true;
	
};


Line.prototype = {
		
		constructor : Line,

		length : function(){
			
			if (this.update){
				
				this.length_ = this.start.distance(this.end);
				this.update = false;
			}
			
			return this.length_;
		},
		
		getVect : function(pos, vec){
			
			return ((vec)? vec.copy(this.start) : this.start.clone()).lerp(this.end,pos);
			
		}

};

externs['Line'] = Line;


var QuadCurve = function(start,anchor,end){
	
	this.start = start;
	this.anchor = anchor;
	this.end = end;
	
	this.temp_ = this.start.clone();
	
	this.update = true;
	
};


QuadCurve.prototype = {
		
		constructor : QuadCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				var c1 = this.anchor.clone().sub(this.start).multiplyScalar(2),
	          		c2 = this.start.clone().sub(this.anchor.clone().multiplyScalar(2)).add(this.end),
	       			sqrt = Math.sqrt,
	       			divider = 5.65685425,
	       			l,r1,r2,r3,s1,s2;

				
				// We'll calculate the length by quarter.
				// This will be used for arc-length parametization latter on
				r1 = sqrt(getGaussLength(0,.25,c1,c2))/divider;
				r2 = sqrt(getGaussLength(.25,.5,c1,c2))/divider;
				r3 = sqrt(getGaussLength(.5,.75,c1,c2))/divider;
				l = r1+r2+r3+(sqrt(getGaussLength(.75,1,c1,c2))/divider);
				r3 = (r1+r2+r3)/l;
				r2 = (r1+r2)/l;
				r1 /= l;
				// we'll smooth the values using a quadratic interpolation
				// this is an anchor for those
				s1 = .5+((1-(r1/(r2-r1)))/4);
				s2 = .5-((1-((1-r3)/(r3-r2)))/5);
				
				this.length_ = l;
				this.inverse_ = [r1,r2,r3,s1,s2];
			}
			
			return this.length_;
		},

		
		getVect : function(pos, vec){

			this.length();
			
			var p = getPositionAt(pos,this.inverse_);
			
			var start = (vec) ? vec.copy(this.start) : this.start.clone();
			
			return 	start.lerp(this.anchor, p)
					.lerp(this.temp_.copy(this.anchor).lerp(this.end, p), p);
		}

};


externs['QuadCurve'] = QuadCurve;




var Path = function(start){

	this.start = start || 0;
	
	this.elements = [];
	
	this.update = true;
	
};

Path.prototype = {
	
	constructor : Path,
	
	length : function(){
		
		if (this.update){
			
			var current_length = 0,
				l = this.elements.length,
				i;
			
			this.update = false;
			
			this.lengths_ = [current_length];
			
			for (i = 0; i < l; i++) {
				
				current_length += this.elements[i].length();
				this.lengths_.push(current_length);
				
			}
			
			this.lastPos_ = 0;
			this.lastItemPos_ = 0;
			this.length_ = current_length;
			
		}

		return this.length_;
	},
	
	getItem : function(pos){

		pos *= this.length();
		
		var increment = ( pos >= this.lastPos_ ) ? 1 : -1,
			l = this.elements.length,
			limit,item;
		
		
		
		for ( var i = this.lastItemPos_; i < l; i += increment ) {
			
			limit = this.lengths_[i];
			
			item = this.elements[i];
			
			if ( pos >= limit && pos < limit+item.length() ){
				
				
				
				this.lastItemPos_ = i;
				this.lastPos_ = limit;
				return item;
			}
			
		}
		
	},

	getVect : function(pos, vec){

		var item = this.getItem(pos);

		pos *= this.length();
		
		if (item){
			return item.getVect((pos-this.lastPos_) / item.length(), vec);
		} else {
			return (vec) ? vec.copy(this.start) : this.start.clone();
		}
		
	},
	
	lineTo : function(end){
		
		this.elements.push(new Line(this.start,end));
		this.start = end;
		this.update = true;
		
	},
	
	curveTo : function(anchor,end){
		
		this.elements.push( new QuadCurve( this.start,anchor,end ) );
		this.start = end;
		this.update = true;
		
	},
	
	cubicCurveTo : function(a1,a2,end){
		
		this.elements.push(new CubicCurve(this.start,a1,a2,end));
		this.start = end;
		this.update = true;
		
	}

};

externs['Path'] = Path;



var CubicCurve = function(start,a1,a2,end){
	
	
	this.start = start;
	this.a1 = a1;
	this.a2 = a2;
	this.end = end;
	
	this.update = true;
	
};


CubicCurve.prototype = {
		
		constructor : CubicCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				this.path = cubicToQuadratic(this.start,this.a1,this.a2,this.end,new Path(this.start));
				
				this.length_ = this.path.length();
			}
			
			return this.length_;
		},
		
		getVect : function(pos, vec){

			this.length();
			
			return this.path.getVect(pos, vec);
			
		}

};

externs['CubicCurve'] = CubicCurve;


var Animator = function(layer,in_point,out_point,source){
	
	Stack.call(this);
	
	
	this.layer = layer;
	this.inPoint = in_point || 0;
	this.outPoint = out_point || 1/0;
	this.source = source;
	
	this.startTime = 0;
	this.speed = 1;
	
	this.remap = new Keys();
};

Animator.prototype = new Stack();
Animator.prototype.constructor = Animator;

Animator.prototype.animate = function(time){
	
	var layer = this.layer,
		items = this.items_,
		l;
	
	if (time >= this.inPoint && time <= this.outPoint){
		
		layer.visible = true;
		l = items.length;
		
		for ( var i = 0; i < l; i++) {
			items[i].set(time);
		}
		
		if (this.source){
			
			if (!this.remap.num()){
				this.source.animate((time - this.startTime) * this.speed);
			} else {
				this.source.animate(this.remap.get(time - this.startTime));
			}

		}
		
	} else {
		layer.visible = false;
	}
	

};

var AnimatorStack = function(item){
	
	Stack.call(this);
	
	this.item = item;
	this.duration = 1;
	this.frameRate = 25;
	this.clamp = false;
};

AnimatorStack.prototype = new Stack();
AnimatorStack.prototype.constructor = AnimatorStack;

AnimatorStack.prototype.animate = function(time){
	
	var items = this.items_,
		l = items.length;
	
	time = time%this.duration;
	
	if (this.clamp){
		time = Math.floor(time*this.frameRate)/this.frameRate;
	}
	
	if (time !== this.prevTime_){
		for ( var i = 0; i < l; i++) {
			items[i].animate(time);
		}
		
		this.prevTime_ = time;
	}
	
};

var KeyFrame = function(offset,value,is_hold){
	
	this.offset = offset;
	this.position_ = 0;
	
	this.value = value;
	this.isHold = is_hold;
	this.inX = 0;
	this.inY = 0;
	this.outX = 0;
	this.outY = 0;
	this.inTangent = null;
	this.outTangent = null;
	this.path = null;
	this.update = false;
};



var Keys = function(target,property){

	this.target = target;
	this.property = property;
	
	this.keys_ = [];
	this.length_ = 0;
};

Keys.prototype = {
	
	constructor : Keys,
	
	length : function(){
		
		var keys = this.keys_,
			key,i,l,pos;
		
		if (this.update){
			
			l = keys.length;
			pos = 0;
			
			for ( i = 0; i < l; i++) {
				key = keys[i];
				pos += key.offset;
				key.position_ = pos;
				if (key.update && key.path && (key.inTangent || key.outTangent)){
					this.path = null;
					key.update = false;
				}
			}
			
			this.length_ = pos;
			this.update = false;
		}

		return this.length_;
	},
	
	num : function(){
		return this.keys_.length;
	},
	
	indexAt : function(pos){
		
		var keys = this.keys_,
			i = this.prevIndex_ || 0,
			iterator = (pos >= (this.prevPosition_||0)) ? 1 : -1;
		
		this.length();
		this.prevPosition_ = pos;
		
		if (pos <= keys[0].position_) {
			this.prevIndex_ = 0;
			return this.prevIndex_;
		} else if (pos >= keys[keys.length-1].position_) {
			this.prevIndex_ = keys.length-1;
			return this.prevIndex_;
		} else {
			
			key_loop: while (keys[i]){
				
				if ( pos >= keys[i].position_ && (!keys[i+1] || pos < keys[i+1].position_) ){
					
					this.prevIndex_ = i;
					this.prevPosition_ = pos;
					return this.prevIndex_;
					
					break key_loop;
				}
				
				i += iterator;
			}
		}

		this.prevIndex_ = 0;
		return this.prevIndex_;
	},
	
	get : function(pos, opt_obj){
		
		var index = this.indexAt(pos),
			key = this.keys_[index],
			next_key, i;
		
		if ( (index === 0 && pos <= key.offset) || index >= this.num()-1 || key.isHold){
			return key.value;
		} else {
			next_key = this.keys_[index+1];
			
			i = (pos-key.position_)/next_key.offset;
			
			if (key.outX || key.outY || next_key.inX || next_key.inY){
				
				i = BezierEasing.ease(key.outX, key.outY, next_key.inX, next_key.inY, i);
				
			}
			
			return this.interpolate(key, next_key, i, opt_obj);
		}
	},
	
	interpolate: function(key, next_key, pos){
		return key.value + (next_key.value - key.value) * pos;
	},
	
	set: function(pos){
		var res = this.get(pos);
		if (this.target[this.property] !== res){
			this.target[this.property] = res;
		};
	},
	
	add : function(offset,val,is_hold){
		
		var key = new KeyFrame(offset, val, is_hold);
		
		this.length_ += offset;
		key.position_ = this.length_;
		this.keys_.push(key);
		
		return key;
		
	}

	
};

externs['Keys'] = Keys;



var SpatialKeys = function(target, property){

	Keys.call(this, target, property);
	
	this.temp_ = target[property].clone();
};

SpatialKeys.prototype = new Keys();
SpatialKeys.prototype.constructor = SpatialKeys;

SpatialKeys.prototype.interpolate = function(key, next_key, pos, opt_vec){
	
	if (key.update){
		if (key.outTangent && next_key.inTangent){
			key.path = new CubicCurve(	
				key.value,
				key.outTangent.clone().add(key.value),
				next_key.inTangent.clone().add(next_key.value),
				next_key.value
			);
		} else {
			key.path = null;
		}
		
		key.update = false;
	}
	if (key.path){
		return key.path.getVect(pos, opt_vec);
	} else {
		return ((opt_vec) ? opt_vec.copy(key.value) : key.value.clone())
			   .lerp(next_key.value,pos);
	}
};

SpatialKeys.prototype.set = function(pos){
	
	var res = this.get(pos, this._temp),
		v = this.target[this.property];
	
	if (v.equals && !v.equals(res)){
		v.copy(res);
	};
	
};

externs['SpatialKeys'] = SpatialKeys;

/** @constructor */
var LayerBase = function(){
	
	this.is3D = true;
	this.parent = null;
	this.visible = true;
	this.name = null;
	
	this.matrix_ = new Matrix;;
	this.matrix2D_ = new Matrix;
	
};


LayerBase.prototype.getMatrix = function(){
	
	if (!this.is3D){
		return this.getMatrix2D();
	}

	var mat = this.matrix_.injectMatrix(this.getLocalMatrix()),
		p = this.parent;
	
	if (p){
		mat.multiply(p.getMatrix());
	}
	
	return mat;
};


LayerBase.prototype.getMatrix2D = function(){
	
	var mat = this.matrix2D_.injectMatrix(this.getLocalMatrix2D()),
		p = this.parent;

	if (p){
		mat.multiply(p.getMatrix2D());
	}
	
	return mat;
};


LayerBase.prototype.getLocalMatrix = function(){
	return new Matrix();
};

LayerBase.prototype.getLocalMatrix2D = function(){
	return new Matrix();
};

/** @constructor */
var Layer = function(){
	
	LayerBase.call(this);

	this.filters = new Stack();
	this.masks = new Stack();
	
	this.collapse = false;
	
	this.position = new Vector();
	this.anchor = new Vector();
	this.scale = new Vector(1,1,1);
	this.rotation = new Vector();
	this.orientation = new Vector4();
	this.opacity = 1;
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	
};

Layer.prototype = new LayerBase();
Layer.prototype.constructor = Layer;

Layer.prototype.getLocalMatrix = function(){
	
	var t = this,
		p = t.position,
		a = t.anchor,
		s = t.scale,
		r = t.rotation,
		o = t.orientation;
	
	return 	this.localMatrix_
			.translation(-a.x,-a.y, -a.z)
			.scale(s.x, s.y, s.z)
			.rotate(r.x, r.y, r.z)
			.quaternionRotate(o.x, o.y, o.z, o.w)
			.translate(p.x,p.y, -p.z);
};

Layer.prototype.getLocalMatrix2D = function(){
	
	var t = this,
		p = t.position,
		a = t.anchor,
		s = t.scale;

	return 	this.localMatrix2D_
			.translation(-a.x, -a.y, 0)
			.scale(s.x, s.y, 1)
			.rotate(0, 0, t.rotation.z)
			.translate(p.x, p.y, 0);
};


externs['Layer'] = Layer;

/** @constructor */
var Camera = function(){
	
	LayerBase.call(this);
	
	this.position = new Vector();
	this.rotation = new Vector();
	this.target = new Vector();
	this.haveTarget = true;
	this.zoom = 1333.33;
	this.center = new Vector();
	this.is3D = true;
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	this.matrixCamera_ = new Matrix();
	this.tempMatrixCamera_ = new Matrix();
};

Camera.prototype = new LayerBase();
Camera.prototype.constructor = Camera;

Camera.prototype.getLocalMatrix = function(){
	
	var t   = 	this,
		r	=	t.rotation,
		ta	=	t.target,
		p	=	t.position,
		mat = 	this.localMatrix_
				.rotate(r.x,r.y,r.z);
	
	mat.m41 = mat.m42 = mat.m43 = 0;
	
	if (t.haveTarget){
		mat.lookAt(
				ta.x - p.x,
				ta.y - p.y, 
				ta.z - p.z
		);
	}
	
	mat.translate(p.x,p.y, -p.z);
	
	return 	mat;
};

Camera.prototype.getLocalMatrix2D = function(){
	
	return 	this.localMatrix2D_
			.rotate(0,0,this.rotation.z)
			.translate(this.position.x,this.position.y, 0);
	
};


Camera.prototype.getCameraMatrix = function(){
	
	
	var c = this.center;

	return	this.matrixCamera_
			.translate(c.x,c.y,this.zoom)
			.preMultiply(
				this.tempMatrixCamera_
				.injectMatrix(this.getMatrix())
				.invert()
			);
	//return 	new Matrix()
	//		.translate(c.x,c.y,this.zoom)
	//		.preMultiply(this.getMatrix().createInvert());
	
};


externs['Camera'] = Camera;

/** @constructor */
var Solid = function(){
	
	Layer.call(this);
	
	this.color = '#000000';
	this.width = 640;
	this.height = 360;
	
};


Solid.prototype = new Layer();
Solid.prototype.constructor = Solid;


externs['Solid'] = Solid;

/** @constructor */
var Composition = function(){
	Layer.call(this);
	
	this.layers = new Stack(Layer);
	this.cameras = new Stack(Camera);
	this.width = 640;
	this.height = 360;
	this.color = "#000000";
};


Composition.prototype = new Layer();
Composition.prototype.constructor = Composition;


Composition.prototype.getCamera = function(){
	
	
	var i = 0,
		l = this.cameras.length,
		temp_cam = null,
		cam = null;
	
	camLoop : for (i = 0; i < l; i++) {
		
		temp_cam = this.cameras.get(i);
		
		if (temp_cam.visible){
			cam = temp_cam;
			break camLoop;
		}
		
	}
	
	return cam;
};

externs['Composition'] = Composition;
/** constructor */

var Text = function(){

	Layer.call(this);
	
	this.text = "";
	this.textArea = new Rectangle(0,0,150,150);
	this.textClass = null;
	this.fontFamily = 'Arial';
	this.textColor = '#888888';
	this.fontSize = 18;
	this.lineHeight = 1.2;
	this.letterSpacing = 0;
	this.textAlign = 'left';
	this.verticalAlign = 'top';
	this.collapse = true;
	
};


Text.prototype = new Layer();
Text.prototype.constructor = Text;


externs['Text'] = Text;

var AEBuilder = {
	
	build: function(data){
		
		return this.buildItem(data.items[data.root],data.items);
		
	},
	
	buildItem: function(item,items){
		switch (item.type) {
		case 'Composition':
			return this.buildComp(item,items);
			break;
		case 'Solid':
			return this.buildSolid(item,items);
			break;
		case 'Image':
			return this.buildImage(item,items);
			break;
		case 'Video':
			return this.buildVideo(item,items);
			break;
		}
		
	},
	
	buildComp: function (item, items) {
		
		var comp = new Composition(),
			item_animator = new AnimatorStack(comp),
			layers = item.layers,
			i,layer_data,animator;
		
		comp.width = item.width;
		comp.height = item.height;
		comp.color = item.color || "#000000";
		item_animator.duration = item.duration || 1;
		item_animator.frameRate = item.frameRate || 25;
		
		
		for ( i = 0; i < layers.length; i++) {
			
			layer_data = layers[i];
			animator = null;
			
			switch (layer_data.type) {
			case 'Camera':
				animator = this.buildCamera(layer_data);
				break;
			case 'Text':
				animator = this.buildText(layer_data);
				break;
			default:
				if (layer_data.source){
					animator = this.buildItemLayer(layer_data,items);
				}
				break;
			}

			if (animator){
				
				item_animator.add(animator);
				((animator.layer instanceof Camera)
					? comp.cameras 
					: comp.layers
				).add(animator.layer);
				
			}
		}
		
		return item_animator;
	},
	
	setLayer: function(animator,data){
		var layer = animator.layer,
			tr = data.transform;
		
		layer.name = data.name;
		layer.is3D = data.is3D || false;
		
		if (tr){
			this.setProp(layer, "position", animator, tr.position);
			this.setProp(layer, "anchor", animator, tr.anchor);
			this.setProp(layer, "scale", animator, tr.scale);
			this.setProp(layer, "opacity", animator, tr.opacity);
		}
		
		if (layer.is3D){
			this.setProp(layer, "rotation", animator, tr.rotation);
			this.setProp(layer, "orientation", animator, tr.orientation);
		} else {
			this.setProp(layer.rotation, "z", animator, tr.rotation);
		}
		
	},
	
	

	buildSolid: function (data, items) {
		
		var solid = new Solid(),
			item_animator = new AnimatorStack(solid);
		
		solid.width = data.width;
		solid.height = data.height;
		solid.color = data.color;
		
		return item_animator;
		
	},
	
	
	buildItemLayer: function (data, items) {
		
		var item_animator = this.buildItem(items[data.source], items),
			layer = item_animator.item,
			animator = new Animator(layer, data.inPoint, data.outPoint);
		
		this.setLayer(animator, data);
		
		animator.source = item_animator;
		animator.startTime = data.startTime || 0;
		animator.speed = data.speed || 1;
		
		return animator;
	},
	
	buildImage: function (item, items) {
		
	},
	
	buildVideo: function (item, items) {
		
	},

	
	buildCamera: function (layer) {
		
	},

	buildText: function (layer) {
		
	},


	dump: function(){
		
	},
	
	
	setProp: function (obj, name, animator, value) {
		
		if (!value && value !== 0){
			return;
		}
		
		var i,k,val,offset,is_hold,keys,key,is_object,is_array,is_spatial,is_vector;
		
		if (Array.isArray(value)){
			
			is_spatial = null;
			offset = 0;
			
			for (i = 0; i < value.length; i++) {
				
				k = value[i];
				
				is_object = typeof k === 'object';
				is_array = Array.isArray(k);
				is_hold = ( is_array || !is_object || (k.e && k.e.o === 0));
				val = (is_array) ? k[0] : (is_object && k.v) ? k.v : k;
				is_vector = Vector.isVector(val);
				
				if (is_vector){
					if (val.w !== undefined){
						val = new Vector4(val.x,val.y,val.z,val.w);
					} else {
						val = new Vector(val.x,val.y,val.z);
					}
				}
				
				if (is_spatial === null){
					
					is_spatial = is_vector;
					
					if (is_spatial){
						keys = new SpatialKeys(obj,name);
					} else {
						keys = new Keys(obj,name);
					}
				}
				
				if (is_array){
					offset = k[1];
				} else if (is_object && k.d !== undefined){
					
					offset = k.d || 0;
				}
				
				key = keys.add(offset,val,is_hold);
				
				if (k.e && Array.isArray(k.e.i)){
					key.inX = k.e.i[0];
					key.inY = k.e.i[1];
				}
				if (k.e && Array.isArray(k.e.o)){
					key.outX = k.e.o[0];
					key.outY = k.e.o[1];
				}
				
				if (is_spatial && k.t){
					if (Array.isArray(k.t.i)){
						key.inTangent = new Vector(k.t.i[0],k.t.i[1],k.t.i[2]);
					}
					if (Array.isArray(k.t.o)){
						key.outTangent = new Vector(k.t.o[0],k.t.o[1],k.t.o[2]);
					}
					key.update = true;
				}
				
			}
			
			if (keys){
				animator.add(keys);
			}
			
		} else if (Array.isArray(value.x)) {
			
			setProp(obj[name],'x',animator,value.x);
			
			if (prop.y){
				setProp(obj[name],'y',animator,value.y);
			}
			
			if (prop.z){
				setProp(obj[name],'z',animator,value.z);
			}
			
		} else {
			
			if (Vector.isVector(value)){
				
				obj[name].set(value.x,value.y,value.z);
				console.log(value,obj[name]);
				if (obj[name].w !== undefined){
					obj[name].w = value.w;
					//console.log(value);
				}
			} else {
				obj[name] = value;
			}
			
		}
		
	},
	
};

externs["AEBuilder"] = AEBuilder;



/**
 * @constructor
 */
var LayerDomElement = function(layer){

	this.model = layer;
	
	this.holder = document.createElement(this.tagName);
	this.element = this.holder;

	this.prevScale = 0;
	this.visible = false;
	
	this.matrix_ = new Matrix();
	this.tempMatrix_ = new Matrix();
};

LayerDomElement.prototype = {
		
		constructor : LayerDomElement,
		
		tagName : 'layer',
		
		visible : false,
		
		setVisible : function(val){
			
			if (val !== this.visible){
				this.visible = val;
				if (val){
					this.element.style.display = undefined;
				} else {
					this.element.style.display = 'none';
				}
			}
			
		},
		
		
		render : function(camera_mat,camera_zoom){
			
			var t = this,
				m = t.model,
				mat = t.matrix_.injectMatrix(m.getMatrix());
			
			
			t.modifyMatrix(mat);

			if (camera_mat){
				mat.multiply(camera_mat);
			}
			
			t.modifyCollapse(mat,camera_zoom);

			t.element.style[TRANSFORM] = mat.toString();
			t.holder.style.opacity = (m.opacity !== 1) ? m.opacity : undefined;
			
			
		},
		
		modifyCollapse : function(mat,zoom){
			
			
			var t = this,
				e = t.element,
				h = t.holder,
				m = t.model;
			
			if ((e === h) === m.collapse){
				
				if (m.collapse){
					
					e = t.element = document.createElement('transform');
					
					if (h.parentElement){
						h.parentElement.replaceChild(e,h);
						e.style[TRANSFORM] = h.style[TRANSFORM];
						e.appendChild(h);
					}
					
				} else {
					
					if (e.parentElement){
						e.parentElement.replaceChild(h,e);
						h.style[TRANSFORM] = e.style[TRANSFORM];
					}
					
					t.element = h;
				}
				
			}
			
			
			if (m.collapse){
				
				var scale = 1,
					invScale,
					mx = mat.m21,
					my = mat.m22,
					mz = mat.m23,
					prev = t.prevScale;
				
				scale = Math.sqrt((mx * mx) + (my * my) + (mz * mz)) * (zoom / (zoom - mat.m43));
				
				
				
				if (scale / prev > 1.5 || scale / prev < .75) {
					
					t.prevScale = scale;
					h.style[TRANSFORM] = 'scale('+scale+','+scale+')';
					
				}
				
				invScale = 1/scale;
				mat.preMultiply(t.tempMatrix_.scaling(invScale, invScale, 1));
				
			} else {
				this.prevScale = 0;
			}

		},

		modifyMatrix : function(mat){
			return mat;
		}
};




/**
 * @constructor
 */
var SolidDomElement = function(layer){

	LayerDomElement.call(this,layer);
	
};

SolidDomElement.prototype = new LayerDomElement(null);
SolidDomElement.prototype.constructor = SolidDomElement;
SolidDomElement.prototype.tagName = 'solid';

SolidDomElement.prototype.render = function(camera_mat,camera_zoom){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var h = this.holder,
		m = this.model;
	
	h.style.width = m.width;
	h.style.height = m.height;
	h.style.backgroundColor = m.color;
	
};

var checkDifference = function(source,target){
	var res = false,
		s_prop,
		t_prop;
	
	for ( var i in target) {
		
		if (target.hasOwnProperty(i)){
			s_prop = source[i];
			t_prop = target[i];
			if (s_prop !== t_prop && (typeof s_prop !== 'object' || s_prop === null)){
				
				res = true;
				target[i] = s_prop;

			} else if (s_prop !== null && s_prop.clone && s_prop.compare){
				if (!s_prop.compare(t_prop)){
					res = true;
					target[i] = s_prop.clone();
				}
			}
		}
	}
	
	return res;
};


/**
 * @constructor
 */
var TextDomElement = function(layer){

	this.text = layer;
	
	LayerDomElement.call(this,layer);
	
	
	this.oldText = {
		text : null,
		textArea : null,
		textClass : null,
		fontFamily : null,
		textColor : null,
		fontSize : null,
		lineHeight : null,
		letterSpacing : null,
		textAlign : null,
		verticalAlign : null
	};
	
};

TextDomElement.prototype = new LayerDomElement(null);
TextDomElement.prototype.constructor = SolidDomElement;

TextDomElement.prototype.tagName = 'text';

TextDomElement.prototype.render = function(camera_mat,camera_zoom){

	if (checkDifference(this.text,this.oldText)){
		
		var holder = this.holder,
			style = this.holder.style,
			text = this.text,
			size = text.fontSize,
			maxResize = 6,
			maxHeight = text.textArea.height,
			offset = (size * text.leading) - size;
			i = 0;
		
		style.width = text.textArea.width + 'px';
		style.color = text.textColor;
		style.textAlign = text.textAlign;
		style.fontFamily = text.fontFamily;
		style.fontSize = text.fontSize + 'px';
		style.lineHeight = text.lineHeight + 'em';
		
		var t_node = document.createTextNode(text.text);
		
		if (this.textNode){
			
			holder.replaceChild(t_node,this.textNode);
			
		} else {
			
			holder.appendChild(t_node);
			
		}
		
		this.textNode = t_node;
		
		while (i <= maxResize && (holder.offsetHeight - offset) >= maxHeight) {
			size = size * 0.92;
			offset = (size * text.leading) - size;
			style.fontSize = size + 'px';
			i++;
		}
		
		this.offsetY = (text.textArea.y - (offset / 2));
		var dif = (maxHeight - (holder.offsetHeight - (offset / 2)));
		
		switch (text.verticalAlign) {
			case 'bottom':
				this.offsetY += dif;
				break;
			case 'middle':
				this.offsetY += dif / 2;
				break;
			default:
				break;
		}
		
		style.height = (holder.offsetHeight + 5) + 'px';
		
	}
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
};


TextDomElement.prototype.modifyMatrix = function(mat){
	return mat;
};


/** @this {CompositionDomElement} */
var _Composition_add = function(layer,pos){
	
	var e = _Composition_generate(layer);
	this.holder.appendChild(e.element);
	this.layers.splice(pos,0,e);
	
	
	
};

/** @this {CompositionDomElement} */
var _Composition_remove = function(layer,pos){
	
	var e = this.layers[pos];
	this.holder.removeChild(e.element);
	this.layers.splice(pos,1);
	
	
};

/** @this {CompositionDomElement} */
var _Composition_swap = function(pos_1,pos_2){
	
	var e = this.layers[pos_1];
	this.layers[pos_1] = this.layers[pos_2];
	this.layers[pos_2] = e;
	
};

/** 
 * 
 * @this {CompositionDomElement}
 * @param {Layer} obj
 * @returns {LayerDomElement}
 * 
 * */
var _Composition_generate = function(obj){
	
	if (obj instanceof Composition){
		return new CompositionDomElement(obj);
	} else if (obj instanceof Solid){
		return new SolidDomElement(obj);
	} else if (obj instanceof Text){
		return new TextDomElement(obj);
	} else {
		return new LayerDomElement(obj);
	};
	
};

/**
 * @constructor
 * @param {Composition} layer
 */
var CompositionDomElement = function(comp){

	var t = this,
		e,
		sig = comp.layers.on;

	LayerDomElement.call(t,comp);

	/** @type Composition */
	t.composition = comp;
	
	t.collapse = null;
	t.zoom = 1333.33;
	t.width = 0;
	t.height = 0;
	
	
	/** @type Array.<Layer> */
	t.layers = [];
	
	comp.layers.each(function(lyr){
		e = _Composition_generate(lyr);
		t.holder.appendChild(e.element);
		t.layers.push(e);
	});

	sig.add.add(_Composition_add,t);
	sig.remove.add(_Composition_remove,t);
	sig.swap.add(_Composition_swap,t);
};

CompositionDomElement.prototype = new LayerDomElement(null);
CompositionDomElement.prototype.constructor = CompositionDomElement;

CompositionDomElement.prototype.tagName = 'composition';

CompositionDomElement.prototype.render = function(camera_mat,camera_zoom,opt_camera){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var t = this,
		layers = t.layers,
		l = t.layers.length,
		model = t.model,
		style = t.element.style,
		i,
		camera = (opt_camera || (!model.collapse) ? t.composition.getCamera() : null),				
		cam_mat = (camera) ? camera.getCameraMatrix() : null,
		cam_zoom = (camera) ? camera.zoom : 1333.33,
		layer;
		
	if (t.collapse !== model.collapse){
		
		if (model.collapse){
			
			style[TRANSFORM_STYLE] = 'preserve-3d';
			style[PERSPECTIVE] = undefined;
			style[PERSPECTIVE_ORIGIN] = undefined;
			style.clip = undefined;
			style.overflow = undefined;
		} else {
			
			t.width = null;
			t.height = null;
			t.zoom = null;
			
			style[TRANSFORM_STYLE] = 'flat';
			
		}
		
		t.collapse = model.collapse;
	}
	
	
	
	if (!t.collapse){
		
		if (t.width !== model.width || t.heigh !== model.height){
			
			t.width = model.width;
			t.height = model.height;
			style.width = t.width.toString()+'px';
			style.height = t.height.toString()+'px';
			style.overflow = 'hidden';
			style.clip = "rect(0px,"+t.width+"px,"+t.height+",0px)"
			style[PERSPECTIVE_ORIGIN] = (t.width/2).toString()+'px '+(t.height/2).toString()+'px';
		}
		
		
		if (t.zoom !== cam_zoom){
			
			t.zoom = cam_zoom;
			style[PERSPECTIVE] = t.zoom.toString()+'px';
		}
	}
	

	for ( i = 0; i < l; i++) {
		
		layer = layers[i];
		
		if (layer.visible !== layer.model.visible){
			layer.setVisible(layer.model.visible);
		}
		
		if (layer.visible){
			layer.render(cam_mat,cam_zoom);
		}
		
	}
	
};

CompositionDomElement.prototype.modifyCollapse = function(mat,zoom){
	
	return mat;
	
};


/**
 * @param {Composition} scene
 * @param {Camera} opt_camera
 */
var DomRenderer = function(scene,opt_camera){
	
	this.scene = new CompositionDomElement(scene);

	this.camera = opt_camera;
	
	this.element = document.createElement('scene');
	this.element.appendChild(this.scene.element);
	
	if (!document.getElementById('AEStyleSheet')){
		var cssNode = document.createElement('style');
		cssNode.id = 'AEStyleSheet';
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.media = 'screen';
		cssNode.title = 'AEStyleSheet';
		cssNode.innerHTML = "scene * {position:absolute;display:block;top:0px;left:0px;word-wrap:break-word;-webkit-font-smoothing:antialiased;-moz-transform-origin:0% 0%;-webkit-transform-origin:0% 0%;-ms-transform-origin:0% 0%;}";
		document.getElementsByTagName("head")[0].appendChild(cssNode);
		
	}
	
	if (scene.color){
		this.scene.element.style.backgroundColor = scene.color;
	}
	
	
};

DomRenderer.prototype.render = function(){
	
	this.scene.render(null,null,this.camera);
	
};



externs['DomRenderer'] = DomRenderer;



//exports to multiple environments
if(typeof define === 'function' && define.amd){ //AMD
	define('AE', [], externs);
} else if (typeof module !== 'undefined' && module.exports){ //node
	module.exports = externs;
} else { //browser
	//use string because of Google closure compiler ADVANCED_MODE
	global['AE'] = externs;
}

}(this));
