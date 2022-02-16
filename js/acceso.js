fetch('./api/validaSesion')
    .then(response => response.json())
    .then(data => {
        if (!data.error) {
            window.location = './panel/gestor.html';
        }
    });