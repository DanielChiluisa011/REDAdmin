var socket = io.connect("34.195.35.232:8080",{"forceNew": true});
var User;
var lstUsers=[];
var CorrectPassword=false;
 $(document).ready(function(){
	socket.on('Select Users', function(data){
       	lstUsers=data;
   	})

});  

$('#btnLogin').click(function(){
	var UserExist=false;
	for (var i = 0; i < lstUsers.length; i++) {
		if(lstUsers[i].UserEmail===$('#txtLogEmail').val() && lstUsers[i].UserPassword===$('#txtLogPassword').val() && lstUsers[i].UserProfile==='administrador'){
			var url="dashboard/PanelMonitoreo.html?"+lstUsers[i].UserEmail;
			UserExist=true;
			break;
		}
	}
	if(UserExist){
		window.location = url; // Redirecting to other page.
		return false;
	}else{
		$('.alert-danger', $('.login-form')).show();
	}
})

