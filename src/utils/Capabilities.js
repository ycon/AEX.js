

var TRANSFORM = 'WebkitTransform';
var TRANSFORM_STYLE = 'WebkitTransformStyle';
var PERSPECTIVE = 'WebkitPerspective';
var PERSPECTIVE_ORIGIN = 'WebkitPerspectiveOrigin';
var BGCOLOUR = 'BackgroundColour';
var VENDORS = 'Webkit Moz O ms Khtml'.split(' ');


var upProperty = function(val){
	return val.charAt(0).toUpperCase() + val.substr(1);
};

var getVendorProperty = function(val){
	
	var result = [val],
		i = 0,
		l = VENDORS.length;
	
	val = upProperty(val);
	
	for ( ; i < l; i += 1 ) {
        result.push(VENDORS[i]+val);
    }
	
	return result;
};

var Browser = {
	
	
	
	TRANSFORM: 'Transform',
	TRANSFORM_STYLE: 'transformStyle',
	PERSPECTIVE: 'perspective',
	PERSPECTIVE_ORIGIN: 'perspectiveOrigin',
	
	
};

Browser.haveTransform = (function(){
	
	var element = document.createElement('div'),
		props = getVendorProperty(this.TRANSFORM),
		i = 0,
		l = props.length;

	for ( ; i < l; i += 1 ) {

	    if ( element.style[props[i]] !== undefined ){
	    	if (i){
	    		this.TRANSFORM = VENDORS[i-1] + upProperty(this.TRANSFORM);
	    	}
	    	return true;
	    }
	}
	return false;
	
}).call(Browser);

Browser.have3DTransform = (function(){
	
	var element = document.createElement('div'),
		props = getVendorProperty(this.PERSPECTIVE),
		i = 0,
		l = props.length,
		vendor;
	
	for ( ; i < l; i += 1 ) {
        if ( element.style[props[i]] !== undefined ){
        	if (i){
        		vendor = VENDORS[i-1];
        		this.PERSPECTIVE = vendor + upProperty(this.PERSPECTIVE);
        		this.PERSPECTIVE_ORIGIN = vendor + upProperty(this.PERSPECTIVE_ORIGIN);
        		this.TRANSFORM_STYLE = vendor + upProperty(this.TRANSFORM_STYLE);
        	}
        	return true;
        }
    }
	return false;
	
}).call(Browser),




externs['Browser'] = Browser;
