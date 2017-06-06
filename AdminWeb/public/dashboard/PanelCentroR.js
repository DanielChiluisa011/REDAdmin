var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstCR= [];
var mapa;
var MapsGoogle = function () {

    var mapBasic = function () {
        mapa=new GMaps({
            div: '#MapIngreso',
            lat: -0.191611,
            lng:  -78.483574
        });
         mapa.setZoom(10);
		 
    }
    return {
        //main function to initiate map samples
        init: function () {
            mapBasic();
        }
    };
}();
$(document).ready(function(){
     MapsGoogle.init();
    socket.emit("RequestCRInfo","");
    socket.on("ResponseCRInfo",function(flag){
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
    socket.on("ResponseCR",function(CR){
        lstCR.length=0;
        lstCR=CR;
        $("#txtNewImpName").val("");
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
        $("#ImportersTable > tbody").html("");
        for (var i = 0; i < CR.length; i++) {
            $('#ImportersTable').append("<tbody>"+
                                        "<tr>"+
                                            "<td>"+CR[i].RECYCLINGCENTERNAME+"</td>"+
                                            "<td>"+CR[i].RECYCLINGCENTERADDRESS+"</td>"+
                                            "<td>"+CR[i].RECYCLINGCENTERPHONE+"</td>"+
                                            "<td>"+CR[i].PERSONNAME+' '+CR[i].PERSONLASTNAME+"</td>"+
                                            "<td><a class='btn red btn-outline sbold' data-toggle='modal' href='#addImporter' onclick='ShowImporterInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td>"+
                                        "</tr>"+
                                    "</tbody>");
        }
    });
});
$("#btnShow").click(function () {
    $("#dialog").dialog({
        modal: true,
        title: "Google Map",
        width: 600,
        hright: 450,
        buttons: {
            Close: function () {
                $(this).dialog('close');
            }
        },
        open: function () {
            var mapOptions = {
                center: new google.maps.LatLng(19.0606917, 72.83624970000005),
                zoom: 18,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            var map = new google.maps.Map($("#dvMap")[0], mapOptions);
        }
    });
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
        $("#txtNewImpName").val(lstCR[i].IMPORTERNAME);
		$("#txtNewImpAddress").val(lstCR[i].IMPORTERADDRESS);
		$("#txtNewImpPhone").val(lstCR[i].IMPORTERPHONE);
        $("#txtNewImpRuc").attr("disabled",true);
		$("#txtNewImpRuc").val(lstCR[i].IMPORTERRUC);
        $("#txtNewImpQuota").attr("disabled",true);
		$("#txtNewImpQuota").val(lstCR[i].IMPORTERQUOTA);
        $("#txtNewImpLicence").attr("disabled",true);
		$("#txtNewImpLicence").val(lstCR[i].IMPORTERWASTEGENERATORNUMBER);
		$("#txtNewImpPersonName").val(lstCR[i].PERSONNAME);
        $("#txtNewImpPersonName").attr("disabled",true);
		$("#txtNewImpPersonLastName").val(lstCR[i].PERSONLASTNAME);
        $("#txtNewImpPersonLastName").attr("disabled",true);
		$("#txtNewImpPersonId").val(lstCR[i].PERSONCIRUC);
        $("#txtNewImpPersonId").attr("disabled",true);
		$("#txtNewImpPersonPhone").val(lstCR[i].PERSONPHONE);
		$("#txtNewImpPersonAddress").val(lstCR[i].PERSONADDRESS);
		$("#txtNewImpEmail").val(lstCR[i].USEREMAIL);
        $("#txtNewImpEmail").attr("disabled",true);
}
$("#btnInsertImporter").click(function(){
    // console.log($("#btnInsertImporter").html());
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
    console.log("NUEVO CR");
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