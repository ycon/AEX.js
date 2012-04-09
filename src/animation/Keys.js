


var Keys = function(target,property){

	this.target = target;
	this.property = property;
	
	this.keys_ = [];
	this.length_ = 0;
};

Keys.prototype = {
	
	constructor : Keys,
	
	length : function(){
		
		var keys = this.keys_,
			key,i,l,pos;
		
		if (this.update){
			
			l = keys.length;
			pos = 0;
			
			for ( i = 0; i < l; i++) {
				key = keys[i];
				pos += key.offset;
				key.position_ = pos;
				if (key.update && key.path && (key.inTangent || key.outTangent)){
					this.path = null;
					key.update = false;
				}
			}
			
			this.length_ = pos;
			this.update = false;
		}

		return this.length_;
	},
	
	num : function(){
		return this.keys_.length;
	},
	
	indexAt : function(pos){
		
		var keys = this.keys_,
			i = this.prevIndex_ || 0,
			iterator = (pos >= (this.prevPosition_||0)) ? 1 : -1;
		
		this.length();
		this.prevPosition_ = pos;
		
		if (pos <= keys[0].position_) {
			this.prevIndex_ = 0;
			return this.prevIndex_;
		} else if (pos >= keys[keys.length-1].position_) {
			this.prevIndex_ = keys.length-1;
			return this.prevIndex_;
		} else {
			
			key_loop: while (keys[i]){
				
				if ( pos >= keys[i].position_ && (!keys[i+1] || pos < keys[i+1].position_) ){
					
					this.prevIndex_ = i;
					this.prevPosition_ = pos;
					return this.prevIndex_;
					
					break key_loop;
				}
				
				i += iterator;
			}
		}

		this.prevIndex_ = 0;
		return this.prevIndex_;
	},
	
	get : function(pos){
		
		var index = this.indexAt(pos),
			key = this.keys_[index],
			next_key, i;
		
		if ( (index === 0 && pos <= key.offset) || index >= this.num()-1 || key.isHold){
			return key.value;
		} else {
			next_key = this.keys_[index+1];
			
			i = (pos-key.position_)/next_key.offset;
			
			if (key.outX || key.outY || next_key.inX || next_key.inY){
				
				i = BezierEasing.ease(key.outX, key.outY, next_key.inX, next_key.inY, i);
				
			}
			
			return this.interpolate(key,next_key,i);
		}
	},
	
	interpolate: function(key, next_key, pos){
		return key.value + (next_key.value - key.value) * pos;
	},
	
	set: function(pos){
		var res = this.get(pos);
		if (this.target[this.property] !== res){
			this.target[this.property] = res;
		};
	},
	
	add : function(offset,val,is_hold){
		
		var key = new KeyFrame(offset, val, is_hold);
		
		this.length_ += offset;
		key.position_ = this.length_;
		this.keys_.push(key);
		
		return key;
		
	}

	
};

externs['Keys'] = Keys;
