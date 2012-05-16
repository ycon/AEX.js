
define(['text!style/scene.css', './Composition'], function (sceneCss, Composition) {

    function Renderer (scene, opt_camera) {

        this.scene   = new Composition(scene);
        this.camera  = opt_camera;
        this.element = document.createElement('scene');

        this.element.className = 'no_collapse';
        this.element.appendChild(this.scene.element);

        if (!document.getElementById('AEStyleSheet')){

            var cssNode = document.createElement('style');

            var cssRules = sceneCss;

            /*
            var cssRules = "scene * {" +
                    "position:absolute;" +
                    "display:block;" +
                    "top:0px;" +
                    "left:0px;" +
                    "margin:0px;" +
                    "padding:0px;" +
                    "border:0px;" +
                    "word-wrap:break-word;" +
                    "-webkit-font-smoothing:antialiased;" +
                    "transform-origin:0% 0%;" +
                    "-o-transform-origin:0% 0%;" +
                    "-khtml-transform-origin:0% 0%;" +
                    "-moz-transform-origin:0% 0%;" +
                    "-webkit-transform-origin:0% 0%;" +
                    "-ms-transform-origin:0% 0%;" +
                "}" +
                "scene layer {" +
                    "-ms-filter: \"progid:DXImageTransform.Microsoft.Matrix(M11='2.0', sizingMethod='auto expand')\"" +
                "}" +
                "scene solid {" +
                    "position: absolute" +
                "}";
            */
            cssNode.id = 'AEStyleSheet';
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.media = 'screen';
            cssNode.title = 'AEStyleSheet';

            if (cssNode.styleSheet){
                cssNode.styleSheet.cssText = cssRules;
                //console.log(cssNode.styleSheet.cssText );
            } else {
                cssNode.innerHTML = cssRules;
            }
            document.getElementsByTagName("head")[0].appendChild(cssNode);
        }

        if (scene.color){
            this.scene.element.style.backgroundColor = scene.color;
        }
    }

    Renderer.prototype.render = function(){

        this.scene.render();
    };

    return Renderer;
});
