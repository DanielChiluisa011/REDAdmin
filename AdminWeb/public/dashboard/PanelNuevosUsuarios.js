var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstObjNewUsers=[];
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

function SaveNewUser(i){
	bootbox.confirm("¿Esta seguro de guardar el usuario "+lstObjNewUsers[i].user.USEREMAIL+"?", function(result) {
	   if(result){
		   	socket.emit('SaveNewUserV2', lstObjNewUsers[i]);
			$.notific8('Usuario guardado correctamente');
	   }
	});
	
}

function FillTable(){
	socket.on('NotificationNewUserV2', function(data){
		$("#NewUsersTable > tbody").html("");
		for (var i = 0; i < data.length; i++) {
				$('#NewUsersTable').append("<tr><td>"+data[i].person.PERSONCIRUC+"</td><td>"+data[i].person.PERSONNAME+' '+data[i].person.PERSONLASTNAME+"</td><td>"+data[i].person.PERSONADDRESS+"</td><td>"+data[i].person.PERSONPHONE+"</td><td>"+data[i].person.PERSONROLE+"</td><td>"+data[i].user.USEREMAIL+"</td><td>"+data[i].user.USERPROFILE+
       							"</td><td><button class='btn green' onclick='SaveNewUser("+i+")'><i class='fa fa-save'></i>  Guardar</button></td></tr>");
			}
		lstObjNewUsers=data;
	});
}