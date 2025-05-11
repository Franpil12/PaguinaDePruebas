const contenedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");
//pobre mi gatito alguien lo ha pegado por comeloncito ahora esta llorando ay mi gatito miau miau 

let Aproductos = [];
let categoriaSeleccionada = "all";

async function cargarProductos(){
    try{
        mostrarMensaje("Cargando productos...");
        const respuesta = await fetch("https://fakestoreapi.com/products");
        if(!respuesta.ok){
            throw new Error("Error en la respuesta de la API");        
        }    

        const productos = await respuesta.json();
        Aproductos = productos; 

        if(productos.length === 0){
            console.log("No hay productos disponibles");
        } else{
            mostrarProductos(productos);
        }

        }catch(error){
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
        
        //mostrarCategorias
        mostrarCategorias(["all", ...categorias]);

        
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
    }
}




async function filtrarProductos() {
    let filtrados = Aproductos;
    const texto = inputBusqueda.value.toLowerCase()

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
    contenedorProductos.innerHTML = `
    <p class="text-center col-span-full text-gray-500">${mensaje}</p>`;
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos productos
    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300";
        productoDiv.innerHTML = `
        <img src="${producto.image}" alt="${producto.title}" class="w-32 h-32 object-cover mb-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">${producto.title}</h2>
        <p class="text-gray-700 mb-2">$${producto.price}</p>
        <p class="text-gray-600 mb-4">${producto.description}</p>
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">Agregar al carrito</button>
        `;
        contenedorProductos.appendChild(productoDiv);
    });

}


function mostrarCategorias(categorias) {
    contenedorCategorias.innerHTML = "";
  
    categorias.forEach((cat) => {
      const btn = document.createElement("button");
  
      // Mostrar "Todos" si es la categoría "all"
      const textoBoton = cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.textContent = textoBoton;
  
      // Clase activa si es la categoría seleccionada
      const claseActiva = categoriaSeleccionada === cat ? "bg-blue-700" : "bg-blue-500";
  
      btn.className = `px-4 py-2 rounded-full text-white ${claseActiva} hover:bg-blue-600 transition-colors duration-300`;
  
      btn.addEventListener("click", () => {
        categoriaSeleccionada = cat;
        mostrarCategorias(categorias); // Actualiza estilos
        filtrarProductos();
      });
  
      contenedorCategorias.appendChild(btn); // DEBE estar dentro del forEach
    });
  }


// Llamar a la función para cargar los productos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarCategorias();
});



inputBusqueda.addEventListener('input', filtrarProductos);
  


