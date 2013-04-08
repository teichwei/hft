var db = $.couch.db("hftdb");
var store = new Store();
var FD = {
    db: db,
    store: store,
    data: null,
    loggedin: false,
    loginuser: '',
    focuspv: undefined,
    lcode: 'en',
    infocats: {
    //  <title>: <access>
        'M7001': 'M7500'
        /*
        'M7002': 'M7500',
        'M7003': 'M7500',
        'M7004': 'M7500',
        'M7005': 'M7500',
        'M7006': 'M7500'
        */
    },
    infoCatSelected: 'M7001'
};

function load_db() {
    FD.db.view("hftapp/byfid", {
        success: function(data) {
            FD.data = data;
        } 
    });
}

$(document).ready(function() {
    load_db();
    /* language dropdown select */
    init_titlebar();
    init_familypane();
    init_personpane();
});
