$(document).ready(function() {
	
	$.ajaxSetup({ cache: true });
	
	$.getScript("//connect.facebook.net/en_US/sdk.js", function(){
		
		FB.init({
		  appId: "915905708560072",
		  version: "v2.7"
		});
		
		FB.getLoginStatus(function(response){
			
			if(login_bool == false && response.status == "connected"){
				
			}
		});
		
	});
});