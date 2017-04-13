var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstNewUsers=[];
$(document).ready(function(){
	
})

socket.on('NotificationNewUser', function(data){
	lstNewUsers=[];
	lstNewUsers=data;
	$('#NewNotifi').html(" "+data.length);
	$('#NewUserNotifi').html(" "+data.length);
	if(lstNewUsers.length!=0){
		$.notific8('Nueva solicitud de usuario recibida');
	}
})

socket.on('EmergencyNotification', function(data){
	var msg;
	// lstNewNotification=[];
	// lstNewNotification=data;
	if(data.alerttype=="E"){
		msg="Emergencia"
	}

	

	console.log(data.comment+" "+data.date+"\n"+"Camión: "+data.truckid+" Código de Viaje "+data.journeyid);
	$.notific8(msg+": "+data.comment+" "+data.date+"<br>"+"Camión: "+data.truckid+" Código de Viaje "+data.journeyid);

})

socket.on('FullNotification', function(data){
	var msg;
	
	if(data.alerttype=="CL"){
		msg="Camion Lleno"
	}
	// $('#NewNotifi').html(" "+data.length);
	// console.log(lstNewNotification.length);
	// $('#AlertNotifi').html(" "+lstNewNotification.length);
	console.log(data.comment+" "+data.date+"\n"+"Camión: "+data.truckid+" Código de Viaje "+data.journeyid);
	$.notific8(data.comment+" "+data.date+"<br>"+"Camión: "+data.truckid+" Código de Viaje "+data.journeyid);

})