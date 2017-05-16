var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var MariaDB = require('mysql');
var User;
var isInit=false;
var lstUsers=[];
var lstPersons=[];
var connection = MariaDB.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: 'REDdatabase17',
	database: 'red2'
});
app.use(express.static('public'));
app.get('/', function(req, res){
	res.status(200).send('hello word');
});

connection.connect();
io.on('connection', function(socket){
	// socket.on('New User', function(data){
	//  	SendNotification(); 	 	
	// });
      
      //Prueba socket en app movil********************************
      socket.on('appUsuarios', function(msg){
			connection.query('SELECT * FROM users ','',function(error, result){
				      if(error){
				         throw error;
				      }else{
				      	lstUsers=result;
						socket.emit('AppSelectUsers', lstUsers);
						// console.log('numero de usuarios: '+lstUsers.length)
				      }
					});	
      });
      socket.on('AppNewUserRequest',function(data){
	  		console.log('AppNewUserRequest');
	    		connection.query('INSERT INTO persontemp (PERSONCI,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',[data.ci,data.name,data.lastName,data.phone,data.address,data.role],function(err, rows, fields) {
		        	if(err){
		         	console.log("Error "+ err.message);
				}else{
						connection.query("select max(PERSONID) max from persontemp",function(err,maxID) {
					       	if(err){
					        	console.log("Error "+ err.message);
					        }else{
								console.log(maxID[0].max);
					        	connection.query("INSERT INTO usertemp (USEREMAIL,USERPASSWORD,USERPROFILE,PERSONID) VALUES (?,?,?,?)",[data.email,data.pass,'cliente',maxID[0].max],function(err, rows, fields) {
									if(err){
										console.log("Error "+ err.message);
									}else{
										SendNotification(socket); 
									}
								})
					        }
			            })
			         	
			        }
	         })
    	});
      socket.on('AppDataUsersRequest',function(data){
		  console.log(data);
      	var lstNotificationUsers=[];
		var lstTempUsers=[];
		var lstTempPerson=[];
		var aux;
		connection.query('SELECT * FROM users;',function(error, result){
			if(error){
			    throw error;
			}else{
			  	lstTempUsers=result;
			  	connection.query('SELECT * FROM person;',function(error, result1){
					if(error){
					    throw error;
					}else{
					  	lstTempPerson=result1;
						for (var i = 0; i < lstTempUsers.length; i++) {
							for (var j = 0; j < lstTempPerson.length; j++) {
								if(lstTempUsers[i].PERSONID==lstTempPerson[j].PERSONID){
									aux = {
										person: lstTempPerson[j],
										user: lstTempUsers[i]
									}
									lstNotificationUsers.push(aux);
									break;
								}
							}
						}
						// console.log('Usuarios devueltos: '+lstNotificationUsers.length);
						io.sockets.emit('AppSelectUsers',lstNotificationUsers);
			       }
				})
	       }
		})
      });

      socket.on('AppDataOrdersRequest', function(data){
      	connection.query('SELECT * FROM orders WHERE ;',function(error, result){
			if(error){
			    throw error;
			}else{
			  	
	       }
		})
      });
      socket.on('AppTruckLocation',function(data){
      	console.log(data);
      		io.emit('TruckLocation',data);
      });

      socket.on('RequestDistributorData',function(data){
      		connection.query("SELECT DistributorId, DistributorName, DistributorRuc,DistributorAddress,DistributorPhone,DistributorStock,DistributorEnvironmentalLicense,PersonId,ImporterId,X(GeometryFromText(AsText(DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(DistributorCoordinates))) CoordY FROM distributor where PERSONID='"+data+"'",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log(result.length);
					if(result.length==0){
						socket.emit('DistributorData',0);
					}else{
						var lstDistributor=result;
						socket.emit('DistributorData',lstDistributor);
						// console.log('Select Distributors executed');
					}
		       }
			});
      });
      socket.on('RequestJourneyRoute',function(data){
      	console.log('RequestJourneyRoute cedula: '+data);
      		connection.query("select j.JourneyId, j.JourneyRoute, j.recyclingcenterid, j.truckid from journey j, trucks t, person p where j.truckid=t.TruckId and t.PersonId=p.PersonId and  p.PersonId='"+data+"'",function(error, result){
				if(error){
				    throw error;
				}else{
				  	var JourneyRoute=result;
				  	console.log(JourneyRoute);
					io.emit('JourneyRouteData',JourneyRoute);
					// console.log('Select Distributors executed');
		       }
			});
      });
      socket.on('RequestDistOrders',function(data){
		  console.log('DIstributor id'+data);
      		// connection.query("select O.OrderId,DATE_FORMAT(O.OrderDate ,'%Y-%m-%d') AS OrderDate,O.OrderState,O.WasteONU,O.OrderQuantity,J.JourneyId,DATE_FORMAT(J.JourneyDate ,'%Y-%m-%d') AS JourneyDate,J.JourneyState,J.TruckId, P.PersonName,P.PersonLastName,P.PersonPhone from person P, trucks T, orders O, journey J Where O.JourneyId=J.JourneyId AND O.DistributorId="+data+" AND J.TruckId=T.TruckId AND T.PersonId=P.PersonID;",function(error, result){
				connection.query("select O.OrderId,DAY(O.OrderDate) Oday,MONTH(O.ORDERDATE) Omonth,YEAR(O.OrderDate) Oyear,O.OrderState,O.WasteONU,O.OrderQuantity,J.JourneyId,DAY(J.JourneyDate) Jday, MONTH(J.JourneyDate) Jmonth,YEAR(J.JourneyDate) Jyear,J.JourneyState,J.TruckId, P.PersonName,P.PersonLastName,P.PersonPhone from person P, trucks T, orders O, journey J Where O.JourneyId=J.JourneyId AND O.DistributorId="+data+" AND J.TruckId=T.TruckId AND T.PersonId=P.PersonID;",function(error, result){
				if(error){
				    throw error;
				}else{
					socket.emit('DistOrders',result);
		       }
			});	
      });
	  socket.on('RequestNumOrder',function(){
			connection.query("SELECT MAX(OrderId) MAXORDER FROM orders;",function(error, result){
				if(error){
				    throw error;
				}else{
					socket.emit('RespondeNumOrder',result);
		       }
			});	
	  });
	  

	  
	  socket.on('RegisterDelivery',function(data){
	  	connection.query('INSERT INTO delivery (JOURNEYID, OBSERVATION, SIGNATURE, DELIVERYTIME) VALUES (?,?,?,?)',[data.journeyid, data.observation, data.signature, data.deliverytime],function(error, result){
	  		if(error){
					throw error;
				}else{
					console.log('Entrega registrada');
			}
	  	})
	  });

	  socket.on('RegisterPickup',function(data){
	  	connection.query('INSERT INTO pickup (ORDERID, OBSERVATION, SIGNATUREGENERATOR, SIGNATUREMANAGER, PICKUPTIME) VALUES (?,?,?,?,?)',[data.orderid, data.observation, data.signatureGenerator, data.signatureManager, data.pickuptime],function(error, result){
	  		if(error){
					throw error;
				}else{
					console.log('Recolección registrada');
			}
	  	})
	  });

	  socket.on('AppEmergencyNotification',function(data){ 
	  	connection.query('INSERT INTO alert (ALERTTYPE, ALERTDESCRIPTION, ALERTTIME, JOURNEYID) VALUES (?,?,?,?)', [data.alerttype,data.comment,data.date,data.journeyid],function(error){
	  		if(error){
					throw error;
				}else{
					
					io.emit('EmergencyNotification',data); 
					// console.log(data); 
					SendNotificationAlert(socket);
			}
	  	})
	  	
	  });


	  socket.on('AppFullNotification',function(data){ 
	  	connection.query('INSERT INTO alert (ALERTTYPE, ALERTDESCRIPTION, ALERTTIME, JOURNEYID) VALUES (?,?,?,?)', [data.alerttype,data.comment,data.date,data.journeyid],function(error){
	  		if(error){
					throw error;
				}else{
					
					io.emit('FullNotification',data);
					SendNotificationAlert(socket);
					
			}
	  	})
	  	
	  	
	  });

	  socket.on('RequestAlerts',function(data){
		  connection.query("select A.ALERTID, A.JOURNEYID, A.ALERTTYPE, A.ALERTDESCRIPTION, J.TRUCKID, A.ALERTTIME from alert A, journey J WHERE A.JOURNEYID=J.JOURNEYID ORDER BY A.ALERTID;",function(error, result){
				if(error){
					throw error;
				}else{
					var lstAlerts=result;
					// console.log(lstAlerts);
					socket.emit('ResponseAlerts',lstAlerts);
					// io.emit('ResponseNotificationAlerts',lstAlerts);
			}
			})
	  });

	  socket.on('RequestImporters',function(data){
		  connection.query('SELECT * FROM importer',function(error, result){
				if(error){
					throw error;
				}else{
					var lstImporters=result;
					socket.emit('ResponseImporters',lstImporters);
			}
			})
	  });

	  socket.on('AppInsertOrder',function(order){
		connection.query('INSERT INTO orders (DISTRIBUTORID,WASTEONU,ORDERDATE,ORDERQUANTITY,ORDERSTATE,ORDERTYPE) VALUES (?,?,?,?,?,?)',[order.distributor,order.waste,order.date,order.quantity,"Pendiente",order.type],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("ok");
	 			SelectOrders();
	 		}
	 	})
	  });

	  socket.on('RequestDistOrdersP',function(data){
      		connection.query("SELECT ORDERID, DISTRIBUTORID, WASTEONU, DATE_FORMAT(ORDERDATE, '%Y-%m-%d') ORDERDATE,ORDERQUANTITY,ORDERSTATE,ORDERTYPE,ORDERDEADLINE,JOURNEYID FROM orders WHERE JOURNEYID IS NULL AND DISTRIBUTORID="+data+";",function(error, result){
				if(error){
				    throw error;
				}else{
					socket.emit('DistOrdersP',result);
		       }
			});	
      });

      socket.on('RequestJourneyOrders',function(data){
      	connection.query("SELECT ORDERID, DISTRIBUTORID, WASTEONU, DATE_FORMAT(ORDERDATE, '%Y-%m-%d') ORDERDATE,ORDERQUANTITY,ORDERSTATE,ORDERTYPE,ORDERDEADLINE,JOURNEYID FROM orders WHERE JOURNEYID="+data+";",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log(data);
					socket.emit('ResponseJourneyOrders',result);
		       }
			});	

   //    	
      });

      socket.on('ChangeOrderState', function(data){
      	connection.query("SELECT ORDERID, DISTRIBUTORID, WASTEONU, DATE_FORMAT(ORDERDATE, '%Y-%m-%d') ORDERDATE,ORDERQUANTITY,ORDERSTATE,ORDERTYPE,ORDERDEADLINE,JOURNEYID FROM orders WHERE JOURNEYID="+data+";",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log(data);
					
		       }
			});	
      });

      socket.on('DeleteAlerts', function(data){
      	connection.query("DELETE FROM alert where ALERTID="+data.ALERTID,function(error){
      			if(error){
				    throw error;
				}else{
					console.log("alerta eliminada: "+data.ALERTID);
					
		       }
      	});
      });
	  
	  socket.on('UpdateDistributor',function(data){
		  console.log(data.address+" "+data.phone+" "+data.personid+" "+data.coordx+" "+data.coordy);
		  connection.query("UPDATE distributor SET DISTRIBUTORADDRESS = ?, DISTRIBUTORPHONE = ?, DISTRIBUTORCOORDINATES=GeomFromText('POINT ("+data.coordx+" "+data.coordy+")') WHERE PERSONID = ?",[data.address,data.phone,data.personid],function(err, rows, fields) {
		 		if(err){
					 socket.emit('msg',false)
		 			console.log("Error "+ err.message);
		 		}else{
		 			socket.emit('msg',true);
		 		}
		 	})
	  })

	  socket.on('RequestActiveOrders',function(){
	  	SelectActiveOrders();
	  })
	//   socket.on('RequestJourney',function(data){
    //   		connection.query("select * from journey WHERE journeyId = "+data+";",function(error, result){
	// 			if(error){
	// 			    throw error;
	// 			}else{
	// 			  	var journey=result;
	// 				  console.log(journey);
	// 				socket.emit('ResponseJourney',journey);
	// 				// console.log('Select Distributors executed');
	// 	       }
	// 		});
    //   });

	socket.on('RequestSaveDistributor',function(objDistributor){
		connection.query("INSERT INTO distributor(PERSONID,DISTRIBUTORNAME,DISTRIBUTORADDRESS,DISTRIBUTORRUC,DISTRIBUTORPHONE,DISTRIBUTORENVIRONMENTALLICENSE,DISTRIBUTORCOORDINATES) VALUES (?,?,?,?,?,?,GeomFromText('POINT ("+objDistributor.CoordX+" "+objDistributor.CoordY+")'))",[objDistributor.person,objDistributor.name,objDistributor.address,objDistributor.ruc,objDistributor.phone,objDistributor.licence],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Distribuidor Ingresado");
	 		}
	 	})
	});
      //Prueba socket en app movil*****************************
    SelectRecyclingCenters();
	SelectImporters();
    SelectMaxOrder(socket)
	SelectJourneys();
	SelectActiveOrders();
	SelectUsers();
	selectWaste();
	SelectPersons();
	SendNotification(socket); 
	SendNotificationAlert(socket);
	SelectOrders();
	SelectDrivers();
	SelectTrucks();
	SelectDistributor();
	UpdateUser(socket);
	SaveNewUser(socket);

	socket.on("RequestTrucks",function(msg){
		console.log("RequestTrucks");
		connection.query('SELECT * FROM trucks',function(error, result){
			if(error){
				throw error;
			}else{
					var lstTrucks=result;
					socket.emit('SelectTrucks',lstTrucks);
			}
		})
	});
	socket.on('NewOrder',function(data){
		connection.query('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)',[,data.date,data.quantity,data.importer.DistributorId,data.waste.WasteONU,"Pendiente","General",null,null],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("ok");
	 			SelectOrders();
	 		}
	 	})
	});

	socket.on('SaveJourney',function(data){
		var lstRoute=data.route.split(',');
		connection.query('INSERT INTO journey (IMPORTERID,RECYCLINGCENTERID,TRUCKID,JOURNEYDATE,JOURNEYSTATE,JOURNEYROUTE)VALUES (?,?,?,?,?,?)',[data.importer.IMPORTERID,data.RecyclingCenter,data.truckId,data.date,data.state,data.route],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error SaveJourney"+ err.message);
	 		}else{

	 			console.log("Insert journey execute");
	 			console.log("Insert Savejourney execute");
	 			console.log("Insert Savejourney execute");
	 		}
	 	})

		if(data.importer.ImporterMontlyQuotah-data.quantity>=0){
			connection.query('UPDATE importer SET IMPORTERMONTLYQUOTAH = IMPORTERMONTLYQUOTAH - ?, IMPORTERQUOTAACCOMPLISHED = IMPORTERQUOTAACCOMPLISHED + ? WHERE IMPORTERID = ?',[data.quantity,data.quantity,data.importer.IMPORTERID],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error SaveJourneyImporter"+ err.message);
		 		}else{
		 			console.log("Insert journey execute");
		 		}
		 	})
		}else{
			// console.log('sobrante = '+ ((data.importer.ImporterMontlyQuotah-data.quantity)*-1));
			connection.query('UPDATE importer C SET C.IMPORTERMONTLYQUOTAH = 0, C.IMPORTERQUOTAACCOMPLISHED = C.IMPORTERQUOTAACCOMPLISHED + ? WHERE C.IMPORTERID = ?',[data.quantity-((data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1),data.importer.IMPORTERID],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error Updateimporter1 "+ err.message);
		 		}else{
		 			connection.query('SELECT MIN(B.IMPORTERMONTLYQUOTAH) AS NextQuota FROM importer B WHERE B.IMPORTERMONTLYQUOTAH!=0;',function(error, result) {
				 		if(err){
				 			console.log("Error "+ err.message);
				 		}else{
				 			var aux=result;
				 			// console.log('Siguiente: '+aux[0].NextQuota);
				 			connection.query('UPDATE importer A SET IMPORTERMONTLYQUOTAH = A.IMPORTERMONTLYQUOTAH - ?, IMPORTERQUOTAACCOMPLISHED = A.IMPORTERQUOTAACCOMPLISHED + ? WHERE IMPORTERMONTLYQUOTAH = ?;',[(data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1,(data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1,aux[0].NextQuota],function(err, rows, fields) {
						 		if(err){
						 			console.log("Error UpdateImporter2"+ err.message);
						 		}else{
						 			
						 		}
						 	})
				 		}
				 	})
		 			
		 		}
		 	})
		}
	});
	socket.on('UpdateQuota',function(data){
		connection.query('UPDATE importer SET ImporterQuota = ?, ImporterMontlyQuotah = ? where ImporterId = ?;',[data.quantity,data.monthQuantity,data.importer.ImporterId],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("update  execute");
	 		}
	 	})
	});

	socket.on('AsignJourney', function(data){
		console.log('Se executo AsignJourney '+data.length);
		for (var i = 0; i < data.length; i++) {
			console.log('DATA[i] = '+data[i]);
			connection.query('UPDATE orders SET JOURNEYID = (SELECT max(JOURNEYID) FROM journey) WHERE ORDERID = ?;',[data[i]],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("ok");
		 		}
		 	})

		 	connection.query('UPDATE orders SET ORDERSTATE =  "En Proceso" WHERE ORDERID = ?', [data[i]],function(err, rows, fields){
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			// console.log("Update execute");
	 			SelectOrders();
	 		}
	 	})
		}
	});

	socket.on('UpdateOrderState',function(data){
		console.log(data.state);
		if(data.state=="Completado"){
			connection.query('UPDATE orders SET OrderState =  ? WHERE OrderId = ?', [data.state,data.orderid], function(err, rows, fields){
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("Update execute Order Completado");
		 			
		 		}
		 	})
		}else if(data.state=="Pendiente"){
			connection.query('UPDATE orders SET OrderState =  ?, JOURNEYID = NULL WHERE OrderId = ?', [data.state,data.orderid], function(err, rows, fields){
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("Update execute Order Pendiente");
		 			
		 		}
		 	})
		}
		
	});

	
});

function SelectUsers(){
	lstUsers.length=0;
	connection.query('SELECT * FROM users ','',function(error, result){
      if(error){
         throw error;
      }else{
      	lstUsers=result;
		io.emit('Select Users', lstUsers);
		// console.log('numero de usuarios: '+lstUsers.length)
      }
	});	
}

function AppSelectUsers(socket){
	var lstNotificationUsers=[];
	var lstTempUsers=[];
	var lstTempPerson=[];

	connection.query('SELECT * FROM users',function(error, result){
		if(error){
		    throw error;
		}else{
		  	lstTempUsers=result;
		  	connection.query('SELECT * FROM person',function(error, result){
				if(error){
				    throw error;
				}else{
				  	lstTempPerson=result;
					for (var i = 0; i < lstTempUsers.length; i++) {
						for (var j = 0; j < lstTempPerson.length; j++) {
							if(lstTempUsers[i].PersonId==lstTempPerson[j].PersonId){
								var aux = {
									person: lstTempPerson[j],
									user: lstTempUsers[i]
								}
								console.log(aux.person);
								console.log(aux.user);
								lstNotificationUsers.push(aux);
							}
						}
					}
					io.emit('AppSelectUsers',lstNotificationUsers);
		       }
			})
       }
	})
}
function SendNotification(socket){
	var lstNotificationUsers=[];
	var lstTempUsers=[];
	var lstTempPerson=[];

	connection.query('SELECT * FROM usertemp',function(error, result){
		if(error){
		    throw error;
		}else{
		  	lstTempUsers=result;
		  	connection.query('SELECT * FROM persontemp',function(error, result){
				if(error){
				    throw error;
				}else{
				  	lstTempPerson=result;
					for (var i = 0; i < lstTempUsers.length; i++) {
						for (var j = 0; j < lstTempPerson.length; j++) {
							console.log(lstTempUsers[i].PERSONID+" "+lstTempPerson[j].PERSONID);
							if(lstTempUsers[i].PERSONID==lstTempPerson[j].PERSONID){
								var aux = {
									person: lstTempPerson[j],
									user: lstTempUsers[i]
								}
								lstNotificationUsers.push(aux);
							}
						}
					}
					socket.emit('NotificationNewUser',lstNotificationUsers);
		       }
			})
       }
	})
}

function SendNotificationAlert(socket){
	connection.query("select A.ALERTID, A.JOURNEYID, A.ALERTTYPE, A.ALERTDESCRIPTION, J.TRUCKID, A.ALERTTIME from alert A, journey J WHERE A.JOURNEYID=J.JOURNEYID;",function(error, result){
					if(error){
						throw error;
					}else{
						var lstAlerts=result;
						console.log("alertas:"+lstAlerts.length);
						io.emit('ResponseNotificationAlerts',lstAlerts);
					}
	})
}

function SelectOrders(){
	connection.query("SELECT OrderId,OrderDate,OrderQuantity,DistributorId,WasteONU,OrderState,OrderType,DATE_FORMAT(OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine  FROM orders WHERE OrderState like 'Pendiente' ORDER BY OrderDeadLine ASC",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstOrders=result;
			io.emit('SelectOrders',lstOrders);
       }
	})
}

function SelectActiveOrders(){
	connection.query("SELECT OrderId,OrderDate,OrderQuantity,DistributorId,WasteONU,OrderState,OrderType,DATE_FORMAT(OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine,JourneyId FROM orders WHERE OrderState like 'En Proceso' or OrderState like 'Completado' ORDER BY OrderDeadLine ASC",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstOrders=result;
		  	console.log("SelectActiveOrders");
			io.emit('SelectActiveOrders',lstOrders);
       }
	})
}
function SelectImporters(){
	connection.query('SELECT * FROM importer ORDER BY ImporterMontlyQuotah DESC',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstImporters=result;
			io.emit('SelectImporters',lstImporters);
       }
	})
}

function SelectDrivers(){
	connection.query('SELECT * FROM person WHERE PersonRole LIKE "conductor"  ',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstDriver=result;
			io.emit('SelectDrivers',lstDriver);
       }
	})
}

function SelectTrucks(){
	connection.query('SELECT * FROM trucks',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstTrucks=result;
			io.emit('SelectTrucks',lstTrucks);
       }
	})
}

function SelectDistributor(){
	connection.query('SELECT DistributorId,DistributorName,DistributorRuc,DistributorAddress,DistributorPhone,DistributorStock,DistributorEnvironmentalLicense,PersonId,ImporterId,X(GeometryFromText(AsText(DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(DistributorCoordinates))) CoordY FROM distributor',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstDistributor=result;
			io.emit('SelectDistributors',lstDistributor);
			// console.log('Select Distributors executed');
       }
	})
}

function SelectRecyclingCenters(){
	connection.query('SELECT RecyclingCenterId,RecyclingCenterName,RecyclingCenterAddress,RecyclingCenterPhone,RecyclingEnviromentalLicense,PersonId,X(GeometryFromText(AsText(RecyclingCenterCoordinates))) CoordX, Y(GeometryFromText(AsText(RecyclingCenterCoordinates))) CoordY FROM recycling_centers',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstRecyclingCenters=result;
			io.emit('SelectRecyclingCenters',lstRecyclingCenters);
			// console.log('Select Recycling centers executed');
       }
	})
}

function selectWaste(){
	connection.query('SELECT * FROM waste',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstWastes=result;
			io.emit('selectWaste',lstWastes);
       }
	})
}

function ChangeStateOrder(){
	socket.on('ChangeStateOrder',function(data){
		connection.query('UPDATE orders set OrderState ='+data.OrderState+' WHERE OrderId = '+data.OrderId,function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("ok");
	 		}
	 	})
	});
}

function SelectPersons(){
	connection.query('SELECT * FROM person ORDER BY PERSONNAME',function(error, result){
		if(error){
		 throw error;
		}else{
			lstPersons=result;
			io.emit('SelectPersons', lstPersons);
		}
	});
}



function SaveNewUser(socket){
	
	socket.on('SaveNewUser',function(data){
	console.log(data.person.PERSONCI+" "+data.person.PERSONNAME+" "+data.person.PERSONLASTNAME+" "+
																	  data.person.PERSONPHONE+" "+data.person.PERSONADDRESS+" "+data.person.PERSONROLE)
	console.log(data.user.USEREMAIL+" "+data.user.USERPASSWORD+" "+data.user.USERPROFILE+" "+data.user.PERSONID);
	connection.query('INSERT INTO person(PERSONCIRUC,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',[data.person.PERSONCI,data.person.PERSONNAME,data.person.PERSONLASTNAME,
																	data.person.PERSONPHONE,data.person.PERSONADDRESS,data.person.PERSONROLE],function(err, rows, fields) {
		if(err){
			console.log("Error "+ err.message);
		}else{
			console.log("Insert new person execute");
		}
	});
	connection.query('SELECT max(PERSONID) maxID FROM person',function(err,maxID) {
		if(err){
			console.log("Error "+ err.message);
		}else{
			connection.query('INSERT INTO users VALUES (?,?,?,?)',[data.user.USEREMAIL,maxID[0].maxID,data.user.USERPASSWORD,data.user.USERPROFILE],function(err, rows, fields) {
				if(err){
					console.log("Error "+ err.message);
				}else{
					console.log("Insert new user execute");
				}
			});
		}
	});
	
	 	connection.query('DELETE FROM usertemp WHERE UserEmail = ?',[data.user.USEREMAIL],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Delete usertemp execute");
	 		}
	 	});
	 	connection.query('DELETE FROM persontemp WHERE PERSONID = ?',[data.person.PERSONID],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Delete usertemp execute");
	 		}
	 	});
		SendNotification(socket);
	});
}

function UpdateUser(socket){
	socket.on('UserUpdate',function(data){
		connection.query('UPDATE person SET PersonName ="'+data.name+'", PersonLastName="'+data.lastName+'", PersonPhone="'+data.phone+'", PersonAddress="'+data.address+'", PersonRuc="'+data.ruc+'", PersonRole="'+data.role+'" WHERE PersonCi = "'+data.ci+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Person update excecuted");
	 		}
	 	});

	 	connection.query('UPDATE users SET UserPassword = "'+data.password+'" WHERE UserEmail = "'+data.email+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("User update excecuted");
	 		}
	 	});
	});
}

function SelectJourneys(){
	connection.query("SELECT JourneyId,DATE_FORMAT(JourneyDate ,'%Y-%m-%d') AS JourneyDate,JourneyState,truckId,recyclingcenterid,JourneyRoute,ImporterId FROM journey",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstJourney=result;
			io.emit('SelectJourneys',lstJourney);
       }
	})
}
function SelectMaxOrder(socket){
	connection.query('SELECT max(OrderId) numMax FROM orders',function(error, result){
		if(error){
		    throw error;
		}else{
			var numOrder=result;
			socket.emit('SelectMaxOrder',numOrder[0].numMax+1);
       }
	})
}





server.listen(8080, function(){
   console.log('listening on *:8080');
 });


