

var KeyFrame = function(previous,to,length,inX,inY,outX,outY){

	this.to = to;
	this.length = length;
	this.previous = previous;
	
	if (inX || inY || outX || outY){
		this.easing = new BezierEasing(inX, inY, outX, outY, duration);
	}
	
	
};

KeyFrame.prototype.get = function(pos){

	if ( ! this.previous ){
		return this.to;
	}
	
	var from = this.previous.to,
		dif = this.to-this.from;
	
	if (dif === 0 || pos >= this.length) {
		return this.to;
	} else if (pos <= 0){
		return from;
	} else {
		var	factor = Math.min(pos/this.length,1);
		
		if (this.easing){
			factor = this.easing.ease(factor);
		}
		return from+(dif*factor);
	}
	
};

