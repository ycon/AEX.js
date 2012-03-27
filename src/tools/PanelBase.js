var PanelBase = function(panel,layer,width){

	this.panel = panel;
	this.layer = layer;
	
	if (panel && layer){
		
		this.group = this.panel.add("group");
		this.group.orientation = "column";
		this.group.margins = 8;
		this.group.alignment = 'left';
		
	}

	this.width = width || 190;
	
};

PanelBase.prototype = {
		
		clear : function(){
			this.panel.remove(this.group);
		},
		
		setField : function(prop,name){
			
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			
			if (!name){
				name = prop;
			}
			var stat = group.add("statictext", undefined, name+' :')
			stat.alignment = 'left';

			var field = group.add("edittext", undefined, this.get(prop));
			field.preferredSize.width = this.width-stat.preferredSize.width;

			(function(prop,field,self){
				
				field.addEventListener('keyup',function(e){
					writeLn(self.layer);
					self.set(prop,field.text);
				});
				
			})(prop,field,this);
			
			return field;
		},
		
		setBoolean : function(prop,name,origin){
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			if (!name){
				name = prop;
			}
			
			var active = this.get(prop);

			if (active === undefined){
				active = origin;
			}
			
			var tick = group.add("checkBox", undefined, name);
			tick.value = active;

			(function(prop,tick,self){
			
				tick.addEventListener('click',function(e){
					self.set(prop,tick.value);
				});
			
			})(prop,tick,this);
			
		},
		
		setDrop : function(prop,name,vals,origin,names){
			
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			
			if (!name){
				name = prop;
			}
			
			group.add("statictext", undefined, name+' :').alignment = 'left';
			
			
			
			var drop = group.add("dropdownlist", undefined);
			var i,val,name;
			
			var def = this.get(prop) || origin;
			
			for ( i = 0; i < vals.length; i++ ) {
				val = vals[i];
				name = (names && names[i]) ? names[i] : val;
				
				drop.add('item',name);
				
				if (val === def){
					drop.selection = i;
				}
			}
			
			

			(function(prop,drop,self,vals){

				drop.onChange = function(e){
	
					if (drop.selection !== null){
						selectLoop : for ( var y = 0; y < drop.items.length; y++) {
							if (drop.items[y] === drop.selection){
								self.set(prop,vals[y]);
								break selectLoop;
							}
						}
					}
				};
			
			})(prop,drop,this,vals);
			
		},
		
		set : function(key,val){
			if (this.layer.comment == "" || !this.layer.comment){
				
				this.layer.comment = "{}";
				
			}
			
			var obj = JSON.parse(this.layer.comment);
			
			obj[key] = val;
			
			this.layer.comment = JSON.stringify(obj);
			
			
		},
		
		get : function(key){
			
			if (this.layer.comment == "" || !this.layer.comment){
				
				return undefined;
				
			}
			
			return JSON.parse(this.layer.comment)[key];
			
		}
}