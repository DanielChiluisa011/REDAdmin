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
	alert(lstUsers.length);
	for (var i = 0; i < lstUsers.length; i++) {
		console.log(lstUsers[i].USEREMAIL+" "+lstUsers[i].USERPASSWORD+" "+lstUsers[i].USERPROFILE);
		if(lstUsers[i].USEREMAIL===$('#txtLogEmail').val() && lstUsers[i].USERPASSWORD===$('#txtLogPassword').val() && lstUsers[i].USERPROFILE==='administrador'){
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

