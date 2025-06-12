// js/inicio.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const estaLogueado = localStorage.getItem("logueado") === "true";
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Validar sesión para esta página de perfil
    if (!estaLogueado || !token || !usuario) {
        window.location.href = "login.html"; // Redirigir si no está logueado
        return;
    }

    // Elementos de la barra de navegación (copia de app.js)
    const authLink = document.getElementById("auth-link");
    const mobileAuthLink = document.getElementById("mobile-auth-link");
    const logoutLink = document.getElementById("logout-link");
    const mobileLogoutLink = document.getElementById("mobile-logout-link");
    const adminLink = document.getElementById("admin-link");
    const mobileAdminLink = document.getElementById("mobile-admin-link");
    const pedidosLink = document.getElementById("pedidos-link");
    const mobilePedidosLink = document.getElementById("mobile-pedidos-link");

    // Lógica para los enlaces de navegación en esta página (siempre "Mi Perfil" y "Logout")
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

    // Funcionalidad de Logout (duplicada, se podría refactorizar a un archivo de utilidades)
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
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
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

    // Menú móvil
    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // --- Lógica específica de la página de perfil (inicio.html) ---
    const userNameElement = document.getElementById("user-name");
    const userEmailElement = document.getElementById("user-email");
    const userRoleElement = document.getElementById("user-role");
    const addressesContainer = document.getElementById("addresses-container");
    const noAddressesMessage = document.getElementById("no-addresses-yet");
    const addAddressBtn = document.getElementById("add-address-btn");

    // Mostrar información del usuario
    if (userNameElement) userNameElement.textContent = usuario.name;
    if (userEmailElement) userEmailElement.textContent = usuario.email;
    if (userRoleElement) userRoleElement.textContent = usuario.rol;

    // Función para cargar y mostrar direcciones
    async function loadUserAddresses() {
        if (!token) {
            addressesContainer.innerHTML = '<p class="text-red-500">No autorizado. Por favor, inicia sesión.</p>';
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/direcciones', {
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

            addressesContainer.innerHTML = ''; // Limpiar mensajes de carga

            if (data.direcciones && data.direcciones.length > 0) {
                data.direcciones.forEach(address => {
                    const addressDiv = document.createElement('div');
                    addressDiv.className = 'p-3 border rounded-md bg-gray-50';
                    addressDiv.innerHTML = `
                        <p><strong>Dirección:</strong> ${address.direccion}</p>
                        <p><strong>Ciudad:</strong> ${address.ciudad}</p>
                        <p><strong>Provincia:</strong> ${address.provincia}</p>
                        <p><strong>Teléfono:</strong> ${address.telefono}</p>
                        `;
                    addressesContainer.appendChild(addressDiv);
                });
                noAddressesMessage.classList.add('hidden'); // Ocultar si hay direcciones
            } else {
                noAddressesMessage.classList.remove('hidden'); // Mostrar mensaje si no hay direcciones
                noAddressesMessage.textContent = 'Aún no tienes direcciones registradas.';
            }

        } catch (error) {
            console.error('Error al cargar direcciones:', error);
            addressesContainer.innerHTML = `<p class="text-red-500">No se pudieron cargar las direcciones: ${error.message}</p>`;
        }
    }

    // Event listener para el botón de agregar dirección (redirigir a un formulario)
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {
            alert('Serás redirigido para agregar una nueva dirección.');
            window.location.href = 'agregar_direccion.html'; // Puedes crear esta página después
        });
    }

    // Cargar direcciones al inicio de la página de perfil
    loadUserAddresses();
});