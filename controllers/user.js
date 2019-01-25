'use strict'

//modulos
var bcript = require('bcrypt-nodejs');

var fs = require('fs');

var path = require('path');

//modelos
var User = require('../models/user');

//servicio jwt
var jwt = require('../services/jwt');


function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la accion pruebas',
        user: req.user
    });
}

function saveUser(req, res){
    //Crear objeto Usuario
    var user = new User();

    //recoger los parametros del body de la petición
    var params = req.body;   
    //Testeo por consola
    //console.log(params);
    if(params.password && params.name && params.surname && params.email){
         //asignar valores al usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email =params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
            if(err){
                res.status(500).send({message:'Error al comprobar el usuario'});
            }else{
                if(!issetUser){
                    
                    bcript.hash(params.password, null,null,function(err,hash){
                        user.password = hash;
        
                        user.save((err, userStored) => {
                            if(err){
                                res.status(500).send({message:'Error al guardar el usuario'});
                            }else{
                                if(!userStored){
                                    res.status(404).send({message:'No se ha resgitrado'});
                                }else{
                                    res.status(200).send({user: userStored});
                            }
                        }
                        });
                    });   
                }else{
                    res.status(200).send({
                        message:'El usuario no puede registrarse'
                    });
                }
            }   
        });          
    }else{
        res.status(200).send({
            message:'Introduce los datos corretcamente'
        });
    }
}

function login(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({message:'Error al comprobar el usuario'});
        }else{
            if(user){
                bcript.compare(password,user.password, (err, check) =>{
                    if(check){
                        //comprobar y generar token
                        if(params.gettoken){
                            //devolver el token jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({user});
                        }                       
                    }else{
                        res.status(404).send({
                            message:'El usuario no ha podido logearse correctamente'
                        }); 
                    }
                });             
            }else{
                res.status(404).send({
                    message:'El usuario no ha podido logearse'
                });
            }
        }
    });  
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({
            message:'No tienes permisos para actualizar'
        });
    }
    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdate) =>{
        if(err){
            res.status(500).send({
                message:'Error al Actualizar usuario'
            });
        }else{
            if(!userUpdate){
                res.status(404).send({
                    message:'No se pudo Actualizar usuario'
                }); 
            }else{
                res.status(200).send({
                   user: userUpdate
                }); 
            }
        }
    });
}

function uploadImagen(req, res){
    // res.status(200).send({message:'El metodo upload'});
    var userId = req.params.id;
    var file_name = 'No subido';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2]; 

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext =='jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

            if(userId != req.user.sub){
                return res.status(500).send({
                    message:'No tienes permisos para actualizar'
                });
            }
            User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdate) =>{
                if(err){
                    res.status(500).send({
                        message:'Error al Actualizar usuario'
                    });
                }else{
                    if(!userUpdate){
                        res.status(404).send({
                            message:'No se pudo Actualizar usuario'
                        }); 
                    }else{
                        res.status(200).send({
                           user: userUpdate, 
                           image:file_name
                        }); 
                    }
                }
            });

        }else{

            fs.unlink(file_path, () => {
                if(err){
                    res.status(200).send({message:'Extencion no valida y fichero no borrado'});
                }else{
                    res.status(200).send({message:'Extencion no valida'});
                }
            });
            
        }

      
    }else{
        res.status(200).send({message:'No existe el fichero'});
    }
}

function getImageFile(req, res){
   // res.status(200).send({message:' get image file'});
   var imageFile= req.params.imageFile;
   var path_file = './uploads/users/'+ imageFile;

   fs.exists(path_file, function(exists){
       if(exists){
        res.sendFile(path.resolve(path_file));
       }else{
           res.status(404).send({message: 'la imagen no existe'});
       }

   });

}

function getKeepers(req, res){
    User.find({role:'ROLE_ADMIN'}).exec((err, users) =>  {
        if(err){
            res.status(500).send({message:'Error en la peticion'});
        }else{
            if(!users){
                res.status(400).send({
                    message:'No hay cuidadores'
                });
            }else{
                res.status(200).send({users});
            }
        }
    });

   // res.status(200).send({message:'get keeper'});
}

module.exports = {
    pruebas,
    saveUser, 
    login,
    updateUser, 
    uploadImagen,
    getImageFile,
    getKeepers
};