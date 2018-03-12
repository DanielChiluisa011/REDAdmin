var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstCR= [];
var mapa;
var marcador;
// var mapa=new GMaps({
//     div: '#map_centroR',
//     lat: -0.191611,
//     lng:  -78.483574
// });

$(document).ready(function(){
    MapsGoogle.init();
    CleanInputText();
    
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
        
		
        $("#txtNewRCName").val("");
	    $("#txtNewRCAddress").val("");
	    $("#txtNewRCPhone").val("");
	    $("#txtNewRCPersonName").val("");
	    $("#txtNewRCPersonLastName").val("");
	    $("#txtNewRCPersonId").val("");
	    $("#txtNewRCPersonPhone").val("");
        $("#txtNewRCPersonAddress").val("");

        $("#txtNewRCProvince").val("");
        $("#txtNewRCCanton").val("");
        $("#txtNewRCParroquia").val("");

        for (var i = 0; i < CR.length; i++) {
            $('#ImportersTable').append("<tbody>"+
                                        "<tr>"+
                                            "<td>"+CR[i].RECYCLINGCENTERNAME+"</td>"+
                                            "<td>"+CR[i].RECYCLINGCENTERADDRESS+"</td>"+
                                            "<td>"+CR[i].RECYCLINGCENTERPHONE+"</td>"+
                                            "<td>"+CR[i].PERSONNAME+' '+CR[i].PERSONLASTNAME+"</td>"+
                                            "<td><a class='btn red btn-outline sbold' data-toggle='modal' href='#addCentro' onclick='ShowRCInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td>"+
                                        "</tr>"+
                                    "</tbody>");
        }
    });
    marcador=mapa.addMarker({
		lat: -0.191611,
		lng: -78.483574,
		title: 'Centro de Reciclaje',
		icon: '../iconos/recycle.png',
        draggable: true
	});
    
});
function CleanInputText()
{
    $("#txtNewRCPersonName").val("");
	$("#txtNewRCPersonLastName").val("");
	$("#txtNewRCPersonCi").val("");
	$("#txtNewRCPersonPhone").val("");
	$("#txtNewRCPersonDirection").val("");
	$("#txtNewRCPersonEmail").val("");
	$("#txtNewRCName").val("");
	$("#txtNewRCDirection").val("");
	$("#txtNewRCPhone").val("");
    $("#txtNewRCLicence").val("");
    
    $("#txtNewRCName2").val("");
	$("#txtNewRCDirection2").val("");
    $("#txtNewRCPhone2").val("");
    $("#txtNewRCLicence2").val("");
    $("#txtNewRCProvince").val("");
    $("#txtNewRCCanton").val("");
    $("#txtNewRCParroquia").val("");
    $("#txtNewRCProvince2").val("");
    $("#txtNewRCCanton2").val("");
    $("#txtNewRCParroquia2").val("");

	$("#txtNewRCPersonName2").val("");
	$("#txtNewRCPersonLastName2").val("");
	$("#txtNewRCPersonCi2").val("");
    $("#txtNewRCPersonDirection2").val("");
	$("#txtNewRCPersonPhone2").val("");
    $("#txtNewRCPersonEmail2").val("");
}
var geocoder = new google.maps.Geocoder();
	
document.getElementById('txtNewRCDirection').addEventListener('blur', function() {
	geocodeAddress(geocoder, mapa);
});
function geocodeAddress(geocoder, resultsMap) {
		
        var address = document.getElementById('txtNewRCDirection').value;
        geocoder.geocode({'address': address}, function(results, status) {
            
          if (status === 'OK') {
			//alert(results[0].geometry.location.lat()+" "+results[0].geometry.location.lng());
            resultsMap.setCenter(results[0].geometry.location.lat(),results[0].geometry.location.lng());
            //var marker = new google.maps.Marker({
            //  map: resultsMap,
            var marker=resultsMap.addMarker({
                icon: '../iconos/recycle.png',
                title: 'Centro de Reciclajes',
                lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng(),
				draggable: true,
            });
           
            marcador.setMap(null);
            marcador=marker;
            
            //marcador.setPosition(results[0].geometry.location.lat(),results[0].geometry.location.lng());
		/*var infowindow = new google.maps.InfoWindow({
          content: '<p>Posición del Marcador:' + marker.getPosition() + '</p>'
        });
			  document.getElementById('coord').value=marker.getPosition();
		google.maps.event.addListener(marker, 'mouseover', function() {
			document.getElementById('coord').value=marker.getPosition();	
        });
			  google.maps.event.addListener(marker, 'mouseout', function() {
			document.getElementById('coord').value=marker.getPosition();	
        });
			  google.maps.event.addListener(marker, 'mouseclick', function() {
			document.getElementById('coord').value=marker.getPosition();	
        });*/
			  
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
}
var MapsGoogle = function () {

    var mapBasic = function () {
        mapa=new GMaps({
            // div: '#MapIngreso',
            div: '#map_centroR',
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
$("#btnCancelRC").click(function(){

        CleanInputText();
        
});
function ShowRCInformation(i){
   // $("#btnSaveRC").html('Actualizar');
    $("#txtNewRCName2").attr("disabled",true);
    $("#txtNewRCName2").val(lstCR[i].RECYCLINGCENTERNAME);
	$("#txtNewRCDirection2").val(lstCR[i].RECYCLINGCENTERADDRESS);
    $("#txtNewRCPhone2").val(lstCR[i].RECYCLINGCENTERPHONE);
    $("#txtNewRCLicence2").val(lstCR[i].RECYCLINGENVIROMENTALLICENSE);
    $("#txtNewRCLicence2").attr("disabled",true);
    $("#txtNewRCProvince2").val(lstCR[i].RECYCLINGCENTERPROVINCIA);
    $("#txtNewRCProvince2").attr("disabled",true);
    $("#txtNewRCCanton2").val(lstCR[i].RECYCLINGCENTERCANTON);
    $("#txtNewRCCanton2").attr("disabled",true);
    $("#txtNewRCParroquia2").val(lstCR[i].RECYCLINGCENTERPARROQUIA);
    $("#txtNewRCParroquia2").attr("disabled",true);

	$("#txtNewRCPersonName2").val(lstCR[i].PERSONNAME);
    $("#txtNewRCPersonName2").attr("disabled",true);
	$("#txtNewRCPersonLastName2").val(lstCR[i].PERSONLASTNAME);
    $("#txtNewRCPersonLastName2").attr("disabled",true);
	$("#txtNewRCPersonCi2").val(lstCR[i].PERSONCIRUC);
    $("#txtNewRCPersonCi2").attr("disabled",true);
    $("#txtNewRCPersonDirection2").val(lstCR[i].PERSONADDRESS);
	$("#txtNewRCPersonPhone2").val(lstCR[i].PERSONPHONE);
    $("#txtNewRCPersonEmail2").val(lstCR[i].USEREMAIL);
    $("#txtNewRCPersonEmail2").attr("disabled",true);

}

$("#btnSaveRC").click(function(e){
    e.preventDefault();
    // alert(marcador.getPosition());
    // alert(marcador.position.lat()+" "+marcador.position.lng());
    // Latitud = y
    var newCR = {
        name: $("#txtNewRCName").val(),
        address: $("#txtNewRCDirection").val(),
        phone: $("#txtNewRCPhone").val(),
        personName: $("#txtNewRCPersonName").val(),
        personLastName: $("#txtNewRCPersonLastName").val(),
        personCi: $("#txtNewRCPersonCi").val(),
        personPhone: $("#txtNewRCPersonPhone").val(),
        personAddress: $("#txtNewRCPersonDirection").val(),
        position:marcador.getPosition(),
        CoordX:marcador.position.lat(),
        CoordY:marcador.position.lng(),
        licence:$("#txtNewRCLicence").val(),
        province:$("#txtNewRCProvince").val(),
        canton:$("#txtNewRCCanton").val(),
        parroquia:$("#txtNewRCParroquia").val()
    } 
    console.log("NUEVO CR");
    console.log(newCR);
    
        
        bootbox.confirm("¿Desea guardar la información ingresada? ", function(result) {
            if(result){
                socket.emit("RequestInsertNewCR",newCR);
                socket.on("ResponseNewCR",function(flag){
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
    
});

$("#btnSaveRC2").click(function(e){
    e.preventDefault();
    // alert(marcador.getPosition());
    // alert(marcador.position.lat()+" "+marcador.position.lng());
    // Latitud = y
    var newCR = {
        name: $("#txtNewRCName2").val(),
        address: $("#txtNewRCDirection2").val(),
        phone: $("#txtNewRCPhone2").val(),
        licence:$("#txtNewRCLicence2").val(),
        
        personName: $("#txtNewRCPersonName2").val(),
        personLastName: $("#txtNewRCPersonLastName2").val(),
        personCi: $("#txtNewRCPersonCi2").val(),
        personPhone: $("#txtNewRCPersonPhone2").val(),
        personAddress: $("#txtNewRCPersonDirection2").val(),
        personemail: $("#txtNewRCPersonEmail2").val(),
        position:marcador.getPosition(),
        CoordX:marcador.position.lat(),
        CoordY:marcador.position.lng(),
        province:$("#txtNewRCProvince").val(),
        canton:$("#txtNewRCCanton").val(),
        parroquia:$("#txtNewRCParroquia").val()
    } 
    console.log("NUEVO CR");
    console.log(newCR);
    //alert(newCR.phone+" "+newCR.personPhone);
   
        bootbox.confirm("¿Desea actualizar la información? ", function(result) {
            if(result){
                socket.emit("RequestUpdateImporter",newCR);
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
    	
});