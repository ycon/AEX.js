
/*global define */

define([
    'geom/Vector',
    'geom/Quaternion',
    'path/Path',
    'animation',
    'graph'
], function(
    Vector,
    Quaternion,
    Path,
    animation,
    graph
) {

    var AnimatorStack = animation.AnimatorStack,
        Animator = animation.Animator;

    function build (data) {

        return buildItem(data.items[data.root], data.items);
    }

    function buildCompItem (item, items) {

        var comp = new graph.Composition(),
            item_animator = new AnimatorStack(comp),
            layers = item.layers,
            children = {},
            parents = {},
            key = "",
            i = 0,
            layer_data, animator;

        comp.width = item.width;
        comp.height = item.height;
        comp.color = item.color || "#000000";
        item_animator.duration = item.duration || 1;
        item_animator.frameRate = item.frameRate || 25;

        for ( ; i < layers.length; i += 1) {

            layer_data = layers[i];
            animator = null;

            switch (layer_data.type) {
            case 'Camera':
                animator = buildCameraLayer(layer_data);
                animator.layer.center.set(comp.width / 2, comp.height / 2);
                break;
            case 'Text':
                animator = buildTextLayer(layer_data);
                break;
            default:
                if (layer_data.source) {
                    animator = buildAVLayer(layer_data, items);
                }
                break;
            }

            if (animator) {
                if (layer_data.parent != null) {
                    if (!children[layer_data.parent]) {
                        children[layer_data.parent] = [];
                    }
                    children[layer_data.parent].push(animator.layer);
                }

                parents[layer_data.id] = animator.layer;
                item_animator.add(animator);

                if (animator.layer instanceof graph.Camera) {
                    comp.cameras.add(animator.layer);
                } else {
                    comp.layers.add(animator.layer);
                }
            }
        }

        for (key in children) {
            if (
                children.hasOwnProperty(key) &&
                Array.isArray(children[key]) &&
                parents.hasOwnProperty(key)
            ) {
                for (i = 0; i < children[key].length; i += 1) {
                    children[key][i].parent = parents[key];
                }
            }
        }
        return item_animator;
    }

    function buildSolidItem (data, items) {

        var solid = new graph.Solid(),
            item_animator = new AnimatorStack(solid);

        solid.width = data.width;
        solid.height = data.height;
        solid.color = data.color;

        return item_animator;
    }

    function buildItem (item, items) {
        switch (item.type) {
        case 'Composition':
            return buildCompItem(item, items);
        case 'Solid':
            return buildSolidItem(item, items);
        case 'Image':
            return buildImageItem(item, items);
        case 'Video':
            return buildVideoItem(item, items);
        }

    }

    function buildImageItem (item, items) {

    }

    function buildVideoItem (item, items) {

    }

    function buildAVLayer (data, items) {

        var item_animator = buildItem(items[data.source], items),
            layer = item_animator.item,
            animator = new Animator(layer, data.inPoint, data.outPoint);

        setLayerProperties(animator, data);

        animator.source = item_animator;
        animator.startTime = data.startTime || 0;
        animator.speed = data.speed || 1;

        return animator;
    }

    function buildCameraLayer (data) {

        var camera = new graph.Camera(),
            animator = new Animator(camera, data.inPoint, data.outPoint);

        camera.name = camera.name;
        camera.haveTarget = (data.autoOrient !== 'none' || data.autoOrient === 'target');

        setProp(camera, "position", animator, data.position);
        setProp(camera, "rotation", animator, data.rotation);
        setProp(camera, "orientation", animator, data.orientation);
        setProp(camera, "zoom", animator, data.zoom);

        if (camera.haveTarget) {
            setProp(camera, "target", animator, data.target);
        }

        return animator;
    }

    function buildTextLayer (data) {

        var text_layer = new graph.Text(),
            animator = new Animator(text_layer, data.inPoint, data.outPoint),
            props = [
                'text', 'textPosition', 'width',
                'height', 'textClass', 'fontFamily',
                'textColor', 'fontSize', 'lineHeight',
                'letterSpacing', 'textAlign', 'verticalAlign'
            ],
            i = 0,
            l = props.length;

        setLayerProperties(animator, data);

        for ( ; i < l; i += 1) {
            setProp(text_layer, props[i], animator, data[props[i]]);
        }

        return animator;

    }

    function setLayerProperties (animator, data) {

        var layer = animator.layer;

        layer.name = data.name;
        layer.is3D = data.is3D || false;

        if (data.collapse != null) {
            layer.collapse = (data.collapse === true);
        }

        if (data.masks) {
            setMasks(layer.masks, data.masks, animator);
        }

        setProp(layer, 'position', animator, data.position);
        setProp(layer, 'anchor', animator, data.anchor);
        setProp(layer, 'scale', animator, data.scale);
        setProp(layer, 'opacity', animator, data.opacity);

        if (layer.is3D) {
            setProp(layer, 'rotation', animator, data.rotation);
            setProp(layer, 'orientation', animator, data.orientation);
        } else {
            setProp(layer.rotation, 'z', animator, data.rotation);
        }
    }

    function setMasks (stack, data, animator) {
        var i = 0,
            l = data.length,
            mask_data,
            path_data,
            mask,
            a,
            y,
            y_l;


        for ( ; i < l; i += 1) {
            mask_data = data[i];

            if (mask_data.maskPath) {

                mask = new graph.Mask();

                mask.closed = mask_data.maskPath.closed || true;
                mask.inverted = mask_data.inverted || false;
                mask.blending = mask_data.maskMode || 'normal';

                setProp(mask, '', animator, mask_data.maskPath);
                setProp(mask, 'feather', animator, mask_data.maskFeather);
                setProp(mask, 'opacity', animator, mask_data.maskOpacity);
                setProp(mask, 'expansion', animator, mask_data.maskExpansion);

                stack.add(mask);

            }
        }
    }

    function buildPath (path_data, obj) {
        var i = 0,
            l = path_data.data.length,
            val;

        for ( ; i < l; i += 1) {
            val = path_data.data[i];
            obj.create(
                val[0],
                val[1],
                val[2] || 0,
                val[3] || 0,
                val[4] || 0,
                val[5] || 0
            );
        }

        if (path_data.closed){
            obj.closed = true;
        }

        return obj;
    }

    function setProp (obj, name, animator, value) {

        if (!value && value !== 0) {
            return;
        }
        var i, k, val, first_value, offset, is_hold, keys, key, is_object, is_array, is_spatial, is_vector, target = obj[name];

        if (Array.isArray(value)) {

            is_spatial = null;
            offset = 0;
            first_value = (Array.isArray(value[0]))
                          ? value[0][0]
                          : (typeof value[0] === 'object' && value[0].v)
                            ? value[0].v
                            : value[0];

            is_spatial = Vector.isVector(first_value);

            keys = (is_spatial)
                   ? new animation.SpatialKeys(obj, name)
                   : (typeof value[0] === 'object' && first_value.data)
                     ? new animation.PathKeys(obj)
                     : new animation.Keys(obj, name);

            for (i = 0; i < value.length; i += 1) {

                k = value[i];

                is_object = typeof k === 'object';
                is_array = Array.isArray(k);
                is_hold = (is_array || !is_object || (k.e && k.e.o === 0));
                val = (is_array) ? k[0] : (is_object && k.v != null) ? k.v : k;
                is_vector = Vector.isVector(val);

                if (is_vector) {
                    if (val.w !== undefined) {
                        val = new Quaternion(val.x, val.y, val.z, val.w);
                    } else {
                        val = new Vector(val.x, val.y, val.z);
                    }
                } else if (val.data) {
                    val = buildPath(val, new Path());
                }

                if (is_array) {
                    offset = k[1];
                } else if (is_object && k.d !== undefined) {
                    offset = k.d || 0;
                }

                key = keys.add(offset, val, is_hold);

                if (k.e && Array.isArray(k.e.i)) {
                    key.inX = k.e.i[0];
                    key.inY = k.e.i[1];
                }
                if (k.e && Array.isArray(k.e.o)) {
                    key.outX = k.e.o[0];
                    key.outY = k.e.o[1];
                }
                if (is_spatial && k.t) {
                    if (Array.isArray(k.t.i)) {
                        key.inTangent = new Vector(k.t.i[0], k.t.i[1], k.t.i[2]);
                    }
                    if (Array.isArray(k.t.o)) {
                        key.outTangent = new Vector(k.t.o[0], k.t.o[1], k.t.o[2]);
                    }
                    key.update = true;
                }
            }
            if (keys) {
                animator.add(keys);
            }
        } else {
            if (value.x != null && value.y != null) {
                setProp(target, 'x', animator, value.x);
                setProp(target, 'y', animator, value.y);
                if (value.z != null) {
                    setProp(target, 'z', animator, value.z);
                }
                if (value.w != null) {
                    setProp(target, 'w', animator, value.w);
                }
            } else if (value.data){
                buildPath(value, obj);
            } else {
                obj[name] = value;
            }
        }
    }

    return {
        build: build
    };
});
