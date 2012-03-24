


var SpatialKeys = function(offset,obj,parent,first){

	Keys.call(this,offset,obj,parent,first);
	
	if (first){
		this.lastItem_ = {
			path:{
				end : first
			}
		};
	}
	
};

SpatialKeys.prototype = new Keys();
SpatialKeys.prototype.constructor = SpatialKeys;

SpatialKeys.prototype.set = function(pos){
	
	var res = this.get(pos);
	
	if ( ! this.obj_.equals(res) ){
		
		this.obj_.transfer(res);
		
		if ( this.prop_.update !== false ){
			
			this.prop_.update = true;
			
		}
	}

};

SpatialKeys.prototype.addLinear = function(to,inP,outP,duration){
	
	
	var from = this.lastItem_.path.end,
		path;

	if ( ( !inP && !outP ) || ( to.equals(outP) && from.equals(inP) ) ){
		
		path = new Line(from,to);
		
	} else{
		
		path = new CubicCurve(from, inP, outP, to);
		
	}
	
	var key = new SpatialKeyFrame(path, duration);
	
	this.keys_.push(key);
	this.lastItem_ = key;
	this.update = true;
	
};

SpatialKeys.prototype.addBezier = function(to,inP,outP,duration,inX,inY,outX,outY){
	
	var from = this.lastItem_.path.end,
		path;
	
	if ( ( !inP && !outP ) || ( to.equals(outP) && from.equals(inP) ) ){
		
		path = new Line(from,to);
		
	} else{
		
		path = new CubicCurve(from, inP, outP, to);
		
	}
	
	var key = new SpatialKeyFrame( path, duration, inX, inY, outX, outY );
	
	this.keys_.push(key);
	this.lastItem_ = key;
	this.update = true;
		
};

SpatialKeys.prototype.addHold = function(to,duration){
	
	var key = new HoldSpatialKeyFrame( to, duration );
	
	this.keys_.push(key);
	this.lastItem_ = key;
	this.update = true;
		
};


externs['SpatialKeys'] = SpatialKeys;
