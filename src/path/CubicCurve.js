

var CubicCurve = function(start,a1,a2,end){
	
	
	this.start = start;
	this.a1 = a1;
	this.a2 = a2;
	this.end = end;
	
	this.update = true;
	
};


CubicCurve.prototype = {
		
		constructor : CubicCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				this.path = cubicToQuadratic(this.start,this.a1,this.a2,this.end,new Path(this.start));
				
				this.length_ = this.path.length();
			}
			
			return this.length_;
		},
		
		getVect : function(pos){

			this.length();
			
			return this.path.getVect(pos);
			
		}

};

externs['CubicCurve'] = CubicCurve;

