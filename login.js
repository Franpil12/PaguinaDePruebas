const form = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensajeError.classList.add("hidden");
  mensajeError.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    mostrarError("Por favor, completa ambos campos.");
    return;
  }

  try {
    const respuesta = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        email: email,
        password: password 
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || "Credenciales inválidas");
    }

    // Almacenamiento seguro de la sesión
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("logueado", "true");
    localStorage.setItem("usuario", JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      rol: data.user.rol
    }));

    // Redirección según rol
    redirigirSegunRol(data.user.rol);

  } catch (error) {
    mostrarError(error.message);
    console.error("Error en login:", error);
  }
});

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove("hidden");
}

function redirigirSegunRol(rol) {
  // Todos los usuarios (admin y normales) van a index.html
  window.location.href = "index.html";
}