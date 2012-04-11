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
