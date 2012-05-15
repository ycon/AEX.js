
define(function(){

    /** @constructor */
    function Rectangle (x, y, width, height) {

        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 100;
        this.height = height || 100;
    }

    Rectangle.prototype = {

            constructor : Rectangle,

            clone : function(){

                return new Rectangle(this.x,this.y,this.width,this.height);
            },

            compare : function(obj){

                if (obj === null) return false;

                if (
                    obj.x !== this.x ||
                    obj.y !== this.y ||
                    obj.width !== this.width ||
                    obj.height !== this.height
                ){
                    return false;
                }

                return true;
            },

            multiplyScalar: function(val) {

                this.width  *= val;
                this.height *= val;
                this.x      *= val;
                this.y      *= val;
            }
    };

    return Rectangle;
});
