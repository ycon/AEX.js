
/*global define*/

define(['geom/Vector', './Layer'], function(Vector, Layer) {

    function Text () {

        Layer.call(this);

        this.text           = "";
        this.textPosition   = new Vector();
        this.width          = 150;
        this.height         = 150;
        this.textClass      = null;
        this.fontFamily     = 'Arial';
        this.textColor      = '#888888';
        this.fontSize       = 18;
        this.lineHeight     = 1.2;
        this.letterSpacing  = 0;
        this.textAlign      = 'left';
        this.verticalAlign  = 'top';
        this.collapse       = true;
        this.type           = 'text';
    }


    Text.prototype = new Layer();
    Text.prototype.constructor = Text;

    Text.prototype.getDepthPoint = function () {

        var x = this.textPosition.x,
            y = this.textPosition.y;

        if (this.textAlign === 'center') {
            x += this.width*0.5;
        } else if (this.textAlign === 'right') {
            x += this.width;
        }

        if (this.verticalAlign === 'middle') {
            y += this.height*0.5;
        } else if (this.verticalAlign === 'bottom') {
            y += this.height;
        }

        return this.depthPoint_.set(x, y);
    };

    return Text;
});
