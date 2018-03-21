var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstObjOrders=[];
var OrdersTable=$('#orderTable');
var lstDrivers=[];
var lstTrucks=[];
var lstDistributors=[];
var Route=[];
var mapa=new GMaps({
    div: '#gmap_basic',
    lat: -0.191611,
    lng:  -78.483574
});
mapa.setZoom(10);
var lstRecyclingCenters=[];
var lstWaste=[];
var lstImporters=[];
var lstOrders=[];
var userPosition;
var finishPosition;
var OrderSelected;
var RouteSelected=[];
var StockAux;
var lstJourney=[];
var ImporterSelectd;
var lstIdOrders=[];
var TQ;
var fechaactual;
var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
var lon=6;
var code="h";
var lstDistributorsList=[];
var lstProvinces=[];
$(document).ready(function(){
	$('#txtNewJourneyDate').val(CurrentDate());
	//socket managment
	// $('#txtNewOrderDate').val(CurrentDate());
	// $('#txtUpdateOrderDate').val(CurrentDate());
   	socket.on('SelectDistributors', function(data){
		lstDistributors=[];
       	lstDistributors=data;
       	$('#cmbNewOrderImporters').empty();
       	$('#cmbNewOrderImporters').append('<option selected>Seleccione un Distribuidor</option>');
       	for (var i = 0; i < lstDistributors.length; i++) {
	   		$('#cmbNewOrderImporters').append(new Option(lstDistributors[i].DistributorName, 'names'));
	   	}
		   
	   })
	
      //alert(this.lstProvinces.length);
	
	socket.on('SelectOrdersList', function(data){
		lstDistributorsList=[];
		lstDistributorsList=data;
		hoy=new Date();
		var color;
		$("#OrdersHistoryTable > tbody").html("");
		$('#OrdersHistoryTable').append("<tbody>");
			for (var i = 0; i < lstDistributorsList.length; i++) {
				var minute="", hour="",day="", month="";
				if(lstDistributorsList[i].Ominute==null || lstDistributorsList[i].Ohour==null){
					minute="00";
					hour="00";
				}else{
					if(lstDistributorsList[i].Ominute<=9)
						minute="0"+lstDistributorsList[i].Ominute;
					else
						if(lstDistributorsList[i].Ominute)
							minute=lstDistributorsList[i].Ominute;
					if(lstDistributorsList[i].Ohour<=9)
						hour="0"+lstDistributorsList[i].Ohour;
					else
						if(lstDistributorsList[i].Ohour)
							hour=lstDistributorsList[i].Ohour;
				}
				/*if(lstDistributorsList[i].OrderState=='Pendiente')
				{
					if(lstDistributorsList[i].RestaFechas>0)
						color="style='color:red'";
					else
						color="style='color:green'"									
				}*/
				if(lstDistributorsList[i].Oday<=9){
					day="0"+lstDistributorsList[i].Oday;
				}else{
					day=lstDistributorsList[i].Oday;
				}
				if(lstDistributorsList[i].Omonth<=9){
					month="0"+lstDistributorsList[i].Omonth;
				}else{
					month=lstDistributorsList[i].Omonth;
				}
				
				if(lstDistributorsList[i].OrderState=='Pendiente')
				{
					if(lstDistributorsList[i].RestaFechas<2){
						$('#OrdersHistoryTable').append("<tr><td><input type='button' style='border-radius:100%; border-style:none; background:red' disabled>&nbsp&nbsp&nbsp"+lstDistributorsList[i].OrderId+"</td>"+
						"<td>"+lstDistributorsList[i].DistributorName+"</td>"+
						"<td>"+lstDistributorsList[i].OrderQuantity+"</td>"+
						"<td>"+lstDistributorsList[i].WasteDescription+"</td>"+
						"<td>"+lstDistributorsList[i].OrderState+"</td>"+
						"<td>"+day+'/'+month+'/'+lstDistributorsList[i].Oyear+" "+hour+":"+minute+"</td></tr>");
					}else{
						$('#OrdersHistoryTable').append("<tr><td><input type='button' style='border-radius:100%; border-style:none; background:red' disabled>&nbsp<b style='color:red'>!</b>&nbsp&nbsp&nbsp"+lstDistributorsList[i].OrderId+"</td>"+
						"<td>"+lstDistributorsList[i].DistributorName+"</td>"+
						"<td>"+lstDistributorsList[i].OrderQuantity+"</td>"+
						"<td>"+lstDistributorsList[i].WasteDescription+"</td>"+
						"<td>"+lstDistributorsList[i].OrderState+"</td>"+
						"<td>"+day+'/'+month+'/'+lstDistributorsList[i].Oyear+" "+hour+":"+minute+"</td></tr>");
					}
				}else{
					if(lstDistributorsList[i].OrderState=='Completado')
						{
							$('#OrdersHistoryTable').append("<tr><td><input type='button' style='border-radius:100%; border-style:none; background:green' disabled>&nbsp&nbsp&nbsp"+lstDistributorsList[i].OrderId+"</td>"+
							"<td>"+lstDistributorsList[i].DistributorName+"</td>"+
							"<td>"+lstDistributorsList[i].OrderQuantity+"</td>"+
							"<td>"+lstDistributorsList[i].WasteDescription+"</td>"+
							"<td>"+lstDistributorsList[i].OrderState+"</td>"+
							"<td>"+day+'/'+month+'/'+lstDistributorsList[i].Oyear+"</td></tr>");
					}else{
							$('#OrdersHistoryTable').append("<tr><td><input type='button' style='border-radius:100%; border-style:none; background:yellow' disabled>&nbsp&nbsp&nbsp"+lstDistributorsList[i].OrderId+"</td>"+
							"<td>"+lstDistributorsList[i].DistributorName+"</td>"+
							"<td>"+lstDistributorsList[i].OrderQuantity+"</td>"+
							"<td>"+lstDistributorsList[i].WasteDescription+"</td>"+
							"<td>"+lstDistributorsList[i].OrderState+"</td>"+
							"<td>"+day+'/'+month+'/'+lstDistributorsList[i].Oyear+"</td></tr>");
							}
				}                    
			}
		$('#OrdersHistoryTable').append("</tbody>");
	})

	
	
	
	//socket.emit('ReqSelectImporters','');
	/*socket.on('SelectImporters', function(data){
		lstImporters=[];
       	lstImporters=data;
       	// $('#cmbNewOrderImporters').empty();
       	$('#cmbUpdateImporters').empty();
       	$('#cmbUpdateImporters').append('<option selected>Seleccione un importador</option>');
       	for (var i = 0; i < lstImporters.length; i++) {
	   		// $('#cmbNewOrderImporters').append(new Option(lstImporters[i].ImporterName, 'names', true, true));
	   		$('#cmbUpdateImporters').append(new Option(lstImporters[i].IMPORTERNAME, 'names'));
	   	}
   	})*/
   	socket.on('SelectRecyclingCenters', function(data){
		lstRecyclingCenters=[];
       	lstRecyclingCenters=data;
       	for (var i = 0; i < lstRecyclingCenters.length; i++) {
			mapa.addMarker({
		    	lat: lstRecyclingCenters[i].CoordX,
		    	lng: lstRecyclingCenters[i].CoordY,
		    	title: 'Centro de Distribución',
		    	icon: '../iconos/recycle.png'
			});
		}
		$('#cmbRecyclingCenters').empty();
		$('#cmbRecyclingCenters').append('<option value="0" selected>Seleccione un Centro de Reciclaje</option>');
		for (var i = 0; i < lstRecyclingCenters.length; i++) {
	   		$('#cmbRecyclingCenters').append(new Option(lstRecyclingCenters[i].RecyclingCenterName, 'names', false, false));
	   	}
	   	$("#cmbRecyclingCenters").prop('selectedIndex', 0);
   	})
	fechaactual=new Date();
	//$('#txtUpdateOrderDate').disabled();
	//alert(fechaactual.getFullYear()+"-"+(fechaactual.getMonth() +1)+"-"+fechaactual.getDate());
   	$('#txtNewOrderDate').val(fechaactual.getFullYear()+"-"+(fechaactual.getMonth() +1)+"-"+fechaactual.getDate());
   	socket.on('selectWaste', function(data){
		lstWaste=[];
       	lstWaste=data;
       	$('#cmbNewOrderWaste').empty();
       	$('#cmbUpdateWaste').empty();
       	$('#cmbNewOrderWaste').append('<option selected>Seleccione un tipo de desecho</option>');
       	$('#cmbUpdateWaste').append('<option selected>Seleccione un tipo de desecho</option>');
       	for (var i = 0; i < lstWaste.length; i++) {
	   		$('#cmbNewOrderWaste').append(new Option(lstWaste[i].WASTEDESCRIPTION, 'names',false,false));
	   		$('#cmbUpdateWaste').append(new Option(lstWaste[i].WASTEDESCRIPTION, 'names',false,false));
	   	}
   	})
   	socket.on('SelectTrucks', function(data){
		lstTrucks=[];
       	lstTrucks=data;
   	})
	socket.on('SelectDrivers', function(data){
		lstDrivers=[];
       	lstDrivers=data;
		console.log(lstDrivers.length);
       	$('#cmbDrivers').empty();
       	$('#cmbDrivers').append('<option value="0" selected>Seleccione un Conductor</option>');
       	for (var i = 0; i < lstDrivers.length; i++) {
	   		var driver=lstDrivers[i].PERSONNAME+' '+lstDrivers[i].PERSONLASTNAME;
	   		$('#cmbDrivers').append(new Option(driver, 'names', false, false));
	   	}
       	$("#cmbDrivers").prop('selectedIndex', 0);
   	})
	socket.on('SelectOrders', function(data){
       	var importerName;
       	var waste;
       	lstOrders=[];
       	lstOrders=data;
		socket.emit("RequestMaxOrder","");
       	socket.on("ResponseMaxOrder",function(data){
			// alert(data);
       		$('#txtNewOrderNumber').val(data);	
       	});
		lstObjOrders=[];
		/*socket.emit("SelectDistributors","");
		socket.on('SelectDistributors', function(data){
			lstDistributors=[];
			lstDistributors=data;
			alert(lstDistributors.length);
		});*/
       	$("#orderTable > tbody").html("");
       	for (var i = 0; i <lstOrders.length; i++) {
       		var objOrder = {
       			waste:"",
				order: "",
				importer: "",
				contacto: ""
			}
			objOrder.order=lstOrders[i];
       		for (var j = 0; j < lstDistributors.length; j++) {

       			if(lstDistributors[j].DistributorId==lstOrders[i].DistributorId){
       				objOrder.importer=lstDistributors[j];
       			}
       		}
       		for (var j = 0; j < lstWaste.length; j++) {
       			if(lstWaste[j].WasteONU==lstOrders[i].RESIDUE_ResidueONU){
       				objOrder.waste=lstWaste[j];
       			}
       		}
       		// OrdersTable.append("<tbody> <tr><td onclick='ShowData("+i+")'>"+objOrder.order.OrderId+"</td><td onclick='ShowData("+i+")'>"+
       		// 					objOrder.waste.WasteDescription+"</td><td onclick='ShowData("+i+")'>"+objOrder.order.OrderDeadLine+"</td><td onclick='ShowData("+i+")'>"+objOrder.order.OrderQuantity+
       		// 					"</td><td onclick='ShowData("+i+")'>"+objOrder.importer.DistributorName+"</td></tr><tbody>"); 
       		lstObjOrders.push(objOrder);
		}
		//alert("order="+lstObjOrders.length);
		//alert("waste="+lstWaste.length);
		//alert("distri="+lstDistributors.length);
       	// InitialPosition();
       	if(lstOrders.length!=0){
       		CreateJourney();	
       	}
		for (var i = 0; i < lstJourney.length; i++) {
			var TotalQuantity=0;
			var D='';
			var DetalleCantidad="";
			var DetalleFechas="";
			for (var j = 0; j < lstJourney[i].length; j++) {
				TotalQuantity+=lstJourney[i][j].order.OrderQuantity;
				DetalleCantidad+=lstJourney[i][j].order.OrderQuantity+'<br>';
				D+=lstJourney[i][j].importer.DistributorName+'<br>';
			}
			console.log(DetalleFechas);
			OrdersTable.append("<tbody align='center'> <tr><td onclick='showData1("+i+","+TotalQuantity+")'>"+lstJourney[i][0].order.OrderDate+"</td><td onclick='showData1("+i+","+TotalQuantity+")'>"+
			DetalleCantidad+"</td><td onclick='showData1("+i+","+TotalQuantity+")'>"+D+"</td></tr><tbody>"); 
		}
		
   	})
   	//////
	   // InitialPosition();
	 
});
var band1ordernotification5=0;
var aux=0;
//setInterval("ordernotification5()",3000);

function ordernotification5(){
	//alert(aux);
	
	var band=false;
	//alert(band1ordernotification5);
	socket.emit("SelectCountOrders","");
	socket.on('SelectCountOrders', function(data){
		aux=data[0].cont;
		//alert(aux);
	}); 
	
	//alert(band1ordernotification5);
	if(band){
		if(aux!=band1ordernotification5){
			$.notific8('Nuevos Pedidos', {
				life: 4000,
				heading: 'INFORMACION',
				theme: 'teal',
				sticky: false,
				horizontalEdge: 'top',
				verticalEdge: 'rigth',
				zindex: 1500
			});
		}
	}else
		band=true;
	band1ordernotification5=aux;
}

var MapsGoogle = function () {

    var mapBasic = function () {
        mapa=new GMaps({
            div: '#gmap_basic',
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

jQuery(document).ready(function() {
    MapsGoogle.init();
});

function showData1(i,TotalQuantity){
	k=i;
	$("#cmbDrivers")[0].selectedIndex = 0;//getRandomArbitrary(1, lstDrivers.length);
	console.log(getRandomArbitrary(1, lstDrivers.length))
	$('#txtDriverPhone').val(lstDrivers[$("#cmbDrivers option:selected").index()].PersonPhone);	
	for (var j = 0; j < lstTrucks.length; j++) {
		if(lstTrucks[j].PERSONID==lstDrivers[$("#cmbDrivers option:selected").index()].PERSONID){
			$('#txtTruckId').val(lstTrucks[j].TRUCKID);
			break;
		}else{
			$('#txtTruckId').val('');
		}
	}
	$("#cmbRecyclingCenters")[0].selectedIndex = 0;
	$('#txtRecyclingCenterAddress').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterAddress);
	$('#txtRecyclingCenterPhone').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterPhone);
	finishPosition={
		CoordX: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordX,
		CoordY: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordY
	}
	RouteSelected=[];
	for (var j = 0; j < lstJourney[i].length; j++) {
	
		RouteSelected.push(lstJourney[i][j].importer);
	}
	// SortRoute(userPosition,RouteSelected); 
	LocateDistributors(0);
	ShowRoute();
	// var Difference=lstImporters[0].IMPORTERMONTLYQUOTAH - TotalQuantity;
	// for (var i = 1; i < lstImporters.length; i++) {
	// 	// console.log(lstImporters[i].IMPORTERNAME+' Direncia: '+Difference);
	// 	// if(lstImporters[i].IMPORTERMONTLYQUOTAH - TotalQuantity<Difference && lstImporters[i].IMPORTERMONTLYQUOTAH!=0){
	// 		Difference=lstImporters[i].IMPORTERMONTLYQUOTAH - TotalQuantity;
	// 		// console.log(lstImporters[i].IMPORTERNAME+' Direncia: '+Difference);
	// 		ImporterSelectd=lstImporters[i];
	// 		// alert(ImporterSelectd.IMPORTERID);
	// 		$('#txtImporterName').val(ImporterSelectd.IMPORTERNAME);
	// 		$('#txtImporterRUC').val(ImporterSelectd.IMPORTERRUC);
	// 		$('#txtImporterAddress').val(ImporterSelectd.IMPORTERADDRESS);
	// 		$('#txtImporterPhone').val(ImporterSelectd.IMPORTERPHONE);
		// }
	// }

	$('#Orders').empty();
	console.log("Orders: "+lstJourney[k].length);
	for (var j = 0; j < lstJourney[k].length; j++) {
		$('#Orders').append('<div class="caption font-green">'
								+'<i class="fa fa-sticky-note font-green"></i>'
								+'<span class="caption-subject bold uppercase"> Datos del Pedido '+(j+1)+'</span>'
							+'</div>'
							+'<div class="form-group form-md-line-input has-success">'
								+'<input id="txtOrderId" value="'+ lstJourney[k][j].order.OrderId+'" type="text" class="form-control" id="form_control_1" disabled>'
								+'<label for="form_control_1">Número de orden</label>'
							+'</div>'
							+'<div class="form-group form-md-line-input has-success">'
								+'<input id="txtOrderId" value="'+ lstJourney[k][j].importer.DistributorName +'" type="text" class="form-control" id="form_control_1" disabled>'
								+'<label for="form_control_1">Distibuidor</label>'
							+'</div>'
							+'<div class="form-group form-md-line-input has-success">'
								+'<input id="txtOrderQuantity" value="'+ lstJourney[k][j].order.OrderQuantity +'" type="text" class="form-control" id="form_control_1" disabled>'
								+'<label for="form_control_1">Cantidad</label>'
							+'</div>');
		// console.log("lstJourney[k][j].order");
		// console.log(lstJourney[k][j].order);
		lstIdOrders.push(lstJourney[k][j].order.OrderId);
	}
	$('#txtNewJourneyDate').val(lstJourney[k][0].order.ORDERDEADLINE)
	$('#txtNewJourneyDate').val(CurrentDate());
	TQ=TotalQuantity;
}

function RemoveRow () {
    var table = document.getElementById ("orderTable");
    if (table.rows.length > 1) {
        table.deleteRow(0);
    }
}
function ShowData(i){
	OrderSelected=lstObjOrders[i];
	$("#cmbDrivers")[0].selectedIndex = 1;//getRandomArbitrary(1, lstDrivers.length);
	$('#txtDriverPhone').val(lstDrivers[$("#cmbDrivers option:selected").index()].PersonPhone);	
	for (var j = 0; j < lstTrucks.length; j++) {
		if(lstTrucks[j].TruckDriver==lstDrivers[$("#cmbDrivers option:selected").index()].PersonCi){
			$('#txtTruckId').val(lstTrucks[j].TruckId);
			break;
		}else{
			$('#txtTruckId').val('');
		}
	}

	StockAux=OrderSelected.order.OrderQuantity;
	$('#txtImporterName').val(lstObjOrders[i].importer.IMPORTERNAME);
	$('#txtImporterRUC').val(lstObjOrders[i].importer.DistributorRuc);
	$('#txtImporterAddress').val(lstObjOrders[i].importer.DistributorAddress);
	$('#txtImporterPhone').val(lstObjOrders[i].importer.DistributorPhone);
	$('#txtOrderId').val(lstObjOrders[i].order.OrderId);
	$('#txtOrderDate').val(lstObjOrders[i].order.OrderDeadLine);
	$('#txtOrderQuantity').val(lstObjOrders[i].order.OrderQuantity+' llantas');
	// $("##cmbDrivers").prop("selectedIndex",1);
	$("#cmbRecyclingCenters")[0].selectedIndex = 1;
	$('#txtRecyclingCenterAddress').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterAddress);
	$('#txtRecyclingCenterPhone').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterPhone);
	LocateDistributors(i);
	//$("#cmbRecyclingCenters").removeAttr("disabled");
	finishPosition={
		CoordX: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordX,
		CoordY: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordY
	}
	InitialPosition();

	// for (var i = 0; i < lstImporters.length; i++) {
	// 	console.log(lstImporters[i].ImporterName+' '+lstImporters[i].ImporterMontlyQuotah);
	// }
	// CreateJourney();

}

$('#cmbRecyclingCenters').change(function(){
	$('#gmap_routes_instructions').empty();
	if($("#cmbRecyclingCenters option:selected").index()==0){
		$('#txtRecyclingCenterAddress').val('');	
		$('#txtRecyclingCenterPhone').val('');	
	}else{
		$('#txtRecyclingCenterAddress').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterAddress);
		$('#txtRecyclingCenterPhone').val(lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].RecyclingCenterPhone);
		finishPosition={
			CoordX: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordX,
			CoordY: lstRecyclingCenters[$("#cmbRecyclingCenters option:selected").index()-1].CoordY
		}
		jQuery(document).ready(function() {
		    MapsGoogle.init();
		});
		LocateRecyclingCenters();
		// InitialPosition();
		for (var i = 0; i < Route.length; i++) {
			mapa.addMarker({
			   	lat: Route[i].CoordX,
			   	lng: Route[i].CoordY,
			   	title: 'Centro de Distribución',
			   	icon: '../iconos/dPendiente.png',
			   	infoWindow: {
			        content: '<div id="content"><strong>'+Route[i].DistributorName+'</strong><br>'
			       			+'<label>'+Route[i].DistributorAddress+'</label><br>'
			       			//+'<label>Stock Disponible: '+Route[i].DistributorStock+' llantas <br>'
			           		+'<input type="submit" onclick="IncludeInRoute('+Route[i].DistributorId+')" value="Seleccionar" class=" btn blue"></div>'
			        }
				});
		}		
		ShowRoute();
	}
});

$('#cmbDrivers').change(function(){
	if($("#cmbDrivers option:selected").index()==0){
		$('#txtDriverPhone').val('');
		$('#txtTruckId').val('');	
	}else{
		// alert(lstDrivers[$("#cmbDrivers option:selected").index()-1].PERSONPHONE)
		$('#txtDriverPhone').val(lstDrivers[$("#cmbDrivers option:selected").index()-1].PERSONPHONE);	
		for (var i = 0; i < lstTrucks.length; i++) {
			if(lstTrucks[i].PERSONID==lstDrivers[$("#cmbDrivers option:selected").index()-1].PERSONID){
				$('#txtTruckId').val(lstTrucks[i].TRUCKID);
				break;
			}else{
				$('#txtTruckId').val('');
			}
		}
	}
});

function LocateDistributors(j){
	jQuery(document).ready(function() {
	    MapsGoogle.init();
	});
	LocateRecyclingCenters();
	// InitialPosition();
	Route=[];
	for (var i = 0; i < lstDistributors.length; i++) {
		// if(lstDistributors[i].IMPORTER_ImporterId==lstObjOrders[j].importer.ImporterId){
			mapa.addMarker({
			    	lat: lstDistributors[i].CoordX,
			    	lng: lstDistributors[i].CoordY,
			    	title: 'Centro de Distribución',
			    	icon: '../iconos/dPendiente.png',
			    	infoWindow: {
		                content: '<div id="content"><strong>'+lstDistributors[i].DistributorName+'</strong><br>'
		                			+'<label>'+lstDistributors[i].DistributorAddress+'</label><br>'
		                		//	+'<label>Stock Disponible: '+lstDistributors[i].DistributorStock+' llantas <br>'
		                		+'<input type="submit" onclick="IncludeInRoute('+lstDistributors[i].DistributorId+')" value="Seleccionar "class=" btn blue"> </div>'
		            }
				});
			Route.push(lstDistributors[i]);
		// }
	}
	// if(Route.length==0){
	// 	for (var i = 0; i < lstDistributors.length; i++) {
	// 		var DistibutorAux=lstDistributors[i];
	// 		if(lstDistributors[i].IMPORTER_ImporterId==null){
	// 			mapa.addMarker({
	// 		    	lat: lstDistributors[i].CoordX,
	// 		    	lng: lstDistributors[i].CoordY,
	// 		    	title: 'Centro de Distribución',
	// 		    	icon: '../iconos/llanta.png',
	// 		    	infoWindow: {
	// 	                content: '<div id="content"><strong>'+lstDistributors[i].DistributorName+'</strong><br>'
	// 	                			+'<label>'+lstDistributors[i].DistributorAddress+'</label><br>'
	// 	                			+'<label>Stock Disponible: '+lstDistributors[i].DistributorStock+' llantas <br>'
	// 	                		+'<input type="submit" onclick="IncludeInRoute('+lstDistributors[i].DistributorId+')" value="Seleccionar" class=" btn blue"></div>'
	// 	            }
	// 			});
	// 			Route.push(lstDistributors[i]);
	// 		}
	// 	}
	// }
}

function LocateRecyclingCenters(){
	for (var i = 0; i < lstRecyclingCenters.length; i++) {
		mapa.addMarker({
	    	lat: lstRecyclingCenters[i].CoordX,
	    	lng: lstRecyclingCenters[i].CoordY,
	    	title: 'Centro de Distribución',
	    	icon: '../iconos/recycle.png',
	    	infoWindow: {
                content: '<div id="content"><strong>'+lstRecyclingCenters[i].RecyclingCenterName+'</strong><br>'
                			+'<label>'+lstRecyclingCenters[i].RecyclingCenterAddress+'</label><br>'
                		+'</div>'
            }
		});
	}
}

$('#btnCancelOrder').click(function(){
	//$.notific8('My notification has a heading line.', {heading: 'Notification Heading'});
	location.reload();
})

$('#btnSaveOrder').click(function(e){
	e.preventDefault();
	bootbox.confirm("¿Desea guardar el pedido ingresado? ", function(result) {
	   if(result){
	   		if($('#txtNewOrderQuantity').val()==''){
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
	   			var importerAux;
				var wasteAux;
				var dateAux;
				importerAux=lstDistributors[$('#cmbNewOrderImporters option:selected').index()-1];
				wasteAux=lstWaste[$('#cmbNewOrderWaste option:selected').index()-1];
				dateAux=$('#txtNewOrderDate').val().split('-');
				var objOrder = {
					importer: importerAux,
					waste: wasteAux,
					quantity: $('#txtNewOrderQuantity').val(),
					date: fechaactual.getFullYear()+"-"+(fechaactual.getMonth() +1)+"-"+fechaactual.getDate(),
					time: fechaactual.getHours()+":"+fechaactual.getMinutes()
					//date: dateAux[2]+'-'+dateAux[1]+'-'+dateAux[0]
				}
				//alert(objOrder.time);
				socket.emit('NewOrder',objOrder);

				$.notific8('El pedido ha sido guardado correctamente', {
			      life: 1500,
			      heading: 'INFORMACION',
			      theme: 'teal',
			      sticky: false,
			      horizontalEdge: 'top',
			      verticalEdge: 'rigth',
			      zindex: 1500
			    });
				
				setTimeout("location.reload()",800);	
	   		}
	   }
	});	
});

function InitialPosition(){
	navigator.geolocation.getCurrentPosition(
		function (posicion){
			userPosition = {
				CoordX: posicion.coords.latitude,
				CoordY: posicion.coords.longitude 
			}

			// CreateRoute();
			mapa.addMarker({
				lat: posicion.coords.latitude,
				lng: posicion.coords.longitude,
				title: 'Centro de Distribución',
				infoWindow: {
				    content: '<div id="content"><strong>Punto de Partida</strong><br>'
				    			+'<label>Av. Amazonas N36-12 y Japón</label><br>'
				    		+'</div>'
				}
			});
		},SiError
	);
}

function SiError (error){
	switch(error.code){
	  case 1:
	    alert('Error: '+error.code+' '+error.message+ '\n\nNo ha permitido que su navegador proporcione su localización');
	    break;
	  case 2:
	    alert('Error: '+error.code+' '+error.message+ '\n\nNo se ha podido determinar su localización actual');
	    break;
	  case 3:
	    alert('Error: '+error.code+' '+error.message+ '\n\nSe ha agotado el tiempo de espera para determinar su ubicación');
	    break;
	  default:
	    alert('Error: '+error.code+' '+error.message+ '\n\nNo tiene conexion a internet');
	    break;
	}
}

function ShowRoute(){ 
	var waypnts=[];
	for (var i = 1; i < RouteSelected.length; i++) {
		waypnts.push({
			location: new google.maps.LatLng(RouteSelected[i].CoordX,RouteSelected[i].CoordY),
			stopover: false 
		});
	}
	$('#gmap_routes_instructions').empty();
    mapa.travelRoute({
        origin: [RouteSelected[0].CoordX,RouteSelected[0].CoordY],
        destination: [finishPosition.CoordX,finishPosition.CoordY],
        travelMode: 'driving',
        waypoints: waypnts,
      	optimizeWaypoints: true,
      	provideRouteAlternatives: true,
        step: function (e) {
            $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
            $('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
                mapa.drawPolyline({
                    path: e.path,
                    strokeColor: '#131540',
                    strokeOpacity: 0.6,
                    strokeWeight: 6
                });
            });
        }
    });
}

function CreateJourney(){
	lstJourney=[];
	var AuxlstObjOrders=lstObjOrders;
	var NewRouteSelected=[];
	var j=0;
	var dateDL=AuxlstObjOrders[j].order.OrderDeadLine;
	do{		
		if(dateDL==AuxlstObjOrders[j].order.OrderDeadLine){
			// console.log('Primero: '+AuxlstObjOrders[j].order.OrderId)
			NewRouteSelected.push(AuxlstObjOrders[j]);
			AuxlstObjOrders.splice(j,1);
			// console.log('************************')
		}else{
			// console.log('Else')
			// console.log(NewRouteSelected.length)
			lstJourney.push(NewRouteSelected)
			NewRouteSelected=[];
			dateDL=AuxlstObjOrders[j].order.OrderDeadLine;	
		}
	}while(AuxlstObjOrders.length!=0);

	lstJourney.push(NewRouteSelected)
	NewRouteSelected=[];
	// console.log('lstJourney '+lstJourney.length);
	// var journey = {
	// 		date: $('#txtNewJourneyDate').val(),
	// 		state: 'Pendiente',
	// 		truckId: $('#txtTruckId').val(),
	// 		orderId: $('#txtOrderId').val(),
	// 		RecyclingCenter: lstRecyclingCenters[$('#cmbRecyclingCenters option:selected').index()-1].RecyclingCenterId,
	// 		route: JourneyRoute
	// 	}	
}
function CreateRoute()
{
	// SortRoute(userPosition,Route);
	var i=0;
	RouteSelected=[];
	var numAux=OrderSelected.order.OrderQuantity;
	while(numAux>0 && i<Route.length){
		numAux=numAux - Route[i].DistributorStock;
		RouteSelected.push(Route[i]);
		i++;
	}
	ShowRoute();
}

function SortRoute(reference,rt){
	var x1= new google.maps.LatLng(reference.CoordX,reference.CoordY);
	for (i=0; i<rt.length; i++){
        for (j=0 ; j<rt.length - 1; j++){
           if (google.maps.geometry.spherical.computeDistanceBetween(x1,new google.maps.LatLng(rt[j].CoordX,rt[j].CoordY)) 
           		> google.maps.geometry.spherical.computeDistanceBetween(x1,new google.maps.LatLng(rt[j+1].CoordX,rt[j+1].CoordY))){
                var temp = rt[j];
                rt[j] = rt[j+1];
                rt[j+1] = temp;
            }
        }
	}
}

function IncludeInRoute(DistId){
	mapa.removePolylines();
	var Exist=false;
	for (var j = 0; j < RouteSelected.length; j++) {

		if(RouteSelected[j].DistributorId==DistId){
			RouteSelected.splice(j,1);
			$.notific8(' ha sido eliminado a la ruta ');
			Exist=true;
			break;
		}
	}

	if(!Exist){
		for (var i = 0; i < lstDistributors.length; i++) {
			if(lstDistributors[i].DistributorId==DistId){
				$.notific8(lstDistributors[i].DistributorName+' ha sido agregado a la ruta ');
				RouteSelected.push(lstDistributors[i]);
			}
		}
	}
	$('#gmap_routes_instructions').empty();
	ShowRoute(); 	
}
$("#addImporter").ready(function(){
     rand_code();
     $("#txtNewImpCode").val(code);
 });
function rand_code(){
    code = "";
    for (x=0; x < lon; x++)
    {
        rand = Math.floor(Math.random()*chars.length);
        code += chars.substr(rand, 1);
    }
} 
$('#btnSaveJourney').click(function(){
	alert($('#cmbRecyclingCenters').val());
	alert($('#cmbDrivers').val());
	if($('#cmbRecyclingCenters').val()==0 || $('#cmbDrivers').val()==0){
		alert("Escoja un Conductor y un Centro de Reciclaje");
	}else{
		bootbox.confirm("¿Esta seguro de guardar los cambios?", function(result) {
		if(result){
				var JourneyRoute='';
				for (var i = 0; i < RouteSelected.length; i++) {
					JourneyRoute +=RouteSelected[i].DistributorId
					if(i!=RouteSelected.length-1){
						JourneyRoute+=',';	
					}
				}
				// console.log(lstRecyclingCenters[$('#cmbRecyclingCenters option:selected').index()-1]);
				// console.log('cl');
				// console.log(lstRecyclingCenters[$('#cmbRecyclingCenters option:selected').index()-1].RecyclingCenterId)
				var journey = {
					date: $('#txtNewJourneyDate').val(),
					state: 'Pendiente',
					truckId: $('#txtTruckId').val(),
					RecyclingCenter: lstRecyclingCenters[$('#cmbRecyclingCenters option:selected').index()-1].RecyclingCenterId,
					route: JourneyRoute,
					// importer: null,
					quantity: TQ,
					orders: lstIdOrders
				}
				//    console.log('Numero de ordenes: '+lstIdOrders.length);
				//    for(var i=0;i<lstIdOrders.length;i++){
				// 	   console.log(lstIdOrders[i]);
				//    }
				socket.emit('SaveJourney', journey);
				// socket.emit('AsignJourney',lstIdOrders);
				location.reload();
		}
		}); 
	}
});	

$('#btnCancel').click(function(){
	
});

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/*function updateImporterQuota(){
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
}*/

function isNumberKey(evt)
{
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;
	return true;
}
function CurrentDate(){
	var d = new Date();
	var month = d.getMonth()+1;
	var day = d.getDate();
	var output =  d.getFullYear()+'-'+(month<10 ? '0' : '') + month + '-' + (day<10 ? '0' : '') + day

	return output;
}

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
				code:$("#txtNewImpCode").val()
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