
var HoldSpatialKeyFrame = function(vect,length){
	
	this.path = {
		end:vect
	};
	
	this.length = length;
	
};

HoldSpatialKeyFrame.prototype.get = function(pos){
	
	return this.path.end.clone();
	
};


