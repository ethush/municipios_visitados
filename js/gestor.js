/**
 * TODO:
 *  - Verificar si el acceso al sitio está autorizado
 */

var municipios = document.getElementById('municipios'),
    registrar = document.getElementById('registrar'),
    cerrarSesion = document.getElementById('cerrarSesion'),
    frmRegistroMunicipio = document.getElementById('frmRegistroMunicipio');

/**
 * Verifica si el usuario está autorizado para el acceso
 * @returns {undefined}
 */
fetch('../api/validaSesion')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            window.location = '../';
        }
    });

/**
 * Solicita el catalogo de municipios actualizada de Atlas de Género Oaxaca
 * y llena un select con los municipios con el componente select2.js
 * @returns {undefined}
 * @see select2.js
 * @see https://select2.org/
 * @see https://select2.org/data-sources/ajax
 * @see https://select2.org/data-sources/ajax#getting-started-with-json
 * @see https://select2.org/data-sources/ajax#getting-started-with-json-and-the-data-option
 * 
 */
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
 * Obtiene la clave geoestadistica del municipio seleccionado
 * la envía mediante formulario usando el método POST
 * @returns {undefined}
 * @see https://developer.mozilla.org/es/docs/Web/API/FormData
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
 * @returns {undefined}
 */
cerrarSesion.addEventListener('click', () => {
    fetch('../api/cierraSesion');
    window.location = '../';
});