
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
		cssNode.id = 'AEStyleSheet';
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.media = 'screen';
		cssNode.title = 'AEStyleSheet';
		cssNode.innerHTML = "scene * {position:absolute;display:block;top:0px;left:0px;word-wrap:break-word;-webkit-font-smoothing:antialiased;-moz-transform-origin:0% 0%;-webkit-transform-origin:0% 0%;-ms-transform-origin:0% 0%;}";
		document.getElementsByTagName("head")[0].appendChild(cssNode);
		
	}
	
	
	
};

DomRenderer.prototype.render = function(){
	
	this.scene.render(null,null,this.camera);
	
};



externs['DomRenderer'] = DomRenderer;
