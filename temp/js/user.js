$(document).ready(function(){
	if($("#content_inner").length){
		var user_key = $("#user_general_contact").attr("data-cw_user_key");
		
		$(".user_general_contact_element[data-cw_type='user_contact_private'], .user_general_contact_element[data-cw_type='user_contact_support']").hide();
		
		cw_user_contact_rights_prepare( user_key, 0, function(){
			cw_user_contact_rights_update( user_key, 0 );
			
			var private_button = $(".user_general_contact_element[data-cw_type='user_contact_private']");
			
			$(".user_general_contact_blocked").removeClass("active");
			$(".user_general_contact_blocked_element").removeClass("active");
			
			if(private_button.hasClass("blocked_0"))
				$(".user_general_contact_blocked").addClass("active").find("*[data-cw_block='blocked_0']").addClass("active");
			if(private_button.hasClass("blocked_1"))
				$(".user_general_contact_blocked").addClass("active").find("*[data-cw_block='blocked_1']").addClass("active");
		});
	}
});