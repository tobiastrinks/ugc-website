function dashboard_start(){
	
	dashboard_resize();
	
}
function dashboard_resize(){
	
	
}

$(document).ready(function(){
	
	$(window).load(function(){
		dashboard_start();
	});
	
	$(window).resize(function(){
		dashboard_resize();
	});
});