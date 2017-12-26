var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstImporters= [];
var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
var lon=6;
var code="h";
var fechaactual;
var lstProvinces=[];
$(document).ready(function(){
    // alert(rand_code());
    rand_code();
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
    
    socket.on('ResponseProvinces',function(data){
		lstProvinces=[];
        lstProvinces=data;
        alert(lstProvinces.length);
		$('#cmbNewImpProvince').empty();
       	$('#cmbNewImpProvince').append('<option selected>Seleccione una Provincia</option>');
       	for (var i = 0; i < lstDistributors.length; i++) {
	   		$('#cmbNewImpProvince').append(new Option(lstProvinces[i].PROVINCENAME, 'names'));
           }
    });
    socket.on("ResponseImporter",function(Importador){
        lstImporters.length=0;
        // rand_code();
        
        // alert(rand_code(chars, lon));
        lstImporters=Importador;
        $("#txtNewImpName").val("");
		$("#txtNewImpAddress").val("");
		$("#txtNewImpPhone").val("");
		$("#txtNewImpRuc").val("");
		$("#txtNewImpQuota").val("");
		$("#txtNewImpLicence").val("");
        $("#txtNewImpCode").val(code);
		$("#txtNewImpPersonName").val("");
		$("#txtNewImpPersonLastName").val("");
		$("#txtNewImpPersonId").val("");
		$("#txtNewImpPersonPhone").val("");
		$("#txtNewImpPersonAddress").val("");
		$("#txtNewImpEmail").val("");

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
                                            "<td>"+Importador[i].IMPORTERCODE+"</td>"+
                                            "<td><a class='btn red btn-outline sbold' data-toggle='modal' href='#addImporter' onclick='ShowImporterInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td>"+
                                        "</tr>"+
                                    "</tbody>");
        }
    });

    socket.on('SelectImporters', function(data){
		lstImporters=[];
       	lstImporters=data;
       	// $('#cmbNewOrderImporters').empty();
       	$('#cmbUpdateImporters').empty();
       	$('#cmbUpdateImporters').append('<option selected>Seleccione un importador</option>');
       	for (var i = 0; i < lstImporters.length; i++) {
	   		// $('#cmbNewOrderImporters').append(new Option(lstImporters[i].ImporterName, 'names', true, true));
	   		$('#cmbUpdateImporters').append(new Option(lstImporters[i].IMPORTERNAME, 'names'));
	   	}
       })
    fechaactual=new Date();
	//$('#txtUpdateOrderDate').disabled();
	//alert(fechaactual.getFullYear()+"-"+(fechaactual.getMonth() +1)+"-"+fechaactual.getDate());
       $('#txtUpdateOrderDate').val(fechaactual.getFullYear()+"-"+(fechaactual.getMonth() +1)+"-"+fechaactual.getDate());
       socket.on('selectWaste', function(data){
		lstWaste=[];
       	lstWaste=data;
       	$('#cmbNewOrderWaste').empty();
       	$('#cmbUpdateWaste').empty();
       	$('#cmbNewOrderWaste').append('<option selected>Seleccione un tipo de desecho</option>');
       	$('#cmbUpdateWaste').append('<option selected>Seleccione un tipo de desecho</option>');
       	for (var i = 0; i < lstWaste.length; i++) {
	   		//$('#cmbNewOrderWaste').append(new Option(lstWaste[i].WASTEDESCRIPTION, 'names',false,false));
	   		$('#cmbUpdateWaste').append(new Option(lstWaste[i].WASTEDESCRIPTION, 'names',false,false));
	   	}
   	})
});

$("#btnCancelImporter").click(function(){
        $("#btnInsertImporter").html('Guardar');
        $("#txtNewImpName").val(""),
		$("#txtNewImpAddress").val("");
		$("#txtNewImpPhone").val("");
		$("#txtNewImpRuc").val("");
		$("#txtNewImpQuota").val("");
		$("#txtNewImpLicence").val("");
		$("#txtNewImpPersonName").val("");
		$("#txtNewImpPersonLastName").val("");
		$("#txtNewImpPersonId").val("");
		$("#txtNewImpPersonPhone").val("");
		$("#txtNewImpPersonAddress").val("");
		$("#txtNewImpEmail").val("");
        rand_code();
        $("#txtNewImpCode").val(code);
        // $("txtNewImpCode").val(rand_code());
        $("#txtNewImpName").attr("disabled",false);
        $("#txtNewImpRuc").attr("disabled",false);
        $("#txtNewImpQuota").attr("disabled",false);
        $("#txtNewImpLicence").attr("disabled",false);
        $("#txtNewImpPersonName").attr("disabled",false);
        $("#txtNewImpPersonLastName").attr("disabled",false);
        $("#txtNewImpPersonId").attr("disabled",false);
        $("#txtNewImpEmail").attr("disabled",false);
});
function ShowImporterInformation(i){
        $("#btnInsertImporter").html('Actualizar');
        $("#txtNewImpName").attr("disabled",true);
        $("#txtNewImpName").val(lstImporters[i].IMPORTERNAME);
		$("#txtNewImpAddress").val(lstImporters[i].IMPORTERADDRESS);
		$("#txtNewImpPhone").val(lstImporters[i].IMPORTERPHONE);
        $("#txtNewImpRuc").attr("disabled",true);
		$("#txtNewImpRuc").val(lstImporters[i].IMPORTERRUC);
        $("#txtNewImpQuota").attr("disabled",true);
		$("#txtNewImpQuota").val(lstImporters[i].IMPORTERQUOTA);
        $("#txtNewImpLicence").attr("disabled",true);
		$("#txtNewImpLicence").val(lstImporters[i].IMPORTERWASTEGENERATORNUMBER);
		$("#txtNewImpPersonName").val(lstImporters[i].PERSONNAME);
        $("#txtNewImpPersonName").attr("disabled",true);
		$("#txtNewImpPersonLastName").val(lstImporters[i].PERSONLASTNAME);
        $("#txtNewImpPersonLastName").attr("disabled",true);
		$("#txtNewImpPersonId").val(lstImporters[i].PERSONCIRUC);
        $("#txtNewImpPersonId").attr("disabled",true);
		$("#txtNewImpPersonPhone").val(lstImporters[i].PERSONPHONE);
		$("#txtNewImpPersonAddress").val(lstImporters[i].PERSONADDRESS);
		$("#txtNewImpEmail").val(lstImporters[i].USEREMAIL);
        $("#txtNewImpEmail").attr("disabled",true);
        
        $("#txtNewImpCode").val(lstImporters[i].IMPORTERCODE);
        
}
// $("#addImporter").ready(function(){
//      rand_code();
//      $("#txtNewImpCode").val(code);
//  });
$("#btnInsertImporter").click(function(){
    // console.log($("#btnInsertImporter").html());
    var newImporter = {
        name: $("#txtNewImpName").val(),
        address: $("#txtNewImpAddress").val(),
        phone: $("#txtNewImpPhone").val(),
        rucImporter: $("#txtNewImpRuc").val(),
        quota: $("#txtNewImpQuota").val(),
        licence: $("#txtNewImpLicence").val(),
        code: $("#txtNewImpCode").val(),
        personName: $("#txtNewImpPersonName").val(),
        personLastName: $("#txtNewImpPersonLastName").val(),
        personCi: $("#txtNewImpPersonId").val(),
        personPhone: $("#txtNewImpPersonPhone").val(),
        personAddress: $("#txtNewImpPersonAddress").val(),
        personEmail: $("#txtNewImpEmail").val(),
        // importercode: $("#txtNewImpCode").val()
    } 
    // alert(newImporter.code);
    console.log("NUEVO IMPORTADOR");
    console.log(newImporter);
    if($("#btnInsertImporter").html()=="Guardar"){
        bootbox.confirm("¿Desea guardar la información ingresada? ", function(result) {
            if(result){
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
                        location.reload();	
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
    }else{
        bootbox.confirm("¿Desea actualizar la información? ", function(result) {
            if(result){
                socket.emit("RequestUpdateImporter",newImporter);
                socket.on("RequestErrorUpdateImporter",function(flag){
                    if(flag){
                        $.notific8('Datos actualizados correctamente', {
                            life: 3500,
                            heading: 'Listo!',
                            theme: 'teal',
                            sticky: false,
                            horizontalEdge: 'top',
                            verticalEdge: 'rigth',
                            zindex: 1500
                        });
                        location.reload();	
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
    }
	

	
});

function updateImporterQuota(){
	bootbox.confirm("¿Desea guardar el pedido ingresado? ", function(result) {
	   if(result){
	   		if($('#txtUpdateQuantity').val()==''){
	   			$.notific8('Por favor, ingrese todos los datos solicitados', {
			      life: 3500,
			      heading: 'Error!',
			      theme: 'ruby',
			      sticky: false,
			      horizontalEdge: 'top',
			      verticalEdge: 'rigth',
			      zindex: 1500
			    });
	   		}else{
	   			var quota={
					importer:lstImporters[$('#cmbUpdateImporters option:selected').index()-1],
					quantity: $('#txtUpdateQuantity').val(),
					monthQuantity: $('#txtUpdateQuantity').val()/12
				}
				socket.emit('UpdateQuota',quota);
				location.reload();
	   		}
	   }
	});
}


function rand_code(){
    code = "";
    for (x=0; x < lon; x++)
    {
        rand = Math.floor(Math.random()*chars.length);
        code += chars.substr(rand, 1);
    }
    // alert(code);
    // console.log(code);
    // $("txtNewImpCode").val(code);
}