const contenedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

let Aproductos = [];
let categoriaSeleccionada = "all";

async function cargarProductos() {
    try {
        mostrarMensaje("Cargando productos...");
        const respuesta = await fetch("http://127.0.0.1:8000/api/productos");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        const productos = await respuesta.json();
        Aproductos = productos;

        if (productos.length === 0) {
            console.log("No hay productos disponibles");
        } else {
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        contenedorProductos.innerHTML = "<p>Error al cargar los productos</p>";
    }
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/categorias");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        const categorias = await respuesta.json();
        mostrarCategorias(["all", ...categorias]);
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
    }
}

async function filtrarProductos() {
    let filtrados = Aproductos;
    const texto = inputBusqueda.value.toLowerCase();

    if (categoriaSeleccionada !== "all") {
        filtrados = filtrados.filter(p =>
            p.categorias.some(cat => cat.nombre === categoriaSeleccionada)
        );
    }

    if (texto.trim() !== "") {
        filtrados = filtrados.filter(p =>
            p.titulo.toLowerCase().includes(texto) ||
            p.descripcion.toLowerCase().includes(texto)
        );
    }

    mostrarProductos(filtrados);
}

function mostrarMensaje(mensaje) {
    contenedorProductos.innerHTML = `<p class="text-center col-span-full text-gray-500">${mensaje}</p>`;
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0) {
        contenedorProductos.innerHTML = "<p class='text-center col-span-full text-gray-500'>No se encontraron productos.</p>";
        return;
    }

    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300";
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" class="w-32 h-32 object-cover mb-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">${producto.titulo}</h2>
            <p class="text-green-700 mb-2">$${producto.precio}</p>
            <button class="add-to-cart-btn bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-2"
                    data-product-id="${producto.id}"
                    data-product-stock="${producto.stock}"
                    data-product-name="${producto.titulo}">
                Agregar al carrito
            </button>
            <button class="detalle-btn bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300">Detalles</button>
        `;

        // Event listener para el botón Detalles
        const botonDetalles = productoDiv.querySelector(".detalle-btn");
        botonDetalles.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${producto.id}`;
        });

        // Event listener para el botón "Agregar al carrito"
        const addToCartBtn = productoDiv.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", () => {
            const productId = addToCartBtn.dataset.productId;
            const productStock = parseInt(addToCartBtn.dataset.productStock);
            const productName = addToCartBtn.dataset.productName;

            const quantity = 1;

            if (productStock < quantity) {
                alert(`Lo sentimos, no hay suficiente stock de "${productName}". Stock disponible: ${productStock}`);
                return;
            }

            addToCart(productId, quantity, productName); // Llama a la función que interactúa con la API
        });

        contenedorProductos.appendChild(productoDiv);
    });
}

function mostrarCategorias(categorias) {
    contenedorCategorias.innerHTML = "";

    categorias.forEach((cat) => {
        const isAll = cat === "all";
        const nombre = isAll ? "Todos" : cat.nombre;
        const valor = isAll ? "all" : cat.nombre;

        const btn = document.createElement("button");
        const claseActiva = categoriaSeleccionada === valor ? "bg-blue-700" : "bg-blue-500";

        btn.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        btn.className = `px-4 py-2 rounded-full text-white ${claseActiva} hover:bg-blue-600 transition-colors duration-300`;

        btn.addEventListener("click", () => {
            categoriaSeleccionada = valor;
            mostrarCategorias(categorias);
            filtrarProductos();
        });

        contenedorCategorias.appendChild(btn);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    // --- Lógica de autenticación y enlaces de navegación ---
    const token = localStorage.getItem("token");
    const estaLogueado = localStorage.getItem("logueado") === "true"; // Asegurarse de que es un booleano
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Elementos de navegación
    const authLink = document.getElementById("auth-link"); // Nuevo ID
    const mobileAuthLink = document.getElementById("mobile-auth-link"); // Nuevo ID móvil
    const logoutLink = document.getElementById("logout-link");
    const adminLink = document.getElementById("admin-link");
    const pedidosLink = document.getElementById("pedidos-link");
    const mobileLogoutLink = document.getElementById("mobile-logout-link");
    const mobileAdminLink = document.getElementById("mobile-admin-link");
    const mobilePedidosLink = document.getElementById("mobile-pedidos-link");

    // Lógica para mostrar/ocultar enlaces de navegación basada en el estado de autenticación y el rol
    if (estaLogueado && token && usuario) {
        // Usuario logueado
        if (authLink) { authLink.href = "inicio.html"; authLink.textContent = "Mi Perfil"; }
        if (mobileAuthLink) { mobileAuthLink.href = "inicio.html"; mobileAuthLink.textContent = "Mi Perfil"; }

        if (logoutLink) { logoutLink.classList.remove("hidden"); }
        if (mobileLogoutLink) { mobileLogoutLink.classList.remove("hidden"); }

        if (usuario.rol === "admin") {
            if (adminLink) { adminLink.classList.remove("hidden"); }
            if (mobileAdminLink) { mobileAdminLink.classList.remove("hidden"); }
            if (pedidosLink) { pedidosLink.classList.remove("hidden"); } 
            if (mobilePedidosLink) { mobilePedidosLink.classList.remove("hidden"); }
        } else {
            if (adminLink) { adminLink.classList.add("hidden"); }
            if (mobileAdminLink) { mobileAdminLink.classList.add("hidden"); }
            if (pedidosLink) { pedidosLink.classList.remove("hidden"); } // Muestra para usuario normal
            if (mobilePedidosLink) { mobilePedidosLink.classList.remove("hidden"); }
        }
    } else {
        // Usuario no logueado
        if (authLink) { authLink.href = "login.html"; authLink.textContent = "Login"; }
        if (mobileAuthLink) { mobileAuthLink.href = "login.html"; mobileAuthLink.textContent = "Login"; }

        if (logoutLink) { logoutLink.classList.add("hidden"); }
        if (adminLink) { adminLink.classList.add("hidden"); }
        if (pedidosLink) { pedidosLink.classList.add("hidden"); }
        if (mobileLogoutLink) { mobileLogoutLink.classList.add("hidden"); }
        if (mobileAdminLink) { mobileAdminLink.classList.add("hidden"); }
        if (mobilePedidosLink) { mobilePedidosLink.classList.add("hidden"); }
    }

    // Funcionalidad de Logout
    const handleLogout = async (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem("token"); // Obtener el token actualizado
        if (!currentToken) {
            console.warn("No hay token para cerrar sesión. Limpiando local storage y redirigiendo.");
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            window.location.href = "index.html"; // Redirigir a la tienda principal
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${currentToken}`,
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                // Si el servidor responde con 401 (Unauthenticated) o 400s, aún así limpiamos el token local
                console.warn(`Error al cerrar sesión en el servidor (${response.status}). Posiblemente token inválido. Limpiando local storage.`);
            } else {
                console.log("Sesión cerrada en el servidor.");
            }
        } catch (error) {
            console.error("Error de red durante el logout:", error);
            // alert("Hubo un problema de conexión al cerrar la sesión. Por favor, inténtalo de nuevo."); // Comenta esto si no quieres un alert en errores de red
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            window.location.href = "index.html"; // Redirigir a la tienda principal
        }
    };

    if (logoutLink) { logoutLink.addEventListener("click", handleLogout); }
    if (mobileLogoutLink) { mobileLogoutLink.addEventListener("click", handleLogout); }

    // Lógica para el botón de menú móvil
    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // --- Carga inicial de productos y categorías ---
    cargarProductos();
    cargarCategorias();
    inputBusqueda.addEventListener("input", filtrarProductos);
});


// Función para añadir al carrito
async function addToCart(productId, quantity, productName) {
    console.log(`Añadiendo al carrito desde la página principal: Producto ID ${productId}, Cantidad ${quantity}`);

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            // Si no hay token, redirige al login y luego vuelve al carrito
            alert('Debes iniciar sesión para añadir productos al carrito. Serás redirigido para iniciar sesión.');
            // Guardar la página actual para redirigir después del login (opcional, pero útil)
            localStorage.setItem('redirect_after_login', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/carrito/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                producto_id: productId,
                cantidad: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`"${productName}" añadido al carrito.`);
        } else {
            alert(`Error al añadir "${productName}" al carrito: ${data.message || 'Error desconocido'}`);
            console.error('Error al añadir al carrito:', data);
        }
    } catch (error) {
        console.error('Error de red o del servidor al añadir al carrito:', error);
        alert('Hubo un problema al conectar con el servidor.');
    }
}

