let mapa = null,
    capas =  [];

const cboAnio = document.getElementById('anio');

/**
 * Configuraciones de mapa
 */
mapa = L.map('mapa', {
    center: [17.0669, -96.7203],
    zoom: 7,
    maxZoom: 12
})

let clusterMunicipios = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});

let markerIcon = L.icon({
    iconUrl: 'css/images/marker-icon.png',
    iconRetinaUrl: 'css/images/marker-icon.png'
});

L.tileLayer.wms('http://{s}.inegi.org.mx/mdmCache/service/wms?', {
    attribution: 'Derechos Reservados &copy; INEGI',
    subdomains: ['gaiamapas1', 'gaiamapas2', 'gaiamapas3', 'gaiamapas', 'gaia'],
    format: 'image/jpeg',
    legendlayer: ['c100', 'c101', 'c102', 'c102-r', 't700', 'c102m', 'c103', 'c109', 'c110', 'c111', 'c112', 'c200', 'c201', 'c202', 'c203', 'c206', 'c300', 'c301', 'c302', 'c310', 'c311', 'c354', 'c762', 'c793', 'c795'],
    layers: 'MapaBaseTopograficov61_sinsombreado'
}).addTo(mapa)

mapa.scrollWheelZoom.disable();

/**
 * Solicitudes de precarga
 */
 fetch('./api/cat_anios')
    .then(response => response.json())
    .then(data => {
     //console.log(data.cat_anios);
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
 * Interacción con el usuario
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

            console.log(municipios[0]);
            
            // Se agregan los marcadores al grupo con información adicional en
            // caso de que el usuario lo seleccione
            
            // TODO: Realizar el ciclo para el total de marcadores
            clusterMunicipios.addLayer(
                L.marker([municipios[0].lat_dec,municipios[0].lon_dec], {
                  //icon: markerIcon
                })
                .bindPopup('Hola')
            )
            
            // Se agrega la capa al mapa
            clusterMunicipios.addTo(mapa);
        });
});