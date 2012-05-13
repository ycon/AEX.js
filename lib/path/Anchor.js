
/*global define */
define([
    'geom/Vector'
], function (
    Vector
) {

    function Anchor (x, y, inX, inY, outX, outY) {

        Vector.call(this, x, y);

        this.inVector = new Vector(inX, inY);
        this.outVector = new Vector(outX, outY);
    }

    Anchor.prototype = new Vector();
    Anchor.prototype.constructor = Anchor;

    Anchor.prototype.clone = function() {

        return new Anchor(
            this.x,
            this.y,
            this.inVector.x,
            this.inVector.y,
            this.outVector.x,
            this.outVector.y
        );
    };

    Anchor.prototype.copy = function(a) {

        Vector.prototype.copy.call(this,a);
        if (a.inVector && a.outVector) {
            this.inVector.copy(a.inVector);
            this.outVector.copy(a.outVector);
        }
        return this;
    };

    Anchor.prototype.equals = function(a) {

        if (
               a.inVector
            && a.outVector
            && this.inVector.equals(a.inVector)
            && this.outVector.equals(a.outVector)
            && Vector.prototype.equals.call(this, a)
        ) {
            return true;
        }
        return false;
    };

    return Anchor;
});
