

/** @this {CompositionDomElement} */
var _Composition_add = function(layer,pos){
	
	var e = _Composition_generate(layer);
	this.holder.appendChild(e.element);
	this.layers.splice(pos,0,e);
	
	
	
};

/** @this {CompositionDomElement} */
var _Composition_remove = function(layer,pos){
	
	var e = this.layers[pos];
	this.holder.removeChild(e.element);
	this.layers.splice(pos,1);
	
	
};

/** @this {CompositionDomElement} */
var _Composition_swap = function(pos_1,pos_2){
	
	var e = this.layers[pos_1];
	this.layers[pos_1] = this.layers[pos_2];
	this.layers[pos_2] = e;
	
};

/** 
 * 
 * @this {CompositionDomElement}
 * @param {Layer} obj
 * @returns {LayerDomElement}
 * 
 * */
var _Composition_generate = function(obj){
	
	if (obj instanceof Composition){
		return new CompositionDomElement(obj);
	} else if (obj instanceof Solid){
		return new SolidDomElement(obj);
	} else if (obj instanceof Text){
		return new TextDomElement(obj);
	} else {
		return new LayerDomElement(obj);
	};
	
};

/**
 * @constructor
 * @param {Composition} layer
 */
var CompositionDomElement = function(comp){

	var t = this,
		e,
		sig = comp.layers.on;

	LayerDomElement.call(t,comp);

	/** @type Composition */
	t.composition = comp;
	
	t.collapse = null;
	t.zoom = 1333.33;
	t.width = 0;
	t.height = 0;
	
	
	/** @type Array.<Layer> */
	t.layers = [];
	
	comp.layers.each(function(lyr){
		e = _Composition_generate(lyr);
		t.holder.appendChild(e.element);
		t.layers.push(e);
	});

	sig.add.add(_Composition_add,t);
	sig.remove.add(_Composition_remove,t);
	sig.swap.add(_Composition_swap,t);
};

CompositionDomElement.prototype = new LayerDomElement(null);
CompositionDomElement.prototype.constructor = CompositionDomElement;

CompositionDomElement.prototype.tagName = 'composition';

CompositionDomElement.prototype.render = function(camera_mat,camera_zoom,opt_camera){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var t = this,
		layers = t.layers,
		l = t.layers.length,
		model = t.model,
		style = t.element.style,
		i,
		camera = (opt_camera || (!model.collapse) ? t.composition.getCamera() : null),				
		cam_mat = (camera) ? camera.getCameraMatrix() : null,
		cam_zoom = (camera) ? camera.zoom : 1333.33,
		layer;
		
	if (t.collapse !== model.collapse){
		
		if (model.collapse){
			
			style[TRANSFORM_STYLE] = 'preserve-3d';
			style[PERSPECTIVE] = undefined;
			style[PERSPECTIVE_ORIGIN] = undefined;
			style.clip = undefined;
		} else {
			
			t.width = null;
			t.height = null;
			t.zoom = null;
			
			style[TRANSFORM_STYLE] = 'flat';
			
		}
		
		t.collapse = model.collapse;
	}
	
	
	
	if (!t.collapse){
		
		if (t.width !== model.width || t.heigh !== model.height){
			
			t.width = model.width;
			t.height = model.height;
			style.width = t.width.toString()+'px';
			style.height = t.height.toString()+'px';
			style.clip = "rect(0px,"+t.width+"px,"+t.height+",0px)"
			style[PERSPECTIVE_ORIGIN] = (t.width/2).toString()+'px '+(t.height/2).toString()+'px';
		}
		
		
		if (t.zoom !== cam_zoom){
			
			t.zoom = cam_zoom;
			style[PERSPECTIVE] = t.zoom.toString()+'px';
		}
	}
	

	for ( i = 0; i < l; i++) {
		
		layer = layers[i];
		
		if (layer.visible !== layer.model.visible){
			layer.setVisible(layer.model.visible);
		}
		
		if (layer.visible){
			layer.render(cam_mat,cam_zoom);
		}
		
	}
	
};

CompositionDomElement.prototype.modifyCollapse = function(mat,zoom){
	
	return mat;
	
};

