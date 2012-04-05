
var PropertyExporter = {
		
	getProperty : function( prop, project, options ){
		
		/*
		var keys = [[value,time,type,ease,path]];
		var val = [[value,time]];
		var val = [value];
		var val = value;
		var val = [[0],0,0];
		var val = [0,0,0];
		
		var val = ["L",0,0,"C",100,100,100,100,100,100,100,100,100,100,100,100];

		*/
		
		if (prop.isTimeVarying){
			
			var keys = [],
				y,
				key,
				ease,
				time,
				in_type,
				out_type,
				type,
				in_anchor,
				out_anchor,
				anchors,
				bezier_type = KeyframeInterpolationType.BEZIER,
				linear_type = KeyframeInterpolationType.LINEAR,
				old_type = 1,
				old_time = 0,
				old_time_dif = 0,
				old_ease = [],
				old_anchors = [];
			
			for ( var i = 1; i <= prop.numKeys; i++ ) {
				

				key = [this.getSimpleProperty( prop, prop.keyValue(i) )];
				
				time = prop.keyTime(i)-old_time;
				key.push(time);
				
				in_type = prop.keyInInterpolationType(i);
				out_type = prop.keyInInterpolationType(i);
				
				/*
				
				key :	[ value, time, ease, anchors ]
						[ value, time, ease ]
						[ value, time ]
						value
				
				types:
				
				1 = holdIn + holdOut
				2 = holdIn + linearOut
				3 = holdIn + bezierOut
				4 = linearIn + holdOut
				5 = linearIn + linearOut
				6 = linearIn + bezierOut
				7 = bezierIn + holdOut
				8 = bezierIn + linearOut
				9 = bezierIn + bezierOut
				
				*/
				
				type = 1;
				
				if (out_type === linear_type){
					type = 2;
				} else if (out_type === bezier_type){
					type = 3;
				}
				
				if (in_type === linear_type){
					type += 3;
				} else if (in_type === bezier_type){
					type += 6;
				}
				
				ease = [];
				
				if ( type > 6 ){
					ease = ease.concat(this.getEaseData( prop.keyInTemporalEase(i) ));
				}
				
				if ( type%3 === 0 ){
					ease = ease.concat(this.getEaseData( prop.keyOutTemporalEase(i) ));
				}
				
				key.push(type);
				
				if ( ease.length && ease.join(',') !== old_ease.join(',') ){
					key.push(ease);
				}
				
				old_ease = ease;
				
				if (prop.isSpatial){

					in_anchor = prop.keyInSpatialTangent(i);
					out_anchor = prop.keyOutSpatialTangent(i);
					anchors = [];
					
					for ( y = 0; y < in_anchor.length; i++) {
						anchors.push(in_anchor[y]);
					}
					
					for ( y = 0; y < out_anchor.length; i++) {
						anchors.push(out_anchor[y]);
					}
					
					if (anchors != old_anchors){
						key.push(anchors);
					}

				} else {
					anchors = undefined;
				}
				
				old_anchors = anchors;
				
				
				if (key.length == 3 && type === old_type) {
					key.pop();
				}
				
				old_type = type;
				
				if (key.length === 2 && time === old_time_dif) {
					key.pop();
				}
				
				old_time_dif = time;
				old_time += old_time_dif;
				
				if (keys.length && !key.length) {
					keys.push(key[0]);
				} else {
					keys.push(key);
				}
				
			}
			
			return keys;
			
		} else {
			return this.getSimpleProperty( prop, prop.valueAtTime( 0, true ) );
		}

	},
	
	getEaseData : function(data,dif){
		
		var result = [];
		
		for ( var i = 0; i < data.length; i++) {
			
			result.push( data[i].speed * (data[i].influence /100), data[i].influence /100 );
			
		}
		
		return result;
	},
	
	getKeySpeed : function (prop,key,nextKey){
		
		startVal = prop.keyValue(key);
		
		endVal = prop.keyValue(nextKey);
		
		var result = [];
		
		if (prop.propertyValueType === PropertyValueType.ThreeD){
			startVal = [startVal];
			endVal = [endVal];
		}
		
		switch (prop.propertyValueType){
		case PropertyValueType.TwoD_SPATIAL:
        case PropertyValueType.TwoD:
        case PropertyValueType.ThreeD_SPATIAL:
        case PropertyValueType.ThreeD:
        	
        	break;
        default:
		
		}
		
	},
	
	getSimpleProperty : function( prop, value){
		
		var divider = (prop.unitsText === "percent") ? 100 : 1;
		
        switch (prop.propertyValueType){
        	case PropertyValueType.MARKER:
        		return this.getMarker(value);
	        case PropertyValueType.SHAPE:
	        	return this.getShape(value);
	        case PropertyValueType.TEXT_DOCUMENT:
	        	return this.getText(value);
	            break;
	        case PropertyValueType.OneD:
            	return value/divider;
            	break;
	        case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
            	return [value[0]/divider,value[1]/divider];
            	break;
	        default :
	        	
	        	return [value[0]/divider,value[1]/divider,value[2]/divider];
	    }
        
	},
	
	getMarker : function(val){
		return "marker";
	},
	
	getShape : function(val){
		return "shape";
	},

	getText : function(val){
		return "text";
	},
};