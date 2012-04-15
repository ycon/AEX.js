/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */


var Quaternion = function(x,y,z,w){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w || 1;
};

Quaternion.isQuaternion = function(v){
	
	var n = 'number';
	
	return (v && typeof v.x === n && typeof v.y === n && typeof v.w === n);

};

Quaternion.prototype = {
		
		constructor : Quaternion,
		
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

			return new Quaternion( this.x, this.y, this.z, this.w );

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ));

		},
		
		multiply: function ( v ) {
			
			var x = this.x,
				y = this.y,
				z = this.z,
				w = this.w;
			
			this.w = w*v.w - x*v.x - y*v.y - z*v.z;
			this.x = w*v.x + x*v.w + y*v.z - z*v.y;
			this.y = w*v.y + y*v.w + z*v.x - x*v.z;
			this.z = w*v.z + z*v.w + x*v.y - y*v.x;
			
			return this;
		},
		
		setFromEuler: function ( v ) {

			var sin = Math.sin,
				cos = Math.cos,
				c = Math.PI / 360, // 0.5 * Math.PI / 360, // 0.5 is an optimization
				x = v.x * c,
				y = v.y * c,
				z = v.z * c,
				cy = cos(y),
				sy = sin(y),
				cz = cos(-z),
				sz = sin(-z),
				cx = cos(x),
				sx = sin(x);

			if (!this.temp_){
				this.temp_ = new Quaternion();
			}
			
			this.set(
				0, 0, sz, cz
			).multiply(this.temp_.set(
				0, sy, 0, cy
			)).multiply(this.temp_.set(
				sx, 0, 0, cx
			));
			

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
		
		lerp: function(q, t){

			// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

			var x = this.x,
				y = this.y,
				z = this.z,
				w = this.w,
				cos_half_theta = w * q.w + x * q.x + y * q.y + z * q.z,
				half_theta,
				sin_half_theta,
				ratio_a,
				ratio_b;
			
			
			if (cos_half_theta < 0) {
				this.set(-q.x, -q.y, -q.z, -q.w);
				cos_half_theta = -cos_half_theta;
			} else {
				this.copy(q);
			}

			
			
			half_theta = Math.acos(cos_half_theta);
			sin_half_theta = Math.sqrt(1.0 - cos_half_theta * cos_half_theta);

			if (Math.abs( sin_half_theta ) < 0.001) {
				
				this.set(
					0.5 * ( x + q.x ),
					0.5 * ( y + q.y ),
					0.5 * ( z + q.z ),
					0.5 * ( w + q.w )
				);

				return this;

			}

			ratio_a = Math.sin((1 - t) * half_theta) / sin_half_theta,
			ratio_b = Math.sin(t * half_theta) / sin_half_theta;

			this.set(
				x * ratio_a + this.x * ratio_b,
				y * ratio_a + this.y * ratio_b,
				z * ratio_a + this.z * ratio_b,
				w * ratio_a + this.w * ratio_b
			);
			
			return this;

		},
		
		toJSON: function(){
			
			return {
				x:this.x,
				y:this.y,
				z:this.z,
				w:this.w
			};
			
		}
		
};

externs['Quaternion'] = Quaternion;
