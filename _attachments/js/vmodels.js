/* -----------------------------------------------------------------------------
 * model:{sex: 'mael|female', dob:,dod:,synop:}
 * dict:{x:, y:, anchor:true|false, focus: true|false, fname:, lname:,}
 **/
function PAVModel(container_id, model, dict){
    this.container_id = container_id;
    this.model = model;
    this._focused = false;
    this.focused = function(v){
        if (typeof v !== "undefined"){ 
            this._focused = v; 
            // this line works fine with Chrom and IE, but not FF.
            // I have to use.backgroundColor in stead of ['background-color']
            //this.div.style["background-color"] = (this._focused)? 
            this.div.style.backgroundColor = (this._focused)? 
                                                    "#66CDAA":"#F2FFFF";
            if(v) this.setsynop().setinfopanes();
            return this; 
        }
        return this._focused;
    }
    this.isanchor = false;
    model.pv = this;
    this.div = document.createElement("div");
    this.div.setAttribute('class', 'pv');
    this.div.style["border-color"] = (this.model.sex() === "male")?
                                     '#3366FF':'#CC0099'

    if (this.model.dob()) {
        this.div.style["border-style"] = "solid";
        if (this.model.dod())
            this.div.style["border-color"] = "black";
    } else {
        this.div.style["border-style"] = "dotted";
    }
    this.div.style["left"] = dict["x"] + "px";
    this.div.style["top"] = dict["y"] + "px";

    // put icon picture
    var img = document.createElement("img");
    img.className = "pvicon";
    img.setAttribute("src", (this.model.sex() === "male")?
                            "ftc-images/male1.jpg":"ftc-images/female1.jpg");
    this.div.appendChild(img);

    var box = document.createElement('div');
    box.className = 'namebox';
    // give unique id 4 event-handler attachment
    box.setAttribute('id',this.model.eid()+"_nametag");
    
    if (model.tagname() && model.tagname().length < 18){
        var namebox = document.createElement('div');
        namebox.className = 'fullname';
        namebox.innerHTML = model.tagname();
        box.appendChild(namebox);
    }
    this.div.appendChild(box);

    var self = this;
    $('#'+this.model.eid() + "_nametag").live('click',function(e){
        if (FD.focuspv !== self){
            FD.focuspv.focused(false);
            FD.focuspv = self;
            FD.focuspv.focused(true);
        }
    });

    var actimg = document.createElement('img');
    actimg.className = "pvact";
    actimg.setAttribute('src','ftc-images/right-arrow.png');
    actimg.setAttribute('id',this.model.eid()+"_actimg");
    this.div.appendChild(actimg);
    
    $('#'+this.model.eid()+"_actimg").contextPopup({
        items: [ 
            { label:'Some Item',
              icon:'ftc-images/shopping-basket.png',
              action:function() { alert(self.model.eid() + '-clicked 1') } }, 
            { label:'Another Thing', 
              icon:'ftc-images/receipt-text.png', 
              action:function() { alert(self.model.eid() + '-clicked 2') } },
            // null can be used to add a separator to the menu items
            null,
            { label:'Blah Blah', 
              icon:'ftc-images/book-open-list.png', 
              action:function() { alert(self.model.eid() + '-clicked 3') } }
        ]
    });

    this.anchor = document.createElement("div");
    this.anchor.setAttribute('class',"anchor");
    this.anchor.setAttribute("id", this.model.eid() + "_anchor");
    $('#'+self.model.eid() + "_anchor").live('click', function(e){
        self.isanchor = !self.isanchor;
        //self.anchor.style["background-color"]=(self.isanchor) ? "red":"white";
        self.anchor.style.backgroundColor=(self.isanchor) ? "red":"white";
    });
    this.div.appendChild(this.anchor);

    $('#' + this.container_id).append(this.div);

    this._hdate = function(d){
        if(d && d.length > 2){
            if(d.length ==8){
                return d.substr(0,4)+'.'+d.substr(4,2)+'.'+d.substr(6,2);
            } else if (d.length == 6){
                return d.substr(0,4)+'.'+d.substr(4.2);
            } else if(d.length == 4){
                return d;
            }
        } else {
            return '';
        }
    }
    // update the synopsis box for this person
    this.setsynop = function(){
        // set the portrait of the person
        var bgframe = document.getElementById('pictureframe');
        var frame_png = 'PicFrame1.jpg';
        bgframe.style.backgroundImage = "url(ftc-images/"+frame_png+")";
        var portimg = document.getElementById('portrait');
        var rs = FD.store.getEntity(this.model.portrait());
        var portrait_path = '/hftdb/'+rs.id()+'/'+rs.name();
        portimg.setAttribute('src', portrait_path);
        
        // set 4 lines of person's synopsis
        var secondline = this._hdate(this.model.dob())+' - '+
                         this._hdate(this.model.dod());
        $('#synop-line1').empty().text(this.model.tagname());
        $('#synop-line2').empty().text(secondline);
        $('#synop-line3').empty().text(this.model.origin());
        $('#synop-line4').empty().text(this.model.oneword());
        return this;
    };
    // update ips for this person
    this.setinfopanes = function(){
        // first clear FD.infocats
        FD.infocats = {'M7111': 'M7500'};   // everyone must have nutshell
        
        // fill in FD.infocats with what the person has for ips.
        // M7500 is for access-control (all family members - default)
        for (var i in this.model.ips){
            FD.infocats[this.model.ips[i].name()] = 'M7500';
        };
        // set nutshell to be selected
        FD.infoCatSelected = "M7111";
        refresh_catSelect();
        return this;
    };
    this.showhide = function(){
        this.div.style.display=(this.div.style.display !='none')?'none':'block';
    };
}; // PAVModel
