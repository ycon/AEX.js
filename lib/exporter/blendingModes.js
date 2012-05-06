
/*global define BlendingMode MaskMode*/

define(function () {

    return  {

        getString : function(val){

            switch(val){
            case BlendingMode.ADD:
                return "add";
            case BlendingMode.COLOR_BURN:
                return "subtract";
            case BlendingMode.DARKEN:
                return "darken";
            case BlendingMode.DIFFERENCE:
                return "difference";
            case BlendingMode.HARD_LIGHT:
                return "hardlight";
            case BlendingMode.LIGHTEN:
                return "lighten";
            case BlendingMode.LINEAR_LIGHT:
                return "hardlight";
            case BlendingMode.MULTIPLY:
                return "multiply";
            case BlendingMode.NORMAL:
                return "normal";
            case BlendingMode.OVERLAY:
                return "overlay";
            case BlendingMode.SCREEN:
                return "screen";
            case BlendingMode.SILHOUETE_ALPHA:
                return "erase";
            case BlendingMode.STENCIL_ALPHA:
                return "alpha";
            default:
                return "normal";
            }
        },

        getMaskString : function(val){

            switch(val){
            case MaskMode.NONE:
                return 'none';
            case MaskMode.ADD:
                return 'add';
            case MaskMode.SUBTRACT:
                return 'subtract';
            case MaskMode.INTERSECT:
                return 'intersect';
            case MaskMode.LIGHTEN:
                return 'lighten';
            case MaskMode.DARKEN:
                return 'darken';
            case MaskMode.DIFFERENCE:
                return 'difference';
            default:
                return 'add';
            }
        }
    };
});
