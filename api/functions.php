<?php 
/**
 * Crea claves aleatorias entre 8 y 12 caracteres de largo incluyendo símbolos
 * @return string $password clave aleatoria
 */
function generateRandomPassword() {
    //Inicializa la cadena de la clave aleatoria
    $password = '';
  
    //Largo deseado
    $desired_length = rand(8, 12);
  
    for($length = 0; $length < $desired_length; $length++) {
      //Concatena caracteres aleatorios (incluidos símbolos)
      $password .= chr(rand(32, 126));
    }
  
    return $password;
}

/**
 * Crea una semilla aleatoria para combinar en el método de cifrado
 * @param int $len por omisión crea un largo de 8, puede tomar el largo deseado
 */
function randomSalt($len = 8) {
	$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()-=_+';
	$l = strlen($chars) - 1;
	$str = '';
	for ($i = 0; $i < $len; ++$i) {
		$str .= $chars[rand(0, $l)];
 	}
	return $str;
}

/**
 * Crea un hash usando un método existente dentro del catalogo de algoritmos.
 * Para ver la lista que dispone PHP7 utilice var_dump(hash_algos())
 * @param string $string cadena a codificar
 * @param string $hash_method Método de cifrado que debe existir dentro del catalogo de algoritmos
 * @param int $salt semilla generada por ramdomSalt() para combinar y fortalecer la codificación del hash
 */
function create_hash($string, $hash_method ,$salt) {
	if (function_exists('hash') && in_array($hash_method, hash_algos())) {
		return hash($hash_method, $salt . $string. $salt);
	}
	return sha1($salt . $string . $salt);
}

/**
 * @param string $pass La contraseña proporcionada por el usuario
 * @param string $hashed_pass La contraseña hasheada obtenida desde la base de datos
 * @param string $salt La llave obtenida desde la base de datos
 * @param string $hash_method El metodo de hashing usaro para generar la clave cifrada
 */
function validaLogin($pass, $hashed_pass, $salt, $hash_method ) {

    if (function_exists('hash') && in_array($hash_method, hash_algos())) {
        return ($hashed_pass === hash($hash_method, $salt . $pass . $salt));
    }
    return ($hashed_pass === sha1($salt . $pass . $salt));
}