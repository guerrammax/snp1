'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar rutas
var user_routes = require('./routes/user');
var animal_routes = require('./routes/animal');

//middlerwares de body parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras y cors
app.use((req, res, next)=>{
    res.header('Acces-Control-Allow-Origin', '*');
    res.header('Acces-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Request-With, Content-Type, Accept, Acces-Control-Allow-Request-Method');
    res.header('Acces-Control-Allow-Methods', 'GET, POST, OPTIONS PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//rutas body parser
app.use('/api',user_routes);
app.use('/api',animal_routes);

// app.get('/probando', (req, res) => {
//     res.status(200).send({message:'Este es el metodo probando'})
// });

module.exports = app;