var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstNewUsers=[];
var lstPendingOrders=[];
var notifNewUser=0;
var notifAlert=0;
var totalNotifications=0;

$(document).ready(function(){
	
})

socket.on('NotificationNewUserV2', function(data){
	lstNewUsers=[];
	lstNewUsers=data;
	notifNewUser=data.length;
	console.log("notificación de nuevo usuario");
	// totalNotifications=notifNewUser+notifAlert;
	sumNotifications();
	$('#NewUserNotifi').html(" "+data.length);
	if(lstNewUsers.length!=0){
		$.notific8('Nueva solicitud de usuario recibida');
	}
})
socket.on('NotificationPendingOrders', function(data){
	lstPendingOrders=[];
	lstPendingOrders=data;
	//notifNewUser=data.length;
	console.log("notificación de nuevo usuario");
	// totalNotifications=notifNewUser+notifAlert;
	//sumNotifications();
	$('#NewUserNotifi').html(" "+data.length);
	if(lstPendingOrders.length!=0){
		$.notific8('Tiene Órdenes pendientes de asignar');
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

socket.on('ResponseNotificationAlerts',function(data){
		notifAlert=data.length;
		sumNotifications();
		console.log("numero de alertas : "+data.length+"  total:"+totalNotifications);
		// $('#NewNotifi').html(" "+totalNotifications);
		$('#AlertNotifi').html(" "+data.length); 
})

function sumNotifications(){
	totalNotifications=notifNewUser+notifAlert;
	$('#NewNotifi').html(" "+totalNotifications);
}

socket.on('NearNotificationToAdmin',function(data){
	console.log("NearNotification"+data);
    $.notific8("El conductor está por llegar al distribuidor "+data,  {
                  life: 35000,
                  heading: 'Llegando!',
                  theme: 'teal',
                  sticky: false,
                  horizontalEdge: 'top',
                  verticalEdge: 'rigth',
                  zindex: 1500
                });
})

socket.on('DeviationNotificationToAdmin',function(data){
	console.log(data);
    $.notific8("El conductor "+data.name+" se desvió de su ruta. Tel: "+data.phone, {
                  life: 35000,
                  heading: 'Desviado!',
                  theme: 'ruby',
                  sticky: false,
                  horizontalEdge: 'top',
                  verticalEdge: 'rigth',
                  zindex: 2500
                });
})

