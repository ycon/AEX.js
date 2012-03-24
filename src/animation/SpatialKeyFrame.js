
var SpatialKeyFrame = function(path,length,inX,inY,outX,outY){

	this.path = path;
	this.length = length;
	
	if (inX || inY || outX || outY){
		this.easing = new BezierEasing(inX, inY, outX, outY, length);
	}
	
	
};

SpatialKeyFrame.prototype.get = function(pos){
	
	var factor = pos/this.length;

	if (this.easing){
		factor = this.easing.ease(factor);
	}
	
	return this.path.getVect(factor);
	
};


