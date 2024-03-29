
define(['core/Stack','./Keys'], function (Stack, Keys) {

    function Animator (layer, in_point, out_point, source) {

        Stack.call(this);

        this.layer = layer;
        this.inPoint = in_point || 0;
        this.outPoint = out_point || 1/0;
        this.source = source;

        this.startTime = 0;
        this.speed = 1;

        this.remap = new Keys();
    }

    Animator.prototype = new Stack();
    Animator.prototype.constructor = Animator;

    Animator.prototype.animate = function(time){

        var layer = this.layer,
            items = this.items_,
            i = 0,
            l;

        if (time >= this.inPoint && time <= this.outPoint){

            layer.visible = true;
            l = items.length;

            for ( ; i < l; i += 1) {
                items[i].set(time);
            }

            if (this.source){
                if (!this.remap.num()){
                    this.source.animate((time - this.startTime) * this.speed);
                } else {
                    this.source.animate(this.remap.get(time - this.startTime));
                }
            }

        } else {
            layer.visible = false;
        }
    };

    return Animator;
});


