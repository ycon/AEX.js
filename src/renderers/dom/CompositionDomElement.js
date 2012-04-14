
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

	var t = this, e, sig = comp.layers.on;

	LayerDomElement.call( t, comp );

	/** @type Composition */
	t.composition = comp;

	t.collapse = null;
	t.zoom = 1333.33;
	t.width = 0;
	t.height = 0;


	/** @type Array.<Layer> */
	t.layers = [];

	comp.layers.each( function( lyr ) {

		e = _Composition_generate( lyr );
		t.holder.appendChild( e.element );
		t.layers.push( e );
	} );

	sig.add.add( _Composition_add, t );
	sig.remove.add( _Composition_remove, t );
	sig.swap.add( _Composition_swap, t );
};

CompositionDomElement.prototype = new LayerDomElement( null );
CompositionDomElement.prototype.constructor = CompositionDomElement;

CompositionDomElement.prototype.tagName = 'composition';

CompositionDomElement.prototype.render = function( camera_mat, camera_zoom, opt_camera ) {

	    LayerDomElement.prototype.render.call( this, camera_mat, camera_zoom );

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
	
	   	if ( this.collapse !== model.collapse ) {

		    if ( model.collapse ) {

			    style[TRANSFORM_STYLE] = 'preserve-3d';
			    style[PERSPECTIVE] = undefined;
			    style[PERSPECTIVE_ORIGIN] = undefined;
			    style.clip = undefined;
			    style.overflow = undefined;
			    
		    } else {

		    	this.width = null;
		    	this.height = null;
		    	this.zoom = null;

			    style[TRANSFORM_STYLE] = 'flat';

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
			    style.clip = "rect(0px," +this.width + "px," + this.height + ",0px)"
			    style[PERSPECTIVE_ORIGIN] = ( this.width / 2 ).toString() + 'px '
			    							+ ( this.height / 2 ).toString() + 'px';
		    }

		    if ( this.zoom !== cam_zoom ) {

		    	this.zoom = cam_zoom;
			    style[PERSPECTIVE] = this.zoom.toString() + 'px';
		    }
	    }
	    
	    for ( i = 0; i < l; i++ ) {

		    layer = layers[i];

		    if ( layer.visible !== layer.model.visible ) {
			    layer.setVisible( layer.model.visible );
		    }

		    if ( layer.visible ) {
			    layer.render( cam_mat, cam_zoom );
		    }

	    }

    };

CompositionDomElement.prototype.modifyCollapse = function( mat, zoom ) {

	return mat;

};
