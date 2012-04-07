global = this;
var document = {
		createElement : function(obj){
			
		}
};

var window = {
		document : document
};

var round = function(number,rounding){
	return Math.floor(number/rounding)*rounding;
};