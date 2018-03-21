$(document).ready(function(){
	
	$("#cms_cp_login_button").click(function(){
		
		if($(this).hasClass("disabled") == false){
			
			$(this).addClass("disabled");
			
			if($("#cms_cp_login_username").val() != "" && $("#cms_cp_login_pw").val() != ""){
			
				$.post("php_request/control_panel.php?task=login", {
					username	: $("#cms_cp_login_username").val(),
					pw			: $("#cms_cp_login_pw").val()
					
				}).done(function( data ){
					if(data == "true"){
						$("#cms_cp_login_button span").hide();
						$("#cms_cp_login_button_success").fadeIn(300).delay(800, function(){
							window.location = "control_panel.php";
						});
					}
					
					if(data == "false"){
						$("#cms_cp_login_button span").hide();
						$("#cms_cp_login_button_error").fadeIn(300).delay(500).fadeOut(300, function(){
							$("#cms_cp_login_button_login").fadeIn(300);
							$("#cms_cp_login_button").removeClass("disabled");
						});
					}
				});
			}
			else{
				alert("Bitte alle Felder ausfüllen!");
			}
		}
	});
	
	
	$("#cms_cp_new_project_button").click(function(){
		
		if(confirm("Neues Projekt erstellen?")){
			
			$.post("php_request/control_panel.php?task=new_project", {
				
				desktop_dir	: $("#cms_cp_new_project_desktop_dir").val(),
				mobile_dir	: $("#cms_cp_new_project_mobile_dir").val()
				
			}).done(function( data ){
				
				if(data == ""){
					window.location = "control_panel.php";
				}
				else{
					alert(data);
				}
			});
		}
	});
	
	$("#cms_cp_domain_change_button").click(function(){
		
		if(confirm("'temp'-Ordner muss manuell übernommen werden.")){
			
			$.post("php_request/control_panel.php?task=domain_change", {
				
				old_domain	: $("#cms_cp_domain_change_old_domain").val()
				
			}).done(function( data ){
				
				if(data == ""){
					window.location = "control_panel.php";
				}
				else{
					alert(data);
				}
			});
			
		}
	});
	
	$('.cms_cp_edit_row').delegate('input','click', function(){
	
		if($(this).hasClass("cms_cp_new_input") == false){
			
			if($(this).closest("table").find("tr.selected").length == 0)
				$(this).closest(".cms_cp_edit_row").find(".cms_cp_edit_db_remove").fadeIn(300);
			
			$(this).closest("table").find("tr").removeClass("selected");
			$(this).closest("tr").addClass("selected");
		}
	});
	
	$('.cms_cp_edit_row').delegate('input','change', function(){
		
		var this_element 	= $(this);
		
		if(this_element.hasClass("cms_cp_new_input") == false){
			
			$("body").css("cursor", "wait");
			
			var cms_table		= this_element.closest("table").attr("data-cms_table");
			var cms_field		= this_element.attr("data-cms_field");
			var cms_val			= this_element.val();
			var cms_id			= this_element.attr("data-cms_id");
			
			$.post("php_request/control_panel.php?task=db_edit", {
				
				table 	: cms_table,
				field 	: cms_field,
				val 	: cms_val,
				id 		: cms_id
				
			}).done(function( data ){
				
				if(data != "")
					alert(data);
				
				$("body").css("cursor", "default");
			});
		}
		else{
			var cms_elements = this_element.closest("tr").find(".cms_cp_new_input");
			var cms_all_filled = true;
			
			var cms_table	= this_element.closest("table").attr("data-cms_table");
			var cms_fields 	= Array(cms_elements.length);
			var cms_val 	= Array(cms_elements.length);
			
			for(var x=0; x<cms_elements.length; x++){
				if(cms_elements.eq(x).val() == "")
					cms_all_filled = false;
				
				cms_fields[x] 	= cms_elements.eq(x).attr("data-cms_field");
				cms_val[x] 		= cms_elements.eq(x).val();
			}
			
			if(cms_all_filled == true){
				
				
				$.post("php_request/control_panel.php?task=db_insert", {
					
					table		: cms_table,
					'fields[]' 	: cms_fields,
					'val[]' 	: cms_val
					
				}).done(function( data ){
					
					var cms_id = data;
					
					this_element.closest("tr").before("<tr class='cms_cp_insert_tr'></tr>");
					
					var cms_cp_insert_string = "";
					
					for(var x=0; x<cms_fields.length; x++){
						cms_cp_insert_string = cms_cp_insert_string + '<td><input type="text" value="'+cms_val[x]+'" data-cms_id="'+cms_id+'" data-cms_field="'+cms_fields[x]+'"/></td>'
					}
					$(".cms_cp_insert_tr").html(cms_cp_insert_string).removeClass("cms_cp_insert_tr");
					this_element.closest("tr").find(".cms_cp_new_input").val("");
				});
			
			}
		}
	});
	
	$(".cms_cp_edit_db_remove").click(function(){
		
		var this_element = $(this);
		var cms_tr_selected = $(this).closest(".cms_cp_edit_row").find("table tr.selected");
		
		if(cms_tr_selected.length){
			
			if(confirm("Datensatz löschen?")){
				
				$.post("php_request/control_panel.php?task=db_delete", {
					
					table 	: cms_tr_selected.closest("table").attr("data-cms_table"),
					id		: cms_tr_selected.find("input").attr("data-cms_id")
					
				}).done(function( data ){
					if(data != "")
						alert(data);
					cms_tr_selected.remove();
					
					this_element.fadeOut(300);
				});
			}
		}
	});
	
});