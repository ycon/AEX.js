
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
		
	},
	
	cleanTextLayer : function(result, layer, project, options){
		
		result.type = "Text";
		
		if (layer.Masks.numProperties >= 1){
			
			result.text.bounds = this.getMaskBounds(layer.Masks.property(1));
			
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
		
		result.width = (max_x-result.x).toFixed(2);
		result.height = (max_y-result.y).toFixed(2);
		result.x = result.x.toFixed(2);
		result.y = result.y.toFixed(2);

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
	        	//$.write(layer.Transform["Point of Interest"].active);
	        	result.transform.target = result.transform.pointofInterest;
	        	delete result.transform.pointofInterest;
	        }

	        delete result.transform.opacity;
	        
	        if (result.cameraOptions){
	            result.transform.zoom = result.cameraOptions.zoom;
	        }
	    }
	    delete result.cameraOptions;
	},
	
	reduceProperty : function (prop){
		if (isArray(prop)){
			for (var i = 0; i < prop.length; i++) {
				delete prop[i].v.z;
				if (prop.t){
					prop[i].t.i.pop();
					prop[i].t.o.pop();
				}
			}
		} else {
			delete prop.z;
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
	}
};