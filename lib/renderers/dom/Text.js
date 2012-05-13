
/*global define*/
define(function () {

    function checkDifference (source, target) {

        var res = false,
            s_prop,
            t_prop;

        for ( var i in target) {
            if (target.hasOwnProperty(i)){
                s_prop = source[i];
                t_prop = target[i];
                if (s_prop !== t_prop && (typeof s_prop !== 'object' || s_prop === null)){
                    res = true;
                    target[i] = s_prop;
                } else if (s_prop != null && s_prop.clone && s_prop.equals){
                    if (!s_prop.equals(t_prop)){
                        res = true;
                        target[i] = s_prop.clone();
                    }
                }
            }
        }

        return res;
    }


    function Text (model) {

        this.model = model;
        this.element = document.createElement('text');
        this.text = document.createElement('p');
        this.element.appendChild(this.text);

        this.oldX = 0;
        this.oldY = 0;
        this.offsetY = 0;

        this.oldModel = {
            text : null,
            textClass : null,
            fontFamily : null,
            textColor : null,
            fontSize : null,
            lineHeight : null,
            letterSpacing : null,
            textAlign : null,
            verticalAlign : null,
            width : null,
            height : null
        };
    }

    Text.prototype = {

        constructor: Text,

        render: function() {

            var model       = this.model,
                style       = this.text.style,
                size        = model.fontSize,
                maxResize   = 6,
                maxHeight   = model.height,
                offset      = (size * model.leading) - size,
                i           = 0,
                node;

            if (checkDifference(this.model, this.oldModel)){

                node = document.createTextNode(model.text);
                if (this.node){
                    this.text.replaceChild(node,this.node);
                } else {
                    this.text.appendChild(node);
                }
                this.node = node;


                style.width      = model.width + 'px';
                style.color      = model.textColor;
                style.textAlign  = model.textAlign;
                style.fontFamily = model.fontFamily;
                style.fontSize   = model.fontSize + 'px';
                style.lineHeight = model.lineHeight + 'em';

                offset = (size * model.lineHeight) - size;
                while (i <= maxResize && (this.text.offsetHeight - offset) >= maxHeight) {
                    size = size * 0.92;
                    offset = (size * model.lineHeight) - size;
                    style.fontSize = size + 'px';
                    i += 1;
                }

                this.offsetY = (model.textPosition.y - (offset / 2));
                var dif = (maxHeight - (this.text.offsetHeight - (offset / 2)));

                switch (model.verticalAlign) {
                case 'bottom':
                    this.offsetY += dif;
                    break;
                case 'middle':
                    this.offsetY += dif / 2;
                    break;
                default:
                    break;
                }

            }

            if (this.oldX !== model.textPosition.x){
                this.oldX = model.textPosition.x;
                style.left = this.oldX;
            }

            if (this.oldY !== this.offsetY){
                this.oldY = this.offsetY;
                style.top = this.oldY;
            }
        }
    };

    return Text;
});
