


var Keys = function(offset,obj,prop,first){

	this.offset = offset;
	
	this.keys_ = [];
	
	this.obj_ = obj;
	this.prop_ = prop;

	this.update = true;
	
	this.lastItem_ = {to:first};
	this.lastItemPos_ = 0;
	this.lastPos_ = 0;
	
};

Keys.prototype = {
	
	constructor : Keys,
	
	length : function(){
		
		if (this.update){
			
			var current_length = this.offset,
				l = this.keys_.length,
				i;
			
			this.update = false;
			this.lengths_ = [current_length];
			
			for (i = 1; i < l; i++) {
				
				current_length += this.keys_[i].length;
				this.lengths_.push(current_length);
				
			}
			
			this.lastPos_ = this.offset;
			this.lastItemPos_ = 0;

			this.length_ = current_length;
			
		}

		return this.length_;
	},
	
	get : function(pos){
		
		
		
		var pos_length = this.length(),
			l = this.keys_.length,
			limit,key;
		
		
		if (pos < this.offset){
			
			return this.keys_[l-1].get(1);
			
		} else if ( pos >= pos_length ){
			
			return this.keys_[l-1].get(1);
			
		} else {
			
			var increment = ( pos >= this.lastPos_ ) ? 1 : -1;
			
			for ( var i = this.lastItemPos_; i < l; i += increment ) {
				
				limit = this.lengths_[i];
				
				key = this.keys_[i];
				
				if ( pos >= limit && pos < limit+key.length ){
					
					this.lastItemPos_ = i;
					this.lastPos_ = limit;
					return key.get( pos - limit );
				}
				
			}
			
		}

	},

	set : function(pos){

		var res = this.get(pos);
		
		if ( res !== this.obj_[this.prop_] ){
			
			this.obj_[this.prop_] = res;
			
			if ( this.obj_.update !== false ){
				this.obj_.update = true;
			}
			
		}
		
	},
	
	addLinear : function(to,duration){
		
		var key = new KeyFrame( this.lastItem_, to, duration );
		this.keys_.push(key);
		this.lastItem_ = key;
		this.update = true;
		
	},
	
	addBezier : function(to,duration,inX,inY,outX,outY){
		
		var key = new KeyFrame( this.lastItem_, to, duration, inX, inY, outX, outY );
		this.keys_.push(key);
		this.lastItem_ = key;
		this.update = true;
		
	},
	
	addHold : function(to,duration){
		
		var key = new KeyFrame( null, to, duration );
		this.keys_.push(key);
		this.lastItem_ = key;
		this.update = true;
		
	}
	
};

externs['Keys'] = Keys;
