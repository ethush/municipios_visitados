let mapa = null,
    capas =  [];

const cboAnio = document.getElementById('anio');
const totalMun = document.getElementById('total');
const listaMunicipios = document.getElementById('lista');

/**
 * Configuraciones de mapa
 * @type {L.Map}
 * @see https://leafletjs.com/reference-1.6.0.html#map-l-map
 * @see https://leafletjs.com/examples/quick-start/
 */
mapa = L.map('mapa', {
    center: [17.0669, -96.7203],
    zoom: 7,
    maxZoom: 12
})

/**
 * Capa base para agrupar los municipios por el año seleccionado
 * @type {L.markerClusterGroup}
 * @see https://leafletjs.com/reference-1.6.0.html#markerclustergroup-l-markerclustergroup
 */
let clusterMunicipios = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});

/**
 * Pin de municipio en el mapa
 * @type {L.Icon}
 * @see https://leafletjs.com/reference-1.6.0.html#icon
 * @see https://leafletjs.com/examples/custom-icons/
 */
let markerIcon = L.icon({
    iconUrl: 'css/images/marker-icon.png',
    iconRetinaUrl: 'css/images/marker-icon.png'
});

/**
 * Configuración de mapa base usando servicio WMS que provee el servidor de mapas GAIA de INEGI
 * @type {L.tileLayer}
 * @see https://leafletjs.com/reference-1.6.0.html#tilelayer-l-tilelayer
 * @see https://www.inegi.org.mx/servicios/MxSIG.html
 */
L.tileLayer.wms('http://{s}.inegi.org.mx/mdmCache/service/wms?', {
    attribution: 'Derechos Reservados &copy; INEGI',
    subdomains: ['gaiamapas1', 'gaiamapas2', 'gaiamapas3', 'gaiamapas', 'gaia'],
    format: 'image/jpeg',
    legendlayer: ['c100', 'c101', 'c102', 'c102-r', 't700', 'c102m', 'c103', 'c109', 'c110', 'c111', 'c112', 'c200', 'c201', 'c202', 'c203', 'c206', 'c300', 'c301', 'c302', 'c310', 'c311', 'c354', 'c762', 'c793', 'c795'],
    layers: 'MapaBaseTopograficov61_sinsombreado'
}).addTo(mapa)


mapa.scrollWheelZoom.disable();

/**
 * Obtiene un catalogo de años de los municipios visitados registrados y genera 
 * una lista de opciones para el combo de años
 * @returns {undefined}
 */
 fetch('./api/cat_anios')
    .then(response => response.json())
    .then(data => {
        var anios = data.cat_anios;
        anios.forEach(anio => {
            var option = document.createElement('option');
            option.value = anio;
            option.text = anio;

            cboAnio.add(option);
            option = null;
     });
 });


/**
 * Manejador de evento para el combo de años y generación de lista
 * de municipios visitados para ventana modal
 * @returns {undefined}
 */
cboAnio.addEventListener('change', function() {
    // Se limpia la capa de gestión markerClusterGroup antes de asignar el 
    // grupo de marcadores
    clusterMunicipios.clearLayers();

    fetch('./api/municipios/'+ this.value)
        .then(response => response.json())
        .then(data => {
            // Se obtiene la información
            var municipios = data.municipios;

            // Se crea la tabla en la ventana modal de los nombres con la
            // región y distrito correspondiente
            var tbody = listaMunicipios.getElementsByTagName('tbody')[0];
            // Se limpia el contenido de la tabla con cada cambio de año
            tbody.innerHTML = '';
            
            municipios.forEach((item,index) => {
                // Se agregan los marcadores al grupo con información adicional en
                // una burbuja emergente en caso de que el usuario lo seleccione
                var popupContent = '<table class="table text-center">';
                popupContent += '<tr><th colspan="2">'+ item.Municipio+'</th></tr>';
                popupContent += '<tr><td>Región: '+item.region+'</td>';
                popupContent += '<td>Distrito: '+item.distrito+'</td></tr>';
                popupContent += '</table>';
                popupContent += '<p><a href="https://atlasdegenero.oaxaca.gob.mx/" target="_blank">Conoce más...</a></p>';

                var marcador = L.marker([item.lat_dec,item.lon_dec])
                    .bindPopup(popupContent);
                    clusterMunicipios.addLayer(marcador);

                // se crea al mismo tiempo la tabla de municipios del botón modal
                var tr = document.createElement('tr');
                var tdMunicipio = document.createElement('td');
                var tdRegion = document.createElement('td');
                var tdDistrito = document.createElement('td');

                tdMunicipio.innerHTML = item.Municipio;
                tdRegion.innerHTML = item.region;
                tdDistrito.innerHTML = item.distrito;

                tr.appendChild(tdMunicipio);
                tr.appendChild(tdRegion);
                tr.appendChild(tdDistrito);
                
                tbody.appendChild(tr);
            });
            
            // Se agrega la capa al mapa
            clusterMunicipios.addTo(mapa);

            // Obtiene el total de municipios del año y los asigna al elemento visual
            var totalMunVisitados = municipios.length;
            totalMun.innerHTML = totalMunVisitados.toString();
        });
});