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
		
		transfer: function ( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z || 0;

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
			this.z = v.z;

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

		}
		
};

externs['Vector'] = Vector;
