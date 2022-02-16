<?php
session_start();

require 'flight/Flight.php';
require_once 'functions.php';

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

/**
 * Registra el municipio visitado
 */
Flight::route('POST /municipios/registrar/', function() {
    $parametros = Flight::request()->data;
    $parametros->getData();
    $db = Flight::db();

    $jsonResponse = array();
    // Obtiene el año actual para construir la consula
    $anio = date('Y');
    // SQL para incersión
    $sql = 'INSERT INTO mun_visitados (cvgeo, anio) VALUES('.$parametros['cvgeo'].','.$anio.')';
    
    $response = $db->prepare($sql);

    if($response->execute()) {
        $jsonResponse['ok'] = true;
    }
    else {
        $jsonResponse['ok'] = false;
    }

    Flight::json($jsonResponse);

});


/**
 * API de acceso para la sección de administración de los municipios visitados
 */
Flight::route('POST /acceso', function() {
    $parametros = Flight::request()->data;
    
    //SHA256
    $usuario = '08717a485a9395695ed0112a45a0de78277ae6526e0514074deb9db4d618b846714b5ffa430335f9d906e6fe602b49586887a7742f0b88aae4c5e85e8399b44f'; //DIGEPO
    $clave = 'a8f99d3cc787d64f3e374f33d9f50fc52168757475ddc1cd298e106367a758bc40665b9846ff638c1fb179fb25b691acea04d46dc3fb6116d67fb74133c26fcf'; //d1g3po
    $salt = "uOlNngP=";
    $hash_method = 'sha512';
    
    //var_dump($parametros->getData());
    
    $valida_usuario = validaLogin($parametros['usuario'], $usuario,$salt,$hash_method);
    $valida_clave = validaLogin($parametros['clave'], $clave,$salt,$hash_method);
    
    //var_dump($valida_usuario);
    //var_dump($valida_clave);

    $url = '';

    // Reasigna la redirección y variables de sesión para el login de
    // la sección de gestión de administración
    if($valida_usuario  && $valida_clave ) {
        $_SESSION['login'] = true;
        $_SESSION['session_id'] = session_id();

        $url = '../panel/gestor.html';
    }
    else {
        unset($_SESSION['login']);
        unset($_SESSION['session_id']);
        unset($_SESSION);

        $url = '../';
    }

    Flight::redirect($url);
});



/**
 * Valida cada ingreso en las secciones de instancias o administrador según sea el caso
 * la variable de control $_SESSION['login'] deber ser verdadera
*/
Flight::route('GET /validaSesion', function() {
    $error = false;
    $response = array();
    $msg = '';
    if(isset($_SESSION)) {
        //Valida que el id coincida con el generado, primer factor de seguridad
        if(isset($_SESSION['session_id']) && session_id() == $_SESSION['session_id']) {
            if(!isset($_SESSION['login']) && $_SESSION['login'] == false) {
                $error = true;
            }
        }
        else {
            $error = true;
        }
    }
    else {
        $error = true;
    }
    
    $response['error'] = $error;

    Flight::json($response);
});


/**
 * Cierra la sesión borrando todas las variables usadas
 */
Flight::route('GET /cierraSesion' ,function() {
   
    unset($_SESSION['login']);
    unset($_SESSION['session_id']);
    unset($_SESSION);
});


Flight::route('GET /usuarios/generador', function() {
    $hash_method = 'sha512';
    //Se obtiene desde los parametros del header request
    //$pass = generateRandomPassword();
    $pass = "d1g3po";
    //Clave aleatoria para generación
    //$salt = randomSalt();
    $salt = "uOlNngP=";
    //Encriptación de clave
    //$hash = '1a9a0796baa029319682d1ca14c5ffb1a5b64fd08142be4e4c0c02d1b4b858bc6fb06e80ff5f51226109b807a573040b989481773e73832dea0b35c11bdbcb7f';
    $hash = create_hash($pass,$hash_method,$salt);
    echo 'Clave: '. $pass . '</br>';
    echo 'Salt: '. $salt . '</br>';
    echo 'Hash: '. $hash . '</br>';
    var_dump($pass);
    var_dump($salt);
    var_dump($hash);
    
    //Valida el password enviado del formulario $pass, se obtiene el hash y el salt
    //de la base de datos y el matodo de encriptación
    if(validaLogin($pass,$hash,$salt,$hash_method)) {
        echo "valido";
    }
    else {
        echo "no valido";
    }
    
});

Flight::start();