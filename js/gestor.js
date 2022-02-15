/**
 * TODO:
 *  - Verificar si el acceso al sitio está autorizado
 *  - Cierre de sesión
 *  - Registro del municipio visitado hacia la API 
 *  - 
 */

var municipios = document.getElementById('municipios');
var registrar = document.getElementById('registrar');

/**
 * Solicitudes de precarga
 */
fetch('//atlasdegenero.oaxaca.gob.mx/api/catalogo/municipios')
.then(response => response.json())
.then(data => {
    console.log(data.catalogo)
    var lista_municipios = data.catalogo;

    lista_municipios.forEach(municipio => {
        var option = document.createElement('option');
        option.value = municipio.cvgeo;
        option.text = municipio.Municipio;
        municipios.add(option);
    });

    // Inicializa la lista de municipios con el complemento select2.js
    $('#municipios').select2({
        width: '100%'
    });
});

/**
 * Obtiene los valores de los controles de fecha y clave geoestadistica 
 * del municipio seleccionado
 */
registrar.addEventListener('click', () => {
    var municipioSeleccionado = $("#municipios").val();
    console.log(municipioSeleccionado);
})