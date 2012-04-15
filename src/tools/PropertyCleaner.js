
var PropertyCleaner = {
	
	cleanAVLayer : function( result, layer , project ){
		
		var i,mask,mask_res;

		for( i = 1; i <= layer.Masks.numProperties; i++ ){
			
			mask_res = result.masks[i-1];
			mask = layer.Masks.property(i);
			
			mask_res.maskMode = BlendingModes.getMaskString(mask.maskMode);
			mask_res.inverted = mask.inverted;
			delete mask_res.type;

		}
		
		
		delete result.layerStyles;
		
		if ( ProjectExporter.canParseProperty( layer.property("Layer Styles"), true ) ){
			
			result.layerStyles =  ProjectExporter.getProperties( layer.property("Layer Styles"), project, true, options );
			result.layerStyles.blendingOptions = ProjectExporter.getProperties( layer.property("Layer Styles").property("Blending Options"), project, false, options );
			
		}

		if ( result.effects ){
			
	        for( i = 0; i < result.effects.length; i++ ){
	        	
	            result.effects[i].type = result.effects[i].type.replace("aDBE","");
	            
	        }
	    }
		
		result.transform.anchor = result.transform.anchorPoint;
		delete result.transform.anchorPoint;
		
		if (result.is3D){
			
			
			
			this.cleanRotation(result.transform);
			
			if (result.transform.orientation){
				result.transform.orientation = this.transformOrientation(result.transform.orientation);
			}
			
			delete result.materialOptions;
			
			delete result.transform.xPosition;
			delete result.transform.yPosition;
			delete result.transform.zPosition;
			
		} else {
			
			result.transform.rotation = result.transform.zRotation;
			delete result.transform.xRotation;
			delete result.transform.yRotation;
			delete result.transform.orientation;
			
			
			if ( result.transform.scale ){
				delete result.transform.scale.z;
			}
			
			this.reduceProperty(result.transform.anchor);
			this.reduceProperty(result.transform.position);
			
			delete result.transform.xPosition;
			delete result.transform.yPosition;
			
		}
		
		this.mixin(result,result.transform);
	    delete result.transform;
		
	},
	
	cleanTextLayer : function(result, layer, project, options){
		
		result.type = "Text";
		
		var key;
		var txt = this.separateTextProperties(result.text.sourceText);
		
		
		this.mixin(result, result.text.pathOptions);
		this.mixin(result, result.text.moreOptions);
		this.mixin(result, this.separateTextProperties(result.text.sourceText));
		
		
		
		
		if (layer.Masks.numProperties >= 1){
			
			var bounds = this.getMaskBounds(layer.Masks.property(1));
			result.textPosition = {x:bounds.x,y:bounds.y};
			result.width = bounds.width;
			result.height = bounds.height;
			
		}

	},
	
	getMaskBounds : function(m_obj){
		
		var v  = m_obj.maskShape.value.vertices,
			max_x = -1000000000000000000,
			max_y = -1000000000000000000,
			result = {};
		
		result.x = 1000000000000000000;
		result.y = 1000000000000000000;
		
		for(var i=0;i<v.length;i++){
			
			result.x = Math.min(result.x,v[i][0]);
			result.y = Math.min(result.y,v[i][1]);
			max_x = Math.max(max_x,v[i][0]);
			max_y = Math.max(max_y,v[i][1]);
			
		}
		
		result.width = parseFloat((max_x-result.x).toFixed(2));
		result.height = parseFloat((max_y-result.y).toFixed(2));
		result.x = parseFloat(result.x.toFixed(2));
		result.y = parseFloat(result.y.toFixed(2));

		return result;
	},
	
	cleanCameraLayer : function( result, layer , project ){
		result.type = "Camera";

	    if (result.transform){
	        //delete result.transform.xPosition;
	        //delete result.transform.yPosition;
	        //delete result.transform.zPosition;
	    	
	    	this.cleanRotation(result.transform);
	        
	    	
	    	
	        if (result.transform.pointofInterest){
	        	result.transform.target = result.transform.pointofInterest;
	        	delete result.transform.pointofInterest;
	        }

	        delete result.transform.opacity;
	        
	        if (result.cameraOptions){
	            result.transform.zoom = result.cameraOptions.zoom;
	        }
	    }
	    delete result.cameraOptions;
	    
	    this.mixin(result,result.transform);
	    delete result.transform;
	},
	
	reduceProperty : function (prop){
		
		var k,
			ae = global.AE;
		
		if (isArray(prop)){
			for (var i = 0; i < prop.length; i++) {
				k = prop[i];
				if (isArray(k)){
					delete k[0].z;
				} else if (ae.Vector.isVector(k)){
					delete k.z;
				} else {
					delete k.v.z;
					if (k.t){
						if (k.t.i){
							k.t.i.pop();
						}
						if (k.t.o){
							k.t.o.pop();
						}
					}
				}
			}
		} else {
			delete prop.z;
		}
	},
	
	separateTextProperties: function( obj ) {
		if ( isArray( obj ) ) {
			
			var result = {},
				offsets = {},
				text_obj,
				prev_text_obj,
				i = 0,
				l = obj.length,
				current_time = 0,
				old_offset = 0,
				offset = 0,
				key;
			
			for ( ; i < l; i += 1 ) {
				text_obj = ( isArray(obj[i]) ) ? obj[i][0] : obj[i];
				offset = ( isArray(obj[i]) ) ? obj[i][1] : old_offset;
				current_time += offset;
				old_offset = offset;
				
				for ( key in text_obj ) {
					
					prev_text_obj = ( isArray( result[key] ) )
					        			? result[key][result[key].length-1][0]
					        			: result[key];
					
	                if ( text_obj.hasOwnProperty( key ) && ( text_obj[key] !== prev_text_obj ) ) {
	                	
	                	if ( result.hasOwnProperty( key ) ) {
	                		
	                		if (!isArray( result[key] ) ){
	                			result[key] = [ [ result[key], offsets[key] ] ];
	                		}
	                		
	                		result[key].push([ text_obj[key], current_time - offsets[key] ]);
	                		offsets[key] = current_time;
	                		
	                	} else {
	                		result[key] = text_obj[key];
	                		offsets[key] = current_time;
	                	}
	                }
                }
            }
			
			return result;
			
		} else {
			return obj;
		}
	},
	
	transformOrientation: function( obj ) {
		
		var res,
			ae = global.AE;
		
		if (isArray(obj)){
			
			res = [];
			
			for (var i = 0; i < obj.length; i++) {
				k = obj[i];
				if (isArray(k)){
					res.push([new ae.Quaternion().setFromEuler(k[0]), k[1]]);
				} else if (ae.Vector.isVector(k)){
					res.push(new ae.Quaternion().setFromEuler(k));
				} else {
					
					res.push({
						v: new ae.Quaternion().setFromEuler(k.v),
						d: k.d,
						e : k.e
					});
				}
			}
			return res;
		} else {
			return new ae.Quaternion().setFromEuler(obj);
		}
		
		
	},
	
	cleanRotation : function( obj ) {
		
		obj.rotation = {
			x:obj.xRotation || 0,
		    y:obj.yRotation || 0,
		    z:obj.zRotation || 0
		};
		
		delete obj.xRotation;
		delete obj.yRotation;
		delete obj.zRotation;
	},
	
	mixin : function(target, source, safe) {

		if (typeof source === 'object'){
			for ( var key in source ) {
		        
				if (source.hasOwnProperty(key) && !(target.hasOwnProperty(key) && safe) ){
						target[key] = source[key];
				}
	        }
		}
	},
	rename : function(obj,oldName,newName){
		
		if ( obj.hasOwnProperty(oldName) ){
			obj[newName] = obj[oldName];
			delete obj[oldName];
		}
	}
};
