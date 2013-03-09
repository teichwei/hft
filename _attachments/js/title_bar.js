function authenticate(fid, usrname, psswrd){
    FD.store.authenticate(FD.data, fid, usrname, psswrd);
    if (FD.loggedin){
        FD.store.load(FD.data);
    }
}

function show_loggedin(){
    // show account-setting button, user name label, "log out" on button1
    $('#button2').show();
    $('#username').html(FD.username).show();
    $('#loginbutton').html(ldict['M1002'][FD.lcode]);
}
function show_loggedout(){
    // hide account-setting button and user name label. show "log-in" on button1
    $('#button2').hide();
    $('#username').hide();
    $('#loginbutton').html(ldict['M1001'][FD.lcode]);
}

var init_titlebar = function(){
    /* set all locale-sensitive widgets with language-code from FD.lcode */
    lswitch(FD.lcode);

    /* --------------------------*/
    /* language dropdown select  */
    /* --------------------------*/
    $(".lang_dropdown img.flag").addClass("flagvisibility");
    $(".lang_dropdown dt a").bind("click", function() {
        $(".lang_dropdown dd ul").toggle();
    });
    $(".lang_dropdown dd ul li a").bind("click", function() {
        var text = $(this).html();
        FD.lcode = $('span',this).html(); /* select down from this <a>       */
        lswitch(FD.lcode);                /* update locale-sensitive widgets */
        $(".lang_dropdown dt a span").html(text); /* update button-face      */
        $(".lang_dropdown dd ul").hide(); /* hide away the dropdown list     */
    });
    function getSelectedValue(id) {
        return $("#" + id).find("dt a span.value").html();
    }
    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (! $clicked.parents().hasClass("lang_dropdown"))
            $(".lang_dropdown dd ul").hide();
    });
    $("#flagSwitcher").bind("click", function() {
        $(".lang_dropdown img.flag").toggleClass("flagvisibility");
    });
    /* ---------END--------------*/
    /* language dropdown select  */
    /* --------------------------*/

    /* At the start, hide account-settings button and username label
     * since it is not logged in yet.
     */
    
    if (FD.loggedin){
        show_loggedin();
    } else{
        show_loggedout()
    }
    /* */

    /* --------------------------*/
    /* handle login button       */
    /* --------------------------*/
    /* event handler for login pop-up->Cancel */
    var Dlg_login_cancel = function(){
        $("#Dlg_login").dialog('close');
    }
    /* event handler for login pop-up -> login-button */
    var Dlg_login_execute = function(){        
        /* read inputs */
        var userid = $('#login_userid').val();
        var password = $('#login_password').val();
        
        /* handle login-response: FD.loggedin set true/false by this */
        authenticate('G8FVL9L',userid, password);

        if (FD.loggedin){
            show_loggedin();
        } else {
            alert('login failed, try again.');
        }
        $("#Dlg_login").dialog('close');
        return false;
    }
    /* login click handler: construct dialog */
    $("#button1").button().bind('click', function(){
        // if not logged in, show pop-up
        if (FD.loggedin){
            FD.loggedin = false;
            show_loggedout();
        } else {
            /* define login-dialog pop-up */
            var dlg = $('#Dlg_login').dialog({
                autoOpen: false,
                title: ldict['M1001'][FD.lcode], /* locaized title */
                modal: true,
                width: 350,
                height: 250,
                show: true,
                hide: true,
                buttons: {
                    'login-button': {
                        /* locaized login button face*/
                        text: ldict['M1001'][FD.lcode], 
                        click: Dlg_login_execute, /* function pointer */
                    },
                    'cancel-button': {
                        /* locaized cancel button face*/
                        text: ldict['M0003'][FD.lcode],
                        click: Dlg_login_cancel   /* function pointer */
                    }
                }
            })
            dlg.dialog('open');
        }
        return false;
    });
    $('#button2').button({
        icons: { primary: "ui-icon-wrench"},
        text: false
    }).bind('click', function(){
        $("#Dlg_account_settings").dialog("open");
    });

    /* Dialog - account-settings */
    Dlg_account_settings_Options = {
        width: 350,
        height: 450,
        modal: true,
        autoOpen: false,
        show: true,
        hide: true,
        buttons: {            
            'OK': function(){
                alert('saving account settings...');
                $("#Dlg_account_settings").dialog('close');
            },
            'CANCEL': function(){ $("#Dlg_account_settings").dialog('close'); }
        }
    };
    $("#Dlg_account_settings").dialog(Dlg_account_settings_Options);
    
    /* ----------END-------------*/
    /* handle login button       */
    /* --------------------------*/
}
