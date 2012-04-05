
var BlendingModes = {
		
	getString : function(val){

		switch(val){

			case BlendingMode.ADD:
				return "add";
				break;
			case BlendingMode.COLOR_BURN:
				return "subtract";
				break;
			case BlendingMode.DARKEN:
				return "darken";
				break;
			case BlendingMode.DIFFERENCE:
				return "difference";
				break;
			case BlendingMode.HARD_LIGHT:
				return "hardlight";
				break;
			case BlendingMode.LIGHTEN:
				return "lighten";
				break;
			case BlendingMode.LINEAR_LIGHT:
				return "hardlight";
				break;
			case BlendingMode.MULTIPLY:
				return "multiply";
				break;
			case BlendingMode.NORMAL:
				return "normal";
				break;
			case BlendingMode.OVERLAY:
				return "overlay";
				break;
			case BlendingMode.SCREEN:
				return "screen";
				break;
			case BlendingMode.SILHOUETE_ALPHA:
				return "erase";
				break;
			case BlendingMode.STENCIL_ALPHA:
				return "alpha";
				break;
			default:
				return "normal";
			break;
		}
	},

	getMaskString : function(val){

		switch(val){
			case MaskMode.NONE:
				return 'none';
				break;
			case MaskMode.ADD:
				return 'add';
				break;
			case MaskMode.SUBTRACT:
				return 'subtract';
				break;
			case MaskMode.INTERSECT:
				return 'intersect';
				break;
			case MaskMode.LIGHTEN:
				return 'lighten';
				break;
			case MaskMode.DARKEN:
				return 'darken';
				break;
			case MaskMode.DIFFERENCE:
				return 'difference';
				break;
			default:
				return 'add';
		}
	}
};