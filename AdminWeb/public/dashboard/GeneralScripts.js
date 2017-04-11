var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstNewUsers=[];
$(document).ready(function(){
})



socket.on('EmergencyNotification', function(msg){
	console.log(msg);
	$.notific8(msg);

});