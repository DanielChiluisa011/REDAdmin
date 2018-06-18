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
			connection.query('SELECT * FROM users where USERSTATE=1 ','',function(error, result){
				      if(error){
				         throw error;
				      }else{
						  lstUsers=result;

							socket.emit('AppSelectUsers', lstUsers);
							console.log('numero de usuarios: '+lstUsers.length)
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
					       	if(err){								// console.log(maxID[0].max);
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
			


		////////////////////////////////   Unificacion Registro ///////////////////////////////////////////
		socket.on('AppNewUserRequestV2',function(data){
			console.log(data);
	  		//console.log('AppNewUserRequest');
	    		connection.query('INSERT INTO person (PERSONCIRUC,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',[data.ci,data.name,data.lastName,data.phone,data.address,data.role],function(err, rows, fields) {
		        	if(err){
		         	console.log("Error "+ err.message);
				}else{
						connection.query("select max(PERSONID) max from person",function(err,maxID) {
					       	if(err){
					        	console.log("Error maximo "+ err.message);
					        }else{
								console.log(maxID[0].max);
					        	connection.query("INSERT INTO users (USEREMAIL,USERPASSWORD,USERPROFILE,PERSONID,USERSTATE) VALUES (?,?,?,?,?)",[data.email,data.pass,'cliente',maxID[0].max,2],function(err, rows, fields) {
									if(err){
										console.log("Error inserción usuarios "+ err.message);
									}else{
										// SendNotification(socket); 
										//console.log(data.distributor.name);
										// console.log(data.distributor.Role);
										if(data.role==='Generador')
										{
											connection.query("INSERT INTO distributor(PERSONID,DISTRIBUTORNAME,DISTRIBUTORADDRESS,DISTRIBUTORRUC,DISTRIBUTORPHONE,DISTRIBUTORENVIRONMENTALLICENSE,DISTRIBUTORCOORDINATES,IMPORTERID,PROVINCEID,DISTRIBUTORCITY,DISTRIBUTORPARROQUIA) VALUES (?,?,?,?,?,?,GeomFromText('POINT ("+data.distributor.CoordX+" "+data.distributor.CoordY+")'),?,?,?,?)",[maxID[0].max,data.distributor.name,data.distributor.address,data.distributor.ruc,data.distributor.phone,data.distributor.licence,data.distributor.importer,data.distributor.provinceid,data.distributor.distributorcity,data.distributor.distributorparroquia],function(err, rows, fields) {
												if(err){
													console.log("Error distribuidor"+ err.message);
												}else{
													console.log("Distribuidor Ingresado correctamente");
												}
											})
										}
									}
								})
					        }
			            })
			         	
			        }
	         })
		});
		socket.on('AppUpdateDirectionGenerador',function(data){
			connection.query("UPDATE distributor SET DISTRIBUTORCOORDINATES=GeomFromText('POINT ("+data[0]+" "+data[1]+")'),DISTRIBUTORADDRESS='"+data[2]+"' WHERE DISTRIBUTORID="+data[3],function(err, rows, fields) {
				if(err){
					console.log("Error distribuidor"+ err.message);
				}else{
					console.log("Direccion Distribudor actualizaco");
				}
			})
		});

		// socket.on('EmailNewUserRequest',function(email){
		// 	connection.query("SELECT PERSONID FROM users WHERE USEREMAIL='"+email+"';",function(error,result){
		// 		if(error){
		// 			console.log("Error email "+ err.message);
		// 		}else{
		// 			console.log(result);
		// 			socket.emit('EmailNewUserResponse',result);
		// 		}
		// 	})
		// });	

		////////////////////////////////////////////////////////////////////////////





      socket.on('AppDataUsersRequest',function(data){
		  console.log(data);
      	var lstNotificationUsers=[];
		var lstTempUsers=[];
		var lstTempPerson=[];
		var aux;
		connection.query('SELECT * FROM users where USERSTATE=1;',function(error, result){
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
	  socket.on('RequestProvinces',function(){
			connection.query("SELECT * FROM PROVINCE",function(error,result){
				if(error){
					throw error;
				}else{
					socket.emit('ResponseProvinces',result);
					//console.log(result[0]);
				}
			});
	  });
	socket.on('RequestTypeWaste',function(){
		connection.query("select *from waste_type",function(error,result){
			if(error){
				throw error;
			}else{
				socket.emit('ResponseTypeWaste',result);
				//console.log(result[0]);
			}
		});
	  });
	  socket.on('RequestStateJourney',function(){
		connection.query("select JOURNEYSTATE from journey where JOURNEYID=99",function(error,result){
			if(error){
				throw error;
			}else{
				socket.emit('ResponseStateJourney',result[0].JOURNEYSTATE);
				//console.log(result[0]);
			}
		});
  	});
      socket.on('RequestDistributorData',function(data){
      		connection.query("SELECT d.DistributorId, d.DistributorName, d.DistributorRuc,d.DistributorAddress,d.DistributorPhone,d.DistributorStock,d.DistributorEnvironmentalLicense,d.PersonId,d.ImporterId,p.PROVINCENAME,d.DISTRIBUTORCITY,d.DISTRIBUTORPARROQUIA,X(GeometryFromText(AsText(d.DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(d.DistributorCoordinates))) CoordY FROM distributor d,PROVINCE p  where d.PERSONID='"+data+"' AND p.PROVINCEID=d.PROVINCEID",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log("RequestDistributorData"+result.length);
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
      socket.on('RequestDistributorData2',function(data){
      		connection.query("SELECT DistributorId, DistributorName, DistributorRuc,DistributorAddress,DistributorPhone,DistributorStock,DistributorEnvironmentalLicense,PersonId,ImporterCode,X(GeometryFromText(AsText(DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(DistributorCoordinates))) CoordY FROM distributor, importer where distributor.IMPORTERID=importer.IMPORTERID and PERSONID='"+data+"'",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log("RequestDistributorData2"+result.length);
					if(result.length==0){
						socket.emit('DistributorData2',0);
					}else{
						var lstDistributor=result;
						socket.emit('DistributorData2',lstDistributor);
						// console.log('Select Distributors executed');
					}
		       }
			});
      });
      socket.on('RequestJourneyRoute',function(data){
      	console.log('RequestJourneyRoute cedula: '+data);
      		connection.query("select j.JourneyId, j.JourneyRoute, j.recyclingcenterid, j.truckid from journey j, trucks t, person p where j.truckid=t.TruckId and t.PersonId=p.PersonId and  p.PersonId='"+data+"' AND j.JOURNEYSTATE='Pendiente'",function(error, result){
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
				connection.query("select O.OrderId,DAY(O.OrderDate) Oday,MONTH(O.ORDERDATE) Omonth,YEAR(O.OrderDate) Oyear,O.OrderState,O.WasteONU,O.OrderQuantity,J.JourneyId,DAY(J.JourneyDate) Jday, MONTH(J.JourneyDate) Jmonth,YEAR(J.JourneyDate) Jyear,J.JourneyState,J.TruckId, P.PersonName,P.PersonLastName,P.PersonPhone,WasteDescription from person P, trucks T, orders O, journey J, waste W Where W.WasteONU=O.WasteONU AND O.JourneyId=J.JourneyId AND O.DistributorId="+data+" AND J.TruckId=T.TruckId AND T.PersonId=P.PersonID ORDER BY OrderDate DESC;",function(error, result){
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
	  

	  socket.on('RequestUpdateDriver',function(data){
		  connection.query("Update trucks set personid= "+data.personid+" where truckid= ? ",[data.truckid],function(err,rows,fields){
		  	if(err){
				console.log("Error "+ err.message);
				socket.emit('ResponseUpdateDriver',false);
			}else{
				socket.emit('ResponseUpdateDriver',true)
				console.log("Driver updated");
									
		 	}
		  });
	  });
	  socket.on('RegisterDelivery',function(data){
		//   var lstImp=[];
		//   var Accomplished;
		//   var AccomplishedAux;
		//   var Total;
		//   console.log("RegisterDelivery: "+data.journeyid);
	  	// connection.query('INSERT INTO delivery (JOURNEYID, OBSERVATION, SIGNATURE, DELIVERYTIME) VALUES (?,?,?,?)',[data.journeyid, data.observation, data.signature, data.deliverytime],function(error, result){
	  	// 	if(error){
		// 			throw error;
		// 		}else{
		// 			console.log('Entrega registrada Firma');
		// 	}
	  	// })
		// connection.query('UPDATE journey SET journeystate = "Completado" WHERE journeyid= ?',[data.journeyid],function(err,rows,fields){
		// 	if(err){
		// 			console.log("Error "+ err.message);
		// 		}else{
		// 			console.log("Estado de viaje actualizado");
					
		// 	}
		// });
		
		// //-------------------------------------------NUEVO CODIGO-----------------------------------------------------------------------
		// //____________________________________________________INICIO SIN IMPORTADOR___________________________________________________________
		// connection.query("select * from orders where journeyid="+data.journeyid+" and distributorid in (select distributorid from distributor where importerid is NULL);",function(error, result){
		// 	if(error){
		// 		throw error;
		// 	}else{
		// 		if(result.length!=0){
		// 			connection.query("SELECT sum(orderquantity) Total FROM orders WHERE wasteonu=1325 and journeyid="+data.journeyid+";",function(error, result){
		// 				if(error){
		// 					throw error;
		// 				}else{
		// 					Total=result[0].Total;
		// 					console.log("Cantidad total: "+Total);
		// 					connection.query("SELECT importerid, importerquota FROM importer WHERE importerquota IN ((SELECT max(importerquota) FROM importer), (SELECT min(importerquota) FROM importer)) AND importerquota>0;",function(error, result){
		// 					if(error){
		// 						throw error;
		// 						console.log("Error "+ err.message);
		// 					}else{
		// 						console.log("result "+result.length);
		// 						lstImp=result;
		// 						console.log("importadores "+lstImp.length);
		// 						for(var i=0;i<lstImp.length;i++){
		// 							console.log(lstImp[i]);
		// 						}

		// 						if(lstImp[1].importerquota-Total>=0){
		// 							Accomplished=lstImp[1].importerquota-Total;
		// 							console.log("if "+Accomplished);
		// 							connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[Accomplished,lstImp[0].importerid],function(err,rows,fields){
		// 								if(err){
		// 										console.log("Error "+ err.message);
		// 									}else{
		// 										console.log("Cuota Actualizada if");
												
		// 								}
		// 							});
		// 							connection.query('UPDATE journey SET importerid = ? WHERE journeyid= ?',[lstImp[0].importerid,data.journeyid],function(err,rows,fields){
		// 								if(err){
		// 										console.log("Error "+ err.message);
		// 									}else{
		// 										console.log("Viaje asignado");
												
		// 								}
		// 							});
		// 						}else{
		// 							AccomplishedAux=Math.abs(lstImp[1].importerquota-Total);
		// 							Accomplished=Total-AccomplishedAux;
		// 							console.log("else");
		// 							console.log("AccomplishedAux "+(lstImp[0].importerquota-AccomplishedAux));
		// 							console.log("Accomplished "+Accomplished);
									
		// 							connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[Accomplished,lstImp[1].importerid],function(err,rows,fields){
		// 								if(err){
		// 										console.log("Error "+ err.message);
		// 									}else{
		// 										console.log("Cuota Actualizada else bajo");
												
		// 								}
		// 							});
		// 							connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[AccomplishedAux,lstImp[0].importerid],function(err,rows,fields){
		// 								if(err){
		// 										console.log("Error "+ err.message);
		// 									}else{
		// 										console.log("Cuota Actualizada else alto");
												
		// 								}
		// 							});


		// 							connection.query('UPDATE journey SET importerid = ? WHERE journeyid= ?',[lstImp[0].importerid,data.journeyid],function(err,rows,fields){
		// 								if(err){
		// 										console.log("Error "+ err.message);
		// 									}else{
		// 										console.log("viaje asignado else");
												
		// 								}
		// 							});
		// 						}

		// 					}
		// 				});
		// 				}
		// 			})
		// 		}
		// 	}
		// });	
		// //____________________________________________________FIN SIN IMPORTADOR___________________________________________________________
		// //____________________________________________________INICIO CON IMPORTADOR___________________________________________________________
		// connection.query("select * from orders where journeyid="+data.journeyid+" and distributorid in (select distributorid from distributor where importerid is not NULL);",function(error, result){
		// 	if(error){
		// 		throw error;
		// 	}else{
		// 		if(result.length!=0){
		// 			var Quantity=0;
		// 			var ImpId=0;
		// 			var NewJ=0;
		// 			connection.query('insert into journey (RECYCLINGCENTERID,TRUCKID,JOURNEYDATE,JOURNEYSTATE,JOURNEYROUTE) SELECT RECYCLINGCENTERID,TRUCKID,JOURNEYDATE,JOURNEYSTATE,JOURNEYROUTE FROM journey WHERE journeyid=?;',[data.journeyid],function(error, result){
		// 				if(error){
		// 						throw error;
		// 					}else{
		// 						console.log('NUEVO VIAJE CREADO');
		// 				}
		// 			});
		// 			connection.query('INSERT INTO delivery (JOURNEYID, OBSERVATION, SIGNATURE, DELIVERYTIME) VALUES (?,?,?,?)',[data.journeyid, data.observation, data.signature, data.deliverytime],function(error, result){
		// 				if(error){
		// 						throw error;
		// 					}else{
		// 						console.log('Entrega registrada Firma');
		// 				}
		// 			});
		// 			connection.query("select max(journeyid) maxid from journey;",function(error, result){
		// 				if(error){
		// 					throw error;
		// 				}else{
		// 					NewJ=result[0].maxid;
		// 				}
		// 			});
		// 			for(var i=0;i<result.length;i++){
		// 				Quantity+=result[i].orderquantity;
		// 				console.log(Quantity);
		// 				connection.query("select importerid from distributor where distributorid="+result[i].distributorid,function(error, result1){
		// 					if(error){
		// 						throw error;
		// 					}else{
		// 						ImpId=result1[i].importerid;
		// 					}
		// 				});	
		// 			}
		// 			connection.query('UPDATE journey SET importerid = ? WHERE journeyid= ?',[ImpId,NewJ],function(err,rows,fields){
		// 				if(err){
		// 					console.log("Error "+ err.message);
		// 				}else{
		// 					console.log("Importador asignado");	
		// 				}
		// 			});
		// 			connection.query('UPDATE importer SET importerquota = importerquota - ? WHERE importerid= ?',[Quantity,ImpId],function(err,rows,fields){
		// 				if(err){
		// 					console.log("Error "+ err.message);
		// 				}else{
		// 					ImpId=result[i].importerid;
		// 					console.log("Cuota Importador actualizada");	
		// 				}
		// 			});
		// 			for(var i=0;i<result.length;i++){
		// 				connection.query('UPDATE orders SET journeyid = ? WHERE orderid= ?',[NewJ,result[i].orderid],function(err,rows,fields){
		// 				if(err){
		// 					console.log("Error "+ err.message);
		// 				}else{
		// 					ImpId=result[i].importerid;
		// 					console.log("Cuota Importador actualizada");	
		// 				}
		// 			});
		// 			}
		// 		}	
		// 	}
		// });
		// 	//____________________________________________________FIN CON IMPORTADOR___________________________________________________________
		// //-----------------------------------------FIN NUEVO CODIGO---------------------------------------------------------------------

		/////////////////////////CODIGO JOSE/////////////////////////////////////
		console.log("HOLA, SOCKET 1");
		console.log("RegisterDelivery: "+data.journeyid);
		connection.query('INSERT INTO delivery (JOURNEYID, OBSERVATION, SIGNATURE, DELIVERYTIME) VALUES (?,?,?,?)',[data.journeyid, data.observation, data.signature, data.deliverytime],function(error, result){
			if(error){
				throw error;
			}else{
				console.log('Entrega registrada Firma');
			}
		});
		connection.query('UPDATE journey SET journeystate = "Completado" WHERE journeyid= ?',[data.journeyid],function(err,rows,fields){
			if(err){
				console.log("Error "+ err.message);
			}else{
				console.log("Estado de viaje actualizado");
			}
		});
	
		connection.query("select orderid,ORDEREQUIVALENCE as cantidad from orders where journeyid="+data.journeyid+" and wasteonu=1325;",function(error1, result1){
			if(error1){
				throw error1;
			}else{	
				connection.query("SELECT i.IMPORTERID, i.IMPORTERQUOTA,w.WASTETYPEFACTOR,w.WASTETYPEWEIGHT,i.IMPORTERCODE FROM importer i,waste_type w WHERE w.WASTETYPEID=i.WASTETYPEID AND i.IMPORTERID<>0 ORDER BY importerquota DESC;",function(error2, result2){
				if(error2){
					console.log("Error 2: " + error2);
				}else{
					console.log("Obteniedo lista de prioridad");
					if(result2.length!=0){
						var cont = 0;
						var numorder=0;
						var cantidadequivalente=0;
						var pesoequivalente=0;
						var i=0;
						//for(var i=0;i<result2.length;i++){
						do{
							console.log("Cuota Imp:" + result2[i].IMPORTERQUOTA);
							console.log("numorder:" + numorder);
							console.log("result1.length:" + result1.length);
							if(numorder < result1.length){
								console.log("Cuota Importador: " + result2[i].IMPORTERQUOTA);
								console.log("Cantidad Orden: " + result1[numorder].cantidad);
								cantidadequivalente=Math.floor(result2[i].WASTETYPEFACTOR*result1[numorder].cantidad);
								pesoequivalente=result2[i].WASTETYPEWEIGHT*cantidadequivalente;
								if(result2[i].IMPORTERQUOTA > 0){
									if(cantidadequivalente <= result2[i].IMPORTERQUOTA){
										console.log("CASO 1");
										console.log("------------------------------");
										actualizarCaso1(cantidadequivalente,result2[i], data.journeyid);
									}else{
										console.log("CASO 2");
										console.log("------------------------------");
										actualizarCaso2(cantidadequivalente,result2[i], data.journeyid);
									}
									connection.query('UPDATE orders SET ORDEREQUIVALENCE=FLOOR('+cantidadequivalente+'),ORDERWEIGHT='+pesoequivalente+',IMPORTERID='+result2[i].IMPORTERID+',CODE="'+result2[i].IMPORTERCODE+'" WHERE ORDERID='+result1[numorder].orderid+';',function(err, rows, fields) {
										if(err){
											console.log("Error "+ err.message);
										}else{
											console.log("cantidad equivalente ingresada");
										}
									});
									result2[i].IMPORTERCODE=parseInt(result2[i].IMPORTERCODE)+1;
									connection.query('UPDATE importer SET IMPORTERCODE="'+result2[i].IMPORTERCODE+'" WHERE IMPORTERID='+result2[i].IMPORTERID+';',function(err, rows, fields) {
										if(err){
											console.log("Error "+ err.message);
										}else{
											console.log("codigo secuencial importador ingresada");
										}
									});
									result2[i].IMPORTERQUOTA=result2[i].IMPORTERQUOTA-cantidadequivalente;
									resul2=ordenarlistaprioridad(result2);
									numorder+=1;
									i=0;
								}else{
									cont += 1;
									i++;
								}
							} 
							else{
								console.log("salio");
								i=result2.length;
								break;	
							}
						}while(i<result2.length);
						if(cont == result2.length || numorder < result1.length){
							console.log("CASO 3");
							console.log("------------------------------");
							for(var j=numorder;j<result1.length;j++){
								var impAleatorio = 0;
								impAleatorio = Math.floor(Math.random() * result2.length);
								console.log("aleatorio: " + impAleatorio);
								console.log("result con aleat = " + result2[impAleatorio]);
								console.log("factor: " + result2[impAleatorio].WASTETYPEFACTOR);
								console.log("cantidadorden = " + result1[j].cantidad);
								cantidadequivalente=Math.floor(result2[impAleatorio].WASTETYPEFACTOR*result1[j].cantidad);
								pesoequivalente=result2[impAleatorio].WASTETYPEWEIGHT*cantidadequivalente;
								console.log("cantidadequivalente: " + cantidadequivalente);
								console.log("pesoequivalente = " + pesoequivalente);
								connection.query('UPDATE orders SET ORDEREQUIVALENCE=FLOOR('+cantidadequivalente+'),ORDERWEIGHT='+pesoequivalente+',IMPORTERID='+result2[impAleatorio].IMPORTERID+',CODE="'+result2[impAleatorio].IMPORTERCODE+'" WHERE ORDERID='+result1[j].orderid+';',function(err, rows, fields) {
									if(err){
										console.log("Error "+ err.message);
									}else{
										console.log("cantidad equivalente ingresada");
									}
								});
								result2[impAleatorio].IMPORTERCODE=parseInt(result2[impAleatorio].IMPORTERCODE)+1;
									connection.query('UPDATE importer SET IMPORTERCODE="'+result2[impAleatorio].IMPORTERCODE+'" WHERE IMPORTERID='+result2[impAleatorio].IMPORTERID+';',function(err, rows, fields) {
										if(err){
											console.log("Error "+ err.message);
										}else{
											console.log("codigo secuencial importador ingresada");
										}
									});
								actualizarCaso3(cantidadequivalente,result2[impAleatorio], data.journeyid,pesoequivalente);
							}
						}
					}
				}
				});
			}
		});		
		/*
		connection.query("select sum(orderquantity) as cantidad from orders where journeyid="+data.journeyid+" and wasteonu=1325;",function(error1, result1){
			if(error1){
				throw error1;
			}else{
				if(result1.length!=0){
					connection.query("SELECT * FROM importer ORDER BY importerquota ASC;",function(error2, result2){
						if(error2){
							console.log("Error 2: " + error2);
						}else{
							console.log("Obteniedo lista de prioridad");
							if(result2.length!=0){
								var cont = 0;
								for(var i=0;i<result2.length;i++){
									console.log("Cuota Imp:" + result2[i].IMPORTERQUOTA);
									if(result1[0].cantidad <= 0){
										break;
									} 
									else{
										console.log("Cuota Importador: " + result2[i].IMPORTERQUOTA);
										console.log("Cantidad Orden: " + result1[0].cantidad);
										console.log("Cuota: " + cont);
										if(result2[i].IMPORTERQUOTA > 0){
											if(result1[0].cantidad <= result2[i].IMPORTERQUOTA){
												console.log("CASO 1");
												console.log("------------------------------");
												actualizarCaso1(result1[0],result2[i], data.journeyid);
												
											}
											else{
												console.log("CASO 2");
												console.log("------------------------------");
												actualizarCaso2(result1[0],result2[i], data.journeyid);
												result1[0].cantidad -= result2[i].IMPORTERQUOTA; 
												//cont += 1;
											}
										} 
										else{
											cont += 1;
										}
										if(cont == result2.length){
											console.log("CASO 3");
											console.log("------------------------------");
											var impAleatorio = 0;
											impAleatorio = Math.floor(Math.random() * result2.length);
											console.log("aleatorio: " + impAleatorio);
											console.log("result con aleat = " + result2[impAleatorio]);
											actualizarCaso3(result1[0],result2[impAleatorio], data.journeyid);
										}
									}
								}
							}
						}
					});
				}
			}
		});*/
		/////////////////////////CODIGO JOSE/////////////////////////////////////
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
	  socket.on('DeleteUser',function(data){
		  var flag;
		  connection.query("UPDATE users SET USERSTATE=0 WHERE PERSONID="+data,function(error){
				if(error){
					flag=1;
					throw error;
					console.log(error.message);
					
				}else
				{
					flag=0;
					console.log("Usuario eliminado");
				}
				socket.emit("ErrorDeleteUser",flag);
		  }
		  )
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
		connection.query('INSERT INTO orders (DISTRIBUTORID,WASTEONU,ORDERDATE,ORDERQUANTITY,ORDERSTATE,ORDERTYPE,ORDERTIME) VALUES (?,?,?,?,?,?,?)',[order.distributor,order.waste,order.date,order.quantity,"Pendiente",order.type,order.time],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("ok");
	 			SelectOrders();
	 		}
	 	})
	  });
	  
	  socket.on('RequestDistOrdersP',function(data){
      		connection.query("SELECT ORDERID, DISTRIBUTORID, O.WasteONU, DATE_FORMAT(ORDERDATE, '%Y-%m-%d') ORDERDATE,DAY(O.OrderDate) Oday,MONTH(O.ORDERDATE) Omonth,YEAR(O.OrderDate) Oyear,ORDERQUANTITY,ORDERSTATE,ORDERTYPE,ORDERDEADLINE,JOURNEYID,WASTEDESCRIPTION FROM orders O,waste W WHERE JOURNEYID IS NULL AND W.WasteONU=O.WasteONU AND DISTRIBUTORID="+data+" ORDER BY OrderDate DESC;",function(error, result){
				if(error){
				    throw error;
				}else{
					socket.emit('DistOrdersP',result);
		       }
			});	
      });

      socket.on('RequestJourneyOrders',function(data){
      	connection.query("SELECT o.ORDERID, o.DISTRIBUTORID, d.DISTRIBUTORNAME,  wt.WASTEDESCRIPTION, DATE_FORMAT(o.ORDERDATE, '%Y-%m-%d') ORDERDATE,o.ORDERQUANTITY,o.ORDERSTATE,o.ORDERTYPE,o.ORDERDEADLINE,o.JOURNEYID FROM orders o,distributor d,waste wt WHERE o.DISTRIBUTORID=d.DISTRIBUTORID AND wt.WASTEONU=o.WASTEONU AND JOURNEYID="+data+";",function(error, result){
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

	  socket.on('UpdateDistributor2',function(data){
		//   console.log(data.address+" "+data.phone+" "+data.personid+" "+data.coordx+" "+data.coordy);
		console.log("updateDistributor2");
		console.log(data);
		  connection.query("UPDATE distributor SET DISTRIBUTORRUC=?,DISTRIBUTORNAME=?,DISTRIBUTORADDRESS = ?, DISTRIBUTORPHONE = ?,PROVINCEID="+data.province+",DISTRIBUTORCITY='"+data.canton+"',DISTRIBUTORPARROQUIA='"+data.parroquia+"' WHERE DISTRIBUTORID = ?",[data.ruc,data.name,data.address,data.phone,data.distributor],function(err, rows, fields) {
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

	 	connection.query('UPDATE users SET USERPASSWORD = "'+data.password+'" WHERE PERSONID="'+data.personid+'"',function(err, rows, fields) {
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
		connection.query("INSERT INTO distributor(PERSONID,DISTRIBUTORNAME,DISTRIBUTORADDRESS,DISTRIBUTORRUC,DISTRIBUTORPHONE,DISTRIBUTORENVIRONMENTALLICENSE,DISTRIBUTORCOORDINATES,IMPORTERID) VALUES (?,?,?,?,?,?,GeomFromText('POINT ("+objDistributor.CoordX+" "+objDistributor.CoordY+")'),?)",[objDistributor.person,objDistributor.name,objDistributor.address,objDistributor.ruc,objDistributor.phone,objDistributor.licence,objDistributor.importer],function(err, rows, fields) {
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
	
	socket.on('ListaPuntos',function(data){
		connection.query('INSERT INTO coordinatesjourney (JOURNEYID,COORDINATES) VALUES ('+data.jny+",GeomFromText('POINT ("+data.lat+" "+data.lng+")'))",function(err, rows, fields) {
			if(err){
				console.log("Error "+ err.message);
			}else{
				console.log("ok");
			}
		});
	});

	socket.on('SelectCoordinates',function(data){
		console.log('COORDINATES'+data);
		connection.query('select MIN(ID),X(GeometryFromText(AsText(COORDINATES))) CoordX, Y(GeometryFromText(AsText(COORDINATES))) CoordY FROM coordinatesjourney WHERE JOURNEYID='+data,function(error, result){
			if(error){
				throw error;
			}else{
				console.log('Select Coordinates execute'+result[0].CoordX+result[0].CoordY);
				socket.emit('SelectCoordinates',result);
		   }
		})
	});

	socket.on('SelectALLCoordinates',function(data){
		console.log('COORDINATES'+data);
		connection.query('select X(GeometryFromText(AsText(COORDINATES))) CoordX, Y(GeometryFromText(AsText(COORDINATES))) CoordY FROM coordinatesjourney WHERE JOURNEYID='+data+' ORDER BY ID',function(error, result){
			if(error){
				throw error;
			}else{
				console.log('Select ALL Coordinates execute'+result[0].CoordX+result[0].CoordY);
				socket.emit('SelectALLCoordinates',result);
		   }
		})
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
	SelectDistributor();
	SelectOrders();
	SelectUsers();
	selectWaste();
	selectWasteType();
	SelectManifest();
	UpdateManifest(socket);
	UpdateDetailOrder(socket);
	SelectPersons();
	SendNotification(socket); 
	SendNotificationAlert(socket);
	SelectDrivers();
	SelectTrucks();
	UpdateUser(socket);
	SaveNewUser(socket);
	SelectTrucks1();
	SelectOrdersList();
	SelectCountOrders();
	SelectConfimJourney(socket);
	SelectJourneyDriver(socket);

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
		
		connection.query('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[,data.importer.DistributorId,data.waste.WASTEONU,data.date,data.quantity,"Pendiente","General",null,null,data.time,"0",null,null,null,""],function(err, rows, fields) {
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
		connection.query('INSERT INTO journey (RECYCLINGCENTERID,TRUCKID,JOURNEYDATE,JOURNEYSTATE,JOURNEYROUTE)VALUES (?,?,?,?,?)',[data.RecyclingCenter,data.truckId,data.date,data.state,data.route],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error SaveJourney"+ err.message);
	 		}else{

	 			console.log("Insert journey execute");
	 			console.log("Insert Savejourney execute");
	 			console.log("Insert Savejourney execute");
	 		}
	 	})
		/////////////////////////////////////////////////////// 
		// if(data.importer.ImporterMontlyQuotah-data.quantity>=0){
		// 	connection.query('UPDATE importer SET IMPORTERMONTLYQUOTAH = IMPORTERMONTLYQUOTAH - ?, IMPORTERQUOTAACCOMPLISHED = IMPORTERQUOTAACCOMPLISHED + ? WHERE IMPORTERID = ?',[data.quantity,data.quantity,data.importer.IMPORTERID],function(err, rows, fields) {
		//  		if(err){
		//  			console.log("Error SaveJourneyImporter"+ err.message);
		//  		}else{
		//  			console.log("Insert journey execute");
		//  		}
		//  	})
		// }else{
		// 	// console.log('sobrante = '+ ((data.importer.ImporterMontlyQuotah-data.quantity)*-1));
		// 	connection.query('UPDATE importer C SET C.IMPORTERMONTLYQUOTAH = 0, C.IMPORTERQUOTAACCOMPLISHED = C.IMPORTERQUOTAACCOMPLISHED + ? WHERE C.IMPORTERID = ?',[data.quantity-((data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1),data.importer.IMPORTERID],function(err, rows, fields) {
		//  		if(err){
		//  			console.log("Error Updateimporter1 "+ err.message);
		//  		}else{
		//  			connection.query('SELECT MIN(B.IMPORTERMONTLYQUOTAH) AS NextQuota FROM importer B WHERE B.IMPORTERMONTLYQUOTAH!=0;',function(error, result) {
		// 		 		if(err){
		// 		 			console.log("Error "+ err.message);
		// 		 		}else{
		// 		 			var aux=result;
		// 		 			// console.log('Siguiente: '+aux[0].NextQuota);
		// 		 			connection.query('UPDATE importer A SET IMPORTERMONTLYQUOTAH = A.IMPORTERMONTLYQUOTAH - ?, IMPORTERQUOTAACCOMPLISHED = A.IMPORTERQUOTAACCOMPLISHED + ? WHERE IMPORTERMONTLYQUOTAH = ?;',[(data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1,(data.importer.IMPORTERMONTLYQUOTAH-data.quantity)*-1,aux[0].NextQuota],function(err, rows, fields) {
		// 				 		if(err){
		// 				 			console.log("Error UpdateImporter2"+ err.message);
		// 				 		}else{
						 			
		// 				 		}
		// 				 	})
		// 		 		}
		// 		 	})
		 			
		//  		}
		//  	})
		// }
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
		connection.query('UPDATE importer SET IMPORTERQUOTA = ?, IMPORTERMONTLYQUOTAH = ? where IMPORTERID = ?;',[data.quantity,data.monthQuantity,data.importer.IMPORTERID],function(err, rows, fields) {
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
		if(importer.tipodesecho==0){
			console.log("tipo desecho "+ importer.tipodesecho);
			importer.tipodesecho=3;
		}
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
							connection.query('INSERT INTO users (USEREMAIL,PERSONID,USERPASSWORD,USERPROFILE,USERSTATE) VALUES (?,?,?,?,1)',
							[importer.personEmail,
							result[0].max,
							"importador",
							"importador"],function(err, rows, fields) {
							if(err){
								console.log("Error "+ err.message);
								socket.emit("ResponseImporter",false);
							}else{
								console.log(importer.code);
								connection.query('INSERT INTO importer (IMPORTERNAME,IMPORTERADDRESS,IMPORTERPHONE,IMPORTERRUC,IMPORTERQUOTA,IMPORTERWASTEGENERATORNUMBER,IMPORTERCODE,USEREMAIL,PROVINCEID,IMPORTERCANTON,IMPORTERPARROQUIA,WASTETYPEID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
											[importer.name,
											importer.address,
											importer.phone,
											importer.rucImporter,
											importer.quota,
											importer.licence,
											"1",
											importer.personEmail,
											importer.provincia,
											importer.canton,
											importer.parroquia,
											importer.tipodesecho,
											],function(err, rows, fields) {
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
						"I.IMPORTERCODE,"+
						"I.IMPORTERPHONE,"+
						"I.IMPORTERRUC,"+
						"I.IMPORTERQUOTA,"+
						"I.IMPORTERQUOTAACCOMPLISHED,"+
						"I.IMPORTERWASTEGENERATORNUMBER,I.PROVINCEID,I.IMPORTERPARROQUIA,I.IMPORTERCANTON,"+
						"I.WASTETYPEID,"+
						"P.PERSONNAME,"+
						"P.PERSONCIRUC,"+
						"P.PERSONLASTNAME,"+
						"P.PERSONADDRESS,"+
						"P.PERSONPHONE,"+
						"I.USEREMAIL "+
						"FROM importer I, "+
						"person P, users u "+
						"WHERE I.USEREMAIL=u.USEREMAIL AND u.PERSONID=P.personid AND I.IMPORTERID<>0 "+
						"ORDER BY I.IMPORTERNAME ASC;",function(error, result){
							if(error){
								console.log(error);
								socket.emit("ResponseImporterInfo",0);
							}else{
								var lstImporter=result;
								socket.emit("ResponseImporter",lstImporter);
							}
						});
	});
	/*socket.on('SelectCountOrders',function(data){
	connection.query("select count(*) as cont from orders;",function(error, result){
		if(error){
			throw error;
		}else{
			socket.emit('SelectCountOrders',result);
		}
		});	
	});*/

	socket.on("RequestUpdateImporter",function(data){
		connection.query("UPDATE importer SET IMPORTERQUOTA='"+data.quota+"',IMPORTERPHONE ='"+data.phone+"',IMPORTERADDRESS='"+data.address+"' WHERE IMPORTERNAME = '"+data.name+"'",function(err, rows, fields) {
	 		if(err){
				 console.log("Error "+ err.message);
	 			socket.emit("RequestErrorUpdateImporter",false);
	 		}else{
	 			connection.query("UPDATE person SET PERSONPHONE ='"+data.personPhone+"',PERSONADDRESS='"+data.personAddress+"' WHERE PERSONCIRUC = '"+data.personCi+"'",function(err, rows, fields) {
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
				io.emit('ReturnWaste',lstWastes);
		}
		})
	});
	socket.on("RequestCRInfo",function(data){
		connection.query("SELECT "+
						"I.RECYCLINGCENTERNAME,"+
						"I.RECYCLINGCENTERPHONE,"+
						"I.RECYCLINGCENTERADDRESS,"+
						"I.RECYCLINGENVIROMENTALLICENSE,"+
						"I.RECYCLINGCENTERPROVINCIA,"+
						"I.RECYCLINGCENTERCANTON,"+
						"I.RECYCLINGCENTERPARROQUIA,"+
						"P.PERSONNAME,"+
						"P.PERSONCIRUC,"+
						"P.PERSONLASTNAME,"+
						"P.PERSONADDRESS,"+
						"P.PERSONPHONE, "+
						"U.USEREMAIL "+
						"FROM recycling_centers I, "+
						"person P, users U "+
						"WHERE I.PERSONID=P.PERSONID AND U.PERSONID=P.PERSONID "+
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
	socket.on("RequestInsertNewCR", function(RC){
		connection.query('INSERT INTO person (PERSONCIRUC,PERSONNAME,PERSONLASTNAME,PERSONPHONE,PERSONADDRESS,PERSONROLE) VALUES (?,?,?,?,?,?)',
			[RC.personCi,
			RC.personName,
			RC.personLastName,
			RC.personPhone,
			RC.personAddress,
			// RC.personEmail,
			"Reciclador"],function(err, rows, fields) {
			if(err){
				console.log("Error "+ err.message);
				socket.emit("ResponseNewCR",false);
			}else{
				connection.query("SELECT max(personid) as max  FROM person",function(error, result){
					if(error){
						socket.emit("ResponseNewCR",false);
					}else{
						connection.query('INSERT INTO users (USEREMAIL,PERSONID,USERPASSWORD,USERPROFILE,USERSTATE) VALUES (?,?,?,?,?)',
							[RC.personemail,
							result[0].max,
							RC.personemail,
							"Reciclador",
							"0"],function(err, rows, fields) {
							if(err){
								console.log("Error "+ err.message);
								socket.emit("ResponseNewCR",false);
							}else{
								connection.query("INSERT INTO recycling_centers (PERSONID,RECYCLINGCENTERNAME,RECYCLINGCENTERPHONE,RECYCLINGCENTERADDRESS,RECYCLINGENVIROMENTALLICENSE,RECYCLINGCENTERPROVINCIA,RECYCLINGCENTERCANTON,RECYCLINGCENTERPARROQUIA,RECYCLINGCENTERCOORDINATES) VALUES (?,?,?,?,?,?,?,?,GeomFromText('POINT("+RC.CoordX+" "+RC.CoordY+")'))",
									[result[0].max,
									RC.name,
									RC.phone,
									RC.address,
									RC.licence,
									RC.province,
									RC.canton,
									RC.parroquia
									],function(err, rows, fields) {
										if(err){
											console.log("Error "+ err.message);
											socket.emit("ResponseNewCR",false);
										}else{
											socket.emit("ResponseNewCR",true);
										}
								});
							}
						});
					}
				});
			}
		});
	});

	
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
	connection.query('SELECT * FROM users where USERSTATE=1','',function(error, result){
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

	// connection.query('SELECT * FROM usertemp',function(error, result){
	// 	if(error){
	// 	    throw error;
	// 	}else{
	// 	  	lstTempUsers=result;
	// 	  	connection.query('SELECT * FROM persontemp',function(error, result){
	// 			if(error){
	// 			    throw error;
	// 			}else{
	// 			  	lstTempPerson=result;
	// 				for (var i = 0; i < lstTempUsers.length; i++) {
	// 					for (var j = 0; j < lstTempPerson.length; j++) {
	// 						// console.log(lstTempUsers[i].PERSONID+" "+lstTempPerson[j].PERSONID);
	// 						if(lstTempUsers[i].PERSONID==lstTempPerson[j].PERSONID){
	// 							var aux = {
	// 								person: lstTempPerson[j],
	// 								user: lstTempUsers[i]
	// 							}
	// 							lstNotificationUsers.push(aux);
	// 						}
	// 					}
	// 				}
	// 				socket.emit('NotificationNewUser',lstNotificationUsers);
	// 	       }
	// 		})
    //    }
	// })



	connection.query('SELECT * FROM users where USERSTATE=2',function(error, result){
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
					socket.emit('NotificationNewUserV2',lstNotificationUsers);
		       }
			})
       }
	})




	connection.query("SELECT * FROM orders where ORDERSTATE='Pendiente'",function(error, result){
		if(error){
		    throw error;
		}else{
		  	lstOrders=result;
					socket.emit('NotificationPendingOrders',lstOrders);
		       
			
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
	connection.query("SELECT OrderId,DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate,OrderQuantity,DistributorId,WasteONU,OrderState,OrderType,DATE_FORMAT(OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine  FROM orders WHERE OrderState like 'Pendiente' ORDER BY OrderDeadLine ASC",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstOrders=result;
			io.emit('SelectOrders',lstOrders);
       }
	})
}
function SelectOrdersList(){
	//connection.query("select O.OrderDate as Fecha, O.OrderId,DAY(O.OrderDate) Oday,MONTH(O.ORDERDATE) Omonth,YEAR(O.OrderDate) Oyear,O.OrderState,O.WasteONU,O.OrderQuantity, WasteDescription, DistributorName, HOUR(ORDERTIME) Ohour, MINUTE(ORDERTIME) Ominute, DATE_SUB(CURDATE(), INTERVAL 1 DAY)-ORDERDATE as RestaFechas from distributor D, orders O, waste W Where W.WasteONU=O.WasteONU AND D.DistributorId=O.DistributorId ORDER BY O.OrderId;",function(error, result){
	connection.query("select DATE_FORMAT(O.OrderDate,'%Y-%m-%d') as Fecha, O.OrderId,DAY(O.OrderDate) Oday,MONTH(O.ORDERDATE) Omonth,YEAR(O.OrderDate) Oyear,O.OrderState,O.WasteONU,O.OrderQuantity, WasteDescription, DistributorName, HOUR(ORDERTIME) Ohour, MINUTE(ORDERTIME) Ominute, DATEDIFF(CURDATE(),ORDERDATE) as RestaFechas from distributor D, orders O, waste W Where W.WasteONU=O.WasteONU AND D.DistributorId=O.DistributorId ORDER BY O.OrderId;",function(error, result){

		if(error){
			throw error;
		}else{
			io.emit('SelectOrdersList',result);
			//console.log("si");
		}
		});	
}

function SelectManifest(){
	connection.query("SELECT o.ORDERID, o.JOURNEYID, o.IMPORTERID,i.IMPORTERNAME,j.JOURNEYDATE,j.TRUCKID,p.PERSONNAME,p.PERSONLASTNAME,o.ORDEROBSERVATION,pic.OBSERVATION FROM orders o, importer i, journey j, person p,trucks t,pickup pic WHERE o.IMPORTERID=i.IMPORTERID AND j.JOURNEYID=o.JOURNEYID AND j.TRUCKID=t.TRUCKID AND t.PERSONID=p.PERSONID AND o.ORDERID=pic.ORDERID ORDER BY JOURNEYID DESC;",function(error, result){
		if(error){
			throw error;
		}else{
			connection.query("select d.ORDERID,w.WASTETYPENAME,d.QUANTITY from details_orders d,waste_type w WHERE w.WASTETYPEID=d.WASTETYPEID ORDER BY d.ORDERID;",function(error, result2){
				if(error){
					throw error;
				}else{
					for(var i=0;i<result.length;i++){
						var aux="";
						for(var j=0;j<result2.length;j++){
							if(result[i].ORDERID==result2[j].ORDERID){
								aux=aux+"#"+result2[j].WASTETYPENAME+" = "+result2[j].QUANTITY+"\n";
							}
						}
						result[i].detalle = aux;
					}
					io.emit('SelectManifest',result);
				}
			});
		}
	});	
}

function UpdateManifest(socket){
	socket.on('UpdateManifest',function(data){
		connection.query('UPDATE orders SET ORDEROBSERVATION="'+data.ORDEROBSERVATION+'" WHERE ORDERID='+data.ORDERID+';',function(err, rows, fields) {
			if(err){
				console.log("Error "+ err.message);
			}else{
				console.log("observacion orden actualizado correctamente");
			}
		});
	});
}
function UpdateDetailOrder(socket){
	socket.on('UpdateDetailOrder',function(data){
		lstdetorder=data[1];
		var cantidadreal=0;
		var cantidadequivalente=0;
		for(var i=0;i<lstdetorder.length;i++){
			cantidadreal+=parseInt(lstdetorder[i][1]);
			connection.query('SELECT (WASTETYPEFACTOR/(SELECT WASTETYPEFACTOR FROM waste_type where WASTETYPEID='+lstdetorder[i][0]+')*'+lstdetorder[i][1]+') as cantidad FROM waste_type where WASTETYPEID=4;',function(error, result){
			//connection.query('SELECT * FROM waste_type where WASTETYPEID='+lstdetorder[i][0]+';',function(error, result){
				if(error){
					throw error;
					console.log("query1: "+error);
				}else{
					//console.log("query1: "+result[0].WASTETYPEFACTOR);
					//went=result[0].WASTETYPEFACTOR;
					connection.query('UPDATE orders SET ORDEREQUIVALENCE=ORDEREQUIVALENCE+'+result[0].cantidad+' WHERE ORDERID='+data[0]+';',function(err, rows, fields) {
						if(err){
							console.log("Error "+ err.message);
						}else{
							console.log("cantidad equivalente ingresada");
						}
					});
			   }
			});
			//cantidadequivalente=cantidadequivalente+equivalencia(lstdetorder[i][0],lstdetorder[i][1],3);
			//console.log("EQUIVALENCIA"+ cantidadequivalente);
			//console.log("waste "+ lstdetorder[i][0]);
			//console.log("can "+ lstdetorder[i][1]);
			connection.query('INSERT INTO details_orders VALUES ('+data[0]+','+lstdetorder[i][0]+','+lstdetorder[i][1]+')',function(err, rows, fields) {
				if(err){
					console.log("query2 "+ err.message);
				}else{
					console.log("ingreso detalle de orden");
				}
			});		
		}
		console.log("ingreso detalle de orden");
		connection.query('UPDATE orders SET ORDERQUANTITY='+cantidadreal+' WHERE ORDERID='+data[0]+';',function(err, rows, fields) {
			if(err){
				console.log("Error "+ err.message);
			}else{
				console.log("actualizacion de cantidad ingresada");
			}
		});
			
	});
}

function SelectJourneyDriver(socket){
socket.on('SelectJourneyDriver',function(data){
		connection.query("SELECT dis.DISTRIBUTORNAME, ord.ORDERQUANTITY,pic.OBSERVATION FROM distributor dis, orders ord,pickup pic WHERE dis.DISTRIBUTORID=ord.DISTRIBUTORID AND ord.ORDERID=pic.ORDERID AND ord.JOURNEYID=(select Max(j.JourneyId) from journey j, trucks t, person p where j.truckid=t.TruckId and t.PersonId=p.PersonId and  p.PersonId='"+data+"')",function(error, result){
		  if(error){
			  throw error;
		  }else{
			var JourneyRoute=result;
			//console.log(result[0]+" "+result.length);
				// console.log(JourneyRoute);
			io.emit('SelectListRoutes',JourneyRoute);
			  // console.log('Select Distributors executed');
		 }
	  });
});
}
function SelectCountOrders(){
	connection.query("select count(*) as cont from orders;",function(error, result){
		if(error){
			throw error;
		}else{
			io.emit('SelectCountOrders',result);
		}
		});	
}

function SelectConfimJourney(socket){
    socket.on('SelectConfimJourney',function(data){
        connection.query('SELECT JOURNEYSTATE FROM journey WHERE JOURNEYID="'+data.journeyid+'";',function(error, result) {
            if(error){
				throw error;
            }else{
				console.log("estado journey"+result);
				io.emit('SelectConfimJourney2',result);
            }
        });
    });
}

function SelectActiveOrders(){
	connection.query("SELECT o.OrderId,o.OrderDate,o.OrderQuantity,o.DistributorId,w.WASTEDESCRIPTION,o.OrderState,o.OrderType,DATE_FORMAT(o.OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine,o.JourneyId FROM orders o,waste w WHERE o.WASTEONU=w.WASTEONU AND o.OrderState like 'En Proceso' or o.OrderState like 'Completado' ORDER BY o.OrderDeadLine ASC;",function(error, result){
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
	connection.query('SELECT * FROM importer WHERE IMPORTERID<>0 ORDER BY ImporterMontlyQuotah DESC',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstImporters=result;
			io.emit('SelectImporters',lstImporters);
       }
	})
}

function SelectDrivers(){
	connection.query('SELECT * FROM person WHERE PersonRole LIKE "Gestor"  ',function(error, result){
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

function selectWasteType(){
	connection.query('SELECT * FROM waste_type',function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstWastes=result;
			io.emit('selectWasteType',lstWastes);
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
			connection.query('INSERT INTO users VALUES (?,?,?,?,?)',[data.user.USEREMAIL,maxID[0].maxID,data.user.USERPASSWORD,data.user.USERPROFILE,1],function(err, rows, fields) {
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



	socket.on('SaveNewUserV2',function(data){
	// console.log(data.person.PERSONCI+" "+data.person.PERSONNAME+" "+data.person.PERSONLASTNAME+" "+
																	//   data.person.PERSONPHONE+" "+data.person.PERSONADDRESS+" "+data.person.PERSONROLE)
	// console.log(data.user.USEREMAIL+" "+data.user.USERPASSWORD+" "+data.user.USERPROFILE+" "+data.user.PERSONID);
	connection.query('UPDATE users set USERSTATE=1 where PERSONID='+data.person.PERSONID+';',function(err, rows, fields) {
		if(err){
			console.log("Error "+ err.message);
		}else{
			console.log("Usuario actualizado correctamente");
		}
	});
	});
	
}

function UpdateUser(socket){
	socket.on('UserUpdate',function(data){
		connection.query('UPDATE person SET PERSONNAME ="'+data.name+'", PERSONLASTNAME="'+data.lastName+'", PERSONPHONE="'+data.phone+'", PERSONADDRESS="'+data.address+'", PERSONCIRUC="'+data.ci+'" WHERE PERSONID = "'+data.personid+'"',function(err, rows, fields) {
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

function ordenLstImportadores(a, b){
	if(a.ndistributor === b.ndistributor){
		return 0;
	}
	else{
		return (a.ndistributor < b.ndistributor) ? -1 : 1;
	}
}

/*function EscogerCaso(result1,data){
	connection.query("SELECT i.IMPORTERID, i.IMPORTERQUOTA,w.WASTETYPEFACTOR,w.WASTETYPEWEIGHT FROM importer i,waste_type w WHERE w.WASTETYPEID=i.WASTETYPEID ORDER BY importerquota DESC;",function(error2, result2){
		if(error2){
			console.log("Error 2: " + error2);
		}else{
			console.log("Obteniedo lista de prioridad");
			if(result2.length!=0){

					var cont = 0;
					var cantidadequivalente=0;
					var pesoequivalente=0;
					for(var i=0;i<result2.length;i++){
						console.log("IMPORTER:" + result2[i].IMPORTERID);
						console.log("Cuota Imp:" + result2[i].IMPORTERQUOTA);
						console.log("result1.length:" + result1.length);
						console.log("Cantidad Orden: " + result1.cantidad);
						cantidadequivalente=Math.floor(result2[i].WASTETYPEFACTOR*result1.cantidad);
						pesoequivalente=result2[i].WASTETYPEWEIGHT*cantidadequivalente;
						if(result2[i].IMPORTERQUOTA > 0){
							if(cantidadequivalente <= result2[i].IMPORTERQUOTA){
								console.log("CASO 1");
								console.log("------------------------------");
								actualizarCaso1(cantidadequivalente,result2[i], data.journeyid);
							}else{
								console.log("CASO 2");
								console.log("------------------------------");
								actualizarCaso2(cantidadequivalente,result2[i], data.journeyid);
							}
							connection.query('UPDATE orders SET ORDEREQUIVALENCE=FLOOR('+cantidadequivalente+'),ORDERWEIGHT='+pesoequivalente+',IMPORTERID='+result2[i].IMPORTERID+' WHERE ORDERID='+result1.orderid+';',function(err, rows, fields) {
								if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("cantidad equivalente ingresada");
								}
							});
							//result2[i].IMPORTERQUOTA=result2[i].IMPORTERQUOTA-cantidadequivalente;
							break;
							console.log("ACTIVO \n\n\n");
						}else{
							cont += 1;
						}
						
					}
					if(cont == result2.length){
						console.log("CASO 3");
						console.log("------------------------------");
							var impAleatorio = 0;
							impAleatorio = Math.floor(Math.random() * result2.length);
							console.log("aleatorio: " + impAleatorio);
							console.log("result con aleat = " + result2[impAleatorio]);
							actualizarCaso3(cantidadequivalente,result2[impAleatorio], data.journeyid);
							connection.query('UPDATE orders SET ORDEREQUIVALENCE=FLOOR('+cantidadequivalente+'),ORDERWEIGHT='+pesoequivalente+',IMPORTERID='+result2[impAleatorio].IMPORTERID+' WHERE ORDERID='+result1.orderid+';',function(err, rows, fields) {
								if(err){
									console.log("Error "+ err.message);
								}else{
									console.log("cantidad equivalente ingresada");
								}
							});
						
					}
				
			}
		}
	});
}*/
function ordenarlistaprioridad(list){
	console.log("Ordeno Lista");
	console.log("Primero Actual"+list[0].IMPORTERID);
	var temp;
	for(var i=0;i<list.length;i++){
    	for(var j=0;j<(list.length-1);j++){
        	if(parseInt(list[j].IMPORTERQUOTA)<parseInt(list[j+1].IMPORTERQUOTA)){
            temp=list[j];
            list[j]=list[j+1];
            list[j+1]=temp;
        	}
    	}
	}
	console.log("Primero Despues"+list[0].IMPORTERID);
	return list;
}
function actualizarCaso1(objeto1, objeto2, viaje){
    console.log("Order Quantity: " + objeto1);
    console.log("Data Importador: " + objeto2.IMPORTERID + " - " + objeto2.IMPORTERQUOTA);
    var valor = objeto2.IMPORTERQUOTA - objeto1;
    connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[valor, objeto2.IMPORTERID],function(error){
        if(error){
			throw error;
			console.log("Caso1"+error);
        }else{
            console.log("Cantidad Importador Actualizada");
        }
    });
}

function actualizarCaso2(objeto1, objeto2, viaje){
    connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[0, objeto2.IMPORTERID],function(error){
        if(error){
			throw error;
			console.log("Caso2"+error);
        }else{
            console.log("Cantidad en Importador Actualizada");
        }
    });
}

function actualizarCaso3(objeto1, objeto2, viaje,pesoeq){
    console.log("tamanio: " + objeto2.IMPORTERID, viaje, objeto1);
	connection.query('INSERT INTO journeyximporter (IMPORTERID,JOURNEYID,QUANTITY,PESO) VALUES (?,?,?,?)',[objeto2.IMPORTERID, viaje, objeto1,pesoeq],function(error2){
		if(error2){
			connection.query("SELECT QUANTITY FROM journeyximporter WHERE IMPORTERID = " + objeto2.IMPORTERID + " AND JOURNEYID = " + viaje + ";",function(error, result){
				if(error){
					console.log("Error 2: " + error);
				}else{
					console.log("Cantidad en Importador Actualizada");
					if(result.length!=0){
						var auxCant = objeto1 + result[0].QUANTITY;
						console.log("Nueva cantidad: " + auxCant);
						connection.query('UPDATE journeyximporter SET QUANTITY = ? WHERE IMPORTERID = ? AND JOURNEYID = ?',[auxCant, objeto2.IMPORTERID, viaje],function(error2){
							if(error2){
								throw error2;
							}else{
								console.log("Actualizacion de la cantidad en el registro del importador por viaje");
							}
						});
					}
				}
			});
		}else{
			console.log("Registro de la cantidad en el detalle del viaje");
		}
	});
}

/*function equivalencia(typewasteentrada,cantidad,typewastesalida){
	var equi;
	console.log("entry");	
	connection.query('SELECT * FROM waste_type where WASTETYPEID='+typewasteentrada+';',function(error, result){
		if(error){
		    throw error;
		}else{
			console.log("query1: "+result[0].WASTETYPEFACTOR);
			//went=result[0].WASTETYPEFACTOR;
			connection.query('SELECT * FROM waste_type where WASTETYPEID='+typewastesalida+';',function(error, result1){
				if(error){
					throw error;
				}else{
					console.log("query2: "+result1[0].WASTETYPEFACTOR);
					//wsal=result1[0].WASTETYPEFACTOR;
					equi=(result[0].WASTETYPEFACTOR/result1[0].WASTETYPEFACTOR)*cantidad;
					console.log("equivalencia: "+equi);	
					return equi;
			   }
			});
       }
	});
	
	//console.log("waste salida: "+wsal);
	//console.log("waste entrada: "+went);

	//equi=(went/wsal)*cantidad;
	console.log("equivalencia: "+equi);	 
}*/
/*
function actualizarCaso1(objeto1, objeto2, viaje){
    console.log("Order Quantity: " + objeto1.cantidad);
    console.log("Data Importador: " + objeto2.IMPORTERID + " - " + objeto2.IMPORTERQUOTA);
    var valor = objeto2.IMPORTERQUOTA - objeto1.cantidad;
    connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[valor, objeto2.IMPORTERID],function(error){
        if(error){
			throw error;
			console.log("Caso1"+error);
        }else{
            console.log("Cantidad Importador Actualizada");
            //INSERT en tabla nueva donde vaya el viaje, importador, cantidad asignada al importador
            connection.query('INSERT INTO journeyximporter (IMPORTERID,JOURNEYID,QUANTITY) VALUES (?,?,?)',[objeto2.IMPORTERID, viaje, objeto1.cantidad],function(error2){
                if(error2){
                    throw error2;
                }else{
                    console.log("Registro de la cantidad en el detalle del viaje");
                }
            });
        }
    });
}

function actualizarCaso2(objeto1, objeto2, viaje){
    connection.query('UPDATE importer SET importerquota = ? WHERE importerid= ?',[0, objeto2.IMPORTERID],function(error){
        if(error){
			throw error;
			console.log("Caso2"+error);
        }else{
            console.log("Cantidad en Importador Actualizada");
            connection.query('INSERT INTO journeyximporter (IMPORTERID,JOURNEYID,QUANTITY) VALUES (?,?,?)',[objeto2.IMPORTERID, viaje, objeto2.IMPORTERQUOTA],function(error2){
                if(error2){
                    throw error2;
                }else{
                    console.log("Registro de la cantidad en el detalle del viaje");
                }
            });
        }
    });
}

function actualizarCaso3(objeto1, objeto2, viaje){
    console.log("tamanio: " + objeto2.IMPORTERID, viaje, objeto1.cantidad);
	connection.query('INSERT INTO journeyximporter (IMPORTERID,JOURNEYID,QUANTITY) VALUES (?,?,?)',[objeto2.IMPORTERID, viaje, objeto1.cantidad],function(error2){
		if(error2){
			connection.query("SELECT QUANTITY FROM journeyximporter WHERE IMPORTERID = " + objeto2.IMPORTERID + " AND JOURNEYID = " + viaje + ";",function(error, result){
				if(error){
					console.log("Error 2: " + error);
				}else{
					if(result.length!=0){
						var auxCant = objeto1.cantidad + result[0].QUANTITY;
						console.log("Nueva cantidad: " + auxCant);
						connection.query('UPDATE journeyximporter SET QUANTITY = ? WHERE IMPORTERID = ? AND JOURNEYID = ?',[auxCant, objeto2.IMPORTERID, viaje],function(error2){
							if(error2){
								throw error2;
							}else{
								console.log("Actualizacion de la cantidad en el registro del importador por viaje");
							}
						});
					}
				}
			});
		}else{
			console.log("Registro de la cantidad en el detalle del viaje");
		}
	});
}*/




server.listen(8080, function(){
   console.log('listening on *:8080');
 });

