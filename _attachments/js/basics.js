 
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
// TimeStamp - 19771231THHMMSS
function TS(dt){
    var ts = new Date();
    if (dt){ ts = dt; }
    var msg = pad(ts.getFullYear(),4) + pad(ts.getMonth()+1,2);
    msg += pad(ts.getDate(),2) + 'T' + pad(ts.getHours(),2);
    msg += pad(ts.getMinutes(),2)+pad(ts.getSeconds(),2);
    return msg;
}

function create_id() {
    // 6 chars of random [A-z]_+'T'+ milliseconds since 19700101T000000
    // looks like jfCzMFT1363766141750 20 digits for id
    var s = [];
    // alphbet chars without t/T. 50 in count
    var randChars = "abcdefghijklmnopqrsuvwxyzABCDEFGHIJKLMNOPQRSUVWXYZ";
    for (var i = 0; i < 6; i++) {
        s[i] = randChars.substr(Math.floor(Math.random() * 50), 1);
    }
    var milsec_since_19700101 = (new Date()).getTime().toString();
    var uuid = s.join("") + "T" + milsec_since_19700101;
    return uuid; // bfDceST1354941698601
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var Class = function(){
    var klass = function(){
        this.init.apply(this, arguments);
        this.initialize.apply(this, arguments);
    };
    klass.prototype.initialize = function(dic){}
    
    // this will be overridden, if not, this is the default
    klass.prototype.init = function(d){
        // _id looks like: 3TXE45N-RS-FbXyKC1364194589525_1
        var _id = d['_id'] || create_id();
        
        // get 1364194589525 part, parse/return a javascript Date inst
        this.crtime = function(){ 
            var da = new Date();
            da.setTime(Number(_id.substr(17,13));
            return da;
        };
        var _tx = d['tx'] || "";
        this.tx = function(t){    
            if(t){ _tx = t; return this; }
            else { return _tx; }
        };
        this.cid = function(cid){
            if(cid){
                // replace RS with v, if v is 2 chars long
                if(cid.length == 2){
                    _id = _id.substr(0,8) + cid + _id.substr(10);
                }
                return this; 
            }
            else{ return _id.substr(8,2); }
        };
        // fid is 7 char of random from ([A-Z] - O|I|Z + [1-9]). >42 GB
        this.fid = function(v){
            if(v){ 
                // v must be 7 chars long!
                if (v.length == 7){
                    // replace the first 7 chars(fid) in this._id
                    _id = v + _id.substr(7); 
                }
                return this; 
            }
            return _id.substr(0,7); // get 3TXE45N
        };
        var _vid = 1;
        if (d['vid']){
            this.vid(d['vid']);
        } else if (_id.indexOf('_') > -1){
            _vid = Number(_id.split('_')[1]);
        }
        this.vid = function(v){
            if (v){  
                _id = _id.split('_')[0] + '_' + Number(v);
                return this; 
            }
            else{  return Number(_id.substr(31)); }
        };
        var _rev = d['_rev'] || '';
        this.rev = function(r){
            if (r){  _rev = r;  return this; }
            return _rev;
        };
        this.id = function(){ return _id; }
        this.eid = function(){ 
            if (this.cid() == 'RL' || this.cid() == 'SE')
                return _id;
            else
                return _id.split('_')[0];
        };
        this.base2json = function(){            
            var msg = {
                '_rev':_rev, 'tx':_tx, '_id':this.id() 
            };
            return msg;
        };
    };
    klass.fn = klass.prototype; // Shortcut to access prototype
    klass.fn.parent = klass;    // Shortcut to access class
    
    // Adding class properties
    klass.extend = function(obj){
        var extended = obj.extended;
        for(var i in obj){
            klass[i] = obj[i];
        }
        if (extended) extended(klass);
    };
    // Adding instance properties
    klass.include = function(obj){
        var included = obj.included;
        for(var i in obj){
            klass.fn[i] = obj[i];
        };
        if (included) included(klass);
    };
    return klass;
};
//
//==============================================================================
// family class for a FTC account
var FA = new Class();
FA.include({
    initialize: function(d){
        console.log('initialize FA');
        var _name = d['name'] || 'family';
        this.name = function(v){
            if(v){ _name = v; return this; }
            return _name;
        };
        var _lastupdate = d['lastupdate'] || (new Date()).getTime().toString();
        this.lastupdate = function(v){
            if(v){ _lastupdate = v; return this; }
            return _lastupdate;
        };
        var _type = d['type'] || 'promo';
        this.type = function(v){
            if(v){ _type = v; return this; }
            return _type;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['name'] = _name;
        msg['lastupdate'] = _lastupdate;
        msg['type'] = _type;
        return msg;
    }
}); // FA.include

//
// PA is class for a person
var PA = new Class();
PA.include({
    initialize: function(d){
        console.log('initialize PA');
        var _dob = d['dob'] || '10991216'; // day of birth in 8 digits format
        this.dob = function(v){
            if(v){ _dob = v; return this; }
            else { return _dob; }
        };
        var _dod = d['dod'] || '29991216'; // day of death in 8 digits format
        this.dod = function(d){
            if(d){ _dod = d; return this; }
            else { return _dod; }
        };
        var _sex = d['sex'] || 'male';     // mael or female
        this.sex = function(v){
            if(v){ _sex = v; return this; }
            else { return _sex; }
        };
        var _tagname = d['tagname'] || 'tagname';     // mael or female
        this.tagname = function(v){
            if(v){ _tagname = v; return this; }
            else { return _tagname; }
        };
        var _portrait = d['portrait'] || 'portrait';     // mael or female
        this.tagname = function(v){
            if(v){ _portrait = v; return this; }
            else { return _portrait; }
        };
        this._synop = d['synop'] || 'synop';    // short info about the person
        this.synop = function(v){
            if(v){ this._synop = v; return this; }
            else { return this._synop; }
        };
        var _ftc_credential = d['ftc_credential'] || undefined;
        this.ftc_credential = function(v){
            if(v){ _ftc_credential = v; return this; }
            return _ftc_credential;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['dod'] = _dod;
        msg['dob'] = _dob;
        msg['sex'] = _sex;
        msg['tagname'] = _tagname;
        msg['portrait'] = _portrait;
        msg['synop'] = _synop;
        // user with ftc-login acct(FC with purpose='ftc-login') has this ref.
        if (_ftc_credential){
            msg['ftc_credential'] = _ftc_credential;
        }
        return msg;
    }
});// PA.include

var IP = new Class();
IP.include({
    initialize: function(d){
        var _name = d['name'] || 'ip';
        this.name = function(v){
            if(v){ _name = v; return this; }
            return _name;
        }
        var _title = d['title'] || 'ip';
        this.title = function(v){
            if(v){ _title = v; return this; }
            return _title;
        }
        var _config = d['config'] || [];
        this.config = function(v){
            if(v){ _config = v; return this; }
            return _config;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = _title;
        msg['name'] = _name;
        msg['config'] = _config;
    }
}); // IP.include

// item of info-pane (entries)
var IT = new Class();  // chronolgy entry in chronolgy-info-pane
IT.include({
    intialize: function(d){
        console.log('initialize IT');
        
        // title is the list item name, appearing in info-pane
        var _title = d['title'] || 'event';
        this.title = function(v){
            if(v) { _title = v; return this; }
            else { return _title; }
        };
        var _owner = d['owner'] || ''; // eid of PA in stance containing
        this.owner = function(v){
            if(v){ _owner = v; return this; }
            return _owner;
        };
        // 1 char type will (possiblly) switch item-popup dlg layout
        // A:,B:,C:,D:,E:,F:ftc-login
        var _type = d['type'] || 'A';
        this.type = function(v){
            if(v){ _type = v; return this; }
            return _type;
        }
        // synop is for tooltip, as for now.
        // may not be necessary, since each item contains a main facet
        // the anno of that facet can be used as tooltip? Keep this for now.
        var _synop = d['synop'] || '';
        this.synop = function(v){
            if(v){ _synop = v; return this; }
            else { return _synop; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = _title;
        msg['owner'] = _owner;
        msg['type'] = _type;
        msg['synop'] = _synop;
        return msg;
    }
}); //IT.include

// facet class. contained in item: item1.facets:[<f1>,...]
FC = new Class();
FC.include({
    initialize: function(d){
        console.log('initialize FC');

        // title is the list entry name, appearing in facets-scroll-pane
        var _title = d['title'] || 'facet';
        this.title = function(v){
            if(v) { _title = v; return this; }
            else { return _title; }
        };
        // grp color offers the user to group the facets for sorting purpose
        // they ca be sorted by title or gcolor
        // w)hite, b)lue, p)ink, s)ilver, g)reen. these are css-defined
        var _gcolor = d['gcolor'] || 'w'; 
        this.gcolor = function(v){
            if (v){ _gcolor = v; return this; }
            return _gcolor;
        };
        var _anno = d['anno'] || ""; // annotation - blah blahs
        this.anno = function(v){
            if(v){ _anno = v; return this; }
            return _anno;
        };
        // a list of attached media files [(<rs-id>,<title>,<anno>),..]
        // rs-id are under fa-attachment. <title>,<anno> are optional, if not 
        // present, the <title>, <anno> from rs-doc will take effect.
        var _rslst = d['rslst'] || [];
        this.rslst = function(v){
            if(v){ _rslst = v; return this; }
            return _rslst;
        };
        var _user = d['user'] || undefined; // eid of PA who has this ftc-login
        this.user = function(v){
            if(v){ _user = v; return this; }
            return _user;
        };
        // cont dict is a dictionary with all content-related key-values
        var _contdict = d['contdict'] || {};
        this.contdict = function(v){
            if (v){ _contdict = v; return this; }
            return _contdict;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = _title;
        msg['gcolor'] = _gcolor;
        msg['anno'] = _anno;
        msg['rslst'] = _rslst;
        msg['contdict'] = _contdict;
        if (_user){
            msg['user'] = _user;
        }
        return msg;
    }
}); // FC.include

var RS = new Class();
RS.include({
    initialize: function(d){
        var _name = d['name'] || 'name';
        this.name = function(v){
            if(v){ _name = v; return this; }
            return _name;
        };
        var _mime = d['mime'] || 'mime';
        this.mime = function(v){
            if(v){ _mime = v; return this; }
            return _mime;
        };
        var _size = d['size'] || 'size in byte';
        this.size = function(v){
            if(v){ _size = v; return this; }
            return _size;
        };
        var _signature = d['signature'] || '';
        this.signature = function(v){
            if(v){ _signature = v; return this; }
            return _signature;
        };
        var _title = d['title'] || '';
        this.title = function(v){
            if(v){ _title = v; return this; }
            return _title;
        };
        var _anno = d['anno'] || '';
        this.anno = function(v){
            if(v){ _anno = v; return this; }
            return _anno;
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['name'] = _name;
        msg['mime'] = _mime;
        msg['size'] = _size;
        msg['signature'] = _signature;
        msg['title'] = _title;
        msg['anno'] = _anno;
        return msg;
    }
});// RS.include

// BA is spouse class
var BA = new Class();
BA.include({
    initialize: function(d){
        var _type = d['type'] || 'married'; // married|partner|detached
        this.type = function(v){
            if(v) { _type = v; return this; }
            else { return _type; }
        };
        var _synop = d['synop'] || 'synop'; //short infor about the partnership
        this.synop = function(v){
            if(v) { _synop = v; return this; }
            else { return _synop; }
        };
        var _uday = d['uday'] || 'uday';   // day of get-together
        this.uday = function(v){
            if(v) { _uday = v; return this; }
            else { return _uday; }
        };
        var _dday = d['dday'] || 'dday';   // day of get-together
        this.dday = function(v){
            if(v) { _dday = v; return this; }
            else { return _dday; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['type'] = _type;
        msg['synop'] = _synop;
        msg['uday'] = _uday;
        msg['dday'] = _dday;
        return msg;
    }
}); // BA.include

var BC = new Class();
BC.include({
    initialize: function(d){
        var _rootb1eid = d['rootb1eid'] || '';    //eid of root b1
        this.rootb1eid = function(v){
            if(v){ _rootb1eid = v; return this; }
            else { return _rootb1eid; }
        };
        var _b1scs = d['b1scs'] || [];
        //[{b1eid:, mad:, fad:, anchorsex:, show:},..]
        this.b1scs = function(v){
            if(v) { _b1scs = v; return this; }
            else { return _b1scs; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['rootb1eid'] = _rootb1eid;
        msg['b1scs'] = _b1scs;
        return msg;
    }
}); //BC.include

var TH = new Class();
TH.include({
    initialize: function(d){
        var _name = d['name'] || 'them';
        
        this.name = function(v){
            if(v) { _name = v; return this._name; }
            else { return _name; }
        };
        var _configs = d['configs'] || {};
        
        this.configs = function(v){
            if (v){ _configs = v; return this; }
            else { return _configs; }
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['name'] = _name;
        msg['configs'] = _configs;
        return msg;
    }
}); // TH.include

// TX is the only class not based on Class.
// tx = new Tx(<fid>,<vid>); _id = se.id + '_vid'
// vid serves as a tx-counter within a session, for situation there are
// > 1 txs within a session.
var TX = function(se,vid){
    this.fid = se.fid() || ''; 
    this.id = se.id()+'_'+vid || ''; // SE._id + _vid    
    this.toJSON = function(){
        return { '_id': this.id, 'cid':'TX', 'fid': this.fid };
    }
};

// SE is session class
var SE = new Class();// fid, _id
SE.include({
    intialize: function(d){
        // 30 min from now      = 30x60x1000 = 1800000
        this.expire = (new Date()).getTime() + 1800000;
        this.cid = 'SE';
        this.state = 1;    // alive, 0: expired
        this.usrid = d['usrid'];
    },
    checkExpire: function(){
        // set state. state==0 will be purged by a cron-job
        this.state = (new Date()).getTime() > this.expire;
        return this.state;
    },
    update: function(){    // set expire 30 min later from now
        this.expire = (new Date()).getTime() + 1800000;
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['expire'] = this.expire;
        msg['state'] = this.state;
        msg['usrid'] = this.usrid;
        return msg;
    }
});

var Relation = new Class();
Relation.include({
    initialize: function(d){
        var _leid = d['leid'] || '';
        this.leid = function(eid){
            if (eid){  _leid = eid;  return this; }
            else{  return _leid; };
          };
        var _reid = d['reid'] || '';
        this.reid = function(eid){
            if (eid){  _reid = eid;  return this; }
            else{  return _reid; };
          };
        var _lconts = d['lconts'] || [];
        this.lconts = function(v){
            if(v){ _lconts = v; return this; }
            else { return _lconts; }
        };
        var _rconts = d['rconts'] || [];
        this.rconts = function(v){
            if(v){ _rconts = v; return this; }
            else { return _rconts; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['leid'] = _leid;
        msg['reid'] = _reid;
        msg['lconts'] = _lconts;
        msg['rconts'] = _rconts;
        return msg; 
    }
});

function testing(){
    alert("testing called.");
}