

var QuadCurve = function(start,anchor,end){
	
	this.start = start;
	this.anchor = anchor;
	this.end = end;
	
	this.temp_ = this.start.clone();
	
	this.update = true;
	
};


QuadCurve.prototype = {
		
		constructor : QuadCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				var c1 = this.anchor.clone().sub(this.start).multiplyScalar(2),
	          		c2 = this.start.clone().sub(this.anchor.clone().multiplyScalar(2)).add(this.end),
	       			sqrt = Math.sqrt,
	       			divider = 5.65685425,
	       			l,r1,r2,r3,s1,s2;

				
				// We'll calculate the length by quarter.
				// This will be used for arc-length parametization latter on
				r1 = sqrt(getGaussLength(0,.25,c1,c2))/divider;
				r2 = sqrt(getGaussLength(.25,.5,c1,c2))/divider;
				r3 = sqrt(getGaussLength(.5,.75,c1,c2))/divider;
				l = r1+r2+r3+(sqrt(getGaussLength(.75,1,c1,c2))/divider);
				r3 = (r1+r2+r3)/l;
				r2 = (r1+r2)/l;
				r1 /= l;
				// we'll smooth the values using a quadratic interpolation
				// this is an anchor for those
				s1 = .5+((1-(r1/(r2-r1)))/4);
				s2 = .5-((1-((1-r3)/(r3-r2)))/5);
				
				this.length_ = l;
				this.inverse_ = [r1,r2,r3,s1,s2];
			}
			
			return this.length_;
		},

		
		getVect : function(pos, vec){

			this.length();
			
			var p = getPositionAt(pos,this.inverse_);
			
			var start = (vec) ? vec.transfer(this.start) : this.start.clone();
			
			return 	start.lerp(this.anchor, p)
					.lerp(this.temp_.transfer(this.anchor).lerp(this.end, p), p);
		}

};


externs['QuadCurve'] = QuadCurve;

