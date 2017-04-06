var socket = io.connect("http://localhost:80",{"forceNew": true});
var lstUsers=[];
$(document).ready(function(){
	FillTable();
	$("#UsersTable > tbody").html("");

});

function FillTable(){
	socket.on('Select Users', function(data){
		$("#UsersTable > tbody").html("");
		var UsersAux=[];
		UsersAux=data;
		socket.on('SelectPersons', function(data){
			lstUsers=[];
			var PersonAux=[];
			PersonAux=data;
			for (var j = 0; j < PersonAux.length; j++) {
				for (var i = 0; i < UsersAux.length; i++) {
					if(UsersAux[i].PERSON_person_ci==PersonAux[j].PersonCi){
						var objUser={
							user: UsersAux[i],
							person: PersonAux[j]
						}
						lstUsers.push(objUser);
					}	
				}
				
			}
			for (var i = 0; i < lstUsers.length; i++) {
				$('#UsersTable').append("<tbody><tr><td>"+lstUsers[i].person.PersonCi+"</td><td>"+lstUsers[i].person.PersonName+' '+lstUsers[i].person.PersonLastName+"</td><td>"+lstUsers[i].user.UserEmail+"</td><td>"+lstUsers[i].user.UserProfile+
       							"</td><td><a class='btn red btn-outline sbold' data-toggle='modal' href='#responsive' onclick='ShowUserInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td></tr></tbody>");
			}
		})
	})
}
function ShowPassword(){
	if($('#txtUserPassword').attr("type")=='text'){
		$('#txtUserPassword').attr("type", "password");
	}else{
		$('#txtUserPassword').attr("type", "text");
	}
	if($('#iconPass').attr("class")=="fa fa-eye-slash"){
		$('#iconPass').attr("class", "fa fa-eye");	
	}else{
		$('#iconPass').attr("class", "fa fa-eye-slash");
	}
}

function ShowUserInformation(i){
	$('#txtPersonName').val(lstUsers[i].person.PersonName);
	$('#txtPersonLastName').val(lstUsers[i].person.PersonLastName);
	$('#txtPersonId').val(lstUsers[i].person.PersonCi);
	$('#txtPersonPhone').val(lstUsers[i].person.PersonPhone);
	$('#txtPersonAddress').val(lstUsers[i].person.PersonAddress);
	$('#txtPersonRuc').val(lstUsers[i].person.PersonRuc);
	$('#txtPersonRole').val(lstUsers[i].person.PersonRole);
	$('#txtUserEmail').val(lstUsers[i].user.UserEmail);
	$('#txtUserPassword').val(lstUsers[i].user.UserPassword);
	$('#txtUserProfile').val(lstUsers[i].user.UserProfile);
}

$('#btnUpdateUserInfo').click(function(){
	for (var i = 0; i < lstUsers.length; i++) {
		if(lstUsers[i].person.PersonCi==$('#txtPersonId').val()){
			var UserUpdate = {
				name: 		$('#txtPersonName').val(),
				lastName:	$('#txtPersonLastName').val(),
				ci:			$('#txtPersonId').val(),
				phone:		$('#txtPersonPhone').val(),
				address:	$('#txtPersonAddress').val(),
				ruc:		$('#txtPersonRuc').val(),
				role:		$('#txtPersonRole').val(),
				email:		$('#txtUserEmail').val(),
				password:	$('#txtUserPassword').val(),
				profile:	$('#txtUserProfile').val()
			}
			bootbox.confirm("¿Desea confirmar los cambios realizados? ", function(result) {
			   if(result){
				   	socket.emit('UserUpdate',UserUpdate);
					$.notific8('Usuario actualizado correctamente');
					location.reload();
			   }
			});
			break;
		}
	}
})
