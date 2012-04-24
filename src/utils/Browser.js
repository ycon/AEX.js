
var upProperty = function(val) {
	return val.charAt(0).toUpperCase() + val.substr(1);
};

var getVendorProperty = function(val) {

	var result = [ val ], i = 0, l = vendors.length;

	val = upProperty(val);

	for (; i < l; i += 1) {
		result.push(vendors[i] + val);
	}

	return result;
};

var vendors = 'Webkit Moz O ms Khtml'.split(' ');

var Browser = {

	TRANSFORM: 'Transform',
	TRANSFORM_STYLE: 'transformStyle',
	PERSPECTIVE: 'perspective',
	ORIGIN: 'perspectiveOrigin'

};

Browser.haveTransform = (function() {

	var element = document.createElement('div'),
		props = getVendorProperty(this.TRANSFORM),
		i = 0,
		l = props.length;

	if (element) {
		for (; i < l; i += 1) {

			if (i && element.style[props[i]] !== undefined) {

				this.TRANSFORM = vendors[i - 1] + upProperty(this.TRANSFORM);
				return true;
			}
		}
	}

	return false;

}.call(Browser));

Browser.have3DTransform = (function() {

	var element = document.createElement('div'),
		props = getVendorProperty(this.PERSPECTIVE),
		i = 0,
		l = props.length,
		vendor;

	if (element) {
		for (; i < l; i += 1) {
			if (i && element.style[props[i]] !== undefined) {
				
				vendor = vendors[i-1];
				
				this.PERSPECTIVE = vendor + upProperty(this.PERSPECTIVE);
				this.ORIGIN = vendor + upProperty(this.ORIGIN);
				this.TRANSFORM_STYLE = vendor + upProperty(this.TRANSFORM_STYLE);
				return true;

			}
		}
	}

	return false;

}.call(Browser));

externs.Browser = Browser;