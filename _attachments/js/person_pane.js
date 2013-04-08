var testPWDOffering = function(){
    var acc_opt = $('#ib_acc_select option:selected').val();
    $('#ib_req_pwd').display = 'none';// = acc_opt == 'M0061' || acc_opt =='M0062';
}

var refresh_catSelect = function(){
    $('#infoCatSelect').find('option').remove();
    
    // 1. add FD.infocats (keys); 2. select FD.infoCatSelected
    for (var k in FD.infocats){
        $('#infoCatSelect').append($('<option>', {
            value: k, // Life chronicle
            text: ldict[k][FD.lcode]
        }));
    }
    $("#infoCatSelect").val(FD.infoCatSelected);
}

var ipchange = function(v){
    alert(v);
}

/* adding all ib categories for the user to pick from */
var init_ib_select_options = function(){
    /* ib_select is the select on Dlg_newib */
    /* clear the option list first*/
    $('#ib_select').find('option').remove();
    
    /* --------------------------------
     * adding all possible categories
     */
    $('#ib_select').append($('<option>', {
        value: "M7001",   // life chronicle
        text: ldict['M7001'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7002",   // Photo albums
        text: ldict['M7002'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7003",   // Places to remember
        text: ldict['M7003'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7004",   // Collections
        text: ldict['M7004'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7005",   // Hobbies
        text: ldict['M7005'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7006",   // Readings
        text: ldict['M7006'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7007",   // Writings
        text: ldict['M7007'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7008",   // Important people
        text: ldict['M7008'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7009",   // Correspondences
        text: ldict['M7009'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7010",   // Cars I drove
        text: ldict['M7010'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7011",   // Pets
        text: ldict['M7011'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7012",   // Jobs I have had
        text: ldict['M7012'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7013",   // Goals & plans
        text: ldict['M7013'][FD.lcode]
    }));
    $('#ib_select').append($('<option>', {
        value: "M7014",   // Accounts
        text: ldict['M7014'][FD.lcode]
    }));
}
/* Adding the access rights */
var init_ib_acc_select_options = function(){
    $('#ib_acc_select').find('option').remove();
    
    $('#ib_acc_select').append($('<option>', {
        value: "M7502", // Me only
        text: ldict['M7502'][FD.lcode]
    }));
    $('#ib_acc_select').append($('<option>', {
        value: "M7506", // Some members(s) of family
        text: ldict['M7506'][FD.lcode]
    }));
    $('#ib_acc_select').append($('<option>', {
        value: "M7500", // All family member
        text: ldict['M7500'][FD.lcode]
    }));
}

var init_personpane = function(){
    /* add a life chronicle to ib select, so t has one ib for start   */
    $('#infoCatSelect').find('option').remove();/* clear option first */

    // 1. add FD.infocats (keys); 2. select FD.infoCatSelected
    for (var k in FD.infocats){
        $('#infoCatSelect').append($('<option>', {
            value: k, // Life chronicle
            text: ldict[k][FD.lcode]
        }));
    }
    $("#infoCatSelect").val(FD.infoCatSelected);

    /* ------------------------------------------------
     * Handle button3 for adding a new info-board (ib)
     * ------------------------------------------------*/
    var Dlg_newib_cancel = function(){
        $('#Dlg_newib').dialog('close');
    }
    var Dlg_newib_execute = function(){
        /* get what has been selected from the dropdown in dialog */
        var selvalue = $("#ib_select option:selected").val();
        
        /* add only if this is not already in infoCatSelect's option(s)*/
        if($("#infoCatSelect option[value='" + selvalue +"']").length == 0){
            $('#infoCatSelect').append($('<option>', {
                value: selvalue,
                text: ldict[selvalue][FD.lcode]
            }));
            FD.infocats.push(selvalue);
        }
        /* set the new cat to be the current one */
        $("#infoCatSelect").val(selvalue);
        FD.infoCatSelected = selvalue;
        $('#Dlg_newib').dialog('close');
    }
    $("#button3").button({icons: { primary: "ui-icon-circle-plus"},text: false})
        .bind('click', function(){
            $('#ib_req_pwd').visible = false;
            
            var dlg = $('#Dlg_newib').dialog({
                autoOpen: false,
                title: ldict['M7505'][FD.lcode],
                modal: true,
                width: 680,
                height: 290,
                show: true,
                hide: true,
                buttons: {
                    'ok-button':{
                        text: ldict['M0002'][FD.lcode],
                        click: Dlg_newib_execute
                    },
                    'cancel-button':{
                        text: ldict['M0003'][FD.lcode],
                        click: Dlg_newib_cancel
                    }
                }
            })
            init_ib_select_options();
            init_ib_acc_select_options();
            dlg.dialog('open');
            return false;
        });
    
    /* --------------------------------------------------------
     * Handle button4 is for setting up the current info board
     * -------------------------------------------------------*/
    $("#button4").button({
            icons: { primary: "ui-icon-wrench"},
            text: false }).bind('click', function(){
    });
    
    /* --------------------------------------------------------------
     * Handle button5: adding a new entry into the current info board
     * --------------------------------------------------------------*/
    $("#button5").button({
        icons: { primary: 'ui-icon-pencil'},
        text: false}).bind('click', function(){
    });
    
    /* --------------------------------------------------------*/
    /* button100 is for testing purpose during the development */
    /* --------------------------------------------------------*/
    $("#button100").button({
        icons: { primary: 'ui-icon-gear'},
        text: false}).bind('click', function(){
    });
}