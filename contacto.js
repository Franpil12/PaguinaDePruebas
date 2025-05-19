function initMap() {
    const ubicacion = { lat: -0.33941, lng: -78.44000 }; // Coordenadas de ejemplo: Buenos Aires

    const mapa = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: ubicacion
    });

    new google.maps.Marker({
        position: ubicacion,
        map: mapa,
        title: "Nuestra ubicación"
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const volverLink = document.getElementById("volver-link");
    if (volverLink) {
        volverLink.addEventListener("click", function () {
        window.location.href = "index.html";
     });
    }
});