 
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
    // 18 chars of random [A-z]_+ milliseconds since 19700101T000000
    var s = [];
    // alphbet chars without t/T. 50 in count
    var randChars = "abcdefghijklmnopqrsuvwxyzABCDEFGHIJKLMNOPQRSUVWXYZ";
    for (var i = 0; i < 17; i++) {
        s[i] = randChars.substr(Math.floor(Math.random() * 50), 1);
    }
    var milsec_since_19700101 = (new Date()).getTime().toString();
    var uuid = s.join("") + "T" + milsec_since_19700101;
    return uuid; // bfdce5da62cd50793aT1354941698601
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
        // 18 random chars +T+ 13digits timestamp(milsecs since 19700101000000)
        var _id = d['_id'] || d['id'] || create_id(); 
        this.crtime = function(){ return _id.substr(18,13); };
        var _tx = d['tx'] || "";
        this.tx = function(t){    
            if(t){ _tx = t; return this; }
            else { return _tx; }
        };
        var _cid = d['cid'] || '00';
        this.cid = function(cid){
            if(cid){  _cid = cid; return this; }
            else{ return _cid; }
        };
        // fid is 7 char of random from ([A-Z] - O|I|Z + [1-9]). >42 GB
        var _fid = d['fid'] || '0123456';
        this.fid = function(v){
            if(v){ _fid = v; return this; }
            return _fid;
        };
        var _vid = 1;
        if (d['vid']){
            this.vid(d['vid']);
        } else if (_id.indexOf('_') > -1){
            _vid = Number(_id.split('_')[1]);
        }
        this.vid = function(v){
            if (v){  
                _vid = Number(v);  
                _id = _id.split('_')[0] + '_' + v;
                return this; 
            }
            else{  return _vid; }
        };
        var _rev = d['rev'] || '';
        this.rev = function(r){
            if (r){  _rev = r;  return this; }
            return _rev;
        };
        this.id = function(){ return _id; }
        this.eid = function(){ 
            if (_cid == 'RL' || _cid == 'SE')
                return _id;
            else
                return _id.split('_')[0];
        };
        var _conts = [];
        this.conts = function(cts){
            if(cts){ _conts = cts; return this; }
            else { return _conts; }
        };
        this.base2json = function(){            
            var msg = {
                'fid':_fid, 'cid':_cid, '_rev':_rev, 'tx':_tx,
                '_id':this.id() 
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
//
// P1 is class for a person
var P1 = new Class();
P1.include({
    initialize: function(d){
        console.log('initialize P1');
        this.cid('P1');
        this._dob = d['dob'] || '10991216'; // day of birth in 8 digits format
        this.dob = function(v){
            if(v){ this._dob = v; return this; }
            else { return this._dob; }
        };
        this._dod = d['dod'] || '29991216'; // day of death in 8 digits format
        this.dod = function(d){
            if(d){ this._dod = d; return this; }
            else { return this._dod; }
        };
        this._sex = d['sex'] || 'male';     // mael or female
        this.sex = function(v){
            if(v){ this._sex = v; return this; }
            else { return this._sex; }
        };
        this._synop = d['synop'] || 'synop';    // short info about the person
        this.synop = function(v){
            if(v){ this._synop = v; return this; }
            else { return this._synop; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['dod'] = this._dod;
        msg['dob'] = this._dob;
        msg['sex'] = this._sex;
        msg['synop'] = this._synop;
        return msg;
    }
});// P1

var IP = new Class();
IP.include({
    initialize: function(d){
        this.cid('IP');
        this._name = d['name'] || 'ip';
        this.name = function(v){
            if(v){ this._name = v; return this; }
            return this._name;
        }
        this._title = d['title'] || 'ip';
        this.title = function(v){
            if(v){ this._title = v; return this; }
            return this._title;
        }
        this._config = d['config'] || [];
        this.config = function(v){
            if(v){ this._config = v; return this; }
            return this._config;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = this._title;
        msg['name'] = this._name;
        msg['config'] = this._config;
    }
});

// A1 is ftc login account class
var A1 = new Class();
A1.include({
    
    initialize: function(d){
        this.cid('A1');
        this._usrname = d['usrname'] || 'usr-name'; // user name for login
        this.usrname = function(v){
            if(v){ this._usrname = v; return this; }
            else { return this._usrname; }
        };
        this._psswrd = d['psswrd'] || 'password';   // login password
        this.psswrd = function(v){
            if(v){ this._psswrd = v; return; }
            return this._psswrd;
        };
        // ucode contains info about user's roll, ranking -TBD
        this._ucode = d['ucode'] || 'usr' // sadmin, fadmin
        this.ucode = function(v){
            if(v){ this._ucode = v; return this; }
            else { return this._ucode; }
        }
        this._ipname = d['ipname'] || '';
        this.ipname = function(v){
            if(v){ this._ipname = v; return this; }
            return this._ipname;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['usrname'] = this._usrname;     // login name
        msg['psswrd'] = this._psswrd;       // login passwrod
        msg['ucode'] = this._ucode;         // usr code
        msg['ipname'] = this._ipname;       // name of info-pane
        return msg;
    }    
});//A1

// T1 is title class 1 = legal name (title)
var T1 = new Class();
T1.include({
    initialize: function(d){
        this.cid('T1');
        this._type = d['type'] || '';    // nature of the name/title
        this.type = function(v){        // e.g. legal name, nick name
            if(v){ this._type = v; }
            else { return this._type; }
        };
        this._given = d['given'] || 'given'; // first name/given name
        this.given = function(v){
            if (v){ this_given = v; return this; }
            else { return this._given; }
        };
        this._family = d['family'] || 'fname';  // family name
        this.famaly = function(v){
            if(v){ this._family = v; return this; }
            else { return this._family; }
        };
        this._middle = d['middle'] || '';       // middle name
        this.middle = function(v){
            if(v){ this._middle = v; return this; }
            else { return this._middle; }
        };
        this._ipname = d['ipname'] || '';
        this.ipname = function(v){
            if(v){ this._ipname = v; return this; }
            return this._ipname;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['type'] = this._type;
        msg['given'] = this._given;
        msg['family'] = this._family;
        msg['middle'] = this._middle;
        msg['ipname'] = this._ipname;       // name of info-pane
        return msg;
    }
});// T1

// E1 is email class
var E1 = new Class();
E1.include({
    initialize: function(d){
        this._title = d['title'] || 'title'; // "work email", "whatever name"
        this.title = function(v){
            if(v){ this._title = v; return this; }
            else { return this._title; }
        };
        this._type = d['type'] || 'webemail';   // desktop email, blackberry
        this.type = function(v){
            if(v){ this._type = v; return this; }
            else { return this._type; }
        };
        this._address = d['address'] || 'email address';
        this.address = function(v){
            if(v){ this._address = v; return this; }
            else { return this._address; }
        };
        this._ipname = d['ipname'] || '';
        this.ipname = function(v){
            if(v){ this._ipname = v; return this; }
            return this._ipname;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = this._title;
        msg['type'] = this._type;
        msg['address'] = this._address;
        msg['ipname'] = this._ipname;       // name of info-pane
        return msg;
    }
});// E1

// B1 is spouse class
var B1 = new Class();
B1.include({
    initialize: function(d){
        this.cid('B1');
        this._type = d['type'] || 'single'; // single|married|partner|departed
        this.type = function(v){
            if(v) { this._type = v; return this; }
            else { return this._type; }
        };
        this._synop = d['synop'] || 'synop'; //short infor about the partnership
        this.synop = function(v){
            if(v) { this._synop = v; return this; }
            else { return this._synop; }
        };
        this._uday = d['uday'] || 'uday';   // day of get-together
        this.uday = function(v){
            if(v) { this._uday = v; return this; }
            else { return this._uday; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['type'] = this._type;
        msg['synop'] = this._synop;
        msg['uday'] = this._uday;
        return msg;
    }
}); // B1

var BC = new Class();
BC.include({
    initialize: function(d){
        this.cid('BC');
        this._rootb1eid = d['rootb1eid'] || '';    //eid of root b1
        this.rootb1eid = function(v){
            if(v){ this._rootb1eid = v; return this; }
            else { return this._rootb1eid; }
        };
        this._b1scs = d['b1scs'] || [];
        //[{b1eid:, mad:, fad:, anchorsex:, show:},..]
        this.b1scs = function(v){
            if(v) { this._b1scs = v; return this; }
            else { return this._b1scs; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['rootb1eid'] = this._rootb1eid;
        msg['b1scs'] = this._b1scs;
        return msg;
    }
}); //BC

var TH = new Class();
TH.include({
    initialize: function(d){
        this._name = d['name'] || 'them';
        
        this.name = function(v){
            if(v) { this._name = v; return this._name; }
            else { return this._name; }
        };
        this._configs = d['configs'] || {};
        
        this.configs = function(v){
            if (v){ this._configs = v; return this; }
            else { return this._configs; }
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['name'] = this._name;
        msg['configs'] = this._configs;
        return msg;
    }
}); // TH

var A2 = new Class();   // bank account
A2.include({
    initialize: function(d){
        this._type = d['type'] || 'checking';
        this.type = function(v){
            if(v){ this._type = v; return this; }
            else { return this._type; }
        };
        this._title = d['title'] || 'my checking';
        this.title = function(v){
            if(v){ this._title = v; return this; }
            else { return this._title; }
        };
        this._credential_dict = d['credential_dict'] || {};
        this.credential_dict = function(v){
            if(v) { this._credential_dict = v; return this; }
            else { return this._credential_dict; }
        };
        this._ID_dict = d['ID_dict'] || {};
        this.ID_dict = function(v){
            if(v) { this._ID_dict = v; return this; }
            else { return this._ID_dict; }
        };
        this._synop = d['synop'] || '';
        this.synop = function(v){
            if(v){ this._synop = v; return this; }
            else { return this._synop; }
        };
        this._ipname = d['ipname'] || '';
        this.ipname = function(v){
            if(v){ this._ipname = v; return this; }
            return this._ipname;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['type'] = this._type;
        msg['title'] = this._title;
        msg['ID_dict'] = this._ID_dict;
        msg['credential_dict'] = this._credential_dict;
        msg['synop'] = this._synop;
        msg['ipname'] = this._ipname;       // name of info-pane
        return msg;
    }
}); // A2

var CE = new Class();  // chronolgy entry in chronolgy-info-pane
CE.include({
    intialize: function(d){
        this._title = d['title'] || 'event';
        this.title = function(v){
            if(v) { this._title = v; return this; }
            else { return this._title; }
        };
        this._date = d['date'] || '2000-01-01';
        this.date = function(v){
            if(v){ this._date = v; return this; }
            else { return this._date; }
        };
        this._synop = d['synop'] || '';
        this.synop = function(v){
            if(v){ this._synop = v; return this; }
            else { return this._synop; }
        };
        this._ipname = d['ipname'] || '';
        this.ipname = function(v){
            if(v){ this._ipname = v; return this; }
            return this._ipname;
        }
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['title'] = this._title;
        msg['date'] = this._date;
        msg['synop'] = this._synop;
        msg['ipname'] = this._ipname;       // name of info-pane
        return msg;
    }
}); //CE.include

// TX is the only class not based on Class.
// tx = new Tx(<fid>,<vid>); _id = se.id + '_vid'
// vid serves as a tx-counter within a session, for situation there are
// > 1 txs within a session.
var TX = function(se,vid){
    this.fid = se.fid() || ''; 
    this.cid = 'TX';
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
        this.cid('RL');
        this._leid = d['leid'] || '';
        this.leid = function(eid){
            if (eid){  this._leid = eid;  return this; }
            else{  return this._leid; };
          };
        this._reid = d['reid'] || '';
        this.reid = function(eid){
            if (eid){  this._reid = eid;  return this; }
            else{  return this._reid; };
          };
        this._lconts = d['lconts'] || [];
        this.lconts = function(v){
            if(v){ this._lconts = v; return this; }
            else { return this._lconts; }
        };
        this._rconts = d['rconts'] || [];
        this.rconts = function(v){
            if(v){ this._rconts = v; return this; }
            else { return this._rconts; }
        };
    },
    toJSON: function(){
        var msg = this.base2json();
        msg['leid'] = this._leid;
        msg['reid'] = this._reid;
        msg['lconts'] = this._lconts;
        msg['rconts'] = this._rconts;
        return msg; 
    }
});

function testing(){
    alert("testing called.");
}