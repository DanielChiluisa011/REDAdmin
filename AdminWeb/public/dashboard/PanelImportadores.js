var socket = io.connect("http://34.195.35.232:8080",{"forceNew": true});
$(document).ready(function(){
    socket.emit("RequestImportersInfo","");
    socket.on("ResponseImporterInfo",function(Importer){
        if(Importer==0){
            $.notific8('Error al guardar, intentelo nuevamente', {
                life: 3500,
                heading: 'Error!',
                theme: 'ruby',
                sticky: false,
                horizontalEdge: 'top',
                verticalEdge: 'rigth',
                zindex: 1500
            });
        }else{
            console.log("Importadores")
            for(var i=0;i<Importer.length;i++){
                console.log(Importer[i]);
            }
        }
    })
})