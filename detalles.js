document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id"); // Obtiene el ID del producto de la URL

    const contenedor = document.getElementById("contenedor-detalles");

    // Lógica para el menú móvil y enlaces de navegación
    const token = localStorage.getItem("token"); // Asumiendo que 'token' es tu auth_token
    const estaLogueado = localStorage.getItem("logueado");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!estaLogueado || !token || !usuario) {
        window.location.href = "login.html";
        return;
    }

    const adminLink = document.getElementById("admin-link");
    const mobileAdminLink = document.getElementById("mobile-admin-link");
    const pedidosLink = document.getElementById("pedidos-link"); // Asegúrate de que este ID exista en tu HTML de detalles.html
    const mobilePedidosLink = document.getElementById("mobile-pedidos-link"); // Asegúrate de que este ID exista en tu HTML de detalles.html

    if (adminLink && mobileAdminLink) {
        if (usuario.rol === "admin") {
            adminLink.classList.remove("hidden");
            mobileAdminLink.classList.remove("hidden");
            adminLink.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "admin.html"; });
            mobileAdminLink.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "admin.html"; });
            // Oculta el enlace de pedidos para admin
            if (pedidosLink) pedidosLink.classList.add("hidden");
            if (mobilePedidosLink) mobilePedidosLink.classList.add("hidden");
        } else {
            adminLink.classList.add("hidden");
            mobileAdminLink.classList.add("hidden");
            // Muestra el enlace de pedidos para usuarios normales
            if (pedidosLink) pedidosLink.classList.remove("hidden");
            if (mobilePedidosLink) mobilePedidosLink.classList.remove("hidden");
        }
    }


    const logoutLink = document.getElementById("logout-link");
    const mobileLogoutLink = document.getElementById("mobile-logout-link");

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Error al cerrar sesión en el servidor");
            }
            console.log("Sesión cerrada en el servidor.");
        } catch (error) {
            console.error("Error durante el logout:", error);
            alert("Hubo un problema al cerrar la sesión. Por favor, inténtalo de nuevo.");
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            window.location.href = "login.html";
        }
    };

    if (logoutLink) { logoutLink.addEventListener("click", handleLogout); }
    if (mobileLogoutLink) { mobileLogoutLink.addEventListener("click", handleLogout); }

    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // --- Lógica de carga de detalles del producto ---
    if (contenedor && id) {
        fetch(`http://127.0.0.1:8000/api/productos/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(producto => {
                // Formatear categorías para mostrar
                const nombresCategorias = Array.isArray(producto.categorias)
                    ? producto.categorias.map(cat => cat.nombre).join(', ')
                    : 'Sin categoría';

                // Renderizar los detalles del producto
                contenedor.innerHTML = `
                    <div class="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
                        <img src="${producto.imagen}" alt="${producto.titulo}" class="max-h-full object-contain rounded-lg">
                    </div>
                    <div class="w-full md:w-1/2 p-10 flex flex-col justify-between">
                        <div>
                            <h1 class="text-3xl font-bold mb-4">${producto.titulo}</h1>
                            <p class="text-green-600 text-2xl font-semibold mb-4">$${producto.precio}</p>
                            <p class="text-gray-700 mb-6">${producto.descripcion}</p>
                            <p class="text-sm text-gray-500 italic mb-2">Categoría: ${nombresCategorias}</p>
                            <p class="text-sm text-gray-500 mb-4">Stock disponible: <span id="producto-stock">${producto.stock}</span> unidades</p>
                        </div>
                        <div>
                            <div class="mb-4">
                                <label for="cantidad" class="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                                <input type="number" id="cantidad" name="cantidad" value="1" min="1" max="${producto.stock}"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    onchange="validarCantidad(this, ${producto.stock})"
                                >
                                <p id="cantidad-error" class="text-red-500 text-xs italic mt-2 hidden">La cantidad no puede superar el stock.</p>
                            </div>

                            <button id="btn-add-to-cart"
                                class="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 mr-2"
                                data-product-id="${producto.id}"
                                data-product-stock="${producto.stock}"
                                data-product-name="${producto.titulo}"
                            >
                                Añadir al Carrito
                            </button>
                            <button onclick="window.history.back()" class="bg-gray-500 text-white px-5 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-300 mt-4">Volver</button>
                        </div>
                    </div>
                `;

                // Añadir evento al botón "Añadir al Carrito"
                const btnAddToCart = document.getElementById("btn-add-to-cart");
                if (btnAddToCart) {
                    btnAddToCart.addEventListener("click", () => {
                        const cantidadInput = document.getElementById("cantidad");
                        const cantidadSeleccionada = parseInt(cantidadInput.value);
                        const productId = btnAddToCart.dataset.productId;
                        const stockDisponible = parseInt(btnAddToCart.dataset.productStock);
                        const productName = btnAddToCart.dataset.productName;


                        if (isNaN(cantidadSeleccionada) || cantidadSeleccionada < 1 || cantidadSeleccionada > stockDisponible) {
                            alert(`Por favor, selecciona una cantidad válida (entre 1 y ${stockDisponible}).`);
                            cantidadInput.value = Math.min(Math.max(1, cantidadSeleccionada), stockDisponible); // Ajusta el valor
                            return;
                        }

                        addToCart(productId, cantidadSeleccionada, productName);
                    });
                }
            })
            .catch(err => {
                contenedor.innerHTML = `<p class="m-auto text-red-500">Error al cargar el producto. Intenta nuevamente.</p>`;
                console.error("Error al cargar detalles del producto:", err);
            });
    } else {
        if (contenedor) {
            contenedor.innerHTML = `<p class="m-auto text-red-500">No se especificó un producto válido.</p>`;
        }
    }
});

// Función para validar la cantidad de entrada con el stock máximo
function validarCantidad(input, maxStock) {
    let valor = parseInt(input.value);
    const errorMsg = document.getElementById("cantidad-error");

    if (isNaN(valor) || valor < 1) {
        input.value = 1;
        errorMsg.classList.add("hidden");
    } else if (valor > maxStock) {
        input.value = maxStock;
        errorMsg.classList.remove("hidden");
    } else {
        errorMsg.classList.add("hidden");
    }
}

// Función asíncrona para añadir el producto al carrito (interactúa con el backend)
async function addToCart(productId, quantity, productName) {
    console.log(`Intentando añadir al carrito: Producto ID ${productId}, Cantidad ${quantity}`);

    try {
        const token = localStorage.getItem('token'); // Asegúrate de que esta clave sea la correcta para tu token de autenticación

        if (!token) {
            alert('Debes iniciar sesión para añadir productos al carrito.');
            return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/carrito/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // Incluye el token de autenticación
            },
            body: JSON.stringify({
                producto_id: productId,
                cantidad: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            // --- ELIMINAR ESTAS LÍNEAS YA NO SE ACTUALIZA EL STOCK VISIBLE AL AÑADIR AL CARRITO ---
            // const stockElement = document.getElementById("producto-stock");
            // if (stockElement && typeof data.nuevo_stock !== 'undefined') {
            //      stockElement.textContent = data.nuevo_stock;
            //      const cantidadInput = document.getElementById("cantidad");
            //      if (cantidadInput) {
            //          cantidadInput.max = data.nuevo_stock;
            //          if (parseInt(cantidadInput.value) > data.nuevo_stock) {
            //              cantidadInput.value = data.nuevo_stock;
            //              validarCantidad(cantidadInput, data.nuevo_stock);
            //          }
            //      }
            // }
            // -------------------------------------------------------------------------------------
        } else {
            alert(`Error al añadir al carrito: ${data.message || 'Error desconocido'}`);
            console.error('Error al añadir al carrito:', data);
        }
    } catch (error) {
        console.error('Error de red o del servidor:', error);
        alert('Hubo un problema al conectar con el servidor. Intenta de nuevo.');
    }
}