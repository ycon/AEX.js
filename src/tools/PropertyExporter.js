
var PropertyExporter = {
		
	getProperty : function( prop, project, options ){
		
		var keys = [],
			y,
			i,
			key,
			ease,
			ease_length,
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


		if (	prop.isTimeVarying 
				&& (options.bake || prop.expressionEnabled) 
				&& prop.propertyValueType !== PropertyValueType.MARKER
				&& prop.propertyValueType !== PropertyValueType.TEXT_DOCUMENT ) {
			
			var layer = prop.propertyGroup(prop.propertyDepth);
			var dur = layer.containingComp.frameDuration;
			var val = [];
			var old_val = val;
			
			
			
			for (i = layer.inPoint; i <= layer.outPoint; i+=dur) {
				
				val = this.getSimpleProperty(prop, prop.valueAtTime(i, true), options);
				
				if (JSON.stringify(val) !== JSON.stringify(old_val)){
					
					time = i-old_time;
					
					if (!keys.length){
						keys.push([val,time]);
					} else if (time === old_time_dif) {
						keys.push(val);
					} else {
						keys.push([val,time]);
					}

					old_time = i;
					old_time_dif = time;
					old_val = val;
				}
				
				
			}

			
			return keys;
			
		} else if (prop.isTimeVarying) {

			
			for (i = 1; i <= prop.numKeys; i++ ) {
				
				key = [this.getSimpleProperty(prop, prop.keyValue(i), options)];
				
				time = prop.keyTime(i)-old_time;
				key.push(time);
				
				in_type = prop.keyInInterpolationType(i);
				out_type = prop.keyOutInterpolationType(i);
				
				/*
				 * 
				 * 
				 * 
				
				
				key: {
					v:value,
					d:duration,
					e:{
						i:[0,0],
						o:[0,0]
					}
					t:{
						i:[0,0],
						o:[0,0]
					}
				}
				
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
					
					if (i > 1){
						ease_length = this.getEaseLength(prop, i-1, i);
					} else {
						ease_length = null;
					}
					
					ease = ease.concat(this.getEaseData(prop.keyInTemporalEase(i),true,ease_length));
				}
				
				if ( type%3 === 0 ) {
					
					if (i < prop.numKeys){
						ease_length = this.getEaseLength(prop, i, i+1);
					} else {
						ease_length = null;
					}
					
					ease = ease.concat(this.getEaseData(prop.keyOutTemporalEase(i),false,ease_length));
				}
				
				key.push(type);
				
				if ( ease.length ){
					key.push(ease);
				}
				
				if (	prop.propertyValueType === PropertyValueType.TwoD_SPATIAL
						|| prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL){

					in_anchor = prop.keyInSpatialTangent(i);
					out_anchor = prop.keyOutSpatialTangent(i);
					anchors = [];
					
					for ( y = 0; y < in_anchor.length; y++) {
						anchors.push(round(in_anchor[y],0.01));
					}
					
					for ( y = 0; y < out_anchor.length; y++) {
						anchors.push(round(out_anchor[y],0.01));
					}
					
					if (anchors != old_anchors){
						key.push(anchors);
					}

				} else {
					anchors = undefined;
				}
				
				if (key.length === 4 && ease.join(',') === old_ease.join(',')) {
					key.pop();
				}
				
				if (key.length === 3 && type === old_type) {
					key.pop();
				}
				
				if (key.length === 2 && time === old_time_dif) {
					key.pop();
				}
				
				old_anchors = anchors;
				old_type = type;
				old_time_dif = time;
				old_time += old_time_dif;
				old_ease = ease;
				
				if (keys.length && !key.length) {
					keys.push(key[0]);
				} else {
					keys.push(key);
				}
				
			}
			
			return keys;
			
		} else {
			return this.getSimpleProperty(prop, prop.valueAtTime(0, true), options);
		}

	},
	
	getEaseData : function(data, to_invert, lengths){
		
		var result = [],
			x = 0,
			y = 0;
		
		for ( var i = 0; i < data.length; i++) {
			
			x = data[i].influence /100;
			y = data[i].speed * x;
			
			if (lengths){
				y = (data[i].speed * x)/lengths[i];
			}
			
			if (to_invert){
				x = 1-x;
				y = 1-y;
			}
			
			result.push( round(x,0.001), round(y,0.001) );
			
		}
		
		return result;
	},
	
	getEaseLength : function (prop,key,next_key){
		
		var result = [],
			ae = global.AE,
			i,
			p_1,c_1,c_2,p_2;
		
		start_val = prop.keyValue(key);
		end_val = prop.keyValue(next_key);
		
		if (prop.propertyValueType === PropertyValueType.OneD){
			start_val = [start_val];
			end_val = [end_val];
		}

		if (	prop.propertyValueType === PropertyValueType.TwoD_SPATIAL
				|| prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL){
			
			p_1 = new ae.Vector( start_val[0], start_val[1], start_val[2] );
			c_1 = prop.keyOutSpatialTangent(key);
			c_2 = prop.keyInSpatialTangent(next_key);
			p_2 = new ae.Vector( end_val[0], end_val[1], end_val[2] );
			
			result.push(new ae.CubicCurve(
					p_1,
					new ae.Vector(c_1[0],c_1[1],c_1[2]).add(p_1),
					new ae.Vector(c_2[0],c_2[1],c_2[2]).add(p_2),
					p_2
			).length());
			
		} else if (prop.propertyValueType === PropertyValueType.SHAPE){
			result.push(1);
		} else {
			for ( i = 0; i < start_val.length; i++) {
				result.push( end_val[i] - start_val[i] );
			}
		}
		
		return result;
	},
	
	getSimpleProperty : function( prop, value, options){
		
		var divider = (prop.unitsText === "percent") ? 100 : 1;
		var presision = 0.01/divider;
		
        switch (prop.propertyValueType){
        	case PropertyValueType.MARKER:
        		return this.getMarker(value);
        		break;
	        case PropertyValueType.SHAPE:
	        	return this.getShape(value);
	        	break;
	        case PropertyValueType.TEXT_DOCUMENT:
	        	return this.getText(value, prop, options);
	            break;
	        case PropertyValueType.OneD:
            	return round(value/divider,presision);
            	break;
	        case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
            	return [
            	        round(value[0]/divider,presision),
            	        round(value[1]/divider,presision)
            	       ];
            	break;
            case PropertyValueType.ThreeD_SPATIAL:
            case PropertyValueType.ThreeD:
            	return [
            	        round(value[0]/divider,presision),
            	        round(value[1]/divider,presision),
            	        round(value[2]/divider,presision)
            	       ];
            	break;
	        default :
	        	return null;
	    }
        
	},
	
	getMarker : function(val){
		
		var obj = {
			comment: val.comment,
			duration: val.duration
		};
		
		if (val.chapter){
			obj.chapter = val.chapter;
		}
		
		if (val.cuePointName){
			obj.name = val.cuePointName;
		}
		
		if (val.eventCuePoint){
			obj.event = val.eventCuePoint;
		}
		
		if (val.url){
			obj.url = val.url;
		}
		
		if (val.frameTarget){
			obj.target = val.frameTarget;
		}
		
		var params = val.getParameters();
		
		if (params){
			obj.params = params;
		}
		
		return obj;
	},
	
	getShape : function(val){
		
		var obj = {
			
		};
		
		if (!val.closed){
			obj.closed = false;
		}
		
		var data = [];
		var v,in_data,out_data;
		
		for ( var i = 0; i < val.vertices.length; i++) {
			
			v = val.vertices[i];
			in_data = val.inTangents[i];
			out_data = val.outTangents[i];
			
			if (in_data[0] || in_data[1] || out_data[0] || out_data[1]){
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01),
				           round(in_data[0],0.01),
				           round(in_data[1],0.01),
				           round(out_data[0],0.01),
				           round(out_data[1],0.01)
				           ]);
			} else {
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01)
				           ]);
			}
		}
		
		obj.data = data;
		
		return obj;
	},

	getText : function(val, prop, options){
		
		var obj = {
			text: val.text,
			font: val.font,
			fontSize: val.fontSize,
			color: ProjectExporter.getColor(val.fillColor)
		};
		
		if (options.valign && options.valign !== 'top'){
			obj.valign = options.valign;
		}
		
		if (val.justification === ParagraphJustification.RIGHT_JUSTIFY) {
			obj.align = 'right';
		} else if (val.justification !== ParagraphJustification.CENTER_JUSTIFY) {
			obj.align = 'center';
		}

		if (val.tracking){
			obj.tracking = val.tracking;
		}
		
		if (options.leading){
			obj.leading = options.leading;
		}
		
		if (val.isParaText){
			obj.width = val.boxTextSize[0];
			obj.height = val.boxTextSize[1];
		}
		
		return obj;
	}
};