
/** @constructor */
var Rectangle = function(_x,_y,_width,_height){
	
	this.x = _x || 0;
	this.y = _y || 0;
	this.width = _width || 100;
	this.height = _height || 100;
	
};



Rectangle.prototype = {
		
		constructor : Rectangle,
		
		clone : function(){
			return new Rectangle(this.x,this.y,this.width,this.height);
		},
		
		compare : function(obj){
			
			if (obj === null) return false;
			
			if (	obj.x !== this.x
				 || obj.y !== this.y 
				 || obj.width !== this.width 
				 || obj.height !== this.height
			){
				return false;
			}
			return true;
		}
};
