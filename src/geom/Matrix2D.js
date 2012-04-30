


/** @constructor */
var Matrix2D = function(){
	if (arguments.length){
		this.injectArray(arguments);
	}
};

Matrix2D.matrix_ = new Matrix2D();
Matrix2D.v1_ = new Vector();
Matrix2D.v2_ = new Vector();
Matrix2D.v3_ = new Vector();

Matrix2D.prototype = {
		
		constructor : Matrix2D,
		
		m11:1,m12:0,m21:0,m22:1,x:0,y:0,z:0,
		
		/**
		 * @param {number} n11
		 * @param {number} n12
		 * @param {number} n21
		 * @param {number} n22
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 *
		 * @returns {Matrix2D}
		 */
		set:function(n11, n12, n21, n22, x, y, z){
			
			var m = this;
			
			m.m11 = n11;m.m12 = n12;
			m.m21 = n21;m.m22 = n22;
			m.x = x;m.y = y;m.z = z;
			
			return this;
		},
		
		/**
		 *
		 * @param {Array.<Number>} a
		 * @returns {Matrix2D}
		 */
		injectArray:function(a){
			
			return this.set.apply(this,a);
		},
		
		/**
		 *
		 * @param {Matrix2D} m
		 * @returns {Matrix2D}
		 */
		injectMatrix:function(m){
			
			/** @type Matrix2D */
			var t = this;
			
			t.m11 = m.m11;t.m12 = m.m12;
			t.m21 = m.m21;t.m22 = m.m22;
			t.x = m.x;t.y = m.y;t.z = m.z;
			
			return t;
		},
		
		/** @returns {Matrix} */
		identity:function(){
			
			this.set(
					
				1,0,
				0,1,
				0,0,0
				
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
				1,0,
				0,1,
				x||0,y||0,z||0,1
			);
			
			return this;
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix2D}
		 */
		translate:function(x, y, z){
			
			this.x += x||0;
			this.y += y||0;
			this.z += z||0;
			
			return this;
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix2D}
		 */
		preTranslate:function(x, y, z){
			
			this.x += x * this.m11 + y * this.m21;
			this.y += x * this.m12 + y * this.m22;
			this.z += z||0;
			
			return this;
			
		},
		
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @returns {Matrix2D}
		 */
		scaling:function(scaleX, scaleY){
			
			this.set(
					
				scaleX||0,
				0,scaleY||0,
				0,0,0
				
			);
			
			return this;
			
		},
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @returns {Matrix2D}
		 */
		scale:function(scaleX, scaleY){
			
			scaleX = scaleX||0.000001;
			scaleY = scaleY||0.000001;
			
			var t = this;
			
			if (scaleX !== 1 || scaleY !== 1){
				
				t.m11*=scaleX;t.m12*=scaleX;t.x*=scaleX;
				
				t.m21*=scaleY;t.m22*=scaleY;t.y*=scaleY;
				
			}

			return t;
			
		},
		
		/**
		 * @param {number} rotation
		 * @returns {Matrix2D}
		 */
		rotation:function(rotation){
			
			
			//TODO implement 2D rotation that have 3D rotation interface
			return this;
			
		},
		
		/**
		 * @param {number} rotationX
		 * @param {number} rotationY
		 * @param {number} rotationZ
		 * @returns {Matrix}
		 */
		rotate:function(rotation){

			return (rotation) ? this.multiply(Matrix2D.matrix_.rotation(rotation)) : this;
			
		},
		
		/**
		 * @returns {Matrix}
		 */
		clone:function(){
			var m = this;
			
			return new Matrix2D().set(	
				m.m11,m.m12,
				m.m21,m.m22,
				m.x,m.y,m.z
			);
			
		},
		
		/**
		 * @param {Matrix2D} a
		 * @param {Matrix2D} b
		 * @returns {Matrix2D}
		 */
		join:function(a,b){
			
			var a11 = a.m11, a12 = a.m12,
				a21 = a.m21, a22 = a.m22,
				ax = a.x, ay = a.y,
				
				b11 = b.m11, b12 = b.m12,
				b21 = b.m21, b22 = b.m22,
				bx = b.x, by = b.y;

			this.m11 = a11 * b11 + a12 * b21;
			this.m12 = a11 * b12 + a12 * b22;

			this.m21 = a21 * b11 + a22 * b21;
			this.m22 = a21 * b12 + a22 * b22;
			
			this.x = ax * b11 + ay * b21 + bx;
			this.y = ax * b12 + ay * b22 + by;
			
			return this;
			
		},
		
		/**
		 * @param {Matrix2D} matrix
		 * @returns {Matrix2D}
		 */
		multiply:function(matrix){
			
			return this.join(this, matrix);
			
		},
		
		/**
		 * @param {Matrix2D} matrix
		 * @returns {Matrix2D}
		 */
		preMultiply:function(matrix){
			
			return this.join(matrix, this);
			
			
		},
		
		multiplyVector:function(v){
			
			var vx = v.x;
				vy = v.y;
			
			v.x = this.m11 * vx + this.m21 * vy + this.x;
			v.y = this.m12 * vx + this.m22 * vy + this.y;
			
			return v;
		},
		
		copy3D: function(m) {
			
			var t = this;
			
			t.m11 = m.m11;t.m12 = m.m12;
			t.m21 = m.m21;t.m22 = m.m22;
			t.x = m.m41;t.y = m.m42;
			
			return this;
		},
		
		simulate3D: function(m, center_v, depth_v, zoom) {
			
			var v = Matrix2D.v1_
					.copy(depth_v)
					.multiplyMatrix(m)
					.flatten(zoom, center_v),
					
				vx = Matrix2D.v2_
					 .set(depth_v.x + 1, depth_v.y, 0)
					 .multiplyMatrix(m)
					 .flatten(zoom, center_v)
					 .sub(v),
					
				vy = Matrix2D.v3_
					 .set(depth_v.x, depth_v.y + 1, 0)
					 .multiplyMatrix(m)
					 .flatten(zoom, center_v)
					 .sub(v);
			
			this.m11 = vx.x;
			this.m12 = vx.y;
			this.m21 = vy.x;
			this.m22 = vy.y;
			
			this.x = v.x - (depth_v.x * this.m11 + depth_v.y * this.m21);
			this.y = v.y - (depth_v.x * this.m12 + depth_v.y * this.m22);
			
			return this;
		},
		
		/**
		 * @returns {String}
		 */
		toCSS:function(){
			
			var m = this;
			
			return "matrix("+
				m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+
				m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+
				m.x.toFixed(4)+","+m.y.toFixed(4)+
			")";
			
		},
		
		/**
		 * @returns {Array}
		 */
		toArray:function(){
			var m = this;
			return [
			        m.m11, m.m12,
			        m.m21, m.m22,
			        m.x, m.y
			];
		}
};


externs.Matrix2D = Matrix2D;
