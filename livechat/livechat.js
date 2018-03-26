/*
	-- requirements --

	#jQuery JavaScript Library v1.11.1 or later
	#jQuery UI - v1.12.1 - 2016-09-25 or later

	#PHP 5.0 or later
	#mysql based database > config.php


	-- required external functions (refresh) --

	lc_ready(){

	}
	function lc_new_msg( chatroom_id, notifications, content, user_src_key, timestamp ){

	}
	function lc_chatroom_report( chatroom_id, report, user_key, user_key_action, timestamp ){

	}
	function lc_user_status( status, user_key ){

	}
	function lc_user_activity( activity, chatroom_id, user_key ){

	}
	function lc_translate_user_data( type, element ){
		//type: "timestamp","user_key"
	}


	-- usable functions --

	lc_chatroom_create( name, max_users, receiving_type, callback )
	lc_chatroom_remove( chatroom_id )											- rights: 'root'
	lc_chatroom_status( chatroom_id, status )									- rights: 'admin'/'root'  descr: close chatroom (no remove)
	lc_chatroom_add_user( chatroom_id, user_key )								- rights: 'admin'/'root'
	lc_chatroom_remove_user( chatroom_id, user_key )							- rights: 'admin'/'root'

	lc_chatroom_private( 	user_key, receiving_type,
							chatbox_area, chatbox_clonable, max_msg ) 			- callback: chatroom_id,'user_exist_error'  descr: chatroom 2 users

	lc_user_set_notifications( chatroom_id, val )								- enables/disables user_notifications

	lc_chatroom_init( chatroom_id, chatbox_area, chatbox_clonable, max_msg )

	lc_user_register()															- register user_key > not temporary

	lc_chatroom_id_receive( search_str, callback )
	lc_chatroom_preview_receive( chatroom_id, callback )
	lc_chatroom_title_receive( chatroom_id, callback )
	lc_chatroom_msg_receive( chatroom_id, start_msg, anzahl_msg, callback )
	lc_user_recommend( anzahl, callback )

	-- usable session_var --

	$_SESSION["lc_user_key"]		- define user_key (login)
	$_SESSION["lc_user_temporary"]	- set 0 if user is registred
	$_SESSION["lc_user_rights"]		- 'root'
	$_SESSION["lc_user_contact"][]	- list of contactable users //weitermachen

*/

/* -- js settings -- */

//chatroom_report_output

var chatroom_report_output = [];
chatroom_report_output["create"] 		= "Chatroom wurde von /user_key/ erstellt.";
chatroom_report_output["open"] 			= "Chatroom wurde von /user_key/ geöffnet.";
chatroom_report_output["close"] 		= "Chatroom wurde von /user_key/ geschlossen.";
chatroom_report_output["clear"] 		= "Chatverlauf wurde von /user_key/ zurückgesetzt.";
chatroom_report_output["add_user"] 		= "/user_key_action/ wurde von /user_key/ hinzugefügt.";
chatroom_report_output["remove_user"] 	= "/user_key_action/ wurde von /user_key/ entfernt.";
chatroom_report_output["add_admin"] 	= "Du bist jetzt Admin.";
chatroom_report_output["remove_admin"] 	= "Deine Admin-Rechte wurden entzogen.";
chatroom_report_output["user_join"] 	= "/user_key/ ist beigetreten.";
chatroom_report_output["user_leave"] 	= "/user_key/ hat den Chatroom verlassen.";

//global_var

var livechat = $.Deferred();

var lc_user_key;

var lc_refresh_loop = [];
var user_activity = 1;
var user_activity_timeout = false;
var user = 0;

var lc_notcounter = [];

var lc_chatroom_init_receive_scroll_height_cache = 0;

var notificationsInit = $.Deferred();

//-----------------------------------init socket_connection
var socketInit = $.Deferred();

// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

// const connection = new WebSocket('ws://172.17.0.1:8443');
const connection = new WebSocket('ws://lc.unigrow.ttrks.de:8443');

connection.onopen = function () {
    // connection is opened and ready to use
    connection.send(JSON.stringify({
        type: 'auth',
        user_key: lc_user_key
    }));
    socketInit.resolve();
};

connection.onerror = function (error) {
    // an error occurred when sending/receiving data
	console.log('nodejs error: '+ JSON.stringify(error));
};

connection.onmessage = function (message) {
	console.log(message.data);
    // try to decode json (I assume that each message
    // from server is json)
    try {
        var refresh_val = JSON.parse(message.data);
    } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', message.data);
    }

    var add_msg_chatroom_id 			= [];
    var add_msg_chatroom_x 				= 0;

    var add_report_chatroom_id 			= [];
    var add_report_user_key 			= [];
    var add_report_x 					= 0;

    var invite_user_cancel_chatroom_id 	= [];
    var invite_user_cancel_user_key 	= [];
    var invite_user_cancel_x 			= 0;

	if(refresh_val.type == "msg" && refresh_val.user_src_key != lc_user_key){

		if(refresh_val.notifications == 1){
			if(lc_notcounter[refresh_val.chatroom_id] == undefined){
				lc_notcounter[refresh_val.chatroom_id] = {
					msg: 0,
					report: 0
				};
			}
            var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+refresh_val.chatroom_id+"']");
			if(!chatbox.length) {
                lc_notcounter[refresh_val.chatroom_id].msg++;
            }
		}

		lc_chatroom_init_add_msg( refresh_val.chatroom_id, refresh_val.id, refresh_val.content, refresh_val.user_src_key, refresh_val.timestamp, refresh_val.wrap_msg, function(){
			lc_chatroom_init_receive_scroll( refresh_val.chatroom_id, -2 );
		});
		lc_new_msg(refresh_val.chatroom_id, refresh_val.notifications, refresh_val.content, refresh_val.user_src_key, refresh_val.timestamp);
	}
	if(refresh_val.type == "status"){

		$("*[data-lc_type='user_status'][data-lc_user_key='"+refresh_val.user_key+"']").each(function(){
			$(this).find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
			$(this).find("*[data-lc_type='user_status_"+refresh_val.status+"']").show();
		});

		var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var user_count_online = chatbox.find("*[data-lc_type='user_count_online']");
		var user_count_offline = chatbox.find("*[data-lc_type='user_count_offline']");

		if(user_count_online.length || user_count_offline.length){

			lc_user_count( chatbox.attr("data-lc_chatroom"), function(callback){
				if(user_count_online.length){
					user_count_online.text( callback.online );
				}
				if(user_count_offline.length){
					user_count_offline.text( callback.offline );
				}
			});
		}

		lc_user_status(refresh_val.status, refresh_val.user_key);
	}
	if(refresh_val.type == "activity" && refresh_val.user_key != lc_user_key){
		var chatbox = $("*[data-lc_type='chatbox']");
		if(refresh_val.activity == 'typing')
			chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+refresh_val.chatroom_id+"']");
        chatbox.find("*[data-lc_type='user_activity']").each(function(){

			if(refresh_val.activity != "0"){

				var activity_text = $(this).attr("data-lc_activity_text");

				if(activity_text != undefined){

					activity_text = activity_text.replace("/user_key/", "<span data-lc_transl='user_key'>"+refresh_val.user_key+"</span>");

					$(this).html(activity_text);
					lc_transl($(this), function(){});
				}
			}
			else
				$(this).html("");
		});

		lc_user_activity(refresh_val.activity, refresh_val.activity_chatroom_id, refresh_val.user_key);
	}
	if(refresh_val.type == "report"){

        if(refresh_val.report == "invite_user" && refresh_val.user_key_action == lc_user_key){
            if(lc_notcounter[refresh_val.chatroom_id] == undefined){
                lc_notcounter[refresh_val.chatroom_id] = {
                    msg: 0,
                    report: 0
                };
            }
            var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+refresh_val.chatroom_id+"']");
            if(!chatbox.length) {
                lc_notcounter[refresh_val.chatroom_id].report++;
            }
        }

		if(refresh_val.report != "invite_user" && refresh_val.report != "invite_user_cancel" && refresh_val.report != "user_leave_remove" && refresh_val.report != "user_invite_reject"){

			lc_chatroom_init_add_report(refresh_val.chatroom_id, refresh_val.id, refresh_val.report, refresh_val.user_key, refresh_val.user_key_action, refresh_val.timestamp, function(){

				if(lc_user_key == refresh_val.user_key)
					lc_chatroom_init_receive_scroll( refresh_val.chatroom_id, -1 );
				else
					lc_chatroom_init_receive_scroll( refresh_val.chatroom_id, -2 );
			} );
		}
		if(refresh_val.report == "invite_user_cancel_remove" && refresh_val.user_key_action == lc_user_key){

			lc_chatroom_invite_cancel_remove(function(){
				lc_chatroom_report(refresh_val.chatroom_id, "invite_user_cancel", refresh_val.user_key, lc_user_key, "");
			});
		}
		else
			lc_chatroom_report(refresh_val.chatroom_id, refresh_val.report, refresh_val.user_key, refresh_val.user_key_action, refresh_val.timestamp);


		var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+refresh_val.chatroom_id+"']");

		if(chatbox.length){

			if(refresh_val.report == "open" || refresh_val.report == "close"){

				var form_element = chatbox.find("*[data-lc_type='form']");
				if(form_element.length){

					var input_element_placeholder = form_element.find("*[data-lc_type='form_input'][data-lc_placeholder_"+refresh_val.report+"]");
					input_element_placeholder.attr("placeholder", input_element_placeholder.attr("data-lc_placeholder_"+refresh_val.report));

					if(refresh_val.report == "open"){
						form_element.find("*[data-lc_type='form_submit']").removeClass("inactive");
						form_element.find("*[data-lc_type='form_input']").prop('readonly', false);
					}
					else{
						form_element.find("*[data-lc_type='form_submit']").addClass("inactive");
						form_element.find("*[data-lc_type='form_input']").prop('readonly', true);
					}
				}

				chatbox.find("*[data-lc_type='open'], *[data-lc_type='close']").show();
				chatbox.find("*[data-lc_type='"+refresh_val.report+"']").hide();
			}
			if(refresh_val.report == "clear"){

				lc_chatroom_init_history( refresh_val.chatroom_id, 0, 50, function(){});
			}

			if(refresh_val.report == "add_user" || refresh_val.report == "user_leave" || refresh_val.report == "remove_user"){
				if(refresh_val.user_key_action == lc_user_key){

					var form_element = chatbox.find("*[data-lc_type='form']");
					if(form_element.length){

						if(refresh_val.report == "add_user"){
							form_element.find("*[data-lc_type='form_submit']").removeClass("inactive");
							form_element.find("*[data-lc_type='form_input']").prop('readonly', false);
							form_element.find("*[data-lc_type='form_input']").attr("placeholder", form_element.find("*[data-lc_type='form_input']").attr("data-lc_placeholder_open"));
						}
						else{
							form_element.find("*[data-lc_type='form_submit']").addClass("inactive");
							form_element.find("*[data-lc_type='form_input']").prop('readonly', true);

							var placeholder = "data-lc_placeholder_removed";
							if(refresh_val.report == "user_leave")
								placeholder = "data-lc_placeholder_left";

							form_element.find("*[data-lc_type='form_input']").attr("placeholder", form_element.find("*[data-lc_type='form_input']").attr(placeholder));
						}
					}
				}
			}

			if(refresh_val.report == "add_user" || refresh_val.report == "user_join" || refresh_val.report == "user_leave" || refresh_val.report == "remove_user"){
				lc_chatroom_init_chatbox( chatbox, "head", function(){});
			}
			if(refresh_val.report == "invite_user" ||
				refresh_val.report == "invite_user_cancel" ||
				refresh_val.report == "invite_user_cancel_remove" ||
				refresh_val.report == "user_invite_reject" ||
				refresh_val.report == "user_join" ||
				refresh_val.report == "user_leave" ||
				refresh_val.report == "add_admin" ||
				refresh_val.report == "remove_admin" ||
				refresh_val.report == "add_user" ||
				refresh_val.report == "remove_user"){

				var info = chatbox.find("*[data-lc_type='info'].active");
				info.css("visibility", "hidden");
				lc_chatroom_init_chatbox( chatbox, "info", function(){
					info.css("visibility", "visible");
					chatbox.find("*[data-lc_type='info'].active").hide().fadeIn(300);
				});
			}
		}

		if(refresh_val.report == "user_leave_remove" && refresh_val.user_key_action == lc_user_key){

			lc_chatroom_user_leave_remove_action(refresh_val.chatroom_id, function(){

				//remove chatbox
				lc_chatroom_remove_chatbox( chatbox );
			});
		}
	}
};


//notifications
function lc_getNotSum( chatroom_id ){
	if(lc_notcounter[chatroom_id] != undefined)
		return lc_notcounter[chatroom_id].msg + lc_notcounter[chatroom_id].report;
	else
		return 0;
}
function lc_notifications_reset( chatroom_id, callback ){

	lc_notcounter[chatroom_id] = {
		msg: 0,
		report: 0
	};

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task			: "notifications_reset",
		chatroom_id		: chatroom_id
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}


//chatrooms

function lc_chatroom_create( title, max_users, receiving_type, user_join, readonly, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task			: "chatroom_create",
		title			: title,
		max_users 		: max_users,
		receiving_type 	: receiving_type,
		user_join		: user_join,
		readonly		: readonly
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			callback(data);

	});
}
function lc_chatroom_remove( chatroom_id ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_remove",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else{

		}
	});
}
function lc_chatroom_clear( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task 		: "chatroom_clear",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
        lc_send_report();
		if(data == "")
			callback(1);
		else
			alert(data);
	});
}
function lc_chatroom_update( chatroom_id, attr, val, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task 		: "chatroom_update",
		chatroom_id	: chatroom_id,
		attr		: attr,
		val			: val
	})
	.done(function( data ) {
        lc_send_report();
		if(data == "")
			callback(1);
		else
			alert(data);
	});
}
function lc_chatroom_add_user( chatroom_id, user_key, receiving_type, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_add_user",
		chatroom_id	: chatroom_id,
		user_key	: user_key,
		receiving_type : receiving_type
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_remove_user( chatroom_id, user_key ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_remove_user",
		chatroom_id	: chatroom_id,
		user_key	: user_key
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
	});
}
function lc_chatroom_add_admin( chatroom_id, user_key, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_add_admin",
		chatroom_id : chatroom_id,
		user_key	: user_key
	})
	.done(function( data )	{
        lc_send_report();
		if(data=="")
			callback(1);
		else
			alert(data);
	});
}
function lc_chatroom_remove_admin( chatroom_id, user_key, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_remove_admin",
		chatroom_id : chatroom_id,
		user_key	: user_key
	})
	.done(function( data )	{
        lc_send_report();
		if(data=="")
			callback(1);
		else
			alert(data);
	});
}
function lc_chatroom_invite_user( chatroom_id, user_key, receiving_type ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_invite_user",
		chatroom_id	: chatroom_id,
		user_key	: user_key,
		receiving_type : receiving_type
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
	});
}
function lc_chatroom_invite_cancel_remove( callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_invite_cancel_remove"
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_join( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_join",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_leave( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_leave",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_leave_remove( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_leave_remove",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_leave_remove_action( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_leave_remove_action",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_invite_reject( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_invite_reject",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
        lc_send_report();
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_chatroom_user_readonly( chatroom_id ){ //join as readonly

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_user_readonly",
		chatroom_id	: chatroom_id
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
	});
}

function lc_chatroom_private_check( user_key, callback ){ //isset private chatroom with user_key

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "chatroom_private_check",
		user_key	: user_key
	})
	.done(function( data ) {
		if(data != "")
			callback( $.parseJSON(data) );
		else
			callback( 0 );
	});
}
function lc_chatroom_private( user_key, receiving_type, chatbox_area, chatbox_clonable, max_msg, msg, callback ){

	var new_chatbox = chatbox_clonable;
	var chatbox = new_chatbox.clone();
	chatbox_area.html("");

	chatbox.appendTo(chatbox_area);
	chatbox = chatbox_area.find("*[data-lc_type='chatbox']");

	chatbox	.removeAttr("id");
	chatbox	.find("*[data-lc_empty='hidden']").hide();
	chatbox .find("*[data-lc_empty='visible']").show();

	chatbox_area.css("visibility", "hidden");

	var task1 = $.Deferred();
	var task2 = $.Deferred();

	//user_key
	var content_element = chatbox.find("*[data-lc_type='user_key']");
	if(content_element.length){
		content_element.each(function(){
			$(this).text(user_key);
		});
		lc_retransl( chatbox, function(){
			task1.resolve();
		});
	}
	else
		task1.resolve();

	//user_status
	var content_element = chatbox.find("*[data-lc_type='user_status']");
	if(content_element.length){
		content_element.attr("data-lc_user_key", user_key);

		lc_user_status_receive( user_key, function( result ){

			content_element.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
			content_element.find("*[data-lc_type='user_status_"+result[user_key]+"']").show();

			task2.resolve();
		});
	}
	else
		task2.resolve();

	$.when(task1, task2).done(function(){
		lc_chatbox_ready( chatbox, "private_empty", 0, 0, 0, 0, 0, function(){
			chatbox_area.stop().hide().css("visibility", "visible").fadeIn(500);
		});
	}).promise();

	//init form
	var send_button = chatbox.find("*[data-lc_type='form_submit']");
	var input_element = chatbox.find("*[data-lc_type='form_input']");

	var input_element_placeholder = chatbox.find("*[data-lc_type='form_input'][data-lc_placeholder_open]");
	input_element_placeholder.attr("placeholder", input_element_placeholder.attr("data-lc_placeholder_open"));

	function open_chatroom(){

		//create chatroom
		$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
			task	 : "chatroom_private",
			receiving_type : receiving_type,
			user_key : user_key
		})
		.done(function( chatroom_id ) {
            lc_send_report();
			if(chatroom_id != "rights_error"){
				chatbox_area.css("visibility", "hidden");
				chatbox.remove();

				callback(chatroom_id);

				lc_send_msg( chatroom_id, input_element.val() );
			}
			else
				alert(chatroom_id);
		});

		send_button.unbind("click.private_empty");
		input_element.unbind("click.private_empty");
	}

	if(!msg){
        send_button.bind("click.private_empty", function(){
            if(input_element.val() != "")
                open_chatroom();
        });
        input_element.bind("keypress.private_empty", function(event){
            if(event.which == 13 && input_element.val() != ""){
                open_chatroom();
            }
        });
	}
	else{
        input_element.val(msg);
		open_chatroom();
	}
}


//user

function lc_user_register(){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "user_register"
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
	});
}
function lc_user_set_activity( activity ) {
    if (user_activity_timeout)
        clearTimeout(user_activity_timeout);
	if (activity == 'typing') {
		user_activity_timeout = setTimeout(function () {
			lc_user_set_activity(0);
		}, 1500);
	}
    if (user_activity != activity){
        user_activity = activity;
		connection.send(JSON.stringify({
			type: 'activity',
			activity: activity
		}));
    }
}
function lc_user_set_notifications( chatroom_id, val, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "user_notifications",
		chatroom_id : chatroom_id,
		val			: val
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
		else
			callback(1);
	});
}
function lc_user_notifications_receive( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "user_notifications_receive",
		chatroom_id : chatroom_id
	})
	.done(function( data ) {
		if(data != "")
			callback(data);
	});
}

function lc_user_status_receive( user_key_string, callback ){

	var user_key = user_key_string.split(",");

	new Http('node').post('/user/status', user_key, function (result) {
		console.log(result);
		callback(result);
	});
}

function lc_user_remove( user_key, type, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "user_remove",
		user_key 	: user_key,
		type		: type
	})
	.done(function( data )	{
		if(data != "")
			alert(data)
		else
			callback(1);
	});
}


//msg

function lc_send_msg( chatroom_id, content ){

	lc_user_set_activity(0);

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 : "send_msg",
		chatroom_id : chatroom_id,
		content : content
	})
	.done(function( data ) {
		if(data != ""){
			try {
				var result = $.parseJSON(data);
			}
			catch (e) {
				alert(data);
			};

			connection.send( JSON.stringify({
				type: 'msg',
				id: result.id,
				chatroom_id: chatroom_id,
                content: content,
				timestamp: result.timestamp,
				wrap_msg: result.wrap_msg
			}) );

            lc_notifications_reset( chatroom_id, function(){
                lc_notification_update();
            });

            //remove lc_msg_not
            var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");
            if(chatbox.length){

                chatbox.find(".lc_msg_not").removeClass("lc_msg_not");
            }

            lc_chatroom_init_add_msg( chatroom_id, result["id"], content, result["user_key"], result["timestamp"], result["wrap_msg"], function(){
                lc_chatroom_init_receive_scroll( chatroom_id, -1 );
            });
		}
	});
}

//report
function lc_send_report(){
    connection.send(JSON.stringify({
        type: 'report'
    }));
}


//chatroom_init

function lc_chatroom_init( chatroom_id, chatbox_area, chatbox_clonable, max_msg, callback ){

	var old_chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	if(old_chatbox.length)
		old_chatbox.html("").attr("data-lc_chatroom", "");

	var chatbox = chatbox_clonable.clone();
	chatbox_area.html("");

	chatbox.appendTo(chatbox_area);
	chatbox = chatbox_area.find("*[data-lc_type='chatbox']");

	chatbox	.removeAttr("id").attr("data-lc_chatroom", chatroom_id);

	chatbox	.find("*[data-lc_empty='hidden']").show();
	chatbox .find("*[data-lc_empty='visible']").hide();

	var task1 = $.Deferred();
	var task2 = $.Deferred();

	//load chatbox
	lc_chatroom_init_chatbox( chatbox, 0, function(){
		task1.resolve();
	});

	if(lc_notcounter[chatroom_id] != undefined && (lc_notcounter[chatroom_id].msg+10) > max_msg){

		max_msg = lc_notcounter[chatroom_id].msg+10;
	}

	//load chatroom_history
	lc_chatroom_init_history( chatroom_id, 0, max_msg, function(){
		task2.resolve();
	});

	//socket join
    connection.send(JSON.stringify({
        type: 'join',
        chatroom_id: chatroom_id
    }));

	//callback
	$.when(task1, task2).done(function(){
		callback(1);
	}).promise();

	//load_more_button
	chatbox.find("*[data-lc_type='history_load_more']").click(function(){
		lc_chatroom_init_receive( chatroom_id, chatbox.find("*[data-lc_type='history_msg_content_element'][data-lc_id]").length, max_msg, function(){} );
	});

}
function lc_chatroom_init_history( chatroom_id, start_msg, max_msg, callback ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	chatbox.find("*[data-lc_type='history_msg']")	.eq(0)
													.addClass("empty").hide()
													.attr("data-lc_id", "").attr("data-lc_wrap_msg", "")
													.find("*[data-lc_type='history_msg_content_element']").attr("data-lc_id", "");

	chatbox.find("*[data-lc_type='history_report']").eq(0)
													.addClass("empty").hide()
													.attr("data-lc_id", "");

	chatbox.find("*[data-lc_type='history_msg']:not(.empty), *[data-lc_type='history_report']:not(.empty)").remove();

	lc_chatroom_init_receive( chatroom_id, start_msg, max_msg, function(){
		//mark msg/report notifications
		var msg_elem = $("*[data-lc_type='history_msg_content_element'][data-lc_id]");
		for (var x=0; x<lc_notcounter[chatroom_id].msg; x++){
            msg_elem.eq(msg_elem.length-1-x).addClass("lc_msg_not");
		}
        var report_elem = $("*[data-lc_type='history_report'][data-lc_id]");
        for (var x=0; x<lc_notcounter[chatroom_id].report; x++){
            report_elem.eq(report_elem.length-1-x).addClass("lc_report_not");
        }
		lc_notifications_reset( chatroom_id, function(){
			lc_notification_update();
			callback(1);
		});
	});
}
function lc_chatroom_init_add_element( chatroom_id, type, id, timestamp, wrap_msg, callback ){

	var chat_history = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']").find("*[data-lc_type='history']");

	if(chat_history.find("*[data-lc_type='history_"+type+"'][data-lc_id='"+id+"']").length == 0){

		if(chat_history.find(".empty[data-lc_type='history_"+type+"']").length == 0){
			chat_history.find("*[data-lc_type='history_"+type+"']").eq(0).clone().addClass("empty").hide().appendTo(chat_history);
		}

		var empty_element = chat_history.find(".empty[data-lc_type='history_"+type+"']");
		var msg_element = chat_history.find("*[data-lc_type='history_msg']:not(.empty), *[data-lc_type='history_report']:not(.empty)");

		if(msg_element.length){
			for(var x=0; x<msg_element.length; x++){

				var element_type = msg_element.eq(x).attr("data-lc_type");

				if(parseInt(msg_element.eq(x).attr("data-lc_timestamp")) >= parseInt(timestamp)){
					msg_element.eq(x).before(empty_element);
					x=msg_element.length;
				}
			}

			var last_element = msg_element.eq(msg_element.length-1);
			var element_type = last_element.attr("data-lc_type");

			if(parseInt(last_element.attr("data-lc_timestamp")) < parseInt(timestamp))
				last_element.after(empty_element);
		}

		var msg_content_element = empty_element.find("*[data-lc_type='history_msg_content_element']");
		if(msg_content_element.length){

			var clone_cache = msg_content_element.eq(0).clone();
			var msg_content = empty_element.find("*[data-lc_type='history_msg_content']");

			msg_content.html("");
			clone_cache.text("").appendTo(msg_content);
		}

		var timestamp_date = new Date(timestamp*1000);
		var timestamp_min = timestamp_date.getMinutes();

		empty_element.attr("data-lc_id", id).attr("data-lc_timestamp", timestamp);
		if(wrap_msg != 0)
			empty_element.attr("data-lc_wrap_msg", wrap_msg);

		empty_element.removeClass("empty").removeClass("lc_own_msg").show();

		callback( empty_element	);
	}
	else{
		callback(0);
	}
}
function lc_chatroom_init_add_msg( chatroom_id, id, content, user_src_key, timestamp, wrap_msg, callback ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	if(chatbox.length){

		var msg_wrap_element = chatbox.find("*[data-lc_type='history_msg'][data-lc_wrap_msg='"+wrap_msg+"']");

		if(	msg_wrap_element.length && wrap_msg != 0 && msg_wrap_element.find("*[data-lc_type='history_msg_content_element'][data-lc_id='"+id+"']").length == 0){

			var msg_content_element = msg_wrap_element.find("*[data-lc_type='history_msg_content_element']");

			for(var x=0; x<msg_content_element.length; x++){

				var element_timestamp = parseInt(msg_content_element.eq(x).attr("data-lc_timestamp"));

				if(element_timestamp > timestamp || (element_timestamp==timestamp && msg_content_element.eq(x).attr("data-lc_id") > id)){

					msg_content_element.eq(0)	.clone()
												.addClass("new_content_element")
												.insertBefore(msg_content_element.eq(x));
					break;
				}
				else if((x+1)==msg_content_element.length && ( element_timestamp < timestamp || (element_timestamp==timestamp && msg_content_element.eq(x).attr("data-lc_id") < id))){

					msg_content_element.eq(0)	.clone()
												.addClass("new_content_element")
												.insertAfter(msg_content_element.eq(x));
					break;
				}
			}

			var new_element = msg_wrap_element.find(".new_content_element");

			new_element	.attr({"data-lc_user_src_key":user_src_key, "data-lc_timestamp":timestamp, "data-lc_id":id})
						.html(content)
						.removeClass("lc_msg_not");

			new_element.removeClass("new_content_element");

			callback( 1 );
		}
		else{
			lc_chatroom_init_add_element( chatroom_id, "msg", id, timestamp, wrap_msg, function( new_element ){
				if(new_element != 0){
					new_element.attr("data-lc_user_src_key", user_src_key);

					if(user_src_key == lc_user_key){
						new_element.addClass("lc_own_msg");
					}

					content_element = new_element.find("*[data-lc_type='history_msg_user_src']");
					if(content_element.length)
						content_element.text(user_src_key);

					content_element = new_element.find("*[data-lc_type='history_msg_timestamp']");
					if(content_element.length)
						content_element.text(timestamp);

					content_element = new_element.find("*[data-lc_type='history_msg_content']");
					if(content_element.length){

						var content_element2 = content_element.find("*[data-lc_type='history_msg_content_element']");
						content_element2.html(content);
						content_element2.attr({"data-lc_id":id, "data-lc_user_src_key":user_src_key, "data-lc_timestamp":timestamp});
					}

					//transl
					lc_retransl( new_element, function(){
						callback( new_element );
					});
				}
				else
					callback(0);
			});
		}
	}
}
function lc_chatroom_init_add_report( chatroom_id, id, report, user_key, user_key_action, timestamp, callback ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	if(chatbox.length){

		var history_hide	 = false;
		var history_hide_str = chatbox.find("*[data-lc_type='history']").attr("data-lc_report_hide");

		if(history_hide_str != undefined && history_hide_str != ""){

			var hide_elements = history_hide_str.split(",");

			for(var x=0; x<hide_elements.length; x++){

				if(hide_elements[x] == report)
					history_hide = true;
			}
		}

		if(	history_hide == false &&
			report != "invite_user" &&
			report != "invite_user_cancel" &&
			report != "invite_user_cancel_remove" &&
			report != "user_invite_reject" &&
			report != "user_leave_remove" &&
			report != "remove" &&
			((report != "add_admin" && report != "remove_admin") || user_key_action == lc_user_key ) ){

			lc_chatroom_init_add_element( chatroom_id, "report", id, timestamp, 0, function( new_element ){

				if(new_element != 0){

					var first_element = chatbox.find("*[data-lc_type='history_msg'], *[data-lc_type='history_report']").eq(0);
					if(report == "create" && first_element != new_element){
						first_element.before(new_element);
					}

					new_element.attr("data-lc_report", report);

					var content_element;

					content_element = new_element.find("*[data-lc_type='history_report_content']");
					if(content_element.length)
						content_element.html(chatroom_report_output[report]	.replace("/user_key/", "<span data-lc_transl='user_key'>"+user_key+"</span>")
																			.replace("/user_key_action/", "<span data-lc_transl='user_key'>"+user_key_action+"</span>"));

					content_element = new_element.find("*[data-lc_type='history_report_timestamp']");
					if(content_element.length)
						content_element.text(timestamp);

					//transl
					lc_retransl( new_element, function(){
						callback( new_element );
					});
				}
				else
					callback(1);
			});
		}
		else
			callback(1);
	}
}
function lc_chatroom_init_receive( chatroom_id, start_msg, anzahl_msg, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "receive_chatroom",
		chatroom_id : chatroom_id,
		start_msg	: start_msg,
		anzahl_msg	: anzahl_msg
	})
	.done(function( data ){

		if(data != ""){
			var result = $.parseJSON(data);

			var ready_counter = 0;
			for(var x=0; x<result.length; x++){

				if(result[x].type == "msg"){
					lc_chatroom_init_add_msg( chatroom_id, result[x].id, result[x].content, result[x].user_src_key, result[x].timestamp, result[x].wrap_msg, function(new_element){

						lc_chatroom_init_receive_scroll( chatroom_id, start_msg );

						ready_counter++;
						if(ready_counter == result.length)
							callback(1);
					});
				}

				if(result[x].type == "report"){
					lc_chatroom_init_add_report( chatroom_id, result[x].id, result[x].report, result[x].user_key, result[x].user_key_action, result[x].timestamp, function(new_element){

						lc_chatroom_init_receive_scroll( chatroom_id, start_msg );

						ready_counter++;
						if(ready_counter == result.length)
							callback(1);
					});
				}

				if(result[x].type == "complete"){

					$("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']").find("*[data-lc_type='history_load_more']").hide();
					ready_counter++;
					if(ready_counter == result.length)
						callback(1);
				}
			}
		}
		else
			callback(1);
	});
}
function lc_chatroom_init_get_height( chatbox ){

	var history = chatbox.find("*[data-lc_type='history']");
	var scroll_pos = 0;

	var load_more = history.find("*[data-lc_type='history_load_more']");
	if(load_more.length)
		scroll_pos += load_more.outerHeight(true);

	history.find("*[data-lc_type='history_msg'], *[data-lc_type='history_report']").each(function(){

		scroll_pos += $(this).outerHeight(true);
	});

	return( scroll_pos );
}
function lc_chatroom_init_receive_scroll( chatroom_id, start_msg ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");
	var history = chatbox.find("*[data-lc_type='history']");
	if(history.length){

		if(start_msg == 0){

			var scroll_pos = lc_chatroom_init_get_height( chatbox );

			lc_chatroom_init_receive_scroll_height_cache = scroll_pos;
			history.scrollTop( scroll_pos );
		}
		else if(start_msg > 0){

			var height_sum 			= lc_chatroom_init_get_height( chatbox );
			var height_difference 	= height_sum-lc_chatroom_init_receive_scroll_height_cache;

			lc_chatroom_init_receive_scroll_height_cache = height_sum;

			history.scrollTop( history.scrollTop()+height_difference );
		}
		else{

			var scroll = false;

			//eigene nachricht
			if(start_msg == -1){
				scroll = true;
			}
			//fremde Nachricht
			if(start_msg == -2){

				//scrolle nur wenn bereits unterste Position
				var height_sum 			= lc_chatroom_init_get_height( chatbox );
				if(height_sum-history.scrollTop()-history.height() < 300){
					scroll = true;
				}
			}

			if(scroll == true){

				var history = chatbox.find("*[data-lc_type='history']");
				if(history.length){

					var scroll_pos = 0;

					history.find("*[data-lc_type='history_msg'], *[data-lc_type='history_report']").each(function(){

						scroll_pos = scroll_pos+ $(this).outerHeight(true);
					});
					history.stop().animate({scrollTop: scroll_pos+"px"}, 500);
				}
			}
		}
	}
}

function lc_chatroom_init_chatbox( chatbox, area, callback ){

	//areas: head,info,form

	var chatroom_id = chatbox.attr("data-lc_chatroom");

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "chatroom_info_receive",
		chatroom_id : chatroom_id
	})
	.done(function( data ) {
		if(data != ""){

			var result = $.parseJSON(data);

			var notifications = 0;

			var task1 = $.Deferred();//head > title
			var task2 = $.Deferred();//head > status
			var task3 = $.Deferred();//head > user_count
			var task4 = $.Deferred();//notifications
			var task5 = $.Deferred();//info

			chatbox.removeAttr("data-lc_user_key");

			var private_user_key = "";

			if(result["max_users"] == 2){
				private_user_key = result["user_key"][0];
				if(private_user_key == lc_user_key)
					private_user_key = result["user_key"][1];

				chatbox.attr("data-lc_user_key", private_user_key);
				chatbox.find("*[data-lc_type='user_key']").html(private_user_key);
			}

			//chatroom_id
			var content_element;

			if(area != 0){
				if(area == "head" || area == "info")
					content_element = chatbox.find("*[data-lc_type='"+area+"']").find("*[data-lc_type='chatroom_id']");
				else
					content_element = 0;
			}
			else
				content_element = chatbox.find("*[data-lc_type='chatroom_id']");

			if(content_element.length){
				content_element.html(chatroom_id);
			}

			if(area == 0 || area == "head"){

				//head chatroom_title
				var content_element = chatbox.find("*[data-lc_type='chatroom_title']");
				if(content_element.length){

					lc_chatroom_title_receive( chatroom_id, function(callback){
						chatbox.find("*[data-lc_type='chatroom_title']").html(callback);
						task1.resolve();
					});
				}
				else
					task1.resolve();

				//head user_status
				var content_element = chatbox.find("*[data-lc_type='head']").find("*[data-lc_type='user_status']");
				if(content_element.length){

					if(result["max_users"] == 2){

						content_element.attr("data-lc_user_key", private_user_key);

						var status_receive_content_element = content_element;

						lc_user_status_receive( private_user_key, function(user_status){
							status_receive_content_element.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
							status_receive_content_element.find("*[data-lc_type='user_status_"+user_status[private_user_key]+"']").show();

							task2.resolve();
						});
					}
					else{
						content_element.remove();
						task2.resolve();
					}
				}
				else{
					task2.resolve();
				}
				//user_count
				var user_count_element1 = chatbox.find("*[data-lc_type='user_count']");
				var user_count_element2 = chatbox.find("*[data-lc_type='user_count_online']");
				var user_count_element3 = chatbox.find("*[data-lc_type='user_count_offline']");

				if(user_count_element1.length || user_count_element2.length || user_count_element3.length){

					lc_user_count( chatroom_id, function(callback){
						if(user_count_element1.length)
							user_count_element1.text( callback.all );

						if(user_count_element2.length)
							user_count_element2.text( callback.online );

						if(user_count_element3.length)
							user_count_element3.text( callback.offline );

						task3.resolve();
					});
				}
				else{
					task3.resolve();
				}
			}
			else{
				task1.resolve();
				task2.resolve();
				task3.resolve();
			}

			if(result["rights"] != "invited"){

				var content_element = chatbox.find("*[data-lc_type='invite']");
				if(content_element.length){
					content_element.hide();
				}

				if(result["rights"] != "removed" && result["rights"] != "left"){

					//notifications
					lc_user_notifications_receive( chatroom_id, function(result){

						notifications = result;
						task4.resolve();
					});

					if(area == 0 || area == "info"){

						//load info
						var content_element = chatbox.find("*[data-lc_type='info']");
						if(content_element.length){

							if(result["max_users"] != 2){

								//info_user
								var content_element2_wrapper = chatbox.find("*[data-lc_type='info_user_wrapper']");
								if(content_element2_wrapper.length){

									chatbox.find("*[data-lc_type='info_user']:not(.clonable)").remove();

									var content_element2 = chatbox.find("*[data-lc_type='info_user'].clonable");

									for(var x=0; x<result["user_key"].length; x++){
										content_element2.clone().removeClass("clonable").appendTo(content_element2_wrapper);
									}

									var info_user_element = content_element.find("*[data-lc_type='info_user']:not(.clonable)");

									//get user_status
									var user_key_string = "";
									for(var x=0; x<result["user_key"].length; x++){
										user_key_string += result["user_key"][x]+",";
									}
									user_key_string = user_key_string.slice(0,-1);

									lc_user_status_receive( user_key_string, function( user_status ){

										var own_user_element;

										for(var x=0; x<info_user_element.length; x++){

											//html info
											info_user_element.eq(x).attr({	"data-lc_user_key": result["user_key"][x],
																			"data-lc_user_rights": result["user_rights"][x]});

											//user_key
											var content_element3 = info_user_element.eq(x).find("*[data-lc_type='user_key']");
											if(content_element3.length){

												content_element3.text(result["user_key"][x]);

												if(result["user_key"][x] == lc_user_key)
													own_user_element = info_user_element.eq(x);
											}

											//user_status
											var content_element3 = info_user_element.eq(x).find("*[data-lc_type='user_status']");
											if(content_element3.length){

												content_element3.attr("data-lc_user_key", result["user_key"][x]);
												content_element3.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();

												content_element3.find("*[data-lc_type='user_status_"+user_status[result["user_key"][x]]+"']").show();
											}

											//invite
											var content_element3 = info_user_element.eq(x).find("*[data-lc_type='user_invite']");
											if(content_element3.length){

												if(result["user_rights"][x] == "invited")
													content_element3.show();
												else
													content_element3.hide();
											}

										}
										//own_user_element to top
										info_user_element.eq(0).before(own_user_element);

										task5.resolve();
									});
								}
								else{
									task5.resolve();
								}

								//chatroom_status
								//open
								if(result["status"] == "open"){

									var content_element2 = chatbox.find("*[data-lc_type='open']");
									if(content_element2.length){
										content_element2.hide();
									}
								}
								//close
								else{
									var content_element2 = chatbox.find("*[data-lc_type='close']");
									if(content_element2.length){
										content_element2.hide();
									}
								}

							}
							else{
								content_element.remove();
								task5.resolve();
							}
						}
						else{
							task5.resolve();
						}
					}
					else{
						task5.resolve();
					}
				}
				else{
					task4.resolve();
					task5.resolve();
				}
			}
			else{
				//invited
				var content_element = chatbox.find("*[data-lc_type='invite']");
				if(content_element.length){
					content_element.show();
				}
				//history
				var content_element = chatbox.find("*[data-lc_type='history']");
				if(content_element.length)
					content_element.hide();
				//form
				var content_element = chatbox.find("*[data-lc_type='form']");
				if(content_element.length)
					content_element.hide();
				//info
				var content_element = chatbox.find("*[data-lc_type='info']");
				if(content_element.length)
					content_element.hide();

				//confirm_dialog
				var content_element = chatbox.find("*[data-lc_type='confirm']");
				if(content_element.length)
					content_element.hide();

				task4.resolve();
				task5.resolve();
			}

			if(area == 0 || area == "form"){
				//form
				//form_input
				var content_element2 = chatbox.find("*[data-lc_type='form']");
				if(content_element2.length){

					if(result["rights"] != "readonly"){
						if(result["rights"] == "removed"){

							content_element2.find("*[data-lc_type='form_submit']").addClass("inactive");
							content_element2.find("*[data-lc_type='form_input']").prop('readonly', true).attr("placeholder", content_element2.find("*[data-lc_type='form_input']").attr("data-lc_placeholder_removed"));
						}
						else if(result["rights"] == "left"){

							content_element2.find("*[data-lc_type='form_submit']").addClass("inactive");
							content_element2.find("*[data-lc_type='form_input']").prop('readonly', true).attr("placeholder", content_element2.find("*[data-lc_type='form_input']").attr("data-lc_placeholder_left"));
						}
						else{

							var input_element_placeholder = chatbox.find("*[data-lc_type='form_input'][data-lc_placeholder_"+result["status"]+"]");
							input_element_placeholder.attr("placeholder", input_element_placeholder.attr("data-lc_placeholder_"+result["status"]));

							if(result["status"] == "open"){
								content_element2.find("*[data-lc_type='form_submit']").removeClass("inactive");
								content_element2.find("*[data-lc_type='form_input']").prop('readonly', false);
							}
							else{
								content_element2.find("*[data-lc_type='form_submit']").addClass("inactive");
								content_element2.find("*[data-lc_type='form_input']").prop('readonly', true);
							}
						}
					}
					else{
						content_element2.hide();
					}
				}
			}

			$.when(task1, task2, task3, task4, task5).done(function(){

				var transl_element = chatbox.find("*[data-lc_type='head'], *[data-lc_type='info']");

				if(area == "head" || area == "info")
					transl_element = chatbox.find("*[data-lc_type='"+area+"']");

				lc_retransl(transl_element , function(){
					lc_chatbox_ready( chatbox, area, result["rights"], notifications, result["status"], result["user_join"], result["readonly"], function(){
						callback(1);
					});
				});

			}).promise();
		}
	});
}
function lc_chatroom_leave(chatroom_id){
    connection.send(JSON.stringify({
        type: 'leave'
    }));
}
function lc_chatroom_remove_chatbox( chatbox ){
	chatbox.remove();
}


function lc_retransl( parent, callback ){

	parent.find("*[data-lc_transl]").each(function(){
		$(this).removeAttr("data-lc_transl_loaded");
	});
	lc_transl( parent, function(){
		callback(1);
	});
}
function lc_transl( parent, callback ){

	var elements = parent.find("*[data-lc_transl]:not(*[data-lc_transl_loaded])");

	var transl_counter 	= 0;
	var transl_length 	= elements.length;

	if(transl_length == 0)
		callback(1);

	else{
		elements.each(function(){
			if($(this).text() != ""){

				$(this).attr("data-lc_transl_loaded", "1");

				lc_translate_user_data( $(this).attr("data-lc_transl"), $(this), function(){

					transl_counter++;
					if(transl_counter == transl_length)
						callback(1);
				});
			}
			else{
				transl_counter++;
				if(transl_counter == transl_length)
					callback(1);
			}
		});
	}
}


//receive functions
function lc_chatroom_id_receive( callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "chatroom_id_receive"
	})
	.done(function( data ) {
		if(data != "")
			callback( $.parseJSON(data) );
		else
			callback("");
	});
}
function lc_chatroom_id_receive_search( search_str, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "chatroom_id_receive_search",
		search_str	: search_str
	})
	.done(function( data ) {
		if(data != "")
			callback( $.parseJSON(data) );
		else
			callback("");
	});
}
function lc_chatroom_preview_receive( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "chatroom_preview_receive",
		chatroom_id : chatroom_id
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);
			callback(result);
		}
	});
}
function lc_chatroom_title_receive( chatroom_id, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	 	: "chatroom_info_receive",
		chatroom_id : chatroom_id
	})
	.done(function( data ) {
		if(data != ""){

			var result = $.parseJSON(data);

			if(result["title"] != "")
				callback(result["title"]);
			else{
				if(result["max_users"] == 2 || result["user_key"].length == 2){

					for(var x=0; x<result["user_key"].length; x++){
						if(result["user_key"][x] != lc_user_key)
							callback("<span data-lc_transl='user_key'>"+result["user_key"][x]+"</span>");
					}
				}
				else if(result["user_key"].length > 1){
					var user_title = "";

					for(var x=0; x<result["user_key"].length && x<3; x++){
						if(result["user_key"][x] != lc_user_key)
							user_title += "<span data-lc_transl='user_key'>"+result["user_key"][x]+"</span>, ";
					}
					user_title = user_title.slice(0, -2);
					user_title += "...";
					callback(user_title);
				}
				else{
					callback(lc_user_key);
				}
			}
		}
		else
			callback("");
	});
}
function lc_chatroom_msg_receive( chatroom_id, start_msg, anzahl_msg, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "receive_chatroom",
		chatroom_id : chatroom_id,
		start_msg	: start_msg,
		anzahl_msg	: anzahl_msg
	})
	.done(function( data )	{

		if(data != ""){
			var result = $.parseJSON(data);

			//min_timestamp
			var timestamp = -1;

			for(var x=0; x<result.length; x++){
				if(result[x]["timestamp"] < timestamp || timestamp == -1)
					timestamp = result[x]["timestamp"];
			}

			//remove chatroom_report
			for(var x=0; x<result.length; x++){
				if(result[x]["type"] != "msg")
					result.splice(x,1);
			}

			callback( result, chatroom_id );
		}
	});
}
function lc_user_count( chatroom_id, callback ){

    new Http('node').post('/chatroom/user/status', {
    	chatroom_id: chatroom_id
	}, function (result) {
    	if(!$.isEmptyObject(result))
        	callback(result);
    	else
    		callback('');
    });
/*
	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "user_count",
		chatroom_id	: chatroom_id
	})
	.done(function( data ){
		if(data != ""){
			var result = $.parseJSON(data);
			callback( result );
		}
		else
			callback("");
	});*/
}
function lc_user_recommend( anzahl, callback ){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task		: "user_recommend",
		anzahl		: anzahl
	})
	.done(function( data )	{
		if(data != ""){
			var result = $.parseJSON(data);

			callback( result );
		}
		else
			callback("");
	});
}

$(document).ready(function(){

	$.post( glob_cms_home_dir+"livechat/php_request/livechat.php", {
		task	: "notifications_receive"
	})
	.done(function( data ) {
		livechat.resolve();

		if(data != ""){
			var result = $.parseJSON(data);

			for(var x=0; x<result.length; x++){
                lc_notcounter[ result[x]["id"] ] = [];
				lc_notcounter[ result[x]["id"] ].msg = result[x]["msg"];
				lc_notcounter[ result[x]["id"] ].report = result[x]["report"];
			}
			lc_notification_update( 0 );
		}

		//start refreshing loop
		//lc_refresh_loop = "1";
		//lc_refresh();
        notificationsInit.resolve();
	});

    $.when(socketInit, notificationsInit).done(function() {
        lc_ready();
    }).promise();

	//typing and sending
	$("body").on("click", "*[data-lc_type='form']:not(.inactive) *[data-lc_type='form_submit']:not(.inactive)", function(event){

		var chatroom_id = $(event.target).closest("*[data-lc_type='chatbox']").attr("data-lc_chatroom");

		if(chatroom_id != "" && chatroom_id != "undefined" && chatroom_id != undefined){

			var textarea 	= $("*[data-lc_chatroom='"+chatroom_id+"']").find("*[data-lc_type='form_input']");
			var msg_content = textarea.val();

			if(msg_content != ""){
				lc_send_msg( chatroom_id, msg_content );
				textarea.val("");
			}

			event.preventDefault();
		}
	});
	$("body").on("keypress", "*[data-lc_type='form_input']", function(event){

		var form = $(event.target).closest("*[data-lc_type='form']");

		if(!form.hasClass("inactive") && !form.find("*[data-lc_type='form_submit']").hasClass("inactive")){

			var chatroom_id = $(event.target).closest("*[data-lc_type='chatbox']").attr("data-lc_chatroom");

			if(event.which == 13){

				if(chatroom_id != "" && chatroom_id != "undefined" && chatroom_id != undefined){

					var textarea 	= $("*[data-lc_chatroom='"+chatroom_id+"']").find("*[data-lc_type='form_input']");
					var msg_content = textarea.val();

					if(msg_content != ""){
						lc_send_msg( chatroom_id, msg_content );
						textarea.val("");
					}
				}

				event.preventDefault();
			}
			else{
				if($(event.target).prop("readonly") == false){
					//typing
					lc_user_set_activity("typing");
				}
			}
		}
	});



	//invite
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-lc_type='invite_accept']", function(event){

		var chatbox = $(event.target).closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id = chatbox.attr("data-lc_chatroom");

		lc_chatroom_user_join( chatroom_id, function(){

			lc_chatroom_init_chatbox( chatbox, 0, function(){});
		});
	});
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-lc_type='invite_reject']", function(event){

		var chatbox = $(event.target).closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id = chatbox.attr("data-lc_chatroom");

		lc_chatroom_user_invite_reject(chatroom_id, function(){
			lc_chatroom_report( chatroom_id, "user_invite_reject", lc_user_key, 0, Date.now()/1000 );
		});
	});
});
