
define(function () {

    function Solid (model) {

        this.element = document.createElement('solid');
        this.model = model;
    }

    Solid.prototype = {

        constructor: Solid,

        render: function(){

            var style = this.element.style,
                model = this.model;

            style.width = model.width+'px';
            style.height = model.height+'px';
            style.backgroundColor = model.color;
        }
    };

    return Solid;
});

