
var AnimatorStack = function(item){
	
	Stack.call(this);
	
	this.item = item;
	this.duration = 1;
	this.frameRate = 25;
	this.clamp = false;
};

AnimatorStack.prototype = new Stack();
AnimatorStack.prototype.constructor = AnimatorStack;

AnimatorStack.prototype.animate = function(time){
	
	var items = this.items_,
		l = items.length;
	
	time = time%this.duration;
	
	if (this.clamp){
		time = Math.floor(time*this.frameRate)/this.frameRate;
	}
	
	if (time !== this.prevTime_){
		for ( var i = 0; i < l; i++) {
			items[i].animate(time);
		}
		
		this.prevTime_ = time;
	}
	
};