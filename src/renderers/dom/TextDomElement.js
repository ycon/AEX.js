
var checkDifference = function(source,target){
	var res = false,
		s_prop,
		t_prop;
	
	for ( var i in target) {
		
		if (target.hasOwnProperty(i)){
			s_prop = source[i];
			t_prop = target[i];
			if (s_prop !== t_prop && (typeof s_prop !== 'object' || s_prop === null)){
				
				res = true;
				target[i] = s_prop;

			} else if (s_prop != null && s_prop.clone && s_prop.equals){
				if (!s_prop.equals(t_prop)){
					res = true;
					target[i] = s_prop.clone();
				}
			}
		}
	}
	
	return res;
};


/**
 * @constructor
 */
var TextDomElement = function(layer){

	this.text = layer;
	this.offsetMatrix_ = new Matrix();
	
	LayerDomElement.call(this,layer);
	
	
	this.oldText = {
		text : null,
		textClass : null,
		fontFamily : null,
		textColor : null,
		fontSize : null,
		lineHeight : null,
		letterSpacing : null,
		textAlign : null,
		verticalAlign : null,
		width : null,
		height : null
	};
	
};

TextDomElement.prototype = new LayerDomElement(null);
TextDomElement.prototype.constructor = SolidDomElement;

TextDomElement.prototype.tagName = 'text';

TextDomElement.prototype.render = function(camera_mat,camera_zoom){

	if (checkDifference(this.text,this.oldText)){
		
		var holder = this.holder,
			style = this.holder.style,
			text = this.text,
			size = text.fontSize,
			maxResize = 6,
			maxHeight = text.height,
			offset = (size * text.leading) - size;
			i = 0;
		
		style.width = text.width + 'px';
		style.color = text.textColor;
		style.textAlign = text.textAlign;
		style.fontFamily = text.fontFamily;
		style.fontSize = text.fontSize + 'px';
		style.lineHeight = text.lineHeight + 'em';
		
		var t_node = document.createTextNode(text.text);
		
		if (this.textNode){
			
			holder.replaceChild(t_node,this.textNode);
			
		} else {
			
			holder.appendChild(t_node);
			
		}
		
		this.textNode = t_node;
		
		offset = (size * text.lineHeight) - size;
		while (i <= maxResize && (holder.offsetHeight - offset) >= maxHeight) {
			size = size * 0.92;
			offset = (size * text.lineHeight) - size;
			style.fontSize = size + 'px';
			i++;
		}
		
		this.offsetY = (text.textPosition.y - (offset / 2));
		var dif = (maxHeight - (holder.offsetHeight - (offset / 2)));
		
		switch (text.verticalAlign) {
			case 'bottom':
				this.offsetY += dif;
				break;
			case 'middle':
				this.offsetY += dif / 2;
				break;
			default:
				break;
		}
		
	}
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
};


TextDomElement.prototype.modifyMatrix = function(mat){
	
	mat.preMultiply(
		this.offsetMatrix_.translation(
			this.text.textPosition.x,
			this.offsetY,
			0
		)
	);
	return mat;
};
