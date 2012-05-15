
/*global define*/

define(function () {

    function Solid (model) {

        this.element = document.createElement('solid');
        this.model = model;
    }

    Solid.prototype = {

        constructor: Solid,

        render: function(bounds){

            var style = this.element.style,
                model = this.model;

            style.width = model.width+'px';
            style.height = model.height+'px';
            style.backgroundColor = model.color;

            if (bounds) {
                bounds.x = 0;
                bounds.y = 0;
                bounds.width = model.width;
                bounds.height = model.height;
            }

            return bounds;
        }
    };

    return Solid;
});

