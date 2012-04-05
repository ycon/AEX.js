var LayerSetting = function(panel){

	panel.layout.layout(true);
	panel.layout.resize();
	panel.onResizing = panel.onResize = function () {this.layout.resize();};
	
	this.panel = panel;
	this.panel.alignment = 'left';
	this.panel.margins = 0;
	this.panel.spacing = 0;
	
	this.watcher = new LayerWatcher(panel);
	
	this.watcher.changed.add(this.change,this);
	this.watcher.start();
};

LayerSetting.prototype = {
		
		change : function(layer){
			
			if (this.layerPanel){
				
				this.layerPanel.clear();
				
			}
			
			if (layer){
				
				this.layerPanel = new LayerPanel(this.panel,layer,this);
				
			} else {
				
				if ( 	app && app.project 
						&& app.project.activeItem 
						&& app.project.activeItem.typeName == "Composition"){
					
					this.layerPanel = new ItemSubPanel(this.panel,app.project.activeItem,undefined,this);

				} else {
					
					this.layerPanel = null;
					
				}
				
			}
			
			this.panel.layout.layout(true);
			this.panel.layout.resize();
			
			
			this.layer = layer;
			
		}
		
};

var base = new LayerSetting(this);
