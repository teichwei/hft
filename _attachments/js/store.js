// 2012-12-09 Waterloo
// -----------------------------------
// this is to be after basics.js

// an entry in epool is a vid-sorted list of all entities with the
// same eid, this eid is the key of the (dictionary)entry. 
// This function is used as in epool[eid].sort(eidsort)
// -----------------------------------------------------------------
// vid-ascendant order
var vidsort = function(e1, e2){
    if (e1.vid() < e2.vid() ) return -1;
    if (e1.vid() > e2.vid() ) return 1;
    return 0;
};
var vid_reversesort = function(e1, e2){
    if (e1.vid() < e2.vid() ) return 1;
    if (e1.vid() > e2.vid() ) return -1;
    return 0;
};

// store is the model repository on client side
var Store = function(){
    this.epool = {};    // eid-keyed entity-list, vid (reverse)sorted
    this.rpool = {};
    
    // {<cid1>:{<eid>:<ent>, <eid>:<ent>, ..}, <cid2>:{}, ...}
    this.entdict = {};  
    this.txs = new Array();
    
    this.addEntity = function(e){
        var eid = e.eid();
        if (!(eid in this.epool)){
            this.epool[eid] = new Array(); 
        }
        if (this.epool[eid].indexOf(e) == -1){
            this.epool[eid].push(e);
            this.epool[eid].sort(vid_reversesort); // sort after every add
        }
        if (!this.entdict[e.cid()]){
            this.entdict[e.cid()] = {};
        }
        
        // entities of this cid are the ones with highst vid
        this.entdict[e.cid()][eid] = this.getEntity(eid);
        return this;    // return this/store for chaining
        
    };
    
    this.getEidsByCid = function(cid){
        var _keys = Object.keys(this.entdict[cid]);
        return _keys;
    };
    /**/
    this.getEntityWithId = function(id){
        var pair = id.split('_');
        if (pair.length == 2){
            return this.getEntity(pair[0],pair[1]);
        };
        return null;
    };
    // if no vid, get highst vid entity, otherwise, get entity with vid
    this.getEntity = function(eid, vid){
        if (eid in this.epool){
            if(vid){ // find the right ele with vid, return it
                for (i in this.epool[eid]){
                    if (this.epool[eid][i].vid() == vid)
                        return this.epool[eid][i];
                }
            }else{  //
                return this.epool[eid][0];
            }
        }
        return null;
    };
    // have to make sure the array is without a gap after del a ele
    this.delEntity = function(eid,vid){
    };
    this.addRL = function(r){
        if(r.id() in this.rpool) return this;
        this.rpool[r.id()] = r;
        return this;    // return this/store for chaining
    };
    this.getRL = function(id){
        if(id in this.rpool){
            return this.rpool[id];
        };
        return null;
    };
    this.load = function(data){
        for (var i in data.rows){
            var obj = data.rows[i].value;
            switch(obj.cid){
        case "RL": this.addRL(new Relation(obj));break; // connect/edge
        case "F1": this.addEntity(new F1(obj));  break; // family
        case "P1": this.addEntity(new P1(obj));  break; // person
        case "A1": this.addEntity(new A1(obj));  break; // login account
        case "T1": this.addEntity(new T1(obj));  break; // title
        case "E1": this.addEntity(new E1(obj));  break; // email
        case "B1": this.addEntity(new B1(obj));  break; // spousal bond
        case "BC": this.addEntity(new BC(obj));  break; // bond config
        case "RS": this.addEntity(new RS(obj));  break; // resource
        case "CE": this.addEntity(new CE(obj));  break; // chron-event
        case "TH": this.addEntity(new TH(obj));  break; // theme
        case "IP": this.addEntity(new IP(obj));  break; // info-pane
        case "A2": this.addEntity(new A2(obj));  break; // bank acct
        case "SE": this.addEntity(new SE(obj));  break; // session
        default: console.log("unknown obj: "+JSON.stringify(obj));
            }// switch
        }
    };
    this.authenticate = function(data, fid, usrname, psswrd){
        FD.loggedin = false;
        FD.username = '';
        for (var i in data.rows){
            var obj = data.rows[i].value;
            if (obj.cid == 'A1'){
                if (obj.fid == fid &&
                    obj.usrname == usrname &&
                    obj.psswrd == psswrd){
                    // hit!
                    FD.loggedin = true;
                    FD.username = usrname;
                    return;
                }
            }
        }
    }
    /* */
};

function pageload(){
    alert("page being loaded.");
}

