
/** @this {CompositionDomElement} */
var _Composition_add = function( layer, pos ) {

	var e = _Composition_generate( layer );
	this.holder.appendChild( e.element );
	this.layers.splice( pos, 0, e );



};

/** @this {CompositionDomElement} */
var _Composition_remove = function( layer, pos ) {

	var e = this.layers[pos];
	this.holder.removeChild( e.element );
	this.layers.splice( pos, 1 );


};

/** @this {CompositionDomElement} */
var _Composition_swap = function( pos_1, pos_2 ) {

	var e = this.layers[pos_1];
	this.layers[pos_1] = this.layers[pos_2];
	this.layers[pos_2] = e;

};

/**
 * 
 * @this {CompositionDomElement}
 * @param {Layer}
 *            obj
 * @returns {LayerDomElement}
 * 
 */
var _Composition_generate = function( obj ) {

	if ( obj instanceof Composition ) {
		return new CompositionDomElement( obj );
	} else if ( obj instanceof Solid ) {
		return new SolidDomElement( obj );
	} else if ( obj instanceof Text ) {
		return new TextDomElement( obj );
	} else {
		return new LayerDomElement( obj );
	}
	;

};

/**
 * @constructor
 * @param {Composition}
 *            layer
 */
var CompositionDomElement = function( comp ) {

	var e,
		sig = comp.layers.on;

	LayerDomElement.call( this, comp );

	/** @type Composition */
	this.composition = comp;

	this.collapse = null;
	this.zoom = 1333.33;
	this.width = 0;
	this.height = 0;
	this.origin = new Vector(0, 0);


	/** @type Array.<Layer> */
	this.layers = [];
	
	var self = this;

	comp.layers.each( function( lyr ) {

		e = _Composition_generate( lyr );
		self.holder.appendChild( e.element );
		self.layers.push( e );
	} );

	sig.add.add( _Composition_add, this );
	sig.remove.add( _Composition_remove, this );
	sig.swap.add( _Composition_swap, this );
};

CompositionDomElement.prototype = new LayerDomElement( null );
CompositionDomElement.prototype.constructor = CompositionDomElement;

CompositionDomElement.prototype.tagName = 'composition';

CompositionDomElement.prototype.render = function( camera_mat, camera_zoom, origin, opt_camera ) {

	    LayerDomElement.prototype.render.call( this, camera_mat, camera_zoom, origin );

	    var layers = this.layers,
	    	l = this.layers.length,
	    	model = this.model,
	    	style = this.element.style,
	    	i,
	    	camera = (
	    		opt_camera 
	    		|| ( !model.collapse )
					? this.composition.getCamera()
				    : null
			),
	        cam_mat = ( camera ) 
	        	? camera.getCameraMatrix() 
	        	: null,
	        cam_zoom = ( camera )
	        	? camera.zoom
	        	: 1333.33,
	        layer;
	
	    
	    if ( camera ) {
	    	this.origin.copy(camera.center);
	    } else {
	    	this.origin.set(model.width/2,model.height/2);
	    }
	        	
	        	
	   	if ( this.collapse !== model.collapse ) {

		    if ( model.collapse ) {

			    style[Browser.TRANSFORM_STYLE] = 'preserve-3d';
			    style[Browser.PERSPECTIVE] = "";
			    style[Browser.PERSPECTIVE_ORIGIN] = "";
			    style.clip = "";
			    style.overflow = "";
			    
		    } else {

		    	this.width = null;
		    	this.height = null;
		    	this.zoom = null;

			    style[Browser.TRANSFORM_STYLE] = 'flat';

		    }

		    this.collapse = model.collapse;
	    }
	    
	    if ( !this.collapse ) {

		    if ( this.width !== model.width || this.heigh !== model.height ) {

		    	this.width = model.width;
		    	this.height = model.height;
			    style.width = this.width.toString() + 'px';
			    style.height = this.height.toString() + 'px';
			    style.overflow = 'hidden';
			    style.clip = "rect(0px , " +this.width + "px, " + this.height + "px, 0px)";
			    style[Browser.PERSPECTIVE_ORIGIN] = ( this.origin.x ).toString() + 'px '
			    							+ ( this.origin.y ).toString() + 'px';
		    }

		    if ( this.zoom !== cam_zoom ) {

		    	this.zoom = cam_zoom;
			    style[Browser.PERSPECTIVE] = this.zoom.toString() + 'px';
		    }
	    }
	    
	    for ( i = 0; i < l; i++ ) {

		    layer = layers[i];

		    if ( layer.visible !== layer.model.visible ) {
			    layer.setVisible( layer.model.visible );
		    }
		    
		    if ( layer.visible ) {
			    layer.render( cam_mat , this.zoom, this.origin );
		    }

	    }

    };

CompositionDomElement.prototype.modifyCollapse = function( mat, zoom ) {

	return mat;

};
