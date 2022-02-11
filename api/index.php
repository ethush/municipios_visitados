<?php

require 'flight/Flight.php';

const DB_PATH = './municipios_visitados.db';

// Se registra la clase PDO para conexión y los atributos para gestión de errores
Flight::register('db','PDO', array('sqlite:'.DB_PATH), function($db) {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
});

/**
 * Control y gestión de errores y accesos no autorizados de forma directa
 */
Flight::route('/', function(){
    Flight::redirect('../');
});

Flight::map('notFound', function(){
    // Handle not found
    echo '<h3>Driver not loaded!</3>';    
});


/** 
 * Obtiene el listado de años de la tabla mun_visitados
*/
Flight::route('GET /cat_anios', function() {
    $db = Flight::db();
    $jsonResponse = array();

    $sql = "SELECT anio FROM mun_visitados GROUP BY anio ORDER BY anio ASC;";
  
    $response = $db->prepare($sql);
    $response->execute();
    
    foreach ($response as $key) {
        //print_r($key);
        $jsonResponse['cat_anios'][] = $key[0];
    }
    
    Flight::json($jsonResponse);
});


/**
 * Obtiene los municipios e información para mapeo y popup por año
 */
Flight::route('GET /municipios/@anio', function($anio) {
    $db = Flight::db();
    $jsonResponse = array();

    $sql = "SELECT mun_visitados.cvgeo, municipio, region, distrito, lat_dec, lon_dec FROM mun_visitados, municipios WHERE municipios.cvgeo=mun_visitados.cvgeo AND anio=".$anio;
    
    $response = $db->prepare($sql);
    $response->execute();
    
    
    foreach ($response as $key) {
        $fila['cvgeo'] = $key['cvgeo'];
        $fila['Municipio'] = $key['Municipio'];
        $fila['region'] = $key['region'];
        $fila['distrito'] = $key['distrito'];
        $fila['lat_dec'] = $key['lat_dec'];
        $fila['lon_dec'] = $key['lon_dec'];
        
        $municipios[] = $fila;
        //$fila = null;
    }

    $jsonResponse['municipios'] = $municipios;
    
    Flight::json($jsonResponse);
});



Flight::start();