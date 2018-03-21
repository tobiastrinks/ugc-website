$(document).ready(function(){
	
	//replace hr
	var info_hr_clonable = $(".info_hr.clonable");
	$("#info").find("hr").each(function(){
		$(this).wrap("<div id='hr_wrapper'></div>");
		var hr_wrapper = $("#hr_wrapper").html("");
		info_hr_clonable.clone().appendTo(hr_wrapper);
		hr_wrapper.find(".info_hr").removeClass("clonable").unwrap();
	});
});