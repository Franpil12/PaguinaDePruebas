// js/agregar_direccion.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-agregar-direccion");
    const mensajeError = document.getElementById("mensaje-error");
    const mensajeExito = document.getElementById("mensaje-exito");

    // Función para mostrar mensajes
    function mostrarMensaje(elemento, mensaje, tipo) {
        elemento.textContent = mensaje;
        if (tipo === "error") {
            elemento.classList.remove("hidden", "bg-green-100", "border-green-400", "text-green-700");
            elemento.classList.add("bg-red-100", "border-red-400", "text-red-700");
        } else if (tipo === "exito") {
            elemento.classList.remove("hidden", "bg-red-100", "border-red-400", "text-red-700");
            elemento.classList.add("bg-green-100", "border-green-400", "text-green-700");
        }
        elemento.classList.remove("hidden");
    }

    // Limpiar mensajes
    function limpiarMensajes() {
        mensajeError.classList.add("hidden");
        mensajeExito.classList.add("hidden");
        mensajeError.textContent = "";
        mensajeExito.textContent = "";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        limpiarMensajes();

        const token = localStorage.getItem("token");
        if (!token) {
            mostrarMensaje(mensajeError, "No estás autenticado. Por favor, inicia sesión.", "error");
            // Opcional: redirigir al login
            // setTimeout(() => { window.location.href = "login.html"; }, 2000);
            return;
        }

        const direccion = document.getElementById("direccion").value.trim();
        const ciudad = document.getElementById("ciudad").value.trim();
        const provincia = document.getElementById("provincia").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        if (!direccion || !ciudad || !provincia || !telefono) {
            mostrarMensaje(mensajeError, "Por favor, completa todos los campos.", "error");
            return;
        }

        try {
            const respuesta = await fetch("http://127.0.0.1:8000/api/direcciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    direccion: direccion,
                    ciudad: ciudad,
                    provincia: provincia,
                    telefono: telefono
                }),
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                mostrarMensaje(mensajeExito, data.message || "Dirección guardada exitosamente.", "exito");
                form.reset(); // Limpiar el formulario
                // Opcional: redirigir a inicio.html después de un breve retraso
                setTimeout(() => {
                    window.location.href = "inicio.html";
                }, 2000);
            } else {
                let errorMessage = data.message || "Error al guardar la dirección.";
                if (data.errors) {
                    // Concatenar mensajes de error de validación
                    errorMessage += "\n" + Object.values(data.errors).map(err => err.join(", ")).join("\n");
                }
                mostrarMensaje(mensajeError, errorMessage, "error");
            }
        } catch (error) {
            console.error("Error al enviar la dirección:", error);
            mostrarMensaje(mensajeError, "Hubo un problema al conectar con el servidor.", "error");
        }
    });
});