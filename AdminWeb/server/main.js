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
	database: 'red'
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
			connection.query('SELECT * FROM USERS ','',function(error, result){
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
	    		connection.query('INSERT INTO USER_TEMP VALUES (?,?,?,?,?,?,?)',[data.ci,data.name,data.lastName,data.phone,data.address,data.ruc,data.role],function(err, rows, fields) {
		        	if(err){
		         	console.log("Error "+ err.message);
		         	}else{
			         	connection.query('INSERT INTO USER_TEMP VALUES (?,?,?,?)',[data.email,data.pass,'cliente',data.ci],function(err, rows, fields) {
					       	if(err){
					        	console.log("Error "+ err.message);
					        }else{
					        	SendNotification(socket); 
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

		connection.query('SELECT * FROM USERS;',function(error, result){
			if(error){
			    throw error;
			}else{
			  	lstTempUsers=result;
			  	connection.query('SELECT * FROM PERSON;',function(error, result){
					if(error){
					    throw error;
					}else{
					  	lstTempPerson=result;
						for (var i = 0; i < lstTempUsers.length; i++) {
							for (var j = 0; j < lstTempPerson.length; j++) {
								if(lstTempUsers[i].PERSON_person_ci==lstTempPerson[j].PersonCi){
									var aux = {
										person: lstTempPerson[j],
										user: lstTempUsers[i]
									}
									lstNotificationUsers.push(aux);
								}
							}
						}
						console.log('Usuarios devueltos: '+lstNotificationUsers.length);
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
      		connection.query("SELECT DistributorId,DistributorName,DistributorRuc,DistributorAddress,DistributorPhone,DistributorStock,DistributorEnvironmentalLicense,PersonContact,IMPORTER_ImporterId,X(GeometryFromText(AsText(DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(DistributorCoordinates))) CoordY FROM distributor where PersonContact='"+data+"'",function(error, result){
				if(error){
				    throw error;
				}else{
				  	var lstDistributor=result;
					io.emit('DistributorData',lstDistributor);
					// console.log('Select Distributors executed');
		       }
			});
      });
      socket.on('RequestJourneyRoute',function(data){
      	console.log('RequestJourneyRoute cedula: '+data);
      		connection.query("select j.JourneyId, j.JourneyRoute, j.RECYCLING_CENTER_recycling_center_id from journey j, trucks t, PERSON p where j.TRUCK_truck_id=t.TruckId and t.TruckDriver=p.PersonCi and  p.PersonCi='"+data+"'",function(error, result){
				if(error){
				    throw error;
				}else{
				  	var JourneyRoute=result;
					io.emit('JourneyRouteData',JourneyRoute);
					// console.log('Select Distributors executed');
		       }
			});
      });
      socket.on('RequestDistOrders',function(data){
		  	console.log(data);
      		connection.query("select * from orders WHERE DistributorId= "+data+"",function(error, result){
				if(error){
				    throw error;
				}else{
					console.log('numero de elementos'+result.length);
					for(var i=0;i<result.length;i++){
							console.log(result[i].JourneyId);
						// connection.query("select * from journey WHERE journeyId = "+result[i].JourneyId+";",function(error, result1){
						// 	if(error){
						// 		throw error;
						// 	}else{
						// 		var ObjOrder={
						// 			order: result[i],
						// 			journey: result1
						// 		}
						// 		console.log(journey);
						// 		socket.emit('DistOrders',ObjOrder);
						// 		// console.log('Select Distributors executed');
						// 	}
						// });
					}
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
      //Prueba socket en app movil*****************************
    SelectRecyclingCenters();
	SelectImporters();
    SelectMaxOrder(socket)
	SelectJourneys();
	SelectActiveOrders()
	SelectUsers();
	selectWaste();
	SelectPersons();
	SendNotification(socket); 
	SelectOrders();
	SelectDrivers();
	SelectTrucks();
	SelectDistributor();
	UpdateUser(socket);
	SaveNewUser(socket);
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
		connection.query('INSERT INTO journey VALUES (?,?,?,?,?,?,?)',[,data.date,data.state,data.truckId,data.RecyclingCenter,data.route,data.importer.ImporterId],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			// console.log("Insert journey execute");
	 		}
	 	})

		if(data.importer.ImporterMontlyQuotah-data.quantity>=0){
			connection.query('UPDATE importer SET ImporterMontlyQuotah = ImporterMontlyQuotah - ?, ImporterQuotaAccomplished = ImporterQuotaAccomplished + ? WHERE ImporterId = ?',[data.quantity,data.quantity,data.importer.ImporterId],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("Insert journey execute");
		 		}
		 	})
		}else{
			// console.log('sobrante = '+ ((data.importer.ImporterMontlyQuotah-data.quantity)*-1));
			connection.query('UPDATE importer C SET C.ImporterMontlyQuotah = 0, C.ImporterQuotaAccomplished = C.ImporterQuotaAccomplished + ? WHERE C.ImporterId = ?',[data.quantity-((data.importer.ImporterMontlyQuotah-data.quantity)*-1),data.importer.ImporterId],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			connection.query('SELECT MIN(B.ImporterMontlyQuotah) AS NextQuota FROM importer B WHERE B.ImporterMontlyQuotah!=0;',function(error, result) {
				 		if(err){
				 			console.log("Error "+ err.message);
				 		}else{
				 			var aux=result;
				 			// console.log('Siguiente: '+aux[0].NextQuota);
				 			connection.query('UPDATE importer A SET ImporterMontlyQuotah = A.ImporterMontlyQuotah - ?, ImporterQuotaAccomplished = A.ImporterQuotaAccomplished + ? WHERE ImporterMontlyQuotah = ?;',[(data.importer.ImporterMontlyQuotah-data.quantity)*-1,(data.importer.ImporterMontlyQuotah-data.quantity)*-1,aux[0].NextQuota],function(err, rows, fields) {
						 		if(err){
						 			console.log("Error "+ err.message);
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
		// update orders set JourneyId = (select max(JourneyId) from Journey);
		for (var i = 0; i < data.length; i++) {
			connection.query('UPDATE orders SET JourneyId = (SELECT max(JourneyId) FROM Journey) WHERE OrderId = ?;',[data[i]],function(err, rows, fields) {
		 		if(err){
		 			console.log("Error "+ err.message);
		 		}else{
		 			console.log("ok");
		 		}
		 	})

		 	connection.query('UPDATE orders SET OrderState =  "En Proceso" WHERE OrderId = ?', [data[i]],function(err, rows, fields){
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			// console.log("Update execute");
	 			SelectOrders();
	 		}
	 	})
		}
	});
});

function SelectUsers(){
	lstUsers.length=0;
	connection.query('SELECT * FROM USERS ','',function(error, result){
      if(error){
         throw error;
      }else{
      	lstUsers=result;
		io.emit('Select Users', lstUsers);
		//console.log('numero de usuarios: '+lstUsers.length)
      }
	});	
}

function AppSelectUsers(socket){
	var lstNotificationUsers=[];
	var lstTempUsers=[];
	var lstTempPerson=[];

	connection.query('SELECT * FROM USERS',function(error, result){
		if(error){
		    throw error;
		}else{
		  	lstTempUsers=result;
		  	connection.query('SELECT * FROM PERSON',function(error, result){
				if(error){
				    throw error;
				}else{
				  	lstTempPerson=result;
					for (var i = 0; i < lstTempUsers.length; i++) {
						for (var j = 0; j < lstTempPerson.length; j++) {
							if(lstTempUsers[i].PERSON_TEMP_PersonCi==lstTempPerson[j].PersonCi){
								var aux = {
									person: lstTempPerson[j],
									user: lstTempUsers[i]
								}
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

	connection.query('SELECT * FROM USER_TEMP',function(error, result){
		if(error){
		    throw error;
		}else{
		  	lstTempUsers=result;
		  	connection.query('SELECT * FROM person_temp',function(error, result){
				if(error){
				    throw error;
				}else{
				  	lstTempPerson=result;
					for (var i = 0; i < lstTempUsers.length; i++) {
						for (var j = 0; j < lstTempPerson.length; j++) {
							if(lstTempUsers[i].PERSON_TEMP_PersonCi==lstTempPerson[j].PersonCi){
								var aux = {
									person: lstTempPerson[j],
									user: lstTempUsers[i]
								}
								lstNotificationUsers.push(aux);
							}
						}
					}
					io.emit('NotificationNewUser',lstNotificationUsers);
		       }
			})
       }
	})
}

function SelectOrders(){
	connection.query("SELECT OrderId,OrderDate,OrderQuantity,DistributorId,RESIDUE_ResidueONU,OrderState,OrderType,DATE_FORMAT(OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine  FROM orders WHERE OrderState like 'Pendiente' ORDER BY OrderDeadLine ASC",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstOrders=result;
			io.emit('SelectOrders',lstOrders);
       }
	})
}

function SelectActiveOrders(){
	connection.query("SELECT OrderId,OrderDate,OrderQuantity,DistributorId,RESIDUE_ResidueONU,OrderState,OrderType,DATE_FORMAT(OrderDeadLine ,'%Y-%m-%d') AS OrderDeadLine,JourneyId FROM orders WHERE OrderState like 'En Proceso' ORDER BY OrderDeadLine ASC",function(error, result){
		if(error){
		    throw error;
		}else{
		  	var lstOrders=result;
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
	connection.query('SELECT * FROM PERSON WHERE PersonRole LIKE "conductor"  ',function(error, result){
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
	connection.query('SELECT DistributorId,DistributorName,DistributorRuc,DistributorAddress,DistributorPhone,DistributorStock,DistributorEnvironmentalLicense,PersonContact,IMPORTER_ImporterId,X(GeometryFromText(AsText(DistributorCoordinates)))CoordX, Y(GeometryFromText(AsText(DistributorCoordinates))) CoordY FROM distributor',function(error, result){
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
	connection.query('SELECT RecyclingCenterId,RecyclingCenterName,RecyclingCenterAddress,RecyclingCenterPhone,RecyclingEnviromentalLicense,PERSON_Contact,X(GeometryFromText(AsText(RecyclingCenterCoordinates))) CoordX, Y(GeometryFromText(AsText(RecyclingCenterCoordinates))) CoordY FROM Recycling_Centers',function(error, result){
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
	connection.query('SELECT * FROM WASTE',function(error, result){
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
	connection.query('SELECT * FROM PERSON ORDER BY PersonName',function(error, result){
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
		connection.query('INSERT INTO PERSON VALUES (?,?,?,?,?,?,?)',[data.person.PersonCi,data.person.PersonName,data.person.PersonLastName,
																	  data.person.PersonPhone,data.person.PersonAddress,data.person.PersonRuc,data.person.PersonRole],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Insert new person execute");
	 		}
	 	});
	 	connection.query('INSERT INTO USERS VALUES (?,?,?,?)',[data.user.UserEmail,data.user.UserPassword,data.user.UserProfile,data.user.PERSON_TEMP_PersonCi],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Insert new user execute");
	 		}
	 	});
	 	connection.query('DELETE FROM USERS_TEMP WHERE UserEmail = ?',[data.user.UserEmail],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Delete user_temp execute");
	 		}
	 	});
	 	connection.query('DELETE FROM person_temp WHERE PersonCi = ?',[data.person.PersonCi],function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Delete user_temp execute");
	 		}
	 	});
		SendNotification();
	});
}

function UpdateUser(socket){
	socket.on('UserUpdate',function(data){
		connection.query('UPDATE PERSON SET PersonName ="'+data.name+'", PersonLastName="'+data.lastName+'", PersonPhone="'+data.phone+'", PersonAddress="'+data.address+'", PersonRuc="'+data.ruc+'", PersonRole="'+data.role+'" WHERE PersonCi = "'+data.ci+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("Person update excecuted");
	 		}
	 	});

	 	connection.query('UPDATE USERS SET UserPassword = "'+data.password+'" WHERE UserEmail = "'+data.email+'"',function(err, rows, fields) {
	 		if(err){
	 			console.log("Error "+ err.message);
	 		}else{
	 			console.log("User update excecuted");
	 		}
	 	});
	});
}

function SelectJourneys(){
	connection.query("SELECT JourneyId,DATE_FORMAT(JourneyDate ,'%Y-%m-%d') AS JourneyDate,JourneyState,TRUCK_truck_id,RECYCLING_CENTER_recycling_center_id,JourneyRoute,ImporterId FROM journey",function(error, result){
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
