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

var ionicPushServer = require('ionic-push-server');
 
var credentials = {
    IonicApplicationID : "a47b4141",
    IonicApplicationAPItoken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMTlmNzlkZC1jM2JlLTQ1MGYtOThhZi1lZjA4ZjFlYTU2OTEifQ.G3KzGlwDq50RF_iBx9jW71EAJM0xC-su6_VCcveuGh8"
};
 


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
								// console.log(maxID[0].max);
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
				  	// console.log(JourneyRoute);
					io.emit('JourneyRouteData',JourneyRoute);
					// console.log('Select Distributors executed');
		       }
			});
      });
      socket.on('RequestDistOrders',function(data){
		//   console.log('DIstributor id'+data);
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
		  var lstImp=[];
		  var Accomplished;
		  var AccomplishedAux;
		  var Total;
	  	// connection.query('INSERT INTO delivery (JOURNEYID, OBSERVATION, SIGNATURE, DELIVERYTIME) VALUES (?,?,?,?)',[data.journeyid, data.observation, data.signature, data.deliverytime],function(error, result){
	  	// 	if(error){
		// 			throw error;
		// 		}else{
		// 			console.log('Entrega registrada');
		// 	}
	  	// })
		  connection.query('UPDATE journey SET journeystate = "Completado" WHERE journeyid= ?',[data.journeyid],function(err,rows,fields){
			if(err){
					console.log("Error "+ err.message);
				}else{
					console.log("Estado de viaje actualizado");
					
			}
		});
		console.log(data.journeyid);
		connection.query("SELECT sum(orderquantity) Total FROM orders WHERE wasteonu=1325 and journeyid="+data.journeyid+";",function(error, result){
			if(error){
				throw error;
			}else{
				Total=result[0].Total;
				console.log("Cantidad total: "+Total);
				connection.query("SELECT importerid, importerquota FROM importer WHERE importerquota IN ((SELECT max(importerquota) FROM importer), (SELECT min(importerquota) FROM importer)) AND importerquota>0;",function(error, result){
				if(error){
					throw error;
					console.log("Error "+ err.message);
				}else{
					console.log("result "+result.length);
					lstImp=result;
					console.log("importadores "+lstImp.length);
					for(var i=0;i<lstImp.length;i++){
						console.log(lstImp[i]);
					}

					if(lstImp[1].importerquota-Total>=0){
						Accomplished=lstImp[1].importerquota-Total;
						console.log("if "+Accomplished);
						connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[Accomplished,lstImp[1].importerid],function(err,rows,fields){
							if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("Cuota Actualizada if");
									
							}
						});
						connection.query('UPDATE journey SET importerid = ? WHERE journeyid= ?',[lstImp[1].importerid,data.journeyid],function(err,rows,fields){
							if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("Viaje asignado");
									
							}
						});
					}else{
						AccomplishedAux=Math.abs(lstImp[1].importerquota-Total);
						Accomplished=Total-AccomplishedAux;
						console.log("else");
						console.log("AccomplishedAux "+(lstImp[0].importerquota-AccomplishedAux));
						console.log("Accomplished "+Accomplished);
						
						connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[Accomplished,lstImp[1].importerid],function(err,rows,fields){
							if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("Cuota Actualizada else bajo");
									
							}
						});
						connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[AccomplishedAux,lstImp[0].importerid],function(err,rows,fields){
							if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("Cuota Actualizada else alto");
									
							}
						});


						connection.query('UPDATE journey SET importerid = ? WHERE journeyid= ?',[lstImp[0].importerid,data.journeyid],function(err,rows,fields){
							if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("viaje asignado else");
									
							}
						});
					}

				}
			});
			}
		});    
		
		
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

      socket.on('RequestUserData',function(data){
      	var lstNotificationUsers=[];
		var lstTempUsers=[];
		var lstTempPerson=[];

		connection.query('SELECT * FROM users WHERE PERSONID=?',[data.personid],function(error, result){
			if(error){
			    throw error;
			}else{
			  	lstTempUsers=result;
			  	connection.query('SELECT * FROM person WHERE PERSONID=?',[data.personid],function(error, result){
					if(error){
					    throw error;
					}else{
					  	lstTempPerson=result;
						
									var objUser = {
										person: lstTempPerson[0],
										user: lstTempUsers[0]
									}
									console.log(objUser.person);
									console.log(objUser.user);

						io.emit('SelectUserData',objUser);
			       }
				})
	       }
		})
      });
	  
	  socket.on('UpdateDistributor',function(data){
		//   console.log(data.address+" "+data.phone+" "+data.personid+" "+data.coordx+" "+data.coordy);
		  connection.query("UPDATE distributor SET DISTRIBUTORADDRESS = ?, DISTRIBUTORPHONE = ?, DISTRIBUTORCOORDINATES=GeomFromText('POINT ("+data.coordx+" "+data.coordy+")') WHERE PERSONID = ?",[data.address,data.phone,data.personid],function(err, rows, fields) {
		 		if(err){
					 socket.emit('msg',false)
		 			console.log("Error "+ err.message);
		 		}else{
		 			socket.emit('msg',true);
		 		}
		 	})
	  });

	  socket.on('UpdateOrderQuantity',function(data){
	        connection.query('UPDATE orders SET OrderQuantity = ? WHERE OrderId= ?',[data.quantity,data.orderid],function(err,rows,fields){
	            if(err){
	                     console.log("Error "+ err.message);
	                 }else{
	                     console.log("Update execute Order Quantity");
	                     
	             }
	        })
      });

	  socket.on('RequestActiveOrders',function(){
	  	SelectActiveOrders();
	  })

	  socket.on('AppUserUpdate',function(data){
		connection.query('UPDATE person SET PERSONNAME ="'+data.name+'", PERSONLASTNAME="'+data.lastName+'", PERSONPHONE="'+data.phone+'", PERSONADDRESS="'+data.address+'", PERSONCIRUC="'+data.ruc+'" WHERE PERSONID = "'+data.personid+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Person update excecuted");
	 		}
	 	});

	 	connection.query('UPDATE users SET USERPASSWORD = "'+data.password+'", USEREMAIL = "'+data.email+'" WHERE PERSONID="'+data.personid+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("User update excecuted");
	 		}
	 	});
	});
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

	socket.on('NearNotification',function(data){
          console.log("nearNotification"+data);

          io.emit('NearNotificationToAdmin',data.distributorName);

			var notification = {
			  "emails": [data.email],
			  "profile": "admin",
			  "notification": {
			    "title": "Llegando",
			    "message": "El conductor está por llegar a su ubicación",
			    "android": {
			      "title": "Llegando",
			      "message": "El conductor está por llegar a su ubicación"
			    },
			    "ios": {
			      "title": "Llegando",
			      "message": "El conductor está por llegar a su ubicación"
			    } 
			}
			}
			 
			ionicPushServer(credentials, notification);
          	SendNotificationAlert(socket);
    });
    socket.on('DeviationNotification',function(data){
    	  console.log("Desviacion");
          console.log(data);
          io.emit('DeviationNotificationToAdmin',data);

          SendNotificationAlert(socket);
    });
      //Prueba socket en app movil*****************************
	socket.on("RequestMaxOrder",function(data){
		connection.query('SELECT max(OrderId) numMax FROM orders',function(error, result){
			if(error){
				throw error;
			}else{
				var numOrder=result;
				io.emit('ResponseMaxOrder',numOrder[0].numMax+1);
			}
		})
	})
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
	SelectTrucks1();

	socket.on("RequestDriver",function(obj){
		// console.log("RequestTrucks: "+obj.id+" indx"+obj.indx);
		connection.query("SELECT P.PERSONID, P.PERSONNAME,P.PERSONLASTNAME,P.PERSONPHONE,T.TRUCKID  FROM person P, trucks T WHERE P.PERSONID=T.PERSONID",function(error, result){
			if(error){
				throw error;
			}else{
					console.log(result)
					socket.emit("ResponseDriver",result);
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
		////////////////////////////////////
		console.log('Se executo AsignJourney '+data.orders.length);
		for (var i = 0; i < data.orders.length; i++) {
			// console.log('DATA[i] = '+data[i]);
			connection.query('UPDATE orders SET JOURNEYID = (SELECT max(JOURNEYID) FROM journey), ORDERSTATE =  "En Proceso" WHERE ORDERID = ?;',[data.orders[i]],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("ok");
					SelectOrders();
		 		}
		 	})

		//  	connection.query('UPDATE orders SET ORDERSTATE =  "En Proceso" WHERE ORDERID = ?', [data[i]],function(err, rows, fields){
	 	// 	if(err){
	 	// 		console.log("Error "+ err.message);
	 	// 	}else{
	 	// 		// console.log("Update execute");
	 	// 		SelectOrders();
	 	// 	}
	 	// })
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
			// console.log('DATA[i] = '+data[i]);
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

	socket.on('UpdateJourneyState',function(data){
		console.log(data);
		connection.query('UPDATE journey SET JOURNEYSTATE =  "Completado"  WHERE JOURNEYID = ?', [data], function(err, rows, fields){
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("Update execute Order Completado");
		 			
		 		}
		 	})
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

	socket.on("RequestInsertNewImporter", function(importer){
		connection.query('INSERT INTO person (PERSONCIRUC,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',
			[importer.personCi,
			importer.personName,
			importer.personLastName,
			importer.personPhone,
			importer.personAddress,
			"cliente"],function(err, rows, fields) {
			if(err){
				console.log("Error "+ err.message);
				socket.emit("ResponseImporter",false);
			}else{
				connection.query("SELECT max(personid) as max  FROM person",function(error, result){
					if(error){
						socket.emit("ResponseImporter",false);
					}else{
						console.log(result[0].max);
							connection.query('INSERT INTO users (USEREMAIL,PERSONID,USERPASSWORD,USERPROFILE) VALUES (?,?,?,?)',
							[importer.personEmail,
							result[0].max,
							"importador",
							"importador"],function(err, rows, fields) {
							if(err){
								console.log("Error "+ err.message);
								socket.emit("ResponseImporter",false);
							}else{
								connection.query('INSERT INTO importer (IMPORTERNAME,IMPORTERADDRESS,IMPORTERPHONE,IMPORTERRUC,IMPORTERQUOTA,IMPORTERWASTEGENERATORNUMBER,USEREMAIL) VALUES (?,?,?,?,?,?,?)',
											[importer.name,
											importer.address,
											importer.phone,
											importer.rucImporter,
											importer.quota,
											importer.licence,
											importer.personEmail],function(err, rows, fields) {
									if(err){
										console.log("Error "+ err.message);
										socket.emit("ResponseImporter",false);
									}else{
										socket.emit("ResponseImporter",true);
									}
								});
							}
						});
					}
				})
			}
		});
		console.log(importer);
	});

	socket.on("RequestImportersInfo",function(data){
		connection.query("SELECT "+
						"I.IMPORTERNAME,"+
						"I.IMPORTERADDRESS,"+
						"I.IMPORTERPHONE,"+
						"I.IMPORTERRUC,"+
						"I.IMPORTERQUOTA,"+
						"I.IMPORTERQUOTAACCOMPLISHED,"+
						"I.IMPORTERWASTEGENERATORNUMBER,"+
						"P.PERSONNAME,"+
						"P.PERSONCIRUC,"+
						"P.PERSONLASTNAME,"+
						"P.PERSONADDRESS,"+
						"P.PERSONPHONE,"+
						"I.USEREMAIL "+
						"FROM importer I, "+
						"person P, users u "+
						"WHERE I.USEREMAIL=u.USEREMAIL AND u.PERSONID=P.personid "+
						"ORDER BY I.IMPORTERNAME ASC;",function(error, result){
							if(error){
								socket.emit("ResponseImporterInfo",0);
							}else{
								var lstImporter=result;
								socket.emit("ResponseImporter",lstImporter);
							}
						});
	});

	socket.on("RequestUpdateImporter",function(data){
		connection.query("UPDATE importer SET IMPORTERPHONE ="+data.phone+",IMPORTERADDRESS='"+data.address+"' WHERE IMPORTERNAME = '"+data.name+"'",function(err, rows, fields) {
	 		if(err){
				 console.log("Error "+ err.message);
	 			socket.emit("RequestErrorUpdateImporter",false);
	 		}else{
	 			connection.query("UPDATE person SET PERSONPHONE ="+data.personPhone+",PERSONADDRESS='"+data.personAddress+"' WHERE PERSONCIRUC = '"+data.personCi+"'",function(err, rows, fields) {
					if(err){
						console.log("Error "+ err.message);
						socket.emit("RequestErrorUpdateImporter",false);
					}else{
						socket.emit("RequestErrorUpdateImporter",true);
					}
				});
	 		}
	 	});
	});
	socket.on("RequestWaste",function(data){
		connection.query('SELECT * FROM waste',function(error, result){
			if(error){
				throw error;
			}else{
				var lstWastes=result;
				io.emit('selectWaste',lstWastes);
		}
		})
	});
	socket.on("RequestCRInfo",function(data){
		connection.query("SELECT "+
						"I.RECYCLINGCENTERNAME,"+
						"I.RECYCLINGCENTERPHONE,"+
						"I.RECYCLINGCENTERADDRESS,"+
						"P.PERSONNAME,"+
						"P.PERSONCIRUC,"+
						"P.PERSONLASTNAME,"+
						"P.PERSONADDRESS,"+
						"P.PERSONPHONE "+
						"FROM recycling_centers I, "+
						"person P "+
						"WHERE I.PERSONID=P.PERSONID "+
						"ORDER BY I.RECYCLINGCENTERNAME ASC;",function(error, result){
							if(error){
								console.log("Error "+ error.message);
								socket.emit("ResponseCRInfo",0);
							}else{
								var lstCR=result;
								socket.emit("ResponseCR",lstCR);
							}
						});
	});
	socket.on('NewTruck',function(data){
		connection.query('INSERT INTO trucks VALUES (?,?,?,?,?)',[data.truckid,data.personid,data.truckmodel,data.trucksize,data.trucktrademark],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("ok");
	 			// SelectOrders();
				 SelectTrucks();
	 		}
	 	})
	});
	// socket.on("RequestInsertNewCR", function(RC){
	// 	connection.query('INSERT INTO person (PERSONCIRUC,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',
	// 		[RC.personCi,
	// 		RC.personName,
	// 		RC.personLastName,
	// 		RC.personPhone,
	// 		RC.personAddress,
	// 		"Reciclador"],function(err, rows, fields) {
	// 		if(err){
	// 			console.log("Error "+ err.message);
	// 			socket.emit("ResponseImporter",false);
	// 		}else{
	// 			connection.query("SELECT max(personid) as max  FROM person",function(error, result){
	// 				if(error){
	// 					socket.emit("ResponseCR",false);
	// 				}else{
	// 					connection.query('INSERT INTO recycling_centers (RECYCLINGCENTERNAME,RECYCLINGCENTERPHONE,IMPORTERPHONE,IMPORTERRUC,IMPORTERQUOTA,IMPORTERWASTEGENERATORNUMBER,USEREMAIL) VALUES (?,?,?,?,?,?,?)',
	// 								[RC.name,
	// 								RC.address,
	// 								RC.phone,
	// 								RC.rucImporter,
	// 								RC.quota,
	// 								RC.licence,
	// 								RC.personEmail],function(err, rows, fields) {
	// 						if(err){
	// 							console.log("Error "+ err.message);
	// 							socket.emit("ResponseImporter",false);
	// 						}else{
	// 							socket.emit("ResponseImporter",true);
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// });
	// socket.on("RequestAsignOrders",function(data){
	// 	var Total=0;
	// 	console.log(data);
	// 	connection.query('SELECT sum(OrderQuantity) as total FROM orders WHERE journeyid='+data+' ','',function(error, result){
	// 		if(error){
	// 			throw error;
	// 		}else{
	// 			Total=result[0].total;
	// 			console.log("Total llantas: "+Total);

	// 			connection.query('SELECT importerid, importerquota FROM importer WHERE importerquota=min(importerquota) OR importerquota=max(importerquota)AND importerquota!=0','',function(error, result){
	// 				if(error){
	// 					throw error;
	// 				}else{
	// 					Total=result[0].total;
	// 					console.log("Total llantas: "+Total);
	// 				}
	// 			});	
	// 		}
	// 	});	
	// });
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
								// console.log(aux.person);
								// console.log(aux.user);
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
							// console.log(lstTempUsers[i].PERSONID+" "+lstTempPerson[j].PERSONID);
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
						// console.log("alertas:"+lstAlerts.length);
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
		  	// console.log("SelectActiveOrders");
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
function SelectTrucks1(){
	connection.query('SELECT t.TRUCKID, t.TRUCKMODEL, t.TRUCKSIZE, t.TRUCKTRADEMARK, p.PERSONNAME, p.PERSONLASTNAME FROM trucks t, person p WHERE t.PERSONID=p.PERSONID',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstTrucks=result;
			io.emit('SelectTrucks1',lstTrucks);
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
	// console.log(data.person.PERSONCI+" "+data.person.PERSONNAME+" "+data.person.PERSONLASTNAME+" "+
																	//   data.person.PERSONPHONE+" "+data.person.PERSONADDRESS+" "+data.person.PERSONROLE)
	// console.log(data.user.USEREMAIL+" "+data.user.USERPASSWORD+" "+data.user.USERPROFILE+" "+data.user.PERSONID);
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
		connection.query('UPDATE person SET PERSONNAME ="'+data.name+'", PERSONLASTNAME="'+data.lastName+'", PERSONPHONE="'+data.phone+'", PERSONADDRESS="'+data.address+'", PERSONCIRUC="'+data.ruc+'", PERSONROLE="'+data.role+'" WHERE PERSONID = "'+data.ci+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Person update excecuted");
	 		}
	 	});

	 	connection.query('UPDATE users SET USERPASSWORD = "'+data.password+'" WHERE USEREMAIL = "'+data.email+'"',function(err, rows, fields) {
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


