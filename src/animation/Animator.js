
var Animator = function(layer,in_point,out_point,source){
	
	Stack.call(this);
	
	
	this.layer = layer;
	this.inPoint = in_point || 0;
	this.outPoint = out_point || 1/0;
	this.source = source;
	
	this.startTime = 0;
	this.speed = 1;
	
	this.remap = new Keys();
};

Animator.prototype = new Stack();
Animator.prototype.constructor = CompAnimation;

Animator.prototype.render = function(time){
	
	var layer = this.layer,
		items = this.items_,
		l;
	
	if (time >= this.inPoint && time <= this.outPoint){
		
		layer.visible = true;
		l = items.length;
		
		for ( var i = 0; i < l; i++) {
			items[i].render(time);
		}
		
		if (this.source){
			
			if (!this.keys.num()){
				this.source.render((time - this.startTime) * this.speed);
			} else {
				this.source.render(this.keys.get(time - this.startTime));
			}

		}
		
	} else {
		layer.visible = false;
	}
	

};