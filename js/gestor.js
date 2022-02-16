/**
 * TODO:
 *  - Verificar si el acceso al sitio está autorizado
 *  - Cierre de sesión
 *  - Registro del municipio visitado hacia la API 
 *  - 
 */

var municipios = document.getElementById('municipios'),
    registrar = document.getElementById('registrar'),
    cerrarSesion = document.getElementById('cerrarSesion'),
    frmRegistroMunicipio = document.getElementById('frmRegistroMunicipio');

/**
 * Solicitudes de precarga
 */
fetch('../api/validaSesion')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            window.location = '../';
        }
    });

fetch('//atlasdegenero.oaxaca.gob.mx/api/catalogo/municipios')
    .then(response => response.json())
    .then(data => {
        //console.log(data.catalogo)
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
    // Inhabilita el boton temporalmente para control de eventos
    registrar.disabled = true;

    var municipioSeleccionado = $("#municipios").val();

    var data = new FormData();
    data.append('cvgeo', municipioSeleccionado);

    fetch('../api/municipios/registrar/', {
            method: 'POST',
            body: data
        })
        .then(response => response.text())
        .then(data => {
            var data = JSON.parse(data);
            if (data.ok) {
                registrar.disabled = false;
            } else {
                alert('Ocurrió un error, al guardar el registro');
            }
        });
})

/**
 * Cierre de sesión
 */
cerrarSesion.addEventListener('click', () => {
    fetch('../api/cierraSesion');
    window.location = '../';
});