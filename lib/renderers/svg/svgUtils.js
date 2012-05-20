
/*global define*/

define (function () {


    function draw (seq_path, inAnchor, outAnchor) {

        seq_path.x1 = inAnchor.x + inAnchor.outVector.x;
        seq_path.y1 = inAnchor.y + inAnchor.outVector.y;
        seq_path.x2 = outAnchor.x + outAnchor.inVector.x;
        seq_path.y2 = outAnchor.y + outAnchor.inVector.y;

        seq_path.x = outAnchor.x;
        seq_path.y = outAnchor.y;

    }

    function setPath (node, path, invert) {


        var seq_list = node.pathSegList,
            l = path.getLength(),
            i = 1,
            big_number = 10000,
            move = 'createSVGPathSegMovetoAbs',
            line = 'createSVGPathSegLinetoAbs',
            curve = 'createSVGPathSegCurvetoCubicAbs',
            padding = (invert ? 5 : 0),
            patch, prev_anchor, item, anchor;

        if (!l) {
            return;
        }

        if (l + (path.closed ? 1 : 0) + padding !== seq_list.numberOfItems) {

            console.log("remove");
            seq_list.clear();

            if (invert) {
                seq_list.appendItem(node[move](-big_number, -big_number));
                seq_list.appendItem(node[line](big_number, -big_number));
                seq_list.appendItem(node[line](big_number, big_number));
                seq_list.appendItem(node[line](-big_number, big_number));
                seq_list.appendItem(node[line](-big_number, -big_number));
            }

            seq_list.appendItem(node[move](0, 0));

            for (; i < l; i += 1) {
                seq_list.appendItem(node[curve](0, 0, 0, 0, 0, 0));
            }

            if (path.closed) {
                seq_list.appendItem(node[curve](0, 0, 0, 0, 0, 0));
            }

        }

        i = 1;

        item = seq_list.getItem(padding);

        prev_anchor = path.get(0);

        item.x = prev_anchor.x;
        item.y = prev_anchor.y;

        for (; i < l; i += 1) {
            anchor = path.get(i);
            draw(seq_list.getItem(i + padding), prev_anchor, anchor);
            prev_anchor = anchor;
        }

        if (path.closed) {
            draw(seq_list.getItem(i + padding), prev_anchor, path.get(0));
        }

    }

    function create (type, opt_attr, opt_style) {

        var elem = document.createElementNS("http://www.w3.org/2000/svg", type),
            key;

        if (opt_attr) {
            for (key in opt_attr) {
                if (opt_attr.hasOwnProperty(key)) {
                    elem.setAttribute(key, String(opt_attr[key]));
                }
            }
        }

        if (opt_style) {
            for (key in opt_style) {
                if (opt_style.hasOwnProperty(key)) {
                    elem.style[key] = opt_style[key];
                }
            }
        }

        if (this.appendChild) {
            this.appendChild(elem);
        }

        elem.create = create;

        return elem;
    }

    return {
        create: create,
        path: setPath
    };

});
