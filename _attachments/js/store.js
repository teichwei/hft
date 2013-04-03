// 2012-12-09 Waterloo
// -----------------------------------
// store holds all data model instances
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
    // eid-keyed entity-list, each list contains diff versions of
    // the same entity. vid (reverse)sorted: highst vid front: [0]
    this.epool = {};    
    this.rpool = {};
    
    // {<cid1>:{<eid>:<ent>, <eid>:<ent>, ..}, <cid2>:{}, ...}
    // each ent is the highst vid
    this.entdict = {};  
    this.txs = new Array();
    
    // add entity into epool and entdict
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
        
        // getEntity(eid) gets highst vid
        this.entdict[e.cid()][eid] = this.getEntity(eid);
        return this;    // return this/store for chaining
        
    };
    
    // get a list(array) of eids of all entities of the same cid
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
            }else{//
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
    // parse rows of data into epool/rpool
    this.load = function(data){
        for (var i in data.rows){
            var obj = data.rows[i].value;
            switch(obj._id.substr(8,2)){
        case "RL": this.addRL(new Relation(obj));break; // connect/edge
        case "FA": this.addEntity(new FA(obj));  break; // family
        case "PA": this.addEntity(new PA(obj));  break; // person
        case "BA": this.addEntity(new BA(obj));  break; // spousal bond
        case "BC": this.addEntity(new BC(obj));  break; // bond config
        case "RS": this.addEntity(new RS(obj));  break; // resource
        case "IT": this.addEntity(new IT(obj));  break; // theme
        case "IP": this.addEntity(new IP(obj));  break; // info-pane
        case "FC": this.addEntity(new FC(obj));  break; // bank acct
        case "SE": this.addEntity(new SE(obj));  break; // session
        default: console.log("unknown obj: "+JSON.stringify(obj));
            }// switch
        }
    };
    this.authenticate = function(data, fid, usrname, psswrd){
        FD.loggedin = false;
        for (var i in data.rows){
            var obj = data.rows[i].value;
            if (obj._id.substr(0,7) == fid && obj._id.substr(8,2) == 'FC'){
                if (obj.contdict && 
                    obj.contdict['purpose'] == 'ftc-login' &&
                    obj.contdict['usrname'] == usrname &&
                    obj.contdict['password'] == psswrd){
                    // hit!
                    FD.loggedin = true;
                    FD.loginuser = obj['user']; // eid of pa
                    return;
                }
            }
        }
    };
    
    // build all relationships between entities
    this.build_tree = function(){
        var pa_eids = this.getEidsByCid('PA');
        var ip_eids = this.getEidsByCid('IP');
        var it_eids = this.getEidsByCid('IT');
        var fc_eids = this.getEidsByCid('FC');
        
        // build relationships defined by all RLs: pa<->BA (spousal/children)
        for (var rlid in this.rpool){
            var rl = this.getRL(rlid);
            lent = this.getEntity(rl.leid());   // left: the containing entity
            rent = this.getEntity(rl.reid());   // right: the contained entity
            // loop thru all list name lent contains rent with(can be >1 lists)
            for (var i = 0; i < rl.lcont().length; i++){ 
                if (!lent[rl.lcont()[i]]){   // if list not existing
                    lent[rl.lcont()[i]] = [];            // create one
                }
                lent[rl.lcont()[i]].push(rent);  // put rent into the list
            }
            for (var i = 0; i < rl.rcont().length; i++){
                if (!rent[rl.rcont()[i]]){
                    rent[rl.rcont()[i]] = [];
                }
                rent[rl.rcont()[i]].push(lent);
            }
        }
        
        // build relationships not defined by RL: pa-ip-it-fc, and pa-fc
        // --------------------------------------------------------------
        // 1. collecting all ips whose owner is pa, under pa.ips[]
        for (var i = 0; i < pa_eids.length; i++){
            var pa = this.getEntity(pa_eids[i]);
            
            for(var j = 0; j < ip_eids.length; j++){
                var ip = this.getEntity(ip_eids[j]);
                if (ip.owner() == pa_eids[i]){
                    if (!pa['ips'])
                        pa.ips = [];
                    pa.ips.push(ip);
                }
            }
        } 
        // 2. collecting all its whose owner is ip, under ip.items[]
        for (var i = 0; i < ip_eids.length; i++){
            var ip = this.getEntity(ip_eids[i]);
            
            for(var j = 0; j < it_eids.length; j++){
                var it = this.getEntity(it_eids[j]);
                if (it.owner() == ip_eids[i]){
                    if (!ip['items'])
                        ip.items = [];
                    ip.items.push(it);
                }
            }
        } 
        // 3. collecting all fcs whose owner is it, under it.facets[]
        //    also, for fc with purpose=='ftc-login', build pa-fc
        for (var i = 0; i < it_eids.length; i++){
            var it = this.getEntity(it_eids[i]);
            
            for(var j = 0; j < fc_eids.length; j++){
                var fc = this.getEntity(fc_eids[j]);
                if (fc.owner() == it_eids[i]){
                    if (!it['facets'])
                        it.facets = [];
                    it.facets.push(fc);
                }
            }
        } 
        // since pa.credential == fc.eid(), fc.user() == pa.eid()
        // there is no need to build pa-fc relationship. It exists already.
    };// this.build_tree = function()
    /* */
};

function pageload(){
    //alert("page being loaded.");
}

