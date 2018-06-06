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
var lstAlerts=[];
var lstTrucks=[];
var lstUsers=[];
var BeginPoint;
var AllPassPoints;
var driver;
var mapa=new GMaps({
    div: '#gmap_basic',
    lat: -0.191611,
    lng:  -78.483574
});
var directionsService;
var directionsDisplay;
var UsersAux=[];
var userMarker;
$(document).ready(function(data){
	// socket.removeAllListeners();
	socket.on('SelectImporters', function(data){
		lstImporters=[];
	   	lstImporters=data;
		   for(var i=0;i<lstImporters.length;i++){
			//    console.log(lstImporters[i])
		   }
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
		console.log('SelectJourneys');
		lstJourneys=[];
		lstJourneys=data;
		socket.removeListener("SelectJourneys");
	})
	socket.on("SelectTrucks",function(data){
		lstTrucks=[];
		lstTrucks=data;
	})
	socket.on('SelectActiveOrders', function(data){
		// sock 	et.removeAllListeners();
		console.log("SelectActiveOrders");
       	var importerName;
       	var RCName;
       	var waste;
       	lstOrders=[];
       	lstOrders=data;
		for ( var j = 0; j <lstJourneys.length; j++) {
			// socket.removeAllListeners();
			for (var i = 0; i < lstImporters.length; i++) {
				if(lstJourneys[j].ImporterId==lstImporters[i].IMPORTERID){
					importerName=lstImporters[i].IMPORTERNAME;
					break;
				}
			}
			for (var k = 0; k < lstRecyclingCenters.length; k++) {
				if(lstRecyclingCenters[k].RecyclingCenterId==lstJourneys[j].recyclingcenterid){
					RCName=lstRecyclingCenters[k].RecyclingCenterName;
					break;
				}
			}
			// socket.emit("RequestDriver",{id: lstJourneys[j].truckId,indx: j});
			// socket.on("ResponseDriver",function(data){
			// 	driver=data;
			// 	console.log(lstJourneys.length);
			// 	console.log("J: "+j);
			// 	$('#ActiveOrders').append("<tbody><tr><td onclick='ShowJourney("+data.indx+")'>"+lstJourneys[data.indx].JourneyId+"</td><td onclick='ShowJourney("+data.indx+")'>"+
			// 						lstJourneys[data.indx].JourneyDate+"</td><td onclick='ShowJourney("+data.indx+")'>"+lstJourneys[data.indx].truckId+"</td><td onclick='ShowJourney("+data.indx+")'>"+ data.driver.PERSONNAME +" "+data.driver.PERSONLASTNAME+"</td><td onclick='ShowJourney("+data.indx+")'>"+RCName+
			// 						"</td><td onclick='ShowJourney("+data.indx+")'>"+importerName+"</td><td><a class='btn red btn-outline sbold' data-toggle='modal' href='' onclick='CurrentDate()'> <i class='fa fa-close'> </i> Suspender </a></td></tr><tbody>");  
			// });
			// console.log("sdfghjk");
			// console.log(driver);
			$('#ActiveOrders').append("<tr align='center'><td onclick='BeginCoordinate("+j+")'>"+lstJourneys[j].JourneyId+"</td><td onclick='BeginCoordinate("+j+")'>"+
									lstJourneys[j].JourneyDate+"</td><td onclick='BeginCoordinate("+j+")'>"+lstJourneys[j].truckId+"</td><td onclick='BeginCoordinate("+j+")'>"+RCName+
									// "</td><td onclick='ShowRouteTest("+j+")'>"+importerName+"</td></tr><tbody>");  
									"</td></tr>");  
		}
		socket.removeListener("SelectActiveOrders");
    }) 
	

	socket.emit('RequestAlerts','');

	socket.on('ResponseAlerts',function(data){
		lstAlerts=data;
		$("#AlertsTable > tbody").html("");

		for(var i=0;i<lstAlerts.length;i++){
			var dates = new Date(lstAlerts[i].ALERTTIME);
			$('#AlertsTable').append("<tbody><tr><td>"+lstAlerts[i].ALERTID+"</td><td>"+lstAlerts[i].JOURNEYID+"</td><td>"+lstAlerts[i].ALERTTYPE+"</td><td>"+lstAlerts[i].ALERTDESCRIPTION+"</td><td>"+lstAlerts[i].TRUCKID+"</td><td>"+parseDate(dates)+"</td><td><button class='btn red btn-outline sbold' onclick='DeleteAlert("+i+")'><i class='fa fa-close'></i>  Leído</button></td></tr></tbody>");
		}

		// console.log("numero de alertas : "+lstAlerts.length);
		// $('#AlertNotifi').html(" "+lstAlerts.length); 

		function parseDate(d) {
    		var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembere", "Octubre", "Noviembre", "Diciembre" ],
        	d2 = monthNames[d.getUTCMonth()] +' '+ d.getUTCDate() +', '+d.getUTCFullYear() +' || '+d.getUTCHours() +':'+d.getUTCMinutes()+':'+d.getUTCSeconds();
    		return d2;
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


function BeginCoordinate(i){
	if(lstJourneys[i].JourneyState=="Completado"){
		socket.emit('SelectCoordinates',lstJourneys[i].JourneyId);
		socket.on('SelectCoordinates', function(data){
			BeginPoint=data[0];
			console.log("BeginsocketX="+BeginPoint.CoordX+"Y="+BeginPoint.CoordY);
		});
	
		socket.emit('SelectALLCoordinates',lstJourneys[i].JourneyId);
		socket.on('SelectALLCoordinates', function(data){
			AllPassPoints=data;
		});
	}
	setTimeout("ShowRouteTest("+i+")",1000);
}

function ShowRouteTest(i){
	
	jQuery(document).ready(function() {
	    MapsGoogle.init();
		// directionsDisplay.setMap(mapa);
	});
	var ObjJourney = lstJourneys[i];
	var AuxlstOrders=[];
 	var RouteSelected=[];
	var RouteInGo=[];
	var RouteItem=[];
	var flagCompleted=false;
	
	for (var j = 0; j < lstOrders.length; j++) {
 		if(lstOrders[j].JourneyId==lstJourneys[i].JourneyId){
 			AuxlstOrders.push(lstOrders[j])
 		}	
 	}
	for(var j=0;j<AuxlstOrders.length;j++){
		for(var k=0;k<lstDistributors.length;k++){
			if(AuxlstOrders[j].DistributorId==lstDistributors[k].DistributorId){
				RouteSelected.push(lstDistributors[k]);
			}
		}
	}
	for (var j = 0; j < AuxlstOrders.length; j++) {
 		if(AuxlstOrders[j].OrderState=="En Proceso"){
			RouteItem.push(AuxlstOrders[j]);	
		}
	}
	for(var k=0;k<RouteSelected.length;k++){
		for (var j = 0; j < AuxlstOrders.length; j++) {
			if(RouteSelected[k].DistributorId==AuxlstOrders[j].DistributorId){
 				var aux=AuxlstOrders[k].OrderQuantity
 			}
 		}
		// alert(RouteItem.length);
		if(RouteItem.length!=0)
			for(var l=0;l<RouteItem.length;l++)
			{
				// alert("Inicio "+RouteSelected[k].DistributorId+" "+RouteItem[l].DistributorId);
				if(RouteSelected[k].DistributorId==RouteItem[l].DistributorId)
				{

					// alert("Si "+RouteSelected[k].DistributorId+" "+RouteItem[l].DistributorId);
					mapa.addMarker({
						lat: RouteSelected[k].CoordX,
						lng: RouteSelected[k].CoordY,
						title: 'Centro de Distribución',
						icon: '../iconos/dPendiente.png',
						infoWindow: {
							content: '<div id="content"><strong>'+RouteSelected[k].DistributorName+'</strong><br>'
									+'<label>'+RouteSelected[k].DistributorAddress+'</label><br>'
									+'<label>Stock Disponible: '+aux+' <br></div>'
						}
					});
					break;
				}else{
					// alert(RouteSelected[k].DistributorId+" "+RouteItem[l].DistributorId);
					mapa.addMarker({
						lat: RouteSelected[k].CoordX,
						lng: RouteSelected[k].CoordY,
						title: 'Centro de Distribución',
						icon: '../iconos/dListo.png',
						infoWindow: {
							content: '<div id="content"><strong>'+RouteSelected[k].DistributorName+'</strong><br>'
									+'<label>'+RouteSelected[k].DistributorAddress+'</label><br>'
									+'<label>Stock Disponible: '+aux+' <br></div>'
						}
					});
				}
			}
		else{
			mapa.addMarker({
						lat: RouteSelected[k].CoordX,
						lng: RouteSelected[k].CoordY,
						title: 'Centro de Distribución',
						icon: '../iconos/dListo.png',
						infoWindow: {
							content: '<div id="content"><strong>'+RouteSelected[k].DistributorName+'</strong><br>'
									+'<label>'+RouteSelected[k].DistributorAddress+'</label><br>'
									+'<label>Stock Disponible: '+aux+' <br></div>'
						}
					});

		}	 

	}
	for (var i = 0; i < lstRecyclingCenters.length; i++) {
		if(lstRecyclingCenters[i].RecyclingCenterId==ObjJourney.recyclingcenterid){
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

	
	if(lstJourneys[i].JourneyState=="Completado"){
		mapa.addMarker({
			lat: BeginPoint.CoordX,
			lng: BeginPoint.CoordY,
			title: 'Inicio Trayecto',
			icon: '../iconos/truck.png',
		});

		var rwaypnts=[];
		var contador=1;
		var aux=1;
		var numpoint=Math.round(AllPassPoints.length/21);
		console.log("CONTADORIVAN="+numpoint);
		console.log("allpoints="+AllPassPoints.length);
		do{
			rwaypnts.push({
				location: new google.maps.LatLng(AllPassPoints[aux].CoordX,AllPassPoints[aux].CoordY),
				stopover:false
			});
			
			console.log("LATIV="+AllPassPoints[aux].CoordX+"LONIV="+AllPassPoints[aux].CoordY);
			aux=contador*numpoint;
			console.log("entrocontador"+aux);
			contador++;
			if(aux<AllPassPoints.length){
			 mapa.addMarker({
				lat: AllPassPoints[aux].CoordX,
				lng: AllPassPoints[aux].CoordY,
				title: 'Centro de Distribución',
				icon: '../iconos/recycle.png',	
			 });
			} 

		}while(aux<AllPassPoints.length);

		
		mapa.travelRoute({
	        origin: [AllPassPoints[0].CoordX,AllPassPoints[0].CoordY],
	        destination: [AllPassPoints[AllPassPoints.length-1].CoordX,AllPassPoints[AllPassPoints.length-1].CoordY],
	        travelMode: 'driving',
			waypoints: rwaypnts,
			optimizeWaypoints: false,
		  	provideRouteAlternatives: false,
	      	step: function (e) {
				mapa.drawPolyline({
					path: e.path,
					strokeColor: '#ff0c00',
					strokeOpacity: 0.6,
					strokeWeight: 6
				});
	        }
	    });
	}
	if(RouteSelected.length == 1){
		console.log("Route99X="+RouteSelected[0].CoordX+"Y="+RouteSelected[0].CoordY);
		mapa.travelRoute({
		    origin: [BeginPoint.CoordX,BeginPoint.CoordY],
		    destination: [finishPosition.CoordX,finishPosition.CoordY],
		    travelMode: 'driving',
		    waypoints: waypnts,
		  	optimizeWaypoints: true,
		  	provideRouteAlternatives: true,
		    step: function (e) {
		            mapa.drawPolyline({
		                path: e.path,
		                strokeColor: '#131540',
		                strokeOpacity: 0.6,
		                strokeWeight: 6
		            });
		    }
		});
	}else{
		var waypnts=[];
		for (var i = 1; i < RouteSelected.length; i++) {
			waypnts.push({
				location: new google.maps.LatLng(RouteSelected[i].CoordX,RouteSelected[i].CoordY),
				stopover:false
			});
		}
		mapa.travelRoute({
	        origin: [BeginPoint.CoordX,BeginPoint.CoordY],
	        destination: [finishPosition.CoordX,finishPosition.CoordY],
	        travelMode: 'DRIVING',
	        waypoints: waypnts,
	      	optimizeWaypoints: true,
	      	provideRouteAlternatives: true,
	        step: function (e) {
				mapa.drawPolyline({
					path: e.path,
					strokeColor: '#131540',
					strokeOpacity: 0.6,
					strokeWeight: 6
				});
	        }
	    });
	}
	var flagFirstDrawing=true;
	socket.on('TruckLocation',function(data){
		
		var AuxTruck;
		for(var i=0;i<lstTrucks.length;i++){
			if(ObjJourney.TRUCK_truck_id==lstTrucks[i].TruckId){
				AuxTruck=lstTrucks[i];
			}
		}

		// alert("."+data.user.person.PersonCi+'.'+AuxTruck.TruckDriver+".");
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
						content: '<strong>VIAJE</strong><br><strong>'+data.user.person.PERSONNAME+' '+data.user.person.PERSONLASTNAME+'<strong/>'
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
			socket.on('DeviationNotificationToAdmin',function(data){
				flagFirstDrawing=true;
				console.log("flagFirstDrawing=true")
			});
			if(flagFirstDrawing){
				mapa.removePolylines();
				RouteInGo.length=0;
				for (var i = 0; i<RouteSelected.length ; i++) {
					RouteInGo.push({
						location: new google.maps.LatLng(RouteSelected[i].CoordX,RouteSelected[i].CoordY),
						stopover:false
					});
				}
				SortRoute(data.position,RouteInGo);
				console.log("Elementos en ROuteInGo "+RouteInGo.length);
				mapa.travelRoute({
					origin: [data.position.lat,data.position.lng],
					destination: [finishPosition.CoordX,finishPosition.CoordY],
					travelMode: 'driving',
					waypoints: RouteInGo,
					optimizeWaypoints: true,
					provideRouteAlternatives: true,
					step: function (e) {
						mapa.drawPolyline({
							path: e.path,
							strokeColor: '#131540',
							strokeOpacity: 0.6,
							strokeWeight: 6
						});
					}
				});
				flagFirstDrawing=false;
			}	
		}
	});
}
function SortRoute(reference,rt){
	
	var x1= new google.maps.LatLng(reference.lat,reference.lng);
	var RouteInGoAux = [];
	for (i=0; i<rt.length; i++){
		for (j=0 ; j<rt.length - 1; j++){
			console.log(rt[j].CoordX);
			console.log("X1");
			console.log(x1);
			console.log("new google.maps.LatLng(rt[j].CoordX,rt[j].CoordY) ");
			console.log("Distancia 1 "+google.maps.geometry.spherical.computeDistanceBetween(x1,rt[j].location))
			console.log("Distancia 2 "+google.maps.geometry.spherical.computeDistanceBetween(x1,rt[j+1].location))
		if (google.maps.geometry.spherical.computeDistanceBetween(x1,rt[j].location) 
				> google.maps.geometry.spherical.computeDistanceBetween(x1,rt[j+1].location)){
				var temp = rt[j];
				rt[j] = rt[j+1];
				rt[j+1] = temp;
				console.log("rt length "+rt.length);
			}
		}
	}
}
// function ShowJourney(i){
// 	// socket.removeAllListeners();
// 	var ObjJourney;
// 	jQuery(document).ready(function() {
// 	    MapsGoogle.init();
// 	});
 	
//  	// for (var j = 0; j < lstJourneys.length; j++) {
//  	// 	if(lstJourneys[j].ORDER_order_id==lstOrders[i].OrderId){
//  			ObjJourney = lstJourneys[i];
//  	// 		break;
//  	// 	}
//  	// }
//  	// socket.on('SelectOrders',function(data){
//  	// 	for (var i = 0; i < data.length; i++) {
//  	// 		if(data[i].OrderDeadLine==){

//  	// 		}
//  	// 	}
//  	// 	lstOrders=data;
//  	// });
//  	var Orders=[];
//  	var route=ObjJourney.JourneyRoute.split(',');
//  	var RouteSelected=[];
// 	var RouteItem=[];
//  	for (var j = 0; j < lstOrders.length; j++) {
// 		//  console.log(lstOrders[j].JourneyId+"  "+lstJourneys[i].JourneyId)
//  		if(lstOrders[j].JourneyId==lstJourneys[i].JourneyId){
//  			Orders.push(lstOrders[j])
//  		}	
//  	}
//  	for (var i = 0; i < lstDistributors.length; i++) {
//  		for (var j = 0; j < route.length; j++) {
//  			if(lstDistributors[i].DistributorId==route[j]){
//  				RouteSelected.push(lstDistributors[i]);
//  				for (var k = 0; k < Orders.length; k++) {
//  					// console.log(Orders[k])
// 					if(lstOrders[i].OrderState=="En Proceso"){
// 						RouteItem.push(lstOrders[i]);	
// 					}
//  					if(lstDistributors[i].DistributorId==Orders[k].DistributorId){
//  						var aux=Orders[k].OrderQuantity
//  					}
//  				}
//  				mapa.addMarker({
// 				   	lat: lstDistributors[i].CoordX,
// 				   	lng: lstDistributors[i].CoordY,
// 				   	title: 'Centro de Distribución',
// 				   	icon: '../iconos/dPendiente.png',
// 				   	infoWindow: {
// 				        content: '<div id="content"><strong>'+lstDistributors[i].DistributorName+'</strong><br>'
// 				       			+'<label>'+lstDistributors[i].DistributorAddress+'</label><br>'
// 				       			+'<label>Stock Disponible: '+aux+' <br></div>'
// 				    }
// 				});
//  			}
//  		}	
// 	}	
// 	for (var i = 0; i < lstRecyclingCenters.length; i++) {
// 		if(lstRecyclingCenters[i].RecyclingCenterId==ObjJourney.recyclingcenterid){
// 			var finishPosition=lstRecyclingCenters[i];
// 			mapa.addMarker({
// 			   	lat: lstRecyclingCenters[i].CoordX,
// 			   	lng: lstRecyclingCenters[i].CoordY,
// 			   	title: 'Centro de Distribución',
// 			   	icon: '../iconos/recycle.png',
// 			   	infoWindow: {
// 	                content: '<div id="content"><strong>'+lstRecyclingCenters[i].RecyclingCenterName+'</strong><br>'
// 	                			+'<label>'+lstRecyclingCenters[i].RecyclingCenterAddress+'</label><br>'
// 	                		+'</div>'
// 	            }
// 			});
// 		}
// 	}
// 	if(RouteSelected.length == 1){
// 		mapa.travelRoute({
// 		    origin: [RouteSelected[0].CoordX,RouteSelected[0].CoordY],
// 		    destination: [finishPosition.CoordX,finishPosition.CoordY],
// 		    travelMode: 'driving',
// 		    waypoints: waypnts,
// 		  	optimizeWaypoints: true,
// 		  	provideRouteAlternatives: true,
// 		    step: function (e) {
// 		        // $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
// 		        // $('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
// 		            mapa.drawPolyline({
// 		                path: e.path,
// 		                strokeColor: '#131540',
// 		                strokeOpacity: 0.6,
// 		                strokeWeight: 6
// 		            });
// 		        // });
// 		    }
// 		});
// 	}else{
// 		var waypnts=[];
// 		for (var i = 1; i < RouteItem.length; i++) {
// 			waypnts.push({
// 				location: new google.maps.LatLng(RouteItem[i].CoordX,RouteItem[i].CoordY),
// 				stopover: false 
// 			});
// 		}
// 		mapa.travelRoute({
// 	        origin: [RouteSelected[0].CoordX,RouteSelected[0].CoordY],
// 	        destination: [finishPosition.CoordX,finishPosition.CoordY],
// 	        travelMode: 'driving',
// 	        waypoints: waypnts,
// 	      	optimizeWaypoints: true,
// 	      	provideRouteAlternatives: true,
// 	        step: function (e) {
// 	            // $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
// 	            //$('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
// 	                mapa.drawPolyline({
// 	                    path: e.path,
// 	                    strokeColor: '#131540',
// 	                    strokeOpacity: 0.6,
// 	                    strokeWeight: 6
// 	                });
// 	            // });
// 	        }
// 	    });
// 	}
// 	var flagFirstDrawing=true;
// 	socket.on('TruckLocation',function(data){
		
// 		var AuxTruck;
// 		for(var i=0;i<lstTrucks.length;i++){
// 			console.log("ObjJourney.TRUCK_truck_id: "+ObjJourney.TRUCK_truck_id+" lstTrucks[i].TruckId: "+lstTrucks[i].TruckId)
// 			if(ObjJourney.TRUCK_truck_id==lstTrucks[i].TruckId){
// 				AuxTruck=lstTrucks[i];
// 			}
// 		}
// 		console.log("."+data.user.person.PersonCi+'.'+AuxTruck.TruckDriver+".");
// 		if(data.user.person.PersonCi == AuxTruck.TruckDriver){
// 			var UserExist=false;
// 			if(lstUserMarkers.length==0){
// 				userMarker = mapa.addMarker({
// 					lat: data.position.lat,
// 					lng: data.position.lng,
// 					title: 'Ubicación actual del camión',
// 					icon: '../iconos/truck.png',
// 					animation: google.maps.Animation.BOUNCE,
// 					infoWindow: {
// 						content: '<strong>VIAJE</strong><br><strong>'+data.user.person.PERSONNAME+' '+data.user.person.PERSONLASTNAME+'<strong/>'
// 					}
// 				});
// 				var Aux={
// 					data: data,
// 					marker:userMarker
// 				}
// 				lstUserMarkers.push(Aux);
// 			}
// 			for (var i = 0; i < lstUserMarkers.length; i++) {
// 				if(lstUserMarkers[i].data.user.user.UserEmail==data.user.user.UserEmail){
// 					if(lstUserMarkers[i].marker!=null){
// 						mapa.removeMarker(lstUserMarkers[i].marker);
// 						lstUserMarkers[i].marker=null;
// 					}
// 					lstUserMarkers[i].marker = mapa.addMarker({
// 						lat: data.position.lat,
// 						lng: data.position.lng,
// 						title: 'Ubicación actual del camión',
// 						icon: '../iconos/truck.png',
// 						animation: google.maps.Animation.BOUNCE,
// 						infoWindow: {
// 							content: '<strong>VIAJE</strong><br><strong>'+lstUserMarkers[i].data.user.person.PersonName+' '+lstUserMarkers[i].data.user.person.PersonLastName+'<strong/>'
// 						}
// 					});
// 					UserExist=true;
// 				}else{
// 					UserExist=false;
// 				}
// 			}
// 			if(!UserExist){
// 				userMarker = mapa.addMarker({
// 					lat: data.position.lat,
// 					lng: data.position.lng,
// 					title: 'Ubicación actual del camión',
// 					icon: '../iconos/truck.png',
// 					animation: google.maps.Animation.BOUNCE,
// 					infoWindow: {
// 						content: '<strong>VIAJE</strong><br><strong>'+data.user.person.PersonName+' '+data.user.person.PersonLastName+'<strong/>'
// 					}
// 				});
// 				var Aux={
// 					data: data,
// 					marker:userMarker
// 				}
// 				lstUserMarkers.push(Aux);
// 			}
// 			mapa.travelRoute({
// 				origin: [data.position.lat,data.position.lng],
// 				destination: [finishPosition.CoordX,finishPosition.CoordY],
// 				travelMode: 'driving',
// 				waypoints: waypnts,
// 				optimizeWaypoints: true,
// 				provideRouteAlternatives: true,
// 				step: function (e) {
// 					// $('#gmap_routes_instructions').append('<li>' + e.instructions + '</li>');
// 					// $('#gmap_routes_instructions li:eq(' + e.step_number + ')').fadeIn(500, function () {
// 						mapa.drawPolyline({
// 							path: e.path,
// 							strokeColor: '#131540',
// 							strokeOpacity: 0.6,
// 							strokeWeight: 6
// 						});
// 					// });
// 				}
// 			});
// 	}

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
	
// 		})
	
// }

function CurrentDate(){
	var d = new Date();
	var month = d.getMonth()+1;
	var day = d.getDate();
	var output = d.getFullYear() + '-' +
    (month<10 ? '0' : '') + month + '-' +
    (day<10 ? '0' : '') + day;
    return output;
}

function DeleteAlert(i){
	bootbox.confirm("¿Esta seguro de eliminar la alerta "+lstAlerts[i].ALERTID+" ?", function(result) {
	   if(result){
		   	socket.emit('DeleteAlerts', lstAlerts[i]);
			$.notific8('Alerta eliminada');
			location.reload();
	   }
	});
	
}