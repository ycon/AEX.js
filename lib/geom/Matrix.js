
define(['./Vector'], function(Vector){

    var v1 = new Vector(),
        v2 = new Vector(),
        v3 = new Vector(),
        mat;

    /** @constructor */
    function Matrix () {

        if (arguments.length){
            this.injectArray(arguments);
        }
    }

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
        set: function (n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44) {

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
        injectArray: function (a) {

            return this.set.apply(this,a);
        },

        /**
         *
         * @param {Matrix} m
         * @returns {Matrix}
         */
        injectMatrix: function (m) {

            var t = this;

            t.m11 = m.m11;t.m12 = m.m12;t.m13 = m.m13;t.m14 = m.m14;
            t.m21 = m.m21;t.m22 = m.m22;t.m23 = m.m23;t.m24 = m.m24;
            t.m31 = m.m31;t.m32 = m.m32;t.m33 = m.m33;t.m34 = m.m34;
            t.m41 = m.m41;t.m42 = m.m42;t.m43 = m.m43;t.m44 = m.m44;

            return t;
        },

        /** @returns {Matrix} */
        identity: function () {

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
        translation: function (x, y, z) {

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
        translate: function (x, y, z) {

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
        scaling: function (scaleX, scaleY, scaleZ) {

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
        scale: function (scaleX, scaleY, scaleZ) {

            scaleX = scaleX || 0.000001;
            scaleY = scaleY || 0.000001;
            scaleZ = scaleZ || 0.000001;

            if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1){
                this.m11 *= scaleX; this.m21 *= scaleX; this.m31 *= scaleX; this.m41 *= scaleX;
                this.m12 *= scaleY; this.m22 *= scaleY; this.m32 *= scaleY; this.m42 *= scaleY;
                this.m13 *= scaleZ; this.m23 *= scaleZ; this.m33 *= scaleZ; this.m43 *= scaleZ;
            }

            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotation: function (rotationX, rotationY, rotationZ) {

            var p = Math.PI/180,
                cos = Math.cos,
                sin = Math.sin,
                a, b, c, d, e, f,
                ae, af, be, bf;

            this.identity();

            rotationX = ( rotationX || 0) * p;
            rotationY = ( rotationY || 0) * p;
            rotationZ = (-rotationZ || 0) * p;

            a = cos(rotationX);
            b = sin(rotationX);
            c = cos(rotationY);
            d = sin(rotationY);
            e = cos(rotationZ);
            f = sin(rotationZ);

            ae = a * e;
            af = a * f;
            be = b * e;
            bf = b * f;

            this.m11 = c * e;
            this.m12 = be * d - af;
            this.m13 = ae * d + bf;

            this.m21 = c * f;
            this.m22 = bf * d + ae;
            this.m23 = af * d - be;

            this.m31 = - d;
            this.m32 = b * c;
            this.m33 = a * c;

            this.m41 = this.m42 = this.m43 = 0;

            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotate: function (rotationX, rotationY, rotationZ) {

            return (rotationX || rotationY || rotationZ)
                   ? this.multiply(mat.rotation(rotationX, rotationY, rotationZ))
                   : this;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @param {number} w
         * @returns {Matrix}
         */
        quaternionRotation: function ( x, y, z, w ) {

            var sqw = w * w,
                sqx = x * x,
                sqy = y * y,
                sqz = z * z,
                invs = 1 / (sqx + sqy + sqz + sqw),
                tmp1, tmp2;

            this.m11 = ( sqx - sqy - sqz + sqw)*invs ;
            this.m22 = (-sqx + sqy - sqz + sqw)*invs ;
            this.m33 = (-sqx - sqy + sqz + sqw)*invs ;

            tmp1 = x * y;
            tmp2 = z * w;
            this.m21 = 2 * (tmp1 + tmp2)*invs;
            this.m12 = 2 * (tmp1 - tmp2)*invs;

            tmp1 = x * z;
            tmp2 = y * w;
            this.m31 = 2 * (tmp1 - tmp2)*invs;
            this.m13 = 2 * (tmp1 + tmp2)*invs;

            tmp1 = y*z;
            tmp2 = x*w;
            this.m32 = 2 * (tmp1 + tmp2)*invs;
            this.m23 = 2 * (tmp1 - tmp2)*invs;

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
        quaternionRotate: function (x, y, z, w) {

            w = (!w && w !== 0) ? 1 : w;

            return  this.multiply(mat.quaternionRotation(x, y, z, w));
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix}
         */
        lookingAt: function (x, y, z) {

            var v_x = v1.set(0,1,0),
                v_y = v2,
                v_z = v3.set(-x,-y,z).normalize();

            v_x.cross(v_z);
            v_y.copy(v_z).cross(v_x);

            v_x.normalize();
            v_y.normalize();

            this.set(
                v_x.x, v_x.y, v_x.z, 0,
                v_y.x, v_y.y, v_y.z, 0,
                v_z.x, v_z.y, v_z.z, 0,
                0,     0,     0,     1
            );

            return this;
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix}
         */
        lookAt: function (x, y, z) {

            return (x || y) ? this.multiply(mat.lookingAt(x, y, z)) : this;
        },

        determinant: function(){

            return -this.m13 * this.m22 * this.m31 +
                    this.m12 * this.m23 * this.m31 +
                    this.m13 * this.m21 * this.m32 -
                    this.m11 * this.m23 * this.m32 -
                    this.m12 * this.m21 * this.m33 +
                    this.m11 * this.m22 * this.m33;
        },

        /**
         * @returns {Matrix}
         */
        invert: function () {

            var n11 = this.m11, n12 = this.m12, n13 = this.m13,
                n21 = this.m21, n22 = this.m22, n23 = this.m23,
                n31 = this.m31, n32 = this.m32, n33 = this.m33,
                n41 = this.m41, n42 = this.m42, n43 = this.m43,
                d = 1 / this.determinant();

            this.m11 = (-n23 * n32 + n22 * n33) * d;
            this.m12 = ( n13 * n32 - n12 * n33) * d;
            this.m13 = (-n13 * n22 + n12 * n23) * d;
            this.m14 = 0;
            this.m21 = ( n23 * n31 - n21 * n33) * d;
            this.m22 = (-n13 * n31 + n11 * n33) * d;
            this.m23 = ( n13 * n21 - n11 * n23) * d;
            this.m24 = 0;
            this.m31 = (-n22 * n31 + n21 * n32) * d;
            this.m32 = ( n12 * n31 - n11 * n32) * d;
            this.m33 = (-n12 * n21 + n11 * n22) * d;
            this.m34 = 0;

            this.m41 = (
                n23 * n32 * n41 -
                n22 * n33 * n41 -
                n23 * n31 * n42 +
                n21 * n33 * n42 +
                n22 * n31 * n43 -
                n21 * n32 * n43
            ) * d;

            this.m42 = (
                n12 * n33 * n41 -
                n13 * n32 * n41 +
                n13 * n31 * n42 -
                n11 * n33 * n42 -
                n12 * n31 * n43 +
                n11 * n32 * n43
            ) * d;

            this.m43 = (
                n13 * n22 * n41 -
                n12 * n23 * n41 -
                n13 * n21 * n42 +
                n11 * n23 * n42 +
                n12 * n21 * n43 -
                n11 * n22 * n43
            ) * d;

            this.m44 = 1;

            return this;
        },

        /**
         * @returns {Matrix}
         */
        createInvert: function () {

            return this.clone().invert();
        },

        /**
         * @returns {Matrix}
         */
        clone: function () {

            return new Matrix().set(
                this.m11, this.m12, this.m13, this.m14,
                this.m21, this.m22, this.m23, this.m24,
                this.m31, this.m32, this.m33, this.m34,
                this.m41, this.m42, this.m43, this.m44
            );
        },

        /**
         * @param {Matrix} a
         * @param {Matrix} b
         * @returns {Matrix}
         */
        join: function (a, b) {

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
        multiply: function (matrix) {

            return this.join(this, matrix);
        },

        /**
         * @param {Matrix} matrix
         * @returns {Matrix}
         */
        preMultiply: function (matrix) {

            return this.join(matrix, this);
        },

        multiplyVector: function (v) {

            var vx = v.x,
                vy = v.y,
                vz = v.z;

            v.x = this.m11 * vx + this.m21 * vy + this.m31 * vz + this.m41;
            v.y = this.m12 * vx + this.m22 * vy + this.m32 * vz + this.m42;
            v.z = this.m13 * vx + this.m23 * vy + this.m33 * vz + this.m43;

            return v;
        },

        /**
         * @returns {String}
         */
        toCSS: function () {

            return "matrix3d("+
                this.m11.toFixed(4)+","+this.m12.toFixed(4)+","+this.m13.toFixed(4)+","+this.m14.toFixed(4)+","+
                this.m21.toFixed(4)+","+this.m22.toFixed(4)+","+this.m23.toFixed(4)+","+this.m24.toFixed(4)+","+
                this.m31.toFixed(4)+","+this.m32.toFixed(4)+","+this.m33.toFixed(4)+","+this.m34.toFixed(4)+","+
                this.m41.toFixed(4)+","+this.m42.toFixed(4)+","+(this.m43 + 0.001).toFixed(4)+","+this.m44.toFixed(4)+
            ")";
        },

        /**
         * @returns {Array}
         */
        toArray: function () {

            return [
                this.m11, this.m12, this.m13, this.m14,
                this.m21, this.m22, this.m23, this.m24,
                this.m31, this.m32, this.m33, this.m34,
                this.m41, this.m42, this.m43, this.m44
            ];
        }
    };

    mat = new Matrix();

    return Matrix;
});
