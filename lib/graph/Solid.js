
define(['./Layer'], function(Layer) {

    function Solid () {

        Layer.call(this);

        this.color = '#000000';
        this.width = 640;
        this.height = 360;
        this.type = 'solid';
    }

    Solid.prototype = new Layer();
    Solid.prototype.constructor = Solid;

    return Solid;

});
