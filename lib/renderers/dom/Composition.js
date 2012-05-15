
/*global define */

define([
    'geom/Matrix2D',
    'geom/Matrix',
    'geom/Rectangle',
    'utils/browser',
    './Solid',
    './Text',
    '../canvas/maskUtils'
], function(
    Matrix2D,
    Matrix,
    Rectangle,
    browser,
    Solid,
    Text,
    maskUtils
) {

    var m2D = new Matrix2D();

    var maskCounter = 0;


    function haveActiveMasks (masks) {

        var i, l, mask;

        if (masks == null) {
             return false;
        }

        l = masks.getLength();
        if (l) {
           for (i = 0; i < l; i += 1) {
                mask = masks.get(i);
                if (mask && mask.blending !== 'none' && mask.getLength() && mask.closed){
                    return true;
                }
            }
        } else {
            return false;
        }
        return false;
    }

    function add (layer, pos) {

        var e       = generate.call(this,layer),
            elem    = this.element,
            children;

        if (e) {
            //TODO test DOM layer insertion properly
            if(elem.hasChildNodes() || pos < 0) {
                children = elem.childNodes();
                elem.insertBefore(e.element,children[children.length-pos-1]);
            } else {
                elem.appendChild(e.element);
            }
            this.layers.splice(pos, 0, e);
        }
    }

    function remove (layer, pos) {

        var e = this.layers[pos];

        this.element.removeChild(e.element);
        this.layers.splice(pos, 1);
    }

    function swap (pos_1, pos_2) {

        var e = this.layers[pos_1];

        this.layers[pos_1] = this.layers[pos_2];
        this.layers[pos_2] = e;
    }

    function generate (model) {

        var element = document.createElement('layer'),
            result  = {
                model: model,
                element: element,
                mask: null,
                scale: 1,
                opacity: 1
            },
            handler = null;

        switch (model.type) {
        case 'composition':
            handler = new Composition(model);
            break;
        case 'text':
            handler = new Text(model);
            break;
        case 'solid':
            handler = new Solid(model);
            break;
        }

        if (handler && handler.element) {
            element.appendChild(handler.element);
            result.content = handler.element;
            result.handler = handler;
            result.bounds = new Rectangle(0,0,model.width,model.height);
        }

        return result;
    }

    function Composition (model) {

        var sig  = model.layers.on,
            self = this,
            e;

        this.model    = model;
        this.element  = document.createElement('composition');
        this.collapse = null;
        this.zoom     = 0;
        this.centerX  = 0;
        this.centerY  = 0;
        this.width    = 0;
        this.height   = 0;
        this.layers   = [];

        model.layers.each(function(layer) {
            e = generate.call(self, layer);
            if (e) {
                if(self.element.firstChild){
                    self.element.insertBefore(e.element,self.element.firstChild);
                } else {
                    self.element.appendChild(e.element);
                }
                self.layers.push(e);
            }
        });

        sig.add.add(add, this);
        sig.remove.add(remove, this);
        sig.swap.add(swap, this);

        this.matrix_     = new Matrix();
        this.matrix2D_   = new Matrix();
        this.tempMatrix_ = new Matrix();
    }

    Composition.prototype = {

        constructor: Composition,

        render: function(bounds, opt_camera, opt_parent, opt_parent_2D) {

            var layers  = this.layers,
                l       = this.layers.length,
                i       = 0,
                model   = this.model,
                style   = this.element.style,
                camera  = (opt_camera)
                          ? opt_camera
                          : model.getCamera(),
                cam_mat = camera.getCameraMatrix();

            if (this.collapse !== model.collapse) {

                this.collapse = model.collapse;

                if (this.collapse) {
                    this.element.removeAttribute('style');
                } else {
                    this.width = this.height = this.zoom = null;
                }

            }

            if (this.width !== model.width || this.height !== model.height) {

                this.width   = model.width;
                this.height  = model.height;
                style.width  = this.width.toFixed(4) + 'px';
                style.height = this.height.toFixed(4) + 'px';

                if (!this.collapse) {
                    style.clip = "rect(0px, " + this.width + "px, " + this.height + "px, 0px)";
                }
            }

            if (!this.collapse){

                if (this.zoom !== camera.zoom) {
                    this.zoom = camera.zoom;
                    if (browser.have3DTransform){
                        style[browser.PERSPECTIVE] = this.zoom.toString() + 'px';
                    }
                }

                if (this.centerX !== camera.center.x || this.centerY !== camera.center.y) {

                    this.centerX = camera.center.x;
                    this.centerY = camera.center.y;
                    if (browser.have3DTransform){
                        style[browser.ORIGIN] = this.centerX.toString() + 'px ' +
                                                this.centerY.toString() + 'px';
                    }
                }
            }

            for ( ; i < l; i += 1) {

                this.renderLayer(layers[i], camera, cam_mat, opt_parent, opt_parent_2D);
            }

            if (bounds) {
                bounds.x = 0;
                bounds.y = 0;
                bounds.width = model.width;
                bounds.height = model.height;
            }

            return bounds;
        },

        renderLayer: function(layer, camera, cam_mat, opt_parent, opt_parent_2D) {

            var model   = layer.model,
                element = layer.element,
                handler = layer.handler,
                content = layer.content,
                style   = element.style,
                is3D    = model.is3D,
                mat,
                mat_2D,
                mask_canvas,
                mask_name,
                className;

            if (layer.visible !== model.visible) {
                layer.visible = model.visible;
                style.display = (layer.visible) ? 'block' : 'none';
            }

            if (layer.visible && handler && content) {

                mat = this.matrix_.injectMatrix(model.getMatrix());

                if (opt_parent && is3D){
                    mat.multiply(opt_parent);
                } else if (opt_parent_2D && !is3D) {
                    mat.multiply(opt_parent_2D);
                }

                if (model.collapse !== layer.collapse) {

                    layer.collapse = model.collapse;
                    className = (model.collapse)
                                ? 'collapse'
                                : 'no_collapse';

                    if (model.type === 'composition' && layer.collapse) {
                        element.removeAttribute('style');
                    } else {
                        className += ' filter';
                    }
                    element.className = className;
                }

                if (model.type === 'composition' && model.collapse){

                    mat_2D = mat;

                    if (is3D){
                        mat_2D = this.matrix2D_.injectMatrix(model.getMatrix2D());
                        if (opt_parent_2D){
                            mat_2D.multiply(opt_parent_2D);
                        }
                    }

                    handler.render(layer.bounds, camera, mat, mat_2D);

                } else if (handler && content) {

                    if (is3D){
                        mat.multiply(cam_mat);
                    }

                    if (model.collapse) {

                        var mx = mat.m21,
                            my = mat.m22,
                            mz = mat.m23,
                            scale = (
                                (is3D)
                                ? Math.sqrt(
                                    (mx * mx) + (my * my) + (mz * mz)) *
                                    (this.zoom / (this.zoom - mat.m43)
                                )
                                : Math.sqrt((mx * mx) + (my * my))
                            ) * 1.2 ,
                            ratio = scale / layer.scale;

                        if (ratio > 1.3 || ratio < 0.77) {
                            layer.scale = (scale > 0.77 && scale < 1.1) ? 1 : scale;
                            this.setScale(content, scale);
                        }

                        scale = 1/layer.scale;
                        if (scale !== 1) {
                            //mat.preMultiply(this.tempMatrix_.scaling(scale, scale, 1));
                        }

                    } else if (!model.collapse && is3D && layer.scale !== 1) {

                        layer.scale = 1;
                        this.setScale(content, layer.scale);

                    }

                    layer.collapse = model.collapse;
                    handler.render(layer.bounds);

                    if (layer.scale !== 1 || layer.bounds.x || layer.bounds.y) {
                        mat.preMultiply(this.tempMatrix_.set(
                            1 / layer.scale, 0,               0, 0,
                            0,               1 / layer.scale, 0, 0,
                            0,               0,               1, 0,
                            layer.bounds.x,  layer.bounds.y,  0, 1
                        ));
                    }
                    layer.bounds.multiplyScalar(layer.scale);

                    this.setMatrix(
                        element,
                        mat,
                        (model.is3D) ? camera : null,
                        model.getDepthPoint(),
                        layer.bounds
                    );

                    if (haveActiveMasks(model.masks)) {
                        if (!layer.canvas) {

                            maskCounter += 1;
                            mask_name = 'layer_mask_' + maskCounter;
                            mask_canvas = document.getCSSCanvasContext('2d', mask_name, 10, 10);
                            style.WebkitMaskImage = '-webkit-canvas('+mask_name+')';

                            layer.canvas = mask_canvas;
                        }

                        layer.canvas.canvas.width = style.width = layer.bounds.width;
                        layer.canvas.canvas.height = style.height = layer.bounds.height;

                        maskUtils.renderMasks(layer.canvas, model.masks, layer.scale, layer.bounds);

                    } else if (layer.canvas) {
                        layer.canvas.canvas.width = layer.canvas.canvas.height = 0;
                        style.WebkitMaskImage = '';
                        delete layer.canvas;
                    }

                }

                if (layer.opacity !== model.opacity){
                    layer.opacity = model.opacity;
                    this.setOpacity(element, model.opacity);
                }

                mat.identity();

            }
        },

        setScale: function(elem, scale) {

            if (browser.haveTransform) {

                elem.style[browser.TRANSFORM] = (scale !== 1)
                                                ? 'scale('+scale.toFixed(4)+','+scale.toFixed(4)+')'
                                                : '';

            } else if (elem.style.zoom !== undefined) {
                elem.style.zoom = scale;
            }
        },

        setMatrix: function(elem, matrix, camera, depth_point, bounds) {

            var style = elem.style,
                matrix2D, filter;

            if (browser.have3DTransform) {
                style[browser.TRANSFORM] = matrix.toCSS();
            } else {

                matrix2D = m2D;

                if (camera) {
                    matrix2D.simulate3D(matrix, camera.center, depth_point, camera.zoom);
                } else {
                    matrix2D.copy3D(matrix);
                }

                if (browser.haveTransform) {
                    style[browser.TRANSFORM] = matrix2D.toCSS();
                } else {



                    if (browser.haveIEFilter && elem.filters.length){

                        style.width = bounds.width +'px';
                        style.height = bounds.height +'px';

                        this.slideMatrixBounds(matrix2D, bounds.width, bounds.height);

                        filter = elem.filters.item(0);

                        filter.M11 = matrix2D.m11;
                        filter.M12 = matrix2D.m21;
                        filter.M21 = matrix2D.m12;
                        filter.M22 = matrix2D.m22;
                    }

                    style.left = matrix2D.x.toFixed(4) + 'px';
                    style.top = matrix2D.y.toFixed(4) + 'px';
                }
            }
        },

        slideMatrixBounds: function(matrix, width, height) {

            var min = Math.min;

            matrix.x += min(
                0, min(
                    width * matrix.m11 + height * matrix.m21,
                    min(
                        width * matrix.m11,
                        height * matrix.m21
                    )
                )
            );

            matrix.y += min(
                0, min(
                    width * matrix.m12 + height * matrix.m22,
                    min(
                        width * matrix.m12,
                        height * matrix.m22
                    )
                )
            );
        },

        setOpacity: function(elem, opacity) {

            if (elem.style.opacity !== undefined) {
                elem.style.opacity = ( opacity !== 1 ) ? opacity : "";
            } else if (browser.haveIEFilter && elem.filters.length >= 2) {
                elem.filters.item(1).Opacity = opacity*100;
            }
        }
    };

    return Composition;
});
