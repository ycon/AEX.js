
/**
 * @param {Composition} scene
 * @param {Camera} opt_camera
 */
var DomRenderer = function(scene,opt_camera){
	
	this.scene = new CompositionDomElement(scene);

	this.camera = opt_camera;
	
	this.element = document.createElement('scene');
	this.element.appendChild(this.scene.element);
	
	if (!document.getElementById('AEStyleSheet')){
		
		var cssNode = document.createElement('style');
		var cssRules = 
			"scene * {" +
				"position:absolute;" +
				"display:block;" +
				"top:0px;" +
				"left:0px;" +
				"word-wrap:break-word;" +
				"-webkit-font-smoothing:antialiased;" +
				"transform-origin:0% 0%;" +
				"-o-transform-origin:0% 0%;" +
				"-khtml-transform-origin:0% 0%;" +
				"-moz-transform-origin:0% 0%;" +
				"-webkit-transform-origin:0% 0%;" +
				"-ms-transform-origin:0% 0%;" +
			"}";
		cssNode.id = 'AEStyleSheet';
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.media = 'screen';
		cssNode.title = 'AEStyleSheet';
		
		if (cssNode.styleSheet){
			console.log(cssNode.styleSheet.cssText );
			cssNode.styleSheet.cssText = cssRules;
		} else {
			console.log('cssNode.styleSheet.cssText' );
			cssNode.innerHTML = cssRules;
		}
		
		document.getElementsByTagName("head")[0].appendChild(cssNode);
		
	}
	
	if (scene.color){
		console.log("fffff");
		this.scene.element.style.backgroundColor = scene.color;
	}
	
	
};

DomRenderer.prototype.render = function(){
	
	this.scene.render(null,null,this.camera);
	
};



externs['DomRenderer'] = DomRenderer;
