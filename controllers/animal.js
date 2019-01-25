'use strict'
//modulos
//var bcript = require('bcrypt-nodejs');

var fs = require('fs');

var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');

//servicio jwt
//var jwt = require('../services/jwt');

function pruebas(req, res){
    res.status(200).send({
        message: 'Probando el controlador de animales',
        user: req.user
    });
}

function saveAnimal(req, res){
   var animal = new Animal();

   var params = req.body;

   if(params.name){
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalStored) =>{
            if(err){
                res.status(500).send({
                    message:'Error en el servidor'
                });
            }else{
                if(!animalStored){
                    res.status(404).send({message:'No se guarado el animal'})
                }else{
                    res.status(200).send({animal:animalStored});
                }
            }
        });
   }else{
       res.status(200).send({message:'el nombre del animal es obligatorio'});
   }
   
    // res.status(200).send({
    //     message:'Metoado save animal'
    // });
}

function getAnimals(req, res){
    Animal.find({}).populate({path:'user'}).exec((err, animals) => {
        if(err){
            res.status(500).send({
                message:'Error en la peticion'
            });
        }else{
            if(!animals){
                res.status(404).send({
                    message:'No hay animales'
                });
            }else{
                res.status(200).send({animals});
            }
        }
    });
}

function getAnimal(req,res){
    var animalId = req.params.id;
    
    Animal.findById(animalId).populate({path:'user'}).exec((err, animal) => {
        if(err){
            res.status(500).send({
                message:'Error en la peticion'
            });
        }else{
            if(!animal){
                res.status(404).send({
                    message:'Animal no existe'
                });
            }else{
                res.status(200).send({animal});
            }
        }
    });
}

function updateAnimal(req, res){
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId,update, {new:true}, (err, animalUpdate) => {
        if(err){
            res.status(500).send({message:'Error en la peticion'});
        }else{
            if(!animalUpdate){
                res.status(404).send({message:'No se actualizo animal'});
            }else{
                res.status(200).send({animal:animalUpdate});
            }
        }
    });
}

function uploadImagen(req, res){
    // res.status(200).send({message:'El metodo upload'});
    var animalId = req.params.id;
    var file_name = 'No subido';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2]; 

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext =='jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

            // if(animalId != req.user.sub){
            //     return res.status(500).send({
            //         message:'No tienes permisos para actualizar'
            //     });
            // }
            Animal.findByIdAndUpdate(animalId, {image: file_name}, {new: true}, (err, animalUpdate) =>{
                if(err){
                    res.status(500).send({
                        message:'Error al Actualizar animal'
                    });
                }else{
                    if(!animalUpdate){
                        res.status(404).send({
                            message:'No se pudo Actualizar animal'
                        }); 
                    }else{
                        res.status(200).send({
                           animal: animalUpdate, 
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
   var path_file = './uploads/animals/'+ imageFile;

   fs.exists(path_file, function(exists){
       if(exists){
        res.sendFile(path.resolve(path_file));
       }else{
           res.status(404).send({message: 'la imagen no existe'});
       }

   });

}

function deleteAnimal(req, res){
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId,(err, animalRemoved)=>{
        if(err){
            res.status(500).send({message:'Error en la perticion'});
        }else{
            if(!animalRemoved){
                res.status(404).send({message:'No se pudo borrar'});
            }else{
                res.status(200).send({animal:animalRemoved});
            }
        }
    });

}

module.exports = {
    pruebas, 
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImagen,
    getImageFile,
    deleteAnimal
};