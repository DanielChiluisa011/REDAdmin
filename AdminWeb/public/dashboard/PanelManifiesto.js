var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstObjManifest=[];
$(document).ready(function(){
	FillTable();
	// socket.on('NotificationNewUser', function(data){
	// 	$("#NewUsersTable > tbody").html("");
	// 	for (var i = 0; i < data.length; i++) {
	// 			$('#NewUsersTable').append("<tbody><tr><td>"+data[i].person.PersonCi+"</td><td>"+data[i].person.PersonName+' '+data[i].person.PersonLastName+"</td><td>"+data[i].person.PersonAddress+"</td><td>"+data[i].person.PersonPhone+"</td><td>"+data[i].person.PersonRuc+"</td><td>"+data[i].person.PersonRole+"</td><td>"+data[i].user.UserEmail+"</td><td>"+data[i].user.UserProfile+
 //       							"</td><td><button class='btn green' onclick='SaveNewUser("+i+")'>seleccionar</</td></tr></tbody>");
	// 		}
	// 	lstObjNewUsers=data;
	// });
})

function UpdateManifest(i){
	var b1="txpeso"+i;
	var b2="txobservacion"+i;
	
	lstObjManifest[i].ORDEROBSERVATION=document.getElementById(b2).value;
	bootbox.confirm("¿Esta seguro de modificar el manifiesto de la Orden# = "+lstObjManifest[i].ORDERID+" Importador: "+lstObjManifest[i].IMPORTERNAME+" ?", function(result) {
	   if(result){
		   	socket.emit('UpdateManifest', lstObjManifest[i]);
			$.notific8('Manifiesto modificado');
			setTimeout("location.reload()",900);
	   }
	});
	
}

function FillTable(){
	socket.on('SelectManifest', function(data){
		$("#ManifestTable > tbody").html("");
		$('#OrdersHistoryTable').append("<tbody>");
		var peso1="";
		var obs1="";
		var date=[];
		for (var i = 0; i < data.length; i++) {
			if(data[i].ORDEROBSERVATION==null)
				obs1="";
			else
				obs1=data[i].ORDEROBSERVATION;
				
			date=data[i].JOURNEYDATE.split("T");
			
			$('#ManifestTable').append("<tr align='center'><td>"+data[i].ORDERID+"</td><td>"+data[i].JOURNEYID+"</td><td>"+data[i].IMPORTERNAME+"</td><td>"+date[0]+"</td><td>"+data[i].TRUCKID+"</td><td>"+data[i].PERSONNAME+" "+data[i].PERSONLASTNAME+"</td><td><textarea rows='3' cols='30' id='txobservacion"+i+"'>"+obs1+"</textarea></td><td><button class='btn green' onclick='UpdateManifest("+i+")'><i class='fa fa-save'></i>Modificar</button></td></tr>");
		}
		$('#OrdersHistoryTable').append("</tbody>");
		lstObjManifest=data;
	});
}