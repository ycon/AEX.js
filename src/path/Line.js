



var Line = function(start,end){
	
	this.start = start;
	this.end = end;
	
	this.update = true;
	
};


Line.prototype = {
		
		constructor : Line,

		length : function(){
			
			if (this.update){
				
				this.length_ = this.start.distance(this.end);
				this.update = false;
			}
			
			return this.length_;
		},
		
		getVect : function(pos, vec){
			
			return ((vec)? vec.copy(this.start) : this.start.clone()).lerp(this.end,pos);
			
		}

};

externs['Line'] = Line;
