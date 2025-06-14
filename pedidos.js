// js/pedidos.js

// URL base de tu API Laravel
const baseUrl = 'http://127.0.0.1:8000/api'; 

// Elementos del DOM para mostrar mensajes y contenido
const pedidosContainer = document.getElementById('pedidos-container');
const loadingMessage = document.getElementById('loading-message');
const noPedidosMessage = document.getElementById('no-pedidos-message');
const errorMessage = document.getElementById('error-message');

// Nuevo elemento del DOM para el botón "Volver a la Tienda"
const backToIndexBtn = document.getElementById('back-to-index-btn');


// --- Funciones de Utilidad ---

// Función para formatear fechas
const formatFecha = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Función para mostrar un mensaje (consistente con app.js)
const mostrarMensaje = (elemento, mensaje, tipo = 'info') => {
    if (elemento) { 
        elemento.textContent = mensaje;
        // Reiniciar clases para asegurar que solo se apliquen las nuevas
        elemento.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800');
        if (tipo === 'success') {
            elemento.classList.add('bg-green-100', 'text-green-800');
        } else if (tipo === 'error') {
            elemento.classList.add('bg-red-100', 'text-red-800');
        } else {
            elemento.classList.add('bg-blue-100', 'text-blue-800');
        }
        elemento.classList.remove('hidden'); // Asegurarse de que sea visible
    } else {
        console.warn(`Elemento de mensaje no encontrado para el tipo: ${tipo}. Mensaje: ${mensaje}`);
    }
};

// --- Funciones de Pedidos ---

// NUEVA FUNCIÓN: Para eliminar un pedido




// Función para renderizar un solo pedido
const renderPedido = (pedido) => {
    const pedidoDiv = document.createElement('div');
    pedidoDiv.classList.add('pedido-item', 'bg-white', 'p-6', 'rounded-lg', 'shadow-md', 'mb-6');
    pedidoDiv.setAttribute('data-pedido-id', pedido.id);

    // Mapeo de estados a clases de Tailwind para colores
    const estadoClasses = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'procesando': 'bg-blue-100 text-blue-800',
        'completado': 'bg-green-100 text-green-800',
        'cancelado': 'bg-red-100 text-red-800',
    };
    const estadoClass = estadoClasses[pedido.estado] || 'bg-gray-100 text-gray-800'; // Default si no hay match

    // Calcular la cantidad total de productos en este pedido
    let totalCantidadProductos = 0;
    if (pedido.productos) {
        totalCantidadProductos = pedido.productos.reduce((sum, item) => sum + item.cantidad, 0);
    }

    // Determinar si el botón de eliminar debe ser visible
    const canDelete = pedido.estado === 'completado' || pedido.estado === 'cancelado';
    const deleteButtonHtml = canDelete 
        ? `<button data-id="${pedido.id}" class="delete-pedido-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-base">Eliminar Pedido</button>`
        : `<button disabled class="bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-md cursor-not-allowed text-base">Eliminar Pedido</button>`; // Botón deshabilitado si no se puede eliminar


    pedidoDiv.innerHTML = `
        <div class="pedido-header flex justify-between items-center p-4 rounded-t-lg">
            <h2 class="text-xl font-semibold text-gray-700">Pedido #${pedido.id}</h2>
            <span class="px-3 py-1 rounded-full text-sm font-medium ${estadoClass}">
                ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
            </span>
        </div>
        <div class="p-4">
            <p class="text-gray-600 mb-2">Fecha: <span class="font-medium">${formatFecha(pedido.created_at)}</span></p>
            <p class="text-gray-600 mb-4">Dirección: <span class="font-medium">
                ${pedido.direccion ? pedido.direccion.direccion : 'Dirección no disponible'},
                ${pedido.direccion ? pedido.direccion.ciudad : 'Ciudad no disponible'},
                ${pedido.direccion ? pedido.direccion.provincia : 'Provincia no disponible'}
            </span></p>
            <p class="text-gray-600 mb-4">Número total de productos: <span class="font-medium">${totalCantidadProductos}</span></p>

            <h3 class="text-lg font-bold text-gray-800 mb-3">Productos:</h3>
            <div class="space-y-4">
                ${pedido.productos.map(item => `
                    <div class="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                        <img src="${item.producto && item.producto.imagen ? item.producto.imagen : 'https://via.placeholder.com/64'}" alt="${item.producto ? item.producto.titulo : 'Producto'}" class="w-16 h-16 object-cover rounded-md">
                        <div class="flex-grow">
                            <p class="font-semibold text-gray-800">${item.producto ? item.producto.titulo : 'Producto Desconocido'}</p>
                            <p class="text-gray-600 text-sm">Cantidad: ${item.cantidad}</p>
                            <p class="text-gray-600 text-sm">Precio unitario: $${parseFloat(item.precio_unitario).toFixed(2)}</p>
                            <p class="font-bold text-blue-600 text-lg">Subtotal: $${parseFloat(item.subtotal).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    pedidosContainer.appendChild(pedidoDiv);

    // Añadir el listener para el botón de eliminar SI es visible
    if (canDelete) {
        const deleteBtn = pedidoDiv.querySelector('.delete-pedido-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deletePedido(pedido.id));
        }
    }
};

// Función principal para cargar los pedidos
const loadPedidos = async () => {
    // 1. Ocultar todos los mensajes al inicio y mostrar el de carga
    if (loadingMessage) loadingMessage.classList.remove('hidden');
    if (noPedidosMessage) noPedidosMessage.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (pedidosContainer) pedidosContainer.innerHTML = ''; // Limpiar cualquier contenido previo

    const token = localStorage.getItem('token'); 

    // --- REGLA DE SEGURIDAD 1: Si no hay token, redirigir al login ---
    if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión para ver tus pedidos.');
        window.location.href = 'login.html'; 
        return; 
    }

    try {
        const response = await fetch(`${baseUrl}/pedidos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // --- REGLA DE SEGURIDAD 2: Manejar errores de autenticación/autorización del servidor ---
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                localStorage.removeItem('logueado');
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
                return; 
            }
            // Si el backend envía un 404 para "no hay pedidos", lo manejamos aquí.
            // Algunos backends podrían devolver un 404 o un 200 con un array vacío.
            // Si tu backend devuelve 404 para no pedidos, esta línea lo atrapará.
            // Para el caso de "no hay pedidos", esperamos un 200 con array vacío.
            throw new Error(data.message || 'Error al obtener los pedidos.');
        }

        // 2. Ocultar mensaje de carga, independientemente del resultado
        if (loadingMessage) loadingMessage.classList.add('hidden'); 

        // 3. Evaluar si hay pedidos
        if (data.pedidos && Array.isArray(data.pedidos) && data.pedidos.length > 0) {
            data.pedidos.forEach(pedido => renderPedido(pedido));
            // Asegurarse de que el mensaje de "no pedidos" esté oculto si hay pedidos
            if (noPedidosMessage) noPedidosMessage.classList.add('hidden');
        } else {
            // No hay pedidos o el array está vacío
            if (noPedidosMessage) noPedidosMessage.classList.remove('hidden'); 
        }

    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
        // Ocultar mensaje de carga y mostrar el de error
        if (loadingMessage) loadingMessage.classList.add('hidden');
        if (errorMessage) {
            mostrarMensaje(errorMessage, 'Hubo un error al cargar tus pedidos: ' + error.message + '. Por favor, inténtalo de nuevo más tarde.', 'error');
        }
        // Asegurarse de que el mensaje de "no pedidos" esté oculto si hay un error
        if (noPedidosMessage) noPedidosMessage.classList.add('hidden');
    }
};

// --- Inicialización al cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    loadPedidos();    // Cargar los pedidos

    // Añadir event listener para el botón "Volver a la Tienda"
    if (backToIndexBtn) {
        backToIndexBtn.addEventListener('click', () => {
            window.location.href = 'index.html'; // Redirigir al index.html
        });
    }
});