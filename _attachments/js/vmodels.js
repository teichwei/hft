var PAVmodel = function(model, d){
    this.model = model;
    this.states = {
        live: 'virtual',// ('virtual', 'alive', 'deceased')
        anchor: true,
        expand: true,   // if is anchor, expand upper gen+ sibling-grp
        focus: false,
        visible: true
    };
    this.div = 
    this.state = function(v){
        if (typeof v === 'string'){
            // it is a state-query giving the state-key
            return this.states[v];
        } else if (typeof v === 'object') {
            // setting states with dictionary
            for(var k in v){
                this.states[k] = v[k];
            }
        }
        return this;
    };
}

/* -----------------------------------------------------------------------------
 * model:{sex: 'mael|female', dob:,dod:,synop:}
 * dict:{x:, y:, anchor:true|false, focus: true|false, fname:, lname:,}
 **/
function PAVModel(container_id, model, dict){
    this.container_id = container_id;
    this.model = model;
    this.focused = false;
    this.isanchor = false;
    model.pv = this;
    this.div = document.createElement("div");
    this.div.setAttribute('class', 'pv');
    this.div.style["border-color"]=(this.model.sex === "male")?'#3366FF':'#CC0099'

    if (this.model.dob) {
        this.div.style["border-style"] = "solid";
        if (this.model.dod)
            this.div.style["border-color"] = "black";
    } else {
        this.div.style["border-style"] = "dotted";
    }
    this.div.style["left"] = dict["x"] + "px";
    this.div.style["top"] = dict["y"] + "px";

    // put icon picture
    var img = document.createElement("img");
    img.className = "pvicon";
    img.setAttribute("src",(this.model.sex === "male")?"male1.jpg":"female1.jpg");
    this.div.appendChild(img);

    var box = document.createElement('div');
    box.className = 'namebox';
    box.setAttribute('id',this.model.eid+"_nametag");
    var fnamebox = document.createElement('div');
    var lnamebox = document.createElement('div');
    fnamebox.className = 'fname';
    lnamebox.className = 'lname';
    fnamebox.innerHTML = '毛泽东';//'First name';
    lnamebox.innerHTML = '毛泽东';
    box.appendChild(fnamebox);
    box.appendChild(lnamebox);
    this.div.appendChild(box);

    // set-focus function bound to tbl.onclick
    var self = this;
    $('#'+this.model.eid+"_nametag").live('click',function(e){
        self.focused = !self.focused;
        App.focuspv = (self.focused)? self : undefined;
        self.div.style["background-color"]=(self.focused)? "#66CDAA":"#F2FFFF";
    });

    var actimg = document.createElement('img');
    actimg.className = "pvact";
    actimg.setAttribute('src','right-arrow.png');
    actimg.setAttribute('id',this.model.eid+"_actimg");
    this.div.appendChild(actimg);
    
    $('#'+this.model.eid+"_actimg").contextPopup({
        items: [ 
            { label:'Some Item',
              icon:'icons/icons/shopping-basket.png',
              action:function() { alert(self.model.eid+'-clicked 1') } }, 
            { label:'Another Thing', 
              icon:'icons/icons/receipt-text.png', 
              action:function() { alert(self.model.eid+'-clicked 2') } },
            // null can be used to add a separator to the menu items
            null,
            { label:'Blah Blah', 
              icon:'icons/icons/book-open-list.png', 
              action:function() { alert(self.model.eid+'-clicked 3') } }
        ]
    });

    this.anchor = document.createElement("div");
    this.anchor.setAttribute('class',"anchor");
    this.anchor.setAttribute("id", this.model.eid+"_anchor");
    $('#'+self.model.eid+"_anchor").live('click', function(e){
        self.isanchor = !self.isanchor;
        self.anchor.style["background-color"]=(self.isanchor) ? "red":"white";
    });
    this.div.appendChild(this.anchor);

    $('#' + this.container_id).append(this.div);

    this.showhide = function(){
        this.div.style.display=(this.div.style.display !='none')?'none':'block';
    };
}; // PAVModel
