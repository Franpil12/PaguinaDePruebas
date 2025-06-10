// Variables globales
let productos = [];
let categorias = [];
const token = localStorage.getItem('token');

// Elementos del DOM
const productForm = document.getElementById('product-form');
const productsTable = document.getElementById('products-table');
const categoriasContainer = document.getElementById('categorias-container');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');



// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación y rol de admin
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!localStorage.getItem('logueado')) {
        window.location.href = 'login.html';
    }
    
    if (usuario.rol !== 'admin') {
        alert('No tienes permisos para acceder a esta página');
        window.location.href = 'index.html';
    }

    cargarProductos();
    cargarCategorias();
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
}

// Cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/productos', {
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
        const response = await fetch('http://127.0.0.1:8000/api/categorias');
        
        if (!response.ok) throw new Error('Error al cargar categorías');
        
        categorias = await response.json();
        renderCategoriasCheckboxes();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar categorías');
    }
}

// Renderizar productos en la tabla
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

// Renderizar checkboxes de categorías
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



// Manejar envío del formulario (crear/editar)
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
        const url = 'http://127.0.0.1:8000/api/productos';

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
        await cargarProductos();
        renderProductos();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}



// Cargar producto para editar
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



// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        await cargarProductos();
        renderProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}

// Resetear formulario
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

const storage = firebase.storage();
console.log("🔥 Firebase Storage inicializado:", storage);