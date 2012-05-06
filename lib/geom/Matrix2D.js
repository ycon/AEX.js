
define(['./Vector'], function(Vector){

    var v1 = new Vector(),
        v2 = new Vector(),
        v3 = new Vector(),
        mat;

    function Matrix2D () {
        if (arguments.length){
            this.injectArray(arguments);
        }
    }

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
        set: function (n11, n12, n21, n22, x, y, z) {

            this.m11 = n11; this.m12 = n12;
            this.m21 = n21; this.m22 = n22;
            this.x = x; this.y = y; this.z = z;

            return this;
        },

        /**
         *
         * @param {Array.<Number>} a
         * @returns {Matrix2D}
         */
        injectArray: function (a) {

            return this.set.apply(this,a);
        },

        /**
         *
         * @param {Matrix2D} m
         * @returns {Matrix2D}
         */
        injectMatrix: function (m) {

            this.m11 = m.m11; this.m12 = m.m12;
            this.m21 = m.m21; this.m22 = m.m22;
            this.x = m.x; this.y = m.y; this.z = m.z;

            return this;
        },

        /** @returns {Matrix} */
        identity: function () {

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
        translation: function (x, y, z) {

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
        translate: function (x, y, z) {

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
        preTranslate: function (x, y, z) {

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
        scaling: function (scaleX, scaleY) {

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
        scale: function (scaleX, scaleY) {

            scaleX = scaleX || 0.000001;
            scaleY = scaleY || 0.000001;

            if (scaleX !== 1 || scaleY !== 1){
                this.m11 *= scaleX; this.m12 *= scaleX; this.x *= scaleX;
                this.m21 *= scaleY; this.m22 *= scaleY; this.y *= scaleY;
            }

            return this;
        },

        /**
         * @param {number} rotation
         * @returns {Matrix2D}
         */
        rotation: function (rotation) {
            //TODO implement 2D rotation that have 3D rotation interface
            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotate: function (rotation) {

            return (rotation) ? this.multiply(mat.rotation(rotation)) : this;
        },

        /**
         * @returns {Matrix}
         */
        clone: function () {

            return new Matrix2D().set(
                this.m11, this.m12,
                this.m21, this.m22,
                this.x, this.y, this.z
            );
        },

        /**
         * @param {Matrix2D} a
         * @param {Matrix2D} b
         * @returns {Matrix2D}
         */
        join: function (a, b) {

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
        multiply: function (matrix) {

            return this.join(this, matrix);
        },

        /**
         * @param {Matrix2D} matrix
         * @returns {Matrix2D}
         */
        preMultiply: function (matrix) {

            return this.join(matrix, this);
        },

        multiplyVector: function (v) {

            var vx = v.x,
                vy = v.y;

            v.x = this.m11 * vx + this.m21 * vy + this.x;
            v.y = this.m12 * vx + this.m22 * vy + this.y;

            return v;
        },

        copy3D: function (m) {

            this.m11 = m.m11; this.m12 = m.m12;
            this.m21 = m.m21; this.m22 = m.m22;
            this.x = m.m41; this.y = m.m42;

            return this;
        },

        simulate3D: function (m, center_v, depth_v, zoom) {

            var v = v1.copy(depth_v)
                    .multiplyMatrix(m)
                    .flatten(zoom, center_v),

                vx = v2.set(depth_v.x + 1, depth_v.y, 0)
                     .multiplyMatrix(m)
                     .flatten(zoom, center_v)
                     .sub(v),

                vy = v3.set(depth_v.x, depth_v.y + 1, 0)
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
        toCSS: function () {

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
        toArray: function () {
            var m = this;
            return [
                    m.m11, m.m12,
                    m.m21, m.m22,
                    m.x, m.y
            ];
        }
    };

    mat = new Matrix2D();

    return Matrix2D;

});

