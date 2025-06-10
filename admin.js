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
    // Formulario
    productForm.addEventListener('submit', handleFormSubmit);
    
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

// Manejar envío del formulario (crear/editar)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productId = document.getElementById('product-id').value;
    
    // Obtener IDs de categorías seleccionadas
    const categoriasSeleccionadas = Array.from(
        document.querySelectorAll('input[name="categorias"]:checked')
    ).map(cb => parseInt(cb.value));
    
    // Construir objeto producto
    const producto = {
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion'),
        precio: parseFloat(formData.get('precio')),
        imagen: formData.get('imagen') || null,
        stock: parseInt(formData.get('stock')),
        categorias: categoriasSeleccionadas // Enviamos array de IDs
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
    
    document.getElementById('product-id').value = producto.id;
    document.getElementById('titulo').value = producto.titulo;
    document.getElementById('descripcion').value = producto.descripcion;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('imagen').value = producto.imagen || '';
    document.getElementById('stock').value = producto.stock;
    
    // Marcar categorías seleccionadas
    if (producto.categorias) {
        document.querySelectorAll('input[name="categorias"]').forEach(checkbox => {
            checkbox.checked = producto.categorias.some(cat => cat.nombre === checkbox.value);
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
    
    // Desmarcar todas las categorías
    document.querySelectorAll('input[name="categorias"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}