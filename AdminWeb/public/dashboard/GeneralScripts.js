var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
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

socket.on('EmergencyNotification', function(msg){
	$.notific8(msg);
})