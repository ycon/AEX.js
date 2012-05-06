define(['core/Stack'], function (Stack) {

    function AnimatorStack (item) {

        Stack.call(this);

        this.item = item;
        this.duration = 1;
        this.frameRate = 25;
        this.clamp = false;
    }

    AnimatorStack.prototype = new Stack();
    AnimatorStack.prototype.constructor = AnimatorStack;

    AnimatorStack.prototype.animate = function(time){

        var items = this.items_,
            l = items.length,
            i = 0;

        time = time%this.duration;

        if (this.clamp){
            time = Math.floor(time*this.frameRate)/this.frameRate;
        }

        if (time !== this.prevTime_){
            for ( ; i < l; i += 1) {
                items[i].animate(time);
            }
            this.prevTime_ = time;
        }

    };

    return AnimatorStack;

});
