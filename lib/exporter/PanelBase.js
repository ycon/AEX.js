
/*global define */

define(['extern/json'], function (json) {

    function PanelBase (panel, layer, width, context) {

        this.panel      = panel;
        this.layer      = layer;
        this.context    = context;

        if (panel && layer){
            this.group              = this.panel.add("group");
            this.group.orientation  = "column";
            this.group.margins      = 8;
            this.group.alignment    = 'left';
        }

        this.width = width || 190;
    }

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
            var stat = group.add("statictext", undefined, name+' :');
            stat.alignment = 'left';

            var field = group.add("edittext", undefined, this.get(prop));
            field.preferredSize.width = this.width-stat.preferredSize.width;

            (function(prop,field,self){

                field.addEventListener('keyup',function(e){
                    self.set(prop,(field.text !== '') ? field.text : undefined);
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


            var group = this.group.add("group"),
                i, val, drop, def;
            group.alignment = 'left';
            group.spacing = 2;

            if (!name){
                name = prop;
            }

            group.add("statictext", undefined, name+' :').alignment = 'left';
            drop = group.add("dropdownlist", undefined);
            def = this.get(prop) || origin;

            for ( i = 0; i < vals.length; i += 1 ) {
                val = vals[i];
                name = (names && names[i]) ? names[i] : val;

                drop.add('item',name);

                if (val === def){
                    drop.selection = i;
                }
            }

            (function(prop,drop,self,vals){
                drop.onChange = function(e){

                    var y = 0;

                    if (drop.selection !== null){
                        selectLoop : for ( ; y < drop.items.length; y += 1) {
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

            if (!this.layer.comment){
                this.layer.comment = "{}";
            }

            var obj = json.parse(this.layer.comment);
            obj[key] = val;
            this.layer.comment = json.stringify(obj);
        },

        get : function(key){

            if (!this.layer.comment){
                return undefined;
            }

            return json.parse(this.layer.comment)[key];
        }
    };

    return PanelBase;
});
