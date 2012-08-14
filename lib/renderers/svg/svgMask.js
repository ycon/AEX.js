
/*jshint
    undef:true
    curly:true
    browser: true
    laxbreak: true
    eqnull: true
    white: true
*/
/*global
    define
*/

define([
    './svgUtils'
], function (
    utils
) {

    var svg_mask_counter = 0;


    function updateMask(node, mask, is_first, scale, bounds, defs) {

        var is_first_sub = (mask.blending === 'subtract') && is_first,
            to_invert = (is_first_sub) ? !mask.inverted : mask.inverted,
            expansion = mask.expansion * (to_invert ? -1 : 1),
            feather = mask.feather,
            filter = node.filter,
            path_node = node.path,
            is_sub = (mask.blending === 'subtract' && !is_first),
            fill_color = (to_invert)
                            ? 'black'
                            : (is_sub)
                                ? 'black'
                                : 'white',
            inv_mask;

        if (to_invert) {
            if (!node.invMask) {

                inv_mask = node.invMask = defs.create('mask', {
                    id: path_node.id + "_mask"
                });

                node.invMaskBG = inv_mask.create('path', {}, {

                    fill: 'white',
                    strokeLinejoin: 'round',
                    stroke: 'white',
                    strokeWidth: '0px',
                    fillRulle: 'evenodd'

                });

                node.invMaskPath = inv_mask.create('path', {}, {

                    fill: 'black',
                    strokeLinejoin: 'round',
                    stroke: 'black',
                    strokeWidth: '0px',
                    fillRulle: 'evenodd'

                });


                node.style.mask = 'url(#' + path_node.id + '_mask)';
            }
            path_node = node.invMaskPath;

            node.style.fill = is_sub ? 'white' : 'black';
            utils.rect(node.path, bounds);
            utils.rect(node.invMaskBG, bounds);

        } else if (node.invMask) {
            node.style.mask = '';
            //TODO: Remove mask when de remove inversion
        }

        utils.path(path_node, mask, to_invert);

        node.style.opacity = mask.opacity;
        path_node.style.fill = fill_color;

        if (expansion !== 0) {
            path_node.style.strokeWidth = Math.abs(expansion * 2) + 'px';
            path_node.style.stroke = (expansion > 0 !== (fill_color === 'white')) ? 'white' : 'black';
        } else {
            path_node.style.strokeWidth = 0;
        }

        if (feather.x || feather.y) {

            path_node.style.filter = 'url(#' + filter.id + ')';

            filter.blur.stdDeviationX.baseVal = feather.x / 2;
            filter.blur.stdDeviationY.baseVal = feather.y / 2;
            //filter.x.baseVal.newValueSpecifiedUnits(5, -300);
        } else {
            path_node.style.filter = '';
        }

    }

    function renderMask(root, masks, scale, bounds) {

        var mask_node  = root.maskNode,
            defs       = root.defs,
            svg_masks  = mask_node.masks,
            l          = masks.getLength(),
            i          = svg_masks.length,
            is_first = true,
            mask_layer, mask, path, filter, blend, feather, expansion;


        if (i !== l) {

            if (i < l) {

                for (; i < l; i += 1) {
                    
                    svg_masks.push(
                        mask_layer = mask_node.create('g')
                    );

                    mask_layer.create('rect', {
                        width: bounds.width,
                        height: bounds.height,
                        fill: 'black'
                    });

                    mask_layer.path = mask_layer.create('path', {
                        id: mask_node.id + '_' + i + '_shape'
                    }, {
                        fill: 'white',
                        strokeLinejoin: 'round',
                        stroke: 'white',
                        strokeWidth: '0px',
                        fillRulle: 'evenodd'

                    });
                    filter = defs.create('filter', {
                        id: mask_node.id + '_' + i + '_filter'
                    });
                    filter.blur = filter.create('feGaussianBlur', {
                        'in': 'SourceGraphic'
                    });
                    mask_layer.filter = filter;


                }
            } else {
                for (; i >= l; i -= 1) {
                    //TODO: Remove mask
                }
            }

            //children = mask_node.childNodes;
            //l = children.length;
        }

        i = 0;
        l = svg_masks.length;


        if (masks.get(i).blending === 'subtract') {

            if (! root.first_rect) {

                root.first_rect = mask_node.insertBefore(
                    utils.create('rect', {
                        width: bounds.width,
                        height: bounds.height,
                        fill: 'black'
                    }),
                    mask_node.firstChild
                );
            }

        } else if (root.first_rect) {
            mask_node.removeChild(root.first_rect);
            root.first_rect = false;
        }



        for (; i < l; i += 1) {

            mask_layer = svg_masks[i];
            path = mask_layer.path;
            filter = mask_layer.filter;
            feather = mask.feather;
            expansion = mask.expansion;
            mask = masks.get(i);


            utils.path(path, mask);

            mask_layer.style.opacity = mask.opacity;

            if (expansion !== 0) {
                path.style.strokeWidth = Math.abs(expansion * 2) + 'px';
                path.style.stroke = (expansion > 0) ? 'white' : 'black';
            } else {
                path.style.strokeWidth = 0;
            }

            if (feather.x || feather.y) {

                path.style.filter = 'url(#' + filter.id + ')';

                filter.blur.stdDeviationX.baseVal = feather.x / 2;
                filter.blur.stdDeviationY.baseVal = feather.y / 2;
                //filter.x.baseVal.newValueSpecifiedUnits(5, -300);
            } else {
                path.style.filter = '';
            }

            mask_layer.filter = 'url(#' +
                (mask.blending === 'subtract')
                    ? (mask.inverted)
                        ? 'invsub'
                        : 'sub'
                    : (mask.inverted)
                        ? 'inv'
                        : 'norm'
                + ')';

        }


    }

    function setMask(element) {

        var mask_name = 'svg_mask_' + (svg_mask_counter += 1),
            svg_node = utils.create('svg', {height: 0}),
            svg_defs = svg_node.create('defs'),
            svg_mask = svg_node.create('mask', {
                id: mask_name
            });

        svg_node.defs = svg_defs;
        svg_node.maskNode = svg_mask;
        svg_node.masks = [];
        element.appendChild(svg_node);
        element.firstChild.style.mask = 'url(#' + mask_name + ")";

        return svg_node;
    }

    function removeMask(element, root) {


    }

    return {
        render: renderMask,
        set: setMask,
        remove: removeMask
    };
});
