var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstTrucks= [];
var lstDrivers=[];
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
//      MapsGoogle.init();
//     socket.emit("RequestCRInfo","");
//     socket.on("ResponseCRInfo",function(flag){
//         if(flag==0){
//             $.notific8('Error al cargar, intentelo nuevamente', {
//                 life: 3500,
//                 heading: 'Error!',
//                 theme: 'ruby',
//                 sticky: false,
//                 horizontalEdge: 'top',
//                 verticalEdge: 'rigth',
//                 zindex: 1500
//             });
//         }
//     });
    Limpiar();
    socket.on("SelectTrucks1",function(CR){
        lstTrucks.length=0;
        lstTrucks=CR;
        
        $("#ImportersTable > tbody").html("");
        for (var i = 0; i < CR.length; i++) {
            $('#ImportersTable').append("<tbody>"+
                                        "<tr>"+
                                            "<td>"+CR[i].TRUCKID+"</td>"+
                                            "<td>"+CR[i].TRUCKMODEL+"</td>"+
                                            "<td>"+CR[i].TRUCKSIZE+"</td>"+
                                            "<td>"+CR[i].TRUCKTRADEMARK+"</td>"+
                                            "<td>"+CR[i].PERSONNAME+' '+CR[i].PERSONLASTNAME+"</td>"+
                                            
                                            // "<td><a class='btn red btn-outline sbold' data-toggle='modal' href='#addImporter' onclick='ShowImporterInformation("+i+")'> <i class='fa fa-edit'> </i> Editar </a></td>"+
                                        "</tr>"+
                                    "</tbody>");
        }
    });
    
});
function Limpiar()
{
        $("#txtNewTruckId").val("");
		$("#txtNewTruckModel").val("");
		$("#txtNewTruckSize").val("");
		$("#txtNewTruckTradeMark").val("");
        
        socket.on('SelectDrivers', function(data){
            // lstDrivers=[];
            lstDrivers=data;
            $('#cmbNewTruckDriver').empty();
            $('#cmbNewTruckDriver').append('<option selected>Seleccione un Conductor</option>');
            for (var i = 0; i < lstDrivers.length; i++) {
                $('#cmbNewTruckDriver').append(new Option(lstDrivers[i].PERSONNAME+" "+lstDrivers[i].PERSONLASTNAME, 'names'));
            }

   	    })
}
$('#btnCancelTruck').click(function(){
	Limpiar();
    //$.notific8('My notification has a heading line.', {heading: 'Notification Heading'});
})

$('#btnSaveTruck').click(function(){
	bootbox.confirm("¿Desea guardar camión ingresado? ", function(result) {
	   if(result){
	   		if($('#txtNewTruckId').val()==''||$('#txtNewTruckModel').val()==''||$('#txtNewTruckSize').val()==''||$('#txtNewTruckTradeMark').val()==''){
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
	   			var driverAux;
				// var wasteAux;
				// var dateAux;
				driverAux=lstDrivers[$('#cmbNewTruckDriver option:selected').index()-1].PERSONID;
                alert(driverAux);
				// wasteAux=lstWaste[$('#cmbNewOrderWaste option:selected').index()-1];
				// dateAux=$('#txtNewOrderDate').val().split('-');
				var objTruck = {
					truckid:$('#txtNewTruckId').val(),
                    truckmodel:$('#txtNewTruckModel').val(),
                    trucksize:$('#txtNewTruckSize').val(),
                    trucktrademark:$('#txtNewTruckTradeMark').val(),
                    personid:driverAux
					// date: dateAux[2]+'-'+dateAux[1]+'-'+dateAux[0]
				}

				$.notific8('El pedido ha sido guardado correctamente', {
			      life: 3000,
			      heading: 'INFORMACION',
			      theme: 'teal',
			      sticky: false,
			      horizontalEdge: 'top',
			      verticalEdge: 'rigth',
			      zindex: 1500
			    });
                // alert($('#txtNewTruckId').val());
				socket.emit('NewTruck',objTruck);
                Limpiar();
				// location.reload();	
	   		}
	   }
	});	
});




