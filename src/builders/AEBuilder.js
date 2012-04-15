var AEBuilder = {

    build : function( data ) {

	    return this.buildItem( data.items[data.root], data.items );

    },

    buildCompItem : function( item, items ) {

	    var comp = new Composition(),
	    	item_animator = new AnimatorStack( comp ),
	    	layers = item.layers,
	    	children = {},
	    	parents = {},
	    	i, key, layer_data, animator;

	    comp.width = item.width;
	    comp.height = item.height;
	    comp.color = item.color || "#000000";
	    item_animator.duration = item.duration || 1;
	    item_animator.frameRate = item.frameRate || 25;


	    for ( i = 0; i < layers.length; i++ ) {

		    layer_data = layers[i];
		    animator = null;

		    switch ( layer_data.type ) {
		    case 'Camera':
			    animator = this.buildCameraLayer( layer_data );
			    animator.layer.center.set(comp.width/2, comp.height/2);
			    
			    break;
		    case 'Text':
			    animator = this.buildTextLayer( layer_data );
			    break;
		    default:
			    if ( layer_data.source ) {
				    animator = this.buildAVLayer( layer_data, items );
			    }
			    break;
		    }

		    if ( animator ) {
		    	
		    	if (layer_data.parent != null){
		    		
		    		if ( !children[layer_data.parent] ){
		    			children[layer_data.parent] = [];
		    		}
		    		
		    		children[layer_data.parent].push(animator.layer);
		    		
		    	}
		    	
		    	parents[layer_data.id] = animator.layer;
		    	
		    	item_animator.add( animator );
			    
			    if (animator.layer instanceof Camera){
			    	comp.cameras.add(animator.layer);
			    } else {
			    	comp.layers.add(animator.layer);
			    }
		    }
	    }

	    
	    for ( key in children ) {
	    	
	        if ( 
	        		children.hasOwnProperty(key) 
	        		&& Array.isArray(children[key]) 
	        		&& parents.hasOwnProperty(key)
	        	){
	        	
	        	for ( i = 0; i < children[key].length; i++) {
	                
	        		children[key][i].parent = parents[key];
	        		
                }
	        }
	    	
        }
	    
	    
	    return item_animator;
    },

    buildSolidItem : function( data, items ) {

	    var solid = new Solid(),
	    	item_animator = new AnimatorStack( solid );

	    solid.width = data.width;
	    solid.height = data.height;
	    solid.color = data.color;

	    return item_animator;

    },

    buildItem : function( item, items ) {

	    switch ( item.type ) {
	    case 'Composition':
		    return this.buildCompItem( item, items );
		    break;
	    case 'Solid':
		    return this.buildSolidItem( item, items );
		    break;
	    case 'Image':
		    return this.buildImageItem( item, items );
		    break;
	    case 'Video':
		    return this.buildVideoItem( item, items );
		    break;
	    }

    },

    buildImageItem : function( item, items ) {

    },

    buildVideoItem : function( item, items ) {

    },
    
    buildAVLayer : function( data, items ) {

	    var item_animator = this.buildItem( items[data.source], items ),
	    	layer = item_animator.item,
	    	animator = new Animator( layer, data.inPoint, data.outPoint );

	    this.setLayerProperties( animator, data );

	    animator.source = item_animator;
	    animator.startTime = data.startTime || 0;
	    animator.speed = data.speed || 1;

	    return animator;
    },

    buildCameraLayer : function( data ) {
    	var camera = new Camera(),
			animator = new Animator( camera, data.inPoint, data.outPoint );

    	camera.name = camera.name;
    	camera.haveTarget =  ( data.autoOrient !== 'none' || data.autoOrient === 'target' );
    	
    	this.setProp( camera, "position", animator, data.position );
		this.setProp( camera, "rotation", animator, data.rotation );
		this.setProp( camera, "orientation", animator, data.orientation );
		this.setProp( camera, "zoom", animator, data.zoom );
		    
		if (camera.haveTarget){
			this.setProp( camera, "target", animator, data.target );
		}

    	return animator;
    },

    buildTextLayer : function( data ) {
    	
    	var text_layer = new Text(),
    		animator = new Animator( text_layer, data.inPoint, data.outPoint ),
    		i = 0,
    		props = [
    		     'text',
    		     'textPosition',
    		     'width',
    		     'height',
    		     'textClass',
    		     'fontFamily',
    		     'textColor',
    		     'fontSize',
    		     'lineHeight',
    		     'letterSpacing',
    		     'textAlign',
    		     'verticalAlign'
    		],
    		l = props.length;
    	
    	this.setLayerProperties( animator, data );
    	
    	for ( ; i < l; i += 1 ) {
	        this.setProp( text_layer, props[i], animator, data[props[i]] );
        }
    	
    	
    	return animator;
    	
    },

    setLayerProperties : function( animator, data ) {
    	
    	/** @type Layer */
	    var layer = animator.layer;

	    layer.name = data.name;
	    layer.is3D = data.is3D || false;
	    
	    if (data.collapse != null){
	    	layer.collapse = (data.collapse === true);
	    }
	    
		this.setProp( layer, "position", animator, data.position );
		this.setProp( layer, "anchor", animator, data.anchor );
		this.setProp( layer, "scale", animator, data.scale );
		this.setProp( layer, "opacity", animator, data.opacity );

	    if ( layer.is3D ) {
		    this.setProp( layer, "rotation", animator, data.rotation );
		    this.setProp( layer, "orientation", animator, data.orientation );
	    } else {
		    this.setProp( layer.rotation, "z", animator, data.rotation );
	    }

    },

    setProp : function( obj, name, animator, value ) {

	    if ( !value && value !== 0 ) {
		    return;
	    }

	    var i,
	    	k,
	    	val,
	    	offset,
	    	is_hold,
	    	keys,
	    	key,
	    	is_object,
	    	is_array,
	    	is_spatial,
	    	is_vector,
	    	target = obj[name];

	    if ( Array.isArray( value ) ) {

		    is_spatial = null;
		    offset = 0;

		    for ( i = 0; i < value.length; i++ ) {

			    k = value[i];

			    is_object = typeof k === 'object';
			    is_array = Array.isArray( k );
			    is_hold = ( is_array || !is_object || ( k.e && k.e.o === 0 ) );
			    val = ( is_array )
			    			? k[0] 
			    			: ( is_object && k.v != null ) 
			    				? k.v
			    				: k;
			    is_vector = Vector.isVector( val );

			    if ( is_vector ) {
				    if ( val.w !== undefined ) {
					    val = new Quaternion( val.x, val.y, val.z, val.w );
				    } else {
					    val = new Vector( val.x, val.y, val.z );
				    }
			    }

			    if ( is_spatial === null ) {

				    is_spatial = is_vector;

				    if ( is_spatial ) {
					    keys = new SpatialKeys( obj, name );
				    } else {
					    keys = new Keys( obj, name );
				    }
			    }

			    if ( is_array ) {
				    offset = k[1];
			    } else if ( is_object && k.d !== undefined ) {

				    offset = k.d || 0;
			    }

			    key = keys.add( offset, val, is_hold );

			    if ( k.e && Array.isArray( k.e.i ) ) {
				    key.inX = k.e.i[0];
				    key.inY = k.e.i[1];
			    }
			    if ( k.e && Array.isArray( k.e.o ) ) {
				    key.outX = k.e.o[0];
				    key.outY = k.e.o[1];
			    }

			    if ( is_spatial && k.t ) {
				    if ( Array.isArray( k.t.i ) ) {
					    key.inTangent = new Vector( k.t.i[0], k.t.i[1],
					        k.t.i[2] );
				    }
				    if ( Array.isArray( k.t.o ) ) {
					    key.outTangent = new Vector( k.t.o[0], k.t.o[1],
					        k.t.o[2] );
				    }
				    key.update = true;
			    }

		    }

		    if ( keys ) {
			    animator.add( keys );
		    }

	    } else {

		    if ( value.x != null && value.y != null ) {

		    	this.setProp( target, 'x', animator, value.x );
				this.setProp( target, 'y', animator, value.y );

				if ( value.z != null ) {
					this.setProp( target, 'z', animator, value.z );
				}
				
				if ( value.w != null ) {
					this.setProp( target, 'w', animator, value.w );
				}

		    } else {
			    obj[name] = value;
		    }

	    }

    }

};

externs["AEBuilder"] = AEBuilder;
