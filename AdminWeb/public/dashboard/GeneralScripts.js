var socket = io.connect("http://localhost:8080",{"forceNew": true});
var lstNewUsers=[];
$(document).ready(function(){
})
socket.on('NotificationNewUser', function(data){
	lstNewUsers=[];
	lstNewUsers=data;
	$('#NewUserNotifi').html(" "+data.length);
	$('#NewUserNotifi2').html(" "+data.length);
	if(lstNewUsers.length!=0){
		$.notific8('Nueva solicitud de usuario recibida');
	}
});