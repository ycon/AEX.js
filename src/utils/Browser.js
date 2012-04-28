
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
	ORIGIN: 'perspectiveOrigin',
	
	getLocalBound : function(element, opt_deep){
		
		var left = 0,
			right = 0,
			top = 0,
			bottom = 0,
			children = element.childNodes,
			l = children.length,
			i = 0,
			min = Math.min,
			max = Math.max,
			zoom = 1,
			child, c_children, c_child, c_l, c_i;

		
		for ( ; i < l; i += 1) {
			
			child = children[0];
			
			if (child.nodeType === 1 && child.childNodes.length) {
				
				zoom = parseFloat(child.style.zoom) || 1;
				
				c_children = child.childNodes;
				c_l = c_children.length;
				
				for ( c_i = 0; c_i < c_l; c_i += 1) {
					
					c_child = c_children[c_i];
					
					left = min(c_child.offsetLeft * zoom, left);
					top = min(c_child.offsetTop * zoom, top);
					right = max((c_child.offsetWidth + c_child.offsetLeft) * zoom, right);
					bottom = max((c_child.offsetHeight + c_child.offsetTop) * zoom, bottom);
					
				}
				
			} else {
				
				left = min(child.offsetLeft, left);
				top = min(child.offsetTop, top);
				right = max(child.offsetWidth + child.offsetLeft, right);
				bottom = max(child.offsetHeight + child.offsetTop, bottom);
				
			}
			
		}
		
		return {
			x: left,
			y: top,
			width: right - left,
			height: bottom - top
		};
	}
	
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


Browser.haveIEFilter = (function() {

	var element = document.createElement('div');

	if (element && element.style.filter !== undefined) {
		
		element.style.width = element.style.height = '100px';
		element.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')";
		
		return element.onfilterchange !== undefined;
		
	}

	return false;

}.call(Browser));

externs.Browser = Browser;