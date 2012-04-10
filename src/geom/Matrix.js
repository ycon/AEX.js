


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

			return (rotationX || rotationY || rotationZ) ? this.multiply(new Matrix().rotation(rotationX, rotationY, rotationZ)) : this;
			
		},
		
		/**
		 * 
		 * @param {Object{x:number,y:number,x:number,w:number} q
		 * @returns {Matrix}
		 */
		quaternion: function( q ) {

			var t,
				x = q.x,
				y = q.y,
				z = q.z,
				w = q.w,
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

			return this;

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
			
			return (x || y) ? this.multiply(new Matrix().lookingAt(x, y, z)) : this;
			
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
