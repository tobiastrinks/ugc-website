//kurse
function kurs_remove(kurs_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_remove",
		kurs_id		: kurs_id
	})
	.done(function(data) {
		if(data!="")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}

//user_remove
function user_remove( user_key, type, callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "user_remove",
		user_key 	: user_key,
		type		: type
	})
	.done(function( data ) {
		
		if(data == ""){
			
			lc_user_remove( user_key, type, function(){
				callback(1);
			});
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

//bewerbungen
function application_reply( kurs_id, result, reply_text, callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurse_application_reply",
		kurs_id		: kurs_id,
		result		: result,
		reply_text	: reply_text
	})
	.done(function( data ) {
		
		if(data == ""){
			callback(1);
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}


$(document).ready(function(){
	
	//bewerbungen
	$(".admin_table_applications_hosting").click(function(){
		
		var kurs_id = $(this).closest(".admin_table_element").attr("data-kurs_id");
		
		kurs_hosting(kurs_id);
	});
	$(".application_reply_open").click(function(){
		
		var table_element = $(this).closest(".admin_table_element");
		
		var kurs_id 	= table_element.attr("data-kurs_id");
		var kurs_name 	= table_element.find(".admin_table_applications_hosting").text();
		
		$("#application_reply").addClass("active").attr("data-kurs_id", kurs_id);
		$("#application_reply_subline").text(kurs_name);
	});
	$("#application_reply_close").click(function(){
		$("#application_reply").removeClass("active");
	});
	$("*[data-app_reply]").click(function(){
		
		var kurs_id 	= $("#application_reply").attr("data-kurs_id");
		var reply_text 	= $("#application_reply_textarea").val();
		var result 		= $(this).attr("data-app_reply");
		
		if(result == "1")
			result = true;
		else
			result = false;

        $("#application_reply").removeClass("active");

		application_reply( kurs_id, result, reply_text, function(){
			$("#admin_table_applications").find(".admin_table_element[data-kurs_id='"+kurs_id+"']").remove();
		});
	});
	
	$(".user_remove, .user_anonymize").click(function(){
		
		var this_element = $(this);
		var type = "remove";
		var alert_msg = "Dieser Nutzer und all seine Daten (Profil, gesendete Nachrichten, Rezensionen, usw.) werden unwiderruflich gelöscht!";
		
		if(this_element.hasClass("user_anonymize")){
			type = "anonymize";
			alert_msg = "Die Profildaten des Nutzers werden entgültig gelöscht - Nachrichten/Rezensionen/Kommentare werden anonymisiert.";
		}
		
		ug_alert("ENTGÜLTIG LÖSCHEN?", alert_msg, "Fortfahren", "Abbrechen", function(result){
			if(result == true){
				
				var tr_elem		= this_element.closest(".admin_table_element");
				var user_key 	= tr_elem.attr("data-user_key");
				
				user_remove(user_key, type, function(){
					tr_elem.remove();
				});
			}
		});
	});
	
	$(".kurs_remove").click(function(){
		
		var this_element 	= $(this);
		var tr_elem			= this_element.closest(".admin_table_element");
		var kurs_id 		= tr_elem.attr("data-kurs_id");
		
		ug_alert("ENTGÜLTIG LÖSCHEN", "Der Kurs wird mit all seinen Medien, Modulen, Chatrooms und Mitgliederschaften gelöscht!", "Fortfahren", "Abbrechen", function(result){
			if(result == true){
				kurs_remove(kurs_id, function(){
					tr_elem.remove();
				});
			}
		});
	});
});