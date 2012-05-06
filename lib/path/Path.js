
/*global define */

define(['./SimplePath', './CubicCurve'], function(SimplePath, CubicCurve) {

    function Path (start) {
        SimplePath.call(this,start);
    }

    Path.prototype = new SimplePath();
    Path.constructor = Path;

    Path.prototype.cubicCurveTo = function(a1,a2,end){

        this.elements.push(new CubicCurve(this.start,a1,a2,end));
        this.start = end;
        this.update = true;
    };

    return Path;
});




