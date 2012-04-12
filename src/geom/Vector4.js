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
		
		setFromEuler: function ( v ) {

			var sin = Math.sin,
				cos = Math.cos,
				c = Math.PI / 360, // 0.5 * Math.PI / 360, // 0.5 is an optimization
				x = v.x * c,
				y = v.y * c,
				z = v.z * c,
				c1 = cos( y  ),
				s1 = sin( y  ),
				c2 = cos( -z ),
				s2 = sin( -z ),
				c3 = cos( x  ),
				s3 = sin( x  ),
				c1c2 = c1 * c2,
				s1s2 = s1 * s2;

			this.w = c1c2 * c3  - s1s2 * s3;
		  	this.x = c1c2 * s3  + s1s2 * c3;
			this.y = s1 * c2 * c3 + c1 * s2 * s3;
			this.z = c1 * s2 * c3 - s1 * c2 * s3;

			return this;

		},
		
		setFromRotationMatrix: function ( m ) {

			// Adapted from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

			var sqrt = Math.sqrt,
				max = Math.max,
				abs = Math.abs;
			
			function copySign( a, b ) {

				return b < 0 ? -abs( a ) : abs( a );

			}

			var absQ = Math.pow( m.determinant(), 1.0 / 3.0 );
			this.w = sqrt( max( 0, absQ + m.m11 + m.m22 + m.m33 ) ) / 2;
			this.x = sqrt( max( 0, absQ + m.m11 - m.m22 - m.m33 ) ) / 2;
			this.y = sqrt( max( 0, absQ - m.m11 + m.m22 - m.m33 ) ) / 2;
			this.z = sqrt( max( 0, absQ - m.m11 - m.m22 + m.m33 ) ) / 2;
			this.x = copySign( this.x, ( m.m32 - m.m23 ) );
			this.y = copySign( this.y, ( m.m13 - m.m31 ) );
			this.z = copySign( this.z, ( m.m21 - m.m12 ) );
			this.normalize();

			return this;

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
		
		slerp: function(q, t){

			// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

			var x = this.x;
			var y = this.y;
			var z = this.z;
			var w = this.w;
			
			var cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z;

			if (cosHalfTheta < 0) {
				this.w = -q.w;
				this.x = -q.x;
				this.y = -q.y;
				this.z = -qb.z;
				cosHalfTheta = -cosHalfTheta;
			} else {
				this.copy(q);
			}

			
			var halfTheta = Math.acos( cosHalfTheta ),
			sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

			if ( Math.abs( sinHalfTheta ) < 0.001 ) {

				this.w = 0.5 * ( w + q.w );
				this.x = 0.5 * ( x + q.x );
				this.y = 0.5 * ( y + q.y );
				this.z = 0.5 * ( z + q.z );

				return this;

			}

			var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

			this.w = ( w * ratioA + this.w * ratioB );
			this.x = ( x * ratioA + this.x * ratioB );
			this.y = ( y * ratioA + this.y * ratioB );
			this.z = ( z * ratioA + this.z * ratioB );

			return qm;

		
		}
		
		
		
};

externs['Vector4'] = Vector4;
