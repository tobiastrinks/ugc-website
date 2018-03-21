//reload
function reload( get_param ){
    if(get_param == undefined)
        window.location = window.location.href;
    else if(get_param == 0)
        window.location = glob_cms_filename;
    else
        window.location = glob_cms_filename+"?"+get_param;
}

//cookies
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

//url_get
function getParam( name, url ) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//coverimg
function coverimg( parent ){
    for(var x=0; x<parent.find("img").length; x++)
        parent.find("img").eq(x).resizeToParent();
}


//array operations
function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

//html parsing
function html_decode( string ){

    $("#wrapper").append("<span id='html_decode'></span>");
    var decode_element = $("#html_decode");
    decode_element.html(string);

    var result = decode_element.text();
    decode_element.remove();

    return result;
}

//filename operations
function filename_control( filename ){

    var filename_error_char = Array("#","%","&","{","}","\\","<",">","*","?","/"," ","$","!","'",'"',":","@","+","´","`","|","=",".");

    var return_val = 1;

    for(var x=0; x<filename_error_char.length; x++){

        if (filename.indexOf( filename_error_char[x] ) != -1){
            return_val = filename_error_char[x];
        }
    }

    if(return_val == 1)
        return true;
    else
        return return_val;
}

function delete_filetype( filename ){

    var filetype = filename.slice(filename.indexOf("."), filename.length);
    filename = filename.replace(filetype, "");
    return filename;
}

function get_filetype( filename ){

    filetype = filename.slice(filename.indexOf("."), filename.length);
    return filetype;
}

//Math functions
(function() {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

//sound
function playSound(params){
    $("#playSound").html('<audio autoplay="autoplay"><source src="' + params.mp3 + '" type="audio/mpeg" /><source src="' + params.ogg + '" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + params.mp3 +'" /></audio>');
}

//scrolling
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
    preventDefault(e);
}

function disable_scroll() {
    if (window.addEventListener) {
        window.addEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = wheel;
    document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}

//sortable bug
function sort_jQueryBug8342Fix(e, ui) {

    // ui-sortable-helper: element being dragged
    // ui-sortable-placeholder: invisible item on the original place of dragged item
    var container = $(this);
    var placeholder = container.children('.ui-sortable-placeholder');

    var draggedCenterX = ui.helper.position().left + ui.helper.outerWidth()/2;
    var draggedCenterY = ui.helper.position().top + ui.helper.outerHeight()/2;

    container.children().each(function () {
        var item = $(this);

        if(!item.hasClass( 'ui-sortable-helper' ) && !item.hasClass( 'ui-sortable-placeholder' ) ) {
            var itemCenterX = item.position().left + item.outerWidth()/2;
            var itemCenterY = item.position().top + item.outerHeight()/2;

            // Pythagorean theorem
            var distanceBetweenCenters = Math.sqrt(Math.pow(itemCenterX - draggedCenterX, 2) + Math.pow(itemCenterY - draggedCenterY, 2));

            var minDimension = Math.min(item.outerWidth(), item.outerHeight(), ui.helper.outerWidth(), ui.helper.outerHeight());
            var overlaps = distanceBetweenCenters < (minDimension / 2);

            if (overlaps) {
                if (placeholder.index() > item.index()) {
                    placeholder.insertBefore(item);
                } else {
                    placeholder.insertAfter(item);
                }
                container.sortable('refreshPositions');
                return false;
            }
        }
    });
}


/*tt_plugins*/
function tt_float_gallery( wrapper, elements ){
    $(window).load(function(){
        elements.css("width", ((wrapper.innerWidth()-4 - elements.length*(elements.outerWidth(true)-elements.innerWidth())) / elements.length)-1 + "px");

        $(window).resize(function(){
            elements.css("width", ((wrapper.innerWidth()-4 - elements.length*(elements.outerWidth(true)-elements.innerWidth())) / elements.length)-1 + "px");
        });

        elements.on("remove", function(){
            elements.css("width", ((wrapper.innerWidth()-4 - elements.length*(elements.outerWidth(true)-elements.innerWidth())) / elements.length)-1 + "px");
        });
    });
}
function tt_form_submit( form_element, callback ){

    var form = form_element[0]; // form has to have ID: <form id="formID">
    form.noValidate = true;
    form.addEventListener('submit', function(event) { // listen for form submitting
        if (!event.target.checkValidity()) {
            event.preventDefault(); // dismiss the default functionality
            callback(false); // callback error
        }
        else{
            callback(form_element);
        }
    }, false);
}
function tt_kontakt_form( form_element, submit_element, email_str, subject_str ){

    tt_form_submit( form_element, function(callback){

        if(callback == false) {
            alert("Bitte füllen Sie alle benötigten Felder aus."); // error message
        }
        else{
            if(submit_element.hasClass("passive") == false){

                var val_name = [];
                var val_content = [];

                form_element.find("input, textarea, select").each(function( index ){

                    val_name[index] = $(this).attr("name");
                    val_content[index] = $(this).val();
                });

                submit_element.text("Wird gesendet...").addClass("passive");

                $.post( $("#cms_home_dir").text()+"cms/xml_request/tt_plugins.php?task=kontakt_form", {
                    'val_name[]'	: val_name,
                    'val_content[]'	: val_content,
                    email			: email_str,
                    subject			: subject_str
                })
                    .done(function( data ) {
                        if(data == "")
                            submit_element.text("Gesendet");
                        else
                            alert(data);
                    });
            }
            else{
                submit_element.text("Bereits gesendet");
            }
        }
    });
}

function tt_scroll_effekt( start_top , stop_top , start_x , stop_x){

    var return_val = 0;

    if(start_top > $(window).scrollTop())
        return_val = 0;
    else{
        return_val = ($(window).scrollTop()-start_top) / (stop_top-start_top);
    }

    if(start_x == 0 && stop_x == 0)
        return return_val;
    else{
        return start_x +(stop_x-start_x)*return_val;
    }
}

//dropfile
$(document).bind('drop dragover', function (e) {
    e.preventDefault();
});