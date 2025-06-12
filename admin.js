// Variables globales
let productos = [];
let categorias = [];
let pedidos = []; // Nueva variable para almacenar los pedidos
const token = localStorage.getItem('token');
const baseUrl = 'http://127.0.0.1:8000/api'; // Definir la URL base de la API aquí

// Elementos del DOM de productos
const productForm = document.getElementById('product-form');
const productsTable = document.getElementById('products-table');
const categoriasContainer = document.getElementById('categorias-container');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

// Nuevos elementos del DOM para pedidos
const pedidosTable = document.getElementById('pedidos-table');
const noPedidosAdminMessage = document.getElementById('no-pedidos-admin-message');
const loadingPedidosAdminMessage = document.getElementById('loading-pedidos-admin-message');
const errorPedidosAdminMessage = document.getElementById('error-pedidos-admin-message');


// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación y rol de admin
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!localStorage.getItem('logueado')) {
        window.location.href = 'login.html';
        return; // Detener la ejecución si no está logueado
    }
    
    if (usuario.rol !== 'admin') {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = 'index.html';
        return; // Detener la ejecución si no es admin
    }

    cargarProductos();
    cargarCategorias();
    cargarPedidos(); // ¡NUEVO! Cargar pedidos al inicio
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Botón cancelar
    cancelBtn.addEventListener('click', resetForm);

    // Botón Volver
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Logout
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('logueado');
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    });
    
    // Event listener para el formulario de productos (ya existente)
    productForm.addEventListener('submit', (e) => {
        const fileInput = document.getElementById('imagen');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (!file.type.match('image.*')) {
                alert('Por favor, sube solo archivos de imagen');
                e.preventDefault();
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('La imagen es demasiado grande (máximo 5MB)');
                e.preventDefault();
                return;
            }
        }
        
        submitBtn.disabled = true; // 👈 Deshabilita el botón para evitar doble ejecución
        handleFormSubmit(e).finally(() => {
            submitBtn.disabled = false; // 👈 Reactiva el botón después de que termine el proceso
        });
    });
}

// --- Funciones de Productos (ya existentes, solo se asegura que baseUrl se use) ---

// Cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(`${baseUrl}/productos`, { // Usar baseUrl
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();
        renderProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar productos');
    }
}

// Cargar categorías desde la API
async function cargarCategorias() {
    try {
        const response = await fetch(`${baseUrl}/categorias`); // Usar baseUrl
        
        if (!response.ok) throw new Error('Error al cargar categorías');
        
        categorias = await response.json();
        renderCategoriasCheckboxes();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar categorías');
    }
}

// Renderizar productos en la tabla (no se modifica)
function renderProductos() {
    productsTable.innerHTML = '';
    
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        
        // Obtener nombres de categorías
        const categoriasNames = producto.categorias?.map(c => c.nombre).join(', ') || '';
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${producto.imagen || 'https://via.placeholder.com/50'}" alt="${producto.titulo}" 
                     class="h-10 w-10 rounded-full object-cover">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${producto.titulo}</div>
                <div class="text-sm text-gray-500">${categoriasNames}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                $${parseFloat(producto.precio).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${producto.stock}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="edit-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${producto.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="delete-btn text-red-600 hover:text-red-900" data-id="${producto.id}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
        
        productsTable.appendChild(tr);
    });

    // Agregar eventos a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => cargarProductoParaEditar(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => eliminarProducto(btn.dataset.id));
    });
}

// Renderizar checkboxes de categorías (no se modifica)
function renderCategoriasCheckboxes() {
    categoriasContainer.innerHTML = '';
    
    categorias.forEach(categoria => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        
        div.innerHTML = `
            <input type="checkbox" id="cat-${categoria.id}" 
                   name="categorias" 
                   value="${categoria.id}"
                   class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
            <label for="cat-${categoria.id}" class="ml-2 block text-sm text-gray-700">
                ${categoria.nombre}
            </label>
        `;
        
        categoriasContainer.appendChild(div);
    });
}

// Funciones de Firebase Storage (no se modifican)
async function subirImagenAStorage(file) {
    return new Promise((resolve, reject) => {
        try {
            console.log("📁 Archivo recibido para subir:", file);

            if (!storage) {
                console.error("⚠️ Firebase Storage no está inicializado.");
                reject("Firebase Storage no está inicializado.");
                return;
            }

            document.getElementById('upload-progress').classList.remove('hidden');

            // Normalizar el nombre del archivo
            const nombreArchivoSeguro = file.name.replace(/\s+/g, "_");
            console.log("🔍 Nombre de archivo formateado:", nombreArchivoSeguro);

            const storageRef = storage.ref();
            const imageRef = storageRef.child(`imagenes/${Date.now()}-${nombreArchivoSeguro}`);

            console.log("🚀 Iniciando subida...");
            const uploadTask = imageRef.put(file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById('progress-bar').style.width = `${progress}%`;
                    document.getElementById('progress-text').textContent = `Subiendo imagen: ${Math.round(progress)}%`;
                    console.log(`⬆️ Progreso: ${Math.round(progress)}%`);
                },
                (error) => {
                    console.error("❌ Error al subir imagen:", error);
                    document.getElementById('upload-progress').classList.add('hidden');
                    reject(error);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        console.log("✅ Imagen subida correctamente. URL:", downloadURL);
                        document.getElementById('upload-progress').classList.add('hidden');
                        resolve(downloadURL);
                    }).catch((error) => {
                        console.error("❌ Error obteniendo la URL de la imagen:", error);
                        reject(error);
                    });
                }
            );
        } catch (error) {
            console.error("❌ Error inesperado en subirImagenAStorage:", error);
            reject(error);
        }
    });
}


async function eliminarImagenAnterior(urlImagen) {
    try {
        if (!urlImagen) return; // Si no hay imagen previa, salir

        // Obtener solo el nombre del archivo desde la URL
        const nombreImagen = decodeURIComponent(urlImagen.split("/o/")[1].split("?")[0]);

        const storageRef = storage.ref().child(nombreImagen);
        await storageRef.delete(); // Eliminar imagen anterior en Firebase Storage

        console.log("🗑️ Imagen anterior eliminada:", nombreImagen);
    } catch (error) {
        console.error("❌ Error al eliminar imagen anterior:", error);
    }
}


// Manejar envío del formulario (crear/editar) (no se modifica)
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(productForm);
    const productId = document.getElementById('product-id').value;
    const productoActual = productId ? productos.find(p => p.id == productId) : null;

    // Obtener IDs de categorías seleccionadas
    const categoriasSeleccionadas = Array.from(
        document.querySelectorAll('input[name="categorias"]:checked')
    ).map(cb => parseInt(cb.value));

    // SUBIR IMAGEN A STORAGE solo si hay una nueva imagen seleccionada
    let imagenURL = productoActual?.imagen || null; // Mantener la imagen actual por defecto
    const fileInput = document.getElementById('imagen');

    if (fileInput.files.length > 0) {
        try {
            // 🗑️ Si hay una imagen previa, eliminarla antes de subir la nueva
            if (productoActual?.imagen) {
                await eliminarImagenAnterior(productoActual.imagen);
            }

            // 🚀 Subir la nueva imagen a Firebase Storage
            imagenURL = await subirImagenAStorage(fileInput.files[0]);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir imagen. Intenta nuevamente.');
            return;
        }
    }

    // Construir objeto producto
    const producto = {
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion'),
        precio: parseFloat(formData.get('precio')),
        imagen: imagenURL, // Ahora es la URL del Storage
        stock: parseInt(formData.get('stock')),
        categorias: categoriasSeleccionadas
    };

    try {
        let response;
        const url = `${baseUrl}/productos`; // Usar baseUrl

        const options = {
            method: productId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        };

        if (productId) {
            response = await fetch(`${url}/${productId}`, options);
        } else {
            response = await fetch(url, options);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la solicitud');
        }

        resetForm();
        await cargarProductos(); // Recargar productos
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}


// Cargar producto para editar (no se modifica)
function cargarProductoParaEditar(id) {
    const producto = productos.find(p => p.id == id);

    if (!producto) return;

    // Rellenar datos básicos
    document.getElementById('product-id').value = producto.id;
    document.getElementById('titulo').value = producto.titulo;
    document.getElementById('descripcion').value = producto.descripcion;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('imagen').value = ''; // Limpiar input file
    document.getElementById('stock').value = producto.stock;

    // Marcar categorías seleccionadas - CORRECCIÓN AQUÍ
    if (producto.categorias) {
        document.querySelectorAll('input[name="categorias"]').forEach(checkbox => {
            // Comparar con el ID de la categoría (checkbox.value es string, cat.id es number)
            checkbox.checked = producto.categorias.some(cat => cat.id == checkbox.value);
        });
    }

    // Cambiar texto del formulario
    formTitle.textContent = `Editar Producto: ${producto.titulo}`;
    submitBtn.textContent = 'Actualizar';
    cancelBtn.style.display = 'inline-flex';
}


// Eliminar producto (no se modifica)
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        // 👉 Obtener el producto que vamos a eliminar
        const producto = productos.find(p => p.id == id);

        // 👉 Si el producto tiene imagen, eliminarla en Firebase Storage primero
        if (producto?.imagen) {
            await eliminarImagenAnterior(producto.imagen);
        }

        const response = await fetch(`${baseUrl}/productos/${id}`, { // Usar baseUrl
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        await cargarProductos(); // Recargar productos
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}

// Resetear formulario (no se modifica)
function resetForm() {
    productForm.reset();
    document.getElementById('product-id').value = '';
    formTitle.textContent = 'Crear Producto';
    submitBtn.textContent = 'Guardar';      
    cancelBtn.style.display = 'none';

    // Desmarcar categorías
    document.querySelectorAll('input[name="categorias"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Limpiar campo de imagen (opcional, por seguridad)
    document.getElementById('imagen').value = '';
}


// --- NUEVAS FUNCIONES PARA GESTIÓN DE PEDIDOS ---

// Cargar pedidos desde la API
async function cargarPedidos() {
    // Mostrar mensaje de carga y ocultar otros
    loadingPedidosAdminMessage.classList.remove('hidden');
    noPedidosAdminMessage.classList.add('hidden');
    errorPedidosAdminMessage.classList.add('hidden');
    pedidosTable.innerHTML = ''; // Limpiar tabla

    try {
        const response = await fetch(`${baseUrl}/admin/pedidos`, { // Usar la ruta correcta para el admin
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            // Manejo de errores de autenticación/autorización
            if (response.status === 401 || response.status === 403) {
                alert('Tu sesión ha expirado o no tienes permisos de administrador. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                localStorage.removeItem('logueado');
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Error al cargar pedidos.');
        }
        
        pedidos = await response.json();
        renderPedidos();

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        errorPedidosAdminMessage.classList.remove('hidden');
        errorPedidosAdminMessage.textContent = 'Error al cargar los pedidos. Por favor, verifica la consola para más detalles.';
    } finally {
        loadingPedidosAdminMessage.classList.add('hidden'); // Ocultar mensaje de carga
    }
}

// Renderizar pedidos en la tabla
function renderPedidos() {
    pedidosTable.innerHTML = ''; // Limpiar tabla antes de renderizar

    if (pedidos.length === 0) {
        noPedidosAdminMessage.classList.remove('hidden');
        return;
    } else {
        noPedidosAdminMessage.classList.add('hidden');
    }

    pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        
        // Formatear fecha (reutiliza la función si existe o crea una nueva simple)
        const fechaFormateada = new Date(pedido.created_at).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // Asegurarse de que el usuario existe y tiene nombre
        const userName = pedido.usuario ? pedido.usuario.name : 'N/A';

        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${pedido.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fechaFormateada}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${parseFloat(pedido.total).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <select class="estado-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" data-id="${pedido.id}">
                    <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="procesando" ${pedido.estado === 'procesando' ? 'selected' : ''}>Procesando</option>
                    <option value="completado" ${pedido.estado === 'completado' ? 'selected' : ''}>Completado</option>
                    <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="view-details-btn text-blue-600 hover:text-blue-900" data-id="${pedido.id}">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </td>
        `;
        pedidosTable.appendChild(tr);
    });

    // Añadir event listeners a los selectores de estado
    document.querySelectorAll('.estado-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const pedidoId = e.target.dataset.id;
            const nuevoEstado = e.target.value;
            actualizarEstadoPedido(pedidoId, nuevoEstado);
        });
    });

    // Añadir event listeners a los botones de ver detalles (opcional, para futuras expansiones)
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pedidoId = e.target.dataset.id;
            // Aquí puedes implementar una función para mostrar un modal con los detalles del pedido
            alert(`Ver detalles del Pedido ID: ${pedidoId}`);
            // console.log('Pedido completo:', pedidos.find(p => p.id == pedidoId));
        });
    });
}

// Actualizar estado del pedido
async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    if (!confirm(`¿Estás seguro de cambiar el estado del pedido #${pedidoId} a "${nuevoEstado.toUpperCase()}"?`)) {
        // Revertir el estado seleccionado en el UI si el usuario cancela
        const originalPedido = pedidos.find(p => p.id == pedidoId);
        if (originalPedido) {
            document.querySelector(`.estado-select[data-id="${pedidoId}"]`).value = originalPedido.estado;
        }
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/admin/pedidos/${pedidoId}/estado`, { // Usar la ruta correcta para actualizar estado
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el estado del pedido.');
        }

        const updatedPedido = await response.json();
        alert(`Estado del pedido #${updatedPedido.id} actualizado a "${updatedPedido.estado.toUpperCase()}"`);
        
        // Actualizar el estado en el array global de pedidos y volver a renderizar
        const index = pedidos.findIndex(p => p.id == pedidoId);
        if (index !== -1) {
            pedidos[index].estado = updatedPedido.estado;
        }
        // Opcional: Recargar todos los pedidos para asegurar consistencia (más lento pero seguro)
        // cargarPedidos();
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        alert(`Error al actualizar el estado del pedido: ${error.message}`);
        // Revertir el estado seleccionado en el UI en caso de error en la API
        const originalPedido = pedidos.find(p => p.id == pedidoId);
        if (originalPedido) {
            document.querySelector(`.estado-select[data-id="${pedidoId}"]`).value = originalPedido.estado;
        }
    }
}

// Inicialización de Firebase Storage (ya existente)
const storage = firebase.storage();
console.log("🔥 Firebase Storage inicializado:", storage);