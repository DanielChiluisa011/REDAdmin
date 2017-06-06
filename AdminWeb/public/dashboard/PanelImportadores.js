var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
$(document).ready(function(){
    socket.emit("RequestImportersInfo","");
    socket.on("ResponseImporterInfo",function(flag){
        if(flag==0){
            $.notific8('Error al cargar, intentelo nuevamente', {
                life: 3500,
                heading: 'Error!',
                theme: 'ruby',
                sticky: false,
                horizontalEdge: 'top',
                verticalEdge: 'rigth',
                zindex: 1500
            });
        }
    });
    socket.on("ResponseImporter",function(Importador){
        $("#txtNewImpName").val(""),
		$("#txtNewImpAddress").val(),
		$("#txtNewImpPhone").val(""),
		$("#txtNewImpRuc").val(""),
		$("#txtNewImpQuota").val(""),
		$("#txtNewImpLicence").val(""),
		$("#txtNewImpPersonName").val(""),
		$("#txtNewImpPersonLastName").val(""),
		$("#txtNewImpPersonId").val(""),
		$("#txtNewImpPersonPhone").val(""),
		$("#txtNewImpPersonAddress").val(""),
		$("#txtNewImpEmail").val(""),
        $("#ImportersTable > tbody").html("");
        for (var i = 0; i < Importador.length; i++) {
            $('#ImportersTable').append("<tbody>"+
                                        "<tr>"+
                                            "<td>"+Importador[i].IMPORTERNAME+"</td>"+
                                            "<td>"+Importador[i].IMPORTERRUC+"</td>"+
                                            "<td>"+Importador[i].IMPORTERADDRESS+"</td>"+
                                            "<td>"+Importador[i].IMPORTERPHONE+"</td>"+
                                            "<td>"+Importador[i].IMPORTERQUOTA+"</td>"+
                                            "<td>"+Importador[i].IMPORTERQUOTAACCOMPLISHED+"</td>"+
                                            "<td>"+Importador[i].PERSONNAME+' '+Importador[i].PERSONLASTNAME+"</td>"+
                                            "<td>"+Importador[i].USEREMAIL+"</td>"+
                                            "<td><a class='btn red btn-outline sbold' data-toggle='modal' href='#responsive' onclick='ShowUserInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td>"+
                                        "</tr>"+
                                    "</tbody>");
        }
    });
});
$("#btnInsertImporter").click(function(){
	bootbox.confirm("¿Desea guardar la información ingresada? ", function(result) {
		if(result){
			var newImporter = {
				name: $("#txtNewImpName").val(),
				address: $("#txtNewImpAddress").val(),
				phone: $("#txtNewImpPhone").val(),
				rucImporter: $("#txtNewImpRuc").val(),
				quota: $("#txtNewImpQuota").val(),
				licence: $("#txtNewImpLicence").val(),
				personName: $("#txtNewImpPersonName").val(),
				personLastName: $("#txtNewImpPersonLastName").val(),
				personCi: $("#txtNewImpPersonId").val(),
				personPhone: $("#txtNewImpPersonPhone").val(),
				personAddress: $("#txtNewImpPersonAddress").val(),
				personEmail: $("#txtNewImpEmail").val(),
			} 
			console.log("NUEVO IMPORTADOR");
			console.log(newImporter);
			socket.emit("RequestInsertNewImporter",newImporter);
			socket.on("ResponseImporter",function(flag){
				if(flag){
					$.notific8('Datos guardados correctamente', {
						life: 3500,
						heading: 'Listo!',
						theme: 'teal',
						sticky: false,
						horizontalEdge: 'top',
						verticalEdge: 'rigth',
						zindex: 1500
						});
				}else{
					$.notific8('Error al guardar, intentelo nuevamente', {
						life: 3500,
						heading: 'Error!',
						theme: 'ruby',
						sticky: false,
						horizontalEdge: 'top',
						verticalEdge: 'rigth',
						zindex: 1500
					});
				}
			});
		}
	});
	
	
});