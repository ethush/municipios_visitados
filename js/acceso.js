/**
 * Usado para validar el acceso a la aplicación y enviarlo al panel
 * de administración
 * @returns {undefined}
 * 
 */
fetch('./api/validaSesion')
    .then(response => response.json())
    .then(data => {
        if (!data.error) {
            window.location = './panel/gestor.html';
        }
    });