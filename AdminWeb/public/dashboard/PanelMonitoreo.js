var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
var lstWaste=[];
var lstOrders=[];
var lstObjOrders=[];
var lstImporters=[];
var lstJourneys=[];
var lstDistributors=[];
var lstRecyclingCenters=[];
var lstUserMarkers=[];
var lstOrders=[];
var lstTrucks=[];
var mapa=new GMaps({
    div: '#gmap_basic',
    lat: -0.191611,
    lng:  -78.483574
});

var userMarker;
$(document).ready(function(data){
	socket.on('SelectTrucks',function(data){
		lstTrucks=data;
	});
	socket.on('SelectImporters', function(data){
		lstImporters=[];
	   	lstImporters=data;
	})
	socket.on('selectWaste', function(data){
		lstWaste=[];
       	lstWaste=data;
   	})
	socket.on('SelectRecyclingCenters', function(data){
		lstRecyclingCenters=[];
       	lstRecyclingCenters=data;
	})

	socket.on('SelectDistributors', function(data){
		lstDistributors=[];
       	lstDistributors=data;
   	})
	socket.on('SelectJourneys', function(data){
		lstJourneys=[];
		lstJourneys=data;
	})

	socket.on('SelectActiveOrders', function(data){
       	var importerName;
       	var RCName;
       	var waste;
       	lstOrders=[];
       	lstOrders=data;
     	$("#ActiveOrders > tbody").html("");
    //    	for (var i = 0; i <lstOrders.length; i++) {
    //    		if(lstOrders[i].JourneyDate==CurrentDate()){
    //    			var objOrder = {
	   //     			waste:"",
				// 	order: "",
				// 	importer: "",
				// 	contacto: ""
				// }
				// objOrder.order=lstOrders[i];
	   //     		for (var j = 0; j < lstImporters.length; j++) {
	   //     			if(lstImporters[j].ImporterId==lstOrders[i].IMPORTER_importer_id){
	   //     				objOrder.importer=lstImporters[j];
	   //     			}
	   //     		}
	   //     		for (var j = 0; j < lstWaste.length; j++) {
	   //     			if(lstWaste[j].WasteONU==lstOrders[i].RESIDUE_ResidueONU){
	   //     				objOrder.waste=lstWaste[j];
	   //     			}
	   //     		}
	   //     		$('#ActiveOrders').append("<tbody> <tr><td onclick='ShowJourney("+i+")'>"+objOrder.order.OrderId+"</td><td onclick='ShowJourney("+i+")'>"+
	   //     							objOrder.waste.WasteDescription+"</td><td onclick='ShowJourney("+i+")'>"+objOrder.order.OrderDeadLine+"</td><td onclick='ShowJourney("+i+")'>"+objOrder.order.OrderQuantity+
	   //     							"</td><td onclick='ShowJourney("+i+")'>"+objOrder.importer.ImporterName+"</td><td><a class='btn red btn-outline sbold' data-toggle='modal' href='' onclick='CurrentDate()'> <i class='fa fa-close'> </i> Suspender </a></td></tr><tbody>"); 
	   //     		lstObjOrders.push(objOrder);
    //    		}else{
    //    			console.log('no hay ordenes hoy')
    //    		}
    //    	}
       	for (var j = 0; j <lstJourneys.length; j++) {
       			console.log('Importadores ' +lstImporters.length)
       			for (var i = 0; i < lstImporters.length; i++) {
       				
			    	if(lstImporters[i].IMPORTERID==lstJourneys[j].IMPORTERID){
						console.log('Journey '+lstJourneys[j].ImporterId+' Importer '+lstImporters[i].IMPORTERID);
			    		importerName=lstImporters[i].ImporterName;
			    		break;
			    	}
			    }
			    for (var i = 0; i < lstRecyclingCenters.length; i++) {
					console.log("id centro de reciclaje "+lstRecyclingCenters[i].RecyclingCenterId+" "+lstJourneys[j].recyclingcenterid);
			    	if(lstRecyclingCenters[i].RecyclingCenterId==lstJourneys[j].recyclingcenterid){
						// console.log(lstRecyclingCenters[i].RECYCLINGCENTERID+" "+lstJourneys[j].RECYCLINGCENTERID);
			    		RCName=lstRecyclingCenters[i].RECYCLINGCENTERNAME;
			    		break;
			    	}
			    }
			    $('#ActiveOrders').append("<tbody><tr><td onclick='ShowJourney("+j+")'>"+lstJourneys[j].JourneyId+"</td><td onclick='ShowJourney("+j+")'>"+
		       							lstJourneys[j].JourneyDate+"</td><td onclick='ShowJourney("+j+")'>"+lstJourneys[j].TRUCKID+"</td><td onclick='ShowJourney("+j+")'>"+RCName+
		       							"</td><td onclick='ShowJourney("+j+")'>"+importerName+"</td><td><a class='btn red btn-outline sbold' data-toggle='modal' href='' onclick='CurrentDate()'> <i class='fa fa-close'> </i> Suspender </a></td></tr><tbody>");  
		}
    }) 	
})

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
function ShowJourney(i){

	var ObjJourney;
	jQuery(document).ready(function() {
	    MapsGoogle.init();
	});
 	
 	// for (var j = 0; j < lstJourneys.length; j++) {
 	// 	if(lstJourneys[j].ORDER_order_id==lstOrders[i].OrderId){
 			ObjJourney = lstJourneys[i];
 	// 		break;
 	// 	}
 	// }
 	// socket.on('SelectOrders',function(data){
 	// 	for (var i = 0; i < data.length; i++) {
 	// 		if(data[i].OrderDeadLine==){

 	// 		}
 	// 	}
 	// 	lstOrders=data;
 	// });
 	var Orders=[];
 	var route=ObjJourney.JourneyRoute.split(',');
 	var RouteSelected=[];
 	for (var j = 0; j < lstOrders.length; j++) {
 		if(lstOrders[j].JourneyId==lstJourneys[i].JourneyId){
 			Orders.push(lstOrders[j])
 		}	
 	}
 	for (var i = 0; i < lstDistributors.length; i++) {
 		for (var j = 0; j < route.length; j++) {
 			if(lstDistributors[i].DistributorId==route[j]){
 				RouteSelected.push(lstDistributors[i]);
 				for (var k = 0; k < Orders.length; k++) {
 					// console.log(Orders[k])
 					if(lstDistributors[i].DistributorId==Orders[k].DistributorId){
 						var aux=Orders[k].OrderQuantity
 					}
 				}
 				mapa.addMarker({
				   	lat: lstDistributors[i].CoordX,
				   	lng: lstDistributors[i].CoordY,
				   	title: 'Centro de Distribución',
				   	icon: '../iconos/llanta.png',
				   	infoWindow: {
				        content: '<div id="content"><strong>'+lstDistributors[i].DistributorName+'</strong><br>'
				       			+'<label>'+lstDistributors[i].DistributorAddress+'</label><br>'
				       			+'<label>Stock Disponible: '+aux+' llantas <br></div>'
				    }
				});
 			}
 		}	
	}	
	for (var i = 0; i < lstRecyclingCenters.length; i++) {
		if(lstRecyclingCenters[i].RecyclingCenterId==ObjJourney.RECYCLING_CENTER_recycling_center_id){
			var finishPosition=lstRecyclingCenters[i];
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
	if(RouteSelected.length==1){
		mapa.travelRoute({
		    origin: [RouteSelected[0].CoordX,RouteSelected[0].CoordY],
		    destination: [finishPosition.CoordX,finishPosition.CoordY],
		    travelMode: 'driving',
		    waypoints: waypnts,
		  	optimizeWaypoints: true,
		  	provideRouteAlternatives: true,
		    step: function (e) {
		        // $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
		        // $('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
		            mapa.drawPolyline({
		                path: e.path,
		                strokeColor: '#131540',
		                strokeOpacity: 0.6,
		                strokeWeight: 6
		            });
		        // });
		    }
		});
	}else{
		var waypnts=[];
		for (var i = 1; i < RouteSelected.length; i++) {
			waypnts.push({
				location: new google.maps.LatLng(RouteSelected[i].CoordX,RouteSelected[i].CoordY),
				stopover: false 
			});
		}
		mapa.travelRoute({
	        origin: [RouteSelected[0].CoordX,RouteSelected[0].CoordY],
	        destination: [finishPosition.CoordX,finishPosition.CoordY],
	        travelMode: 'driving',
	        waypoints: waypnts,
	      	optimizeWaypoints: true,
	      	provideRouteAlternatives: true,
	        step: function (e) {
	            // $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
	            //$('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
	                mapa.drawPolyline({
	                    path: e.path,
	                    strokeColor: '#131540',
	                    strokeOpacity: 0.6,
	                    strokeWeight: 6
	                });
	            // });
	        }
	    });
	}
	socket.on('TruckLocation',function(data){
		var AuxTruck;
		for(var i=0;i<lstTrucks.length;i++){
			if(ObjJourney.TRUCK_truck_id==lstTrucks[i].TruckId){
				AuxTruck=lstTrucks[i];
			}
		}
		console.log("."+data.user.person.PersonCi+'.'+AuxTruck.TruckDriver+".");
		if(data.user.person.PersonCi == AuxTruck.TruckDriver){
			var UserExist=false;
			if(lstUserMarkers.length==0){
				userMarker = mapa.addMarker({
					lat: data.position.lat,
					lng: data.position.lng,
					title: 'Ubicación actual del camión',
					icon: '../iconos/truck.png',
					animation: google.maps.Animation.BOUNCE,
					infoWindow: {
						content: '<strong>VIAJE</strong><br><strong>'+data.user.person.PersonName+' '+data.user.person.PersonLastName+'<strong/>'
					}
				});
				var Aux={
					data: data,
					marker:userMarker
				}
				lstUserMarkers.push(Aux);
			}
			for (var i = 0; i < lstUserMarkers.length; i++) {
				if(lstUserMarkers[i].data.user.user.UserEmail==data.user.user.UserEmail){
					if(lstUserMarkers[i].marker!=null){
						mapa.removeMarker(lstUserMarkers[i].marker);
						lstUserMarkers[i].marker=null;
					}
					lstUserMarkers[i].marker = mapa.addMarker({
						lat: data.position.lat,
						lng: data.position.lng,
						title: 'Ubicación actual del camión',
						icon: '../iconos/truck.png',
						animation: google.maps.Animation.BOUNCE,
						infoWindow: {
							content: '<strong>VIAJE</strong><br><strong>'+lstUserMarkers[i].data.user.person.PersonName+' '+lstUserMarkers[i].data.user.person.PersonLastName+'<strong/>'
						}
					});
					UserExist=true;
				}else{
					UserExist=false;
				}
			}
			if(!UserExist){
				userMarker = mapa.addMarker({
					lat: data.position.lat,
					lng: data.position.lng,
					title: 'Ubicación actual del camión',
					icon: '../iconos/truck.png',
					animation: google.maps.Animation.BOUNCE,
					infoWindow: {
						content: '<strong>VIAJE</strong><br><strong>'+data.user.person.PersonName+' '+data.user.person.PersonLastName+'<strong/>'
					}
				});
				var Aux={
					data: data,
					marker:userMarker
				}
				lstUserMarkers.push(Aux);
			}
	}

			// console.log(data.user.user.UserEmail);
			// if(userMarker!=null){
			// 	mapa.removeMarker(userMarker);
			// 	userMarker=null;
			// }
			// userMarker = mapa.addMarker({
			//    	lat: data.position.lat,
			//    	lng: data.position.lng,
			//    	title: 'Ubicación actual del camión',
			//    	icon: '../iconos/truck.png',
			//    	animation: google.maps.Animation.BOUNCE,
			//    	infoWindow: {
		//            content: 'funciona'
		//        }
			// });
	
		})
	
}
function CurrentDate(){
	var d = new Date();
	var month = d.getMonth()+1;
	var day = d.getDate();
	var output = d.getFullYear() + '-' +
    (month<10 ? '0' : '') + month + '-' +
    (day<10 ? '0' : '') + day;
    return output;
}
