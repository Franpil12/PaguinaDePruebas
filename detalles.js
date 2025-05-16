document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const contenedor = document.getElementById("contenedor-detalles");

    if (contenedor && id) {
        fetch(`https://fakestoreapi.com/products/${id}`)
            .then(res => res.json())
            .then(producto => {
                contenedor.innerHTML = `
                    <div class="w-1/2 bg-gray-100 flex items-center justify-center p-8">
                        <img src="${producto.image}" alt="${producto.title}" class="max-h-full object-contain rounded-lg">
                    </div>
                    <div class="w-1/2 p-10 flex flex-col justify-between">
                        <div>
                            <h1 class="text-3xl font-bold mb-4">${producto.title}</h1>
                            <p class="text-green-600 text-2xl font-semibold mb-4">$${producto.price}</p>
                            <p class="text-gray-700 mb-6">${producto.description}</p>
                            <p class="text-sm text-gray-500 italic mb-2">Categoría: ${producto.category}</p>
                        </div>
                        <div>
                            <button onclick="window.history.back()" class="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 mt-4">Volver</button>
                        </div>
                    </div>
                `;
            })
            .catch(err => {
                contenedor.innerHTML = `<p class="text-red-500 m-auto">Error al cargar el producto. Intenta nuevamente.</p>`;
                console.error("Error:", err);
            });
    } else {
        if (contenedor) {
            contenedor.innerHTML = `<p class="text-red-500 m-auto">No se especificó un producto válido.</p>`;
        }
    }
});
