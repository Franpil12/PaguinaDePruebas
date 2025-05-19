const contenedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

let Aproductos = [];
let categoriaSeleccionada = "all";

async function cargarProductos() {
    try {
        mostrarMensaje("Cargando productos...");
        const respuesta = await fetch("https://fakestoreapi.com/products");
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
        const respuesta = await fetch("https://fakestoreapi.com/products/categories");
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
        filtrados = filtrados.filter(p => p.category === categoriaSeleccionada);
    }

    if (texto.trim() !== "") {
        filtrados = filtrados.filter(p =>
            p.title.toLowerCase().includes(texto) ||
            p.description.toLowerCase().includes(texto)
        );
    }

    mostrarProductos(filtrados);
}

function mostrarMensaje(mensaje) {
    contenedorProductos.innerHTML = `<p class="text-center col-span-full text-gray-500">${mensaje}</p>`;
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300";
        productoDiv.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}" class="w-32 h-32 object-cover mb-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">${producto.title}</h2>
            <p class="text-green-700 mb-2">$${producto.price}</p>
            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-2">Agregar al carrito</button>
            <button class="detalle-btn bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300">Detalles</button>
        `;

        const botonDetalles = productoDiv.querySelector(".detalle-btn");
        botonDetalles.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${producto.id}`;
        });

        contenedorProductos.appendChild(productoDiv);
    });
}

function mostrarCategorias(categorias) {
    contenedorCategorias.innerHTML = "";
    categorias.forEach((cat) => {
        const btn = document.createElement("button");
        const textoBoton = cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1);
        const claseActiva = categoriaSeleccionada === cat ? "bg-blue-700" : "bg-blue-500";

        btn.textContent = textoBoton;
        btn.className = `px-4 py-2 rounded-full text-white ${claseActiva} hover:bg-blue-600 transition-colors duration-300`;

        btn.addEventListener("click", () => {
            categoriaSeleccionada = cat;
            mostrarCategorias(categorias);
            filtrarProductos();
        });

        contenedorCategorias.appendChild(btn);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarCategorias();
    inputBusqueda.addEventListener("input", filtrarProductos);
});

// Verifica si el usuario está logueado al entrar a la página
document.addEventListener("DOMContentLoaded", () => {
  const estaLogueado = localStorage.getItem("logueado");

  // Si no está logueado, lo redirige al login
  if (!estaLogueado) {
    window.location.href = "login.html";
  }

  // Asigna la función al enlace de logout si existe
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();

      // Borrar todo lo relacionado al login
      localStorage.removeItem("token");
      localStorage.removeItem("logueado");
      localStorage.removeItem("usuario");

      // Redirigir al login
      window.location.href = "login.html";
    });
  }
});

// Coneccion al html contacto


document.addEventListener("DOMContentLoaded", () => {
  const contactoLink = document.getElementById("contacto-link");
  if (contactoLink) {
    contactoLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "contacto.html";
    });
  }
});