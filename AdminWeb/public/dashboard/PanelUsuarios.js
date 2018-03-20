var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstUsers=[];
var beforeci="";
$(document).ready(function(){
	FillTable();
	$("#UsersTable > tbody").html("");

});

function FillTable(){
	socket.on('Select Users', function(data){
		var UsersAux=[];
		UsersAux=data;
		socket.on('SelectPersons', function(data1){
			lstUsers.length=0;
			var PersonAux=[];
			PersonAux=data1;
			for (var j = 0; j < PersonAux.length; j++) {
				for (var i = 0; i < UsersAux.length; i++) {
					if(UsersAux[i].PERSONID==PersonAux[j].PERSONID){
						var objUser={
							user: UsersAux[i],
							person: PersonAux[j]
						}
						
						lstUsers.push(objUser);
					}	
				}
				
			}
			$("#UsersTable > tbody").html("");
			for (var i = 0; i < lstUsers.length; i++) {
				$('#UsersTable').append("<tr><td>"+lstUsers[i].person.PERSONCIRUC+"</td><td>"+lstUsers[i].person.PERSONNAME+' '+lstUsers[i].person.PERSONLASTNAME+"</td><td>"+lstUsers[i].user.USEREMAIL+"</td><td>"+lstUsers[i].person.PERSONROLE+
								   "</td><td><a class='btn red btn-outline sbold' data-toggle='modal' href='#responsive' onclick='ShowUserInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a>"+
								   "<a class='btn red btn-outline sbold' onclick='DeleteUser("+i+")'> <i class='fa fa-delete'> </i> Eliminar </a></td></tr>");
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
	beforeci=lstUsers[i].person.PERSONCIRUC;
	$('#txtPersonName').val(lstUsers[i].person.PERSONNAME);
	$('#txtPersonLastName').val(lstUsers[i].person.PERSONLASTNAME);
	$('#txtPersonId').val(lstUsers[i].person.PERSONCIRUC);
	$('#txtPersonPhone').val(lstUsers[i].person.PERSONPHONE);
	$('#txtPersonAddress').val(lstUsers[i].person.PERSONADDRESS);
	$('#txtPersonRole').val(lstUsers[i].person.PERSONROLE);
	$('#txtUserEmail').val(lstUsers[i].user.USEREMAIL);
	$('#txtUserPassword').val(lstUsers[i].user.USERPASSWORD);
	$('#txtUserProfile').val(lstUsers[i].user.USERPROFILE);
}
function DeleteUser(i){
	var flagDelete=2;
	var id=lstUsers[i].user.PERSONID;
	bootbox.confirm("¿Seguro que desea eliminar al usuario seleccionado? ", function(result) {
			   if(result){
				   	socket.emit('DeleteUser',id);
					socket.on('ErrorDeleteUser',flagDelete);
					$.notific8('Usuario eliminado correctamente');
					location.reload();
			   }
			});
}
$('#btnUpdateUserInfo').click(function(){
	for (var i = 0; i < lstUsers.length; i++) {
		if(lstUsers[i].person.PersonCi==beforeci){
			var UserUpdate = {
				personid: lstUsers[i].person.PERSONID,
				name: 		$('#txtPersonName').val(),
				lastName:	$('#txtPersonLastName').val(),
				ci:			$('#txtPersonId').val(),
				phone:		$('#txtPersonPhone').val(),
				address:	$('#txtPersonAddress').val(),
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
