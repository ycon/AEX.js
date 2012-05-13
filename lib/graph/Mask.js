
/*global define*/

define([
    'path/Path',
    'geom/Vector'
], function (
    Path,
    Vector
) {

    function Mask () {

        Path.call(this);

        this.inverted  = false;
        this.feather   = new Vector();
        this.opacity   = 1;
        this.expansion = 0;
        this.blending  = 'normal';
    }

    Mask.prototype = new Path();
    Mask.prototype.constructor = Mask;

    return Mask;
});
