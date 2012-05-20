
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


    function updateMask(node, mask, is_first) {

        var is_first_sub = (mask.blending === 'subtract') && is_first,
            to_invert = (is_first_sub) ? !mask.inverted : mask.inverted,
            expansion = mask.expansion * (to_invert ? -1 : 1);

        utils.path(node.pathNode, mask, to_invert);
        node.style.opacity = mask.opacity;



        if (expansion > 0) {

            node.style.strokeWidth = (expansion * 2) + 'px';
        } else {
            node.style.strokeWidth = 0;
        }
    }

    function renderMask(root, masks, scale, bounds) {

        var mask_node  = root.maskNode,
            children   = mask_node.childNodes,
            l          = masks.getLength(),
            i          = children.length,
            to_add     = i < l,
            is_first = true,
            group;


        if (i !== l) {
            if (to_add) {
                for (; i < l; i += 1) {
                    group = mask_node.create('g', {
                    }, {
                        'fill': 'white',
                        'stroke-linejoin': 'round',
                        'stroke': 'white',
                        'strokeWidth': '0px',
                        'fillRulle': 'evenodd'
                    });
                    group.pathNode = group.create('path', {
                        id: mask_node.id + '_' + i + '_shape'
                    });

                }
            } else {
                for (; i >= l; i -= 1) {
                    //remove mask
                }
            }

            children = mask_node.childNodes;
            l = children.length;
        }

        i = 0;

        for (; i < l; i += 1) {
            updateMask(children[i], masks.get(i), is_first);
            is_first = false;
        }


    }

    function setMask(element) {

        var mask_name = 'svg_mask_' + (svg_mask_counter += 1),
            svg_node = utils.create('svg', {height: 0}),
            svg_mask = svg_node.create('mask', {
                id: mask_name
            });

        svg_node.maskNode = svg_mask;
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
