
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


    function updateMask(node, mask) {

        utils.path(node.pathNode, mask, mask.inverted);
        node.style.opacity = mask.opacity;

        if (mask.expansion > 0) {

            node.style.strokeWidth = (mask.expansion * 2) + 'px';
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
            big_number = 90000,
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
            updateMask(children[i], masks.get(i));
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
