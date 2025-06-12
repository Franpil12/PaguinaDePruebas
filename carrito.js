// js/carrito.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const estaLogueado = localStorage.getItem("logueado") === "true";
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const baseUrl = 'http://127.0.0.1:8000/api'; // Definir la base URL

    // Redirigir si no está logueado
    if (!estaLogueado || !token || !usuario) {
        window.location.href = "login.html";
        return;
    }

    // Elementos del DOM
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');
    const checkoutActions = document.getElementById('checkout-actions');

    // Elementos de la sección de direcciones
    const addressesSelectionContainer = document.getElementById("addresses-selection-container");
    const loadingAddressesMessage = document.getElementById("loading-addresses-message");
    const noAddressesError = document.getElementById("no-addresses-error");
    const addnewAddressRedirectBtn = document.getElementById("add-new-address-redirect-btn");

    // Botón para finalizar pedido
    const checkoutButton = document.getElementById('checkout-button');

    let userAddresses = []; // Para almacenar las direcciones del usuario
    let selectedAddressId = null; // Para almacenar la ID de la dirección seleccionada

    // --- Lógica de Navegación ---
    const authLink = document.getElementById("auth-link");
    const mobileAuthLink = document.getElementById("mobile-auth-link");
    const logoutLink = document.getElementById("logout-link");
    const mobileLogoutLink = document.getElementById("mobile-logout-link");
    const adminLink = document.getElementById("admin-link");
    const mobileAdminLink = document.getElementById("mobile-admin-link");
    const pedidosLink = document.getElementById("pedidos-link");
    const mobilePedidosLink = document.getElementById("mobile-pedidos-link");

    if (authLink) { authLink.href = "inicio.html"; authLink.textContent = "Mi Perfil"; }
    if (mobileAuthLink) { mobileAuthLink.href = "inicio.html"; mobileAuthLink.textContent = "Mi Perfil"; }

    if (usuario.rol === "admin") {
        if (adminLink) { adminLink.classList.remove("hidden"); }
        if (mobileAdminLink) { mobileAdminLink.classList.remove("hidden"); }
        if (pedidosLink) { pedidosLink.classList.remove("hidden"); }
        if (mobilePedidosLink) { mobilePedidosLink.classList.remove("hidden"); }
    } else {
        if (adminLink) { adminLink.classList.add("hidden"); }
        if (mobileAdminLink) { mobileAdminLink.classList.add("hidden"); }
        if (pedidosLink) { pedidosLink.classList.remove("hidden"); }
        if (mobilePedidosLink) { mobilePedidosLink.classList.remove("hidden"); }
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem("token");
        if (!currentToken) {
            console.warn("No hay token para cerrar sesión. Limpiando local storage y redirigiendo.");
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            window.location.href = "index.html";
            return;
        }
        try {
            const response = await fetch(`${baseUrl}/logout`, { // Usar baseUrl
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${currentToken}`,
                    "Accept": "application/json",
                },
            });
            if (!response.ok) {
                console.warn(`Error al cerrar sesión en el servidor (${response.status}). Posiblemente token inválido. Limpiando local storage.`);
            } else {
                console.log("Sesión cerrada en el servidor.");
            }
        } catch (error) {
            console.error("Error de red durante el logout:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("logueado");
            localStorage.removeItem("usuario");
            window.location.href = "index.html";
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

    // --- Lógica del Carrito ---

    async function loadCart() {
        if (!token) {
            console.error('No hay token de autenticación.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/carrito`, { // Usar baseUrl
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400 && data.message === 'Tu carrito está vacío.') {
                    displayEmptyCart();
                } else {
                    throw new Error(data.message || 'Error al cargar el carrito.');
                }
            } else {
                if (data.items && data.items.length > 0) {
                    displayCartItems(data.items);
                    updateCartTotal(data.total);
                    emptyCartMessage.classList.add('hidden');
                    cartContent.classList.remove('hidden');
                    checkoutActions.classList.remove('hidden');
                } else {
                    displayEmptyCart();
                }
            }
            updateCheckoutButtonState();
        } catch (error) {
            console.error('Error de red o del servidor al cargar el carrito:', error);
            alert(`Error al cargar el carrito: ${error.message}`);
            displayEmptyCart();
            updateCheckoutButtonState();
        }
    }

    function displayCartItems(items) {
        cartItemsContainer.innerHTML = '';
        if (items.length === 0) {
            displayEmptyCart();
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-gray-50';

            const precioNumerico = parseFloat(item.precio);

            itemDiv.innerHTML = `
                <div class="flex items-center space-x-4 mb-4 md:mb-0">
                    <img src="${item.imagen}" alt="${item.titulo}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <h3 class="text-lg font-semibold">${item.titulo}</h3>
                        <p class="text-gray-600">$${precioNumerico.toFixed(2)}</p>
                        <p class="text-gray-500 text-sm">Stock disponible: ${item.stock_disponible}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 w-full md:w-auto justify-end">
                    <input type="number"
                            class="quantity-input w-20 p-2 border rounded-md text-center"
                            value="${item.cantidad_en_carrito}"
                            min="1"
                            max="${item.stock_disponible}" data-product-id="${item.id}"
                            data-original-quantity="${item.cantidad_en_carrito}">
                    <p class="text-lg font-bold text-blue-600">$${(precioNumerico * item.cantidad_en_carrito).toFixed(2)}</p>
                    <button class="remove-item-btn bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                            data-product-id="${item.id}">
                        Eliminar
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', updateCartItem);
        });
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', removeCartItem);
        });
    }

    function updateCartTotal(total) {
        cartTotalElement.textContent = total.toFixed(2);
    }

    function displayEmptyCart() {
        emptyCartMessage.classList.remove('hidden');
        cartContent.classList.add('hidden');
        checkoutActions.classList.add('hidden');
        addressesSelectionContainer.innerHTML = ''; // Limpiar direcciones también
        loadingAddressesMessage.classList.add('hidden');
        noAddressesError.classList.remove('hidden'); // Mostrar mensaje de que no hay direcciones si el carrito está vacío
        noAddressesError.textContent = 'No tienes direcciones registradas o tu carrito está vacío. Agrega productos y una dirección para finalizar un pedido.';
    }

    async function updateCartItem(event) {
        const input = event.target;
        const productId = input.dataset.productId;
        const newQuantity = parseInt(input.value);
        const maxStock = parseInt(input.max);

        if (isNaN(newQuantity) || newQuantity < 1) {
            alert('La cantidad debe ser al menos 1.');
            input.value = input.dataset.originalQuantity;
            return;
        }

        if (newQuantity > maxStock) {
            alert(`No puedes añadir más de ${maxStock} unidades. Stock disponible excedido.`);
            input.value = maxStock;
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/carrito/update`, { // Usar baseUrl
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    producto_id: productId,
                    cantidad: newQuantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.stock_disponible !== undefined) {
                    input.max = data.stock_disponible;
                    if (newQuantity > data.stock_disponible) {
                        input.value = data.stock_disponible;
                    }
                }
                throw new Error(data.message || 'Error al actualizar el producto en el carrito.');
            }

            input.dataset.originalQuantity = newQuantity;
            await loadCart(); // Recarga el carrito para ver el nuevo subtotal y total
        } catch (error) {
            console.error('Error al actualizar el producto en el carrito:', error);
            alert(`Error al actualizar el carrito: ${error.message}`);
            input.value = input.dataset.originalQuantity; // Revertir a la cantidad original en caso de error
        }
    }

    async function removeCartItem(event) {
        const button = event.target;
        const productId = button.dataset.productId;

        if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/carrito/remove`, { // Usar baseUrl
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ producto_id: productId })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar el producto del carrito.');
            }

            await loadCart(); // Recarga el carrito
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            alert(`Error al eliminar: ${error.message}`);
        }
    }

    // --- Lógica de Direcciones ---

    async function loadUserAddresses() {
        loadingAddressesMessage.classList.remove('hidden');
        addressesSelectionContainer.innerHTML = ''; // Limpiar contenedor
        noAddressesError.classList.add('hidden'); // Ocultar error previo

        try {
            const response = await fetch(`${baseUrl}/direcciones`, { // Usar baseUrl
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar las direcciones.');
            }

            loadingAddressesMessage.classList.add('hidden');
            userAddresses = data.direcciones; // Guardar las direcciones

            if (userAddresses && userAddresses.length > 0) {
                userAddresses.forEach(address => {
                    const addressDiv = document.createElement('div');
                    addressDiv.className = 'flex items-start p-3 border rounded-md bg-white shadow-sm';
                    addressDiv.innerHTML = `
                        <input type="radio" name="shipping_address" id="address-${address.id}" value="${address.id}" class="mt-1 mr-2 cursor-pointer">
                        <label for="address-${address.id}" class="flex-1 cursor-pointer">
                            <p class="font-semibold">${address.direccion}, ${address.ciudad}, ${address.provincia}</p>
                            <p class="text-sm text-gray-600">Teléfono: ${address.telefono || 'N/A'}</p>
                        </label>
                    `;
                    addressesSelectionContainer.appendChild(addressDiv);
                });

                // Añadir event listener para la selección de dirección
                document.querySelectorAll('input[name="shipping_address"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        selectedAddressId = parseInt(e.target.value);
                        updateCheckoutButtonState(); // Actualizar estado del botón al seleccionar dirección
                    });
                });

                // Seleccionar la primera dirección por defecto si existe y no hay una seleccionada
                // Esto es importante para que el botón de checkout se habilite si ya hay una dirección
                if (userAddresses.length > 0 && !selectedAddressId) {
                    const firstAddressRadio = document.getElementById(`address-${userAddresses[0].id}`);
                    if (firstAddressRadio) {
                        firstAddressRadio.checked = true;
                        selectedAddressId = userAddresses[0].id;
                    }
                }

            } else {
                noAddressesError.classList.remove('hidden');
                noAddressesError.textContent = 'No tienes direcciones registradas. Por favor, agrega una para continuar con la compra.';
            }

            updateCheckoutButtonState(); // Actualizar estado del botón después de cargar direcciones
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
            loadingAddressesMessage.classList.add('hidden');
            noAddressesError.classList.remove('hidden');
            noAddressesError.innerHTML = `No se pudieron cargar las direcciones: ${error.message}. Por favor, asegúrate de tener direcciones registradas en tu <a href="inicio.html" class="text-blue-600 hover:underline">Perfil</a>.`;
            updateCheckoutButtonState();
        }
    }

    // Función para actualizar el estado del botón de checkout
    function updateCheckoutButtonState() {
        const hasCartItems = cartItemsContainer.querySelectorAll('.flex').length > 0; // Verifica si hay divs de ítems
        const isCartEmptyDisplayed = emptyCartMessage.classList.contains('hidden') === false; // ¿Está visible el mensaje de carrito vacío?

        const finalHasCartItems = hasCartItems && !isCartEmptyDisplayed; // Solo si hay items Y el mensaje de vacío NO está visible

        const hasSelectedAddress = selectedAddressId !== null;
        
        // Habilitar si hay items en el carrito Y una dirección seleccionada
        checkoutButton.disabled = !(finalHasCartItems && hasSelectedAddress);
    }


    // Redirigir a la página para añadir dirección
    if (addnewAddressRedirectBtn) {
        addnewAddressRedirectBtn.addEventListener('click', () => {
            window.location.href = 'inicio.html'; // Redirige al perfil donde se gestionan las direcciones
        });
    }

    // Event listener para el botón de Finalizar Pedido
    checkoutButton.addEventListener('click', async () => {
        if (!selectedAddressId) {
            alert('Por favor, selecciona una dirección de envío.');
            return;
        }

        // --- INICIO DE LA SECCIÓN CRÍTICA ---
        // Obtener los productos del carrito tal como los tiene el frontend
        const currentCartElements = cartItemsContainer.querySelectorAll('.flex.flex-col.md\\:flex-row'); // Selecciona los divs de ítems del carrito

        // Comprobación para asegurarse de que no estamos procesando un carrito visualmente vacío
        // Aunque displayEmptyCart ya oculta cartContent, es buena práctica volver a verificar.
        if (currentCartElements.length === 0 || emptyCartMessage.classList.contains('hidden') === false) {
             alert('Tu carrito está vacío. No puedes finalizar un pedido.');
             return;
        }

        const cartItemsForOrder = [];
        let hasErrorInCartItems = false; // Bandera para detectar errores en la iteración

        currentCartElements.forEach(itemDiv => {
            const quantityInput = itemDiv.querySelector('.quantity-input');
            const removeButton = itemDiv.querySelector('.remove-item-btn'); // También verificamos el botón

            // **IMPORTANTE: Verificar si quantityInput existe antes de acceder a dataset**
            if (quantityInput && quantityInput.dataset && quantityInput.dataset.productId) {
                const productId = quantityInput.dataset.productId;
                const quantity = parseInt(quantityInput.value);
                
                // Opcional: una validación adicional para asegurarnos de que la cantidad es válida
                if (isNaN(quantity) || quantity < 1) {
                    alert(`Error: La cantidad para el producto ID ${productId} no es válida.`);
                    hasErrorInCartItems = true;
                    return; // Salir de este forEach
                }
                cartItemsForOrder.push({ id: parseInt(productId), cantidad: quantity });
            } else {
                console.error("Error: Elemento de carrito no encontrado con la estructura esperada (falta .quantity-input o data-product-id).", itemDiv);
                alert("Error interno: Un producto en tu carrito no pudo ser procesado correctamente. Por favor, recarga la página.");
                hasErrorInCartItems = true;
                // No retornar aquí para que el forEach pueda continuar, pero la bandera asegura que no se envíe el pedido
            }
        });

        // Si se encontró algún error al procesar los ítems del carrito, detener el envío
        if (hasErrorInCartItems) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Pedido';
            return;
        }
        // --- FIN DE LA SECCIÓN CRÍTICA ---


        if (cartItemsForOrder.length === 0) {
            alert('Tu carrito está vacío. No puedes finalizar un pedido.');
            return;
        }

        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Procesando pedido...';

        try {
            const response = await fetch(`${baseUrl}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    direccion_id: selectedAddressId,
                    productos: cartItemsForOrder
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    let errorMessage = 'Error de validación: \n';
                    for (const key in data.errors) {
                        errorMessage += data.errors[key].join(', ') + '\n';
                    }
                    alert(errorMessage);
                } else if (data.status === 'stock_error' && data.stock_errors) {
                    const productsInError = data.stock_errors.map(err =>
                        `${err.titulo} (Stock disponible: ${err.stock_disponible}, Requerido: ${err.cantidad_requerida})`
                    ).join('\n');
                    alert(`No hay suficiente stock para los siguientes productos:\n${productsInError}\nPor favor, ajusta las cantidades en tu carrito.`);
                }
                else {
                    throw new Error(data.message || 'Error al finalizar el pedido.');
                }
            } else {
                alert('¡Pedido realizado con éxito!\nID del Pedido: ' + data.pedido.id);
                // La limpieza del carrito ahora está en el backend al crear el pedido,
                // así que la llamada explícita a /api/carrito/clear NO ES NECESARIA aquí.
                // Si la mantienes, asegúrate de que el endpoint /api/carrito/clear exista y funcione.
                // delete this line:
                // await fetch(`${baseUrl}/carrito/clear`, { /* ... */ });
                // console.log("Carrito limpiado en el backend.");
                window.location.href = 'pedidos.html';
            }

        } catch (error) {
            console.error('Error al finalizar el pedido:', error);
            alert('Hubo un problema al finalizar tu pedido: ' + error.message);
        } finally {
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Pedido';
            // Recargar el carrito y direcciones para reflejar el estado actual
            // Esto es crucial para que el usuario vea el carrito vacío y las direcciones actualizadas
            await loadCart();
            await loadUserAddresses();
        }
    });


    // --- Inicialización al cargar la página ---
    // Cargar el carrito y las direcciones al iniciar la página
    // Es importante que el carrito se cargue primero para determinar si hay items.
    // Luego se cargan las direcciones, y ambas funciones llaman a updateCheckoutButtonState.
    loadCart();
    loadUserAddresses();
});