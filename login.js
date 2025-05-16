const form = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensajeError.classList.add("hidden");
  mensajeError.textContent = "";

  const username = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    mensajeError.textContent = "Por favor, completa ambos campos.";
    mensajeError.classList.remove("hidden");
    return;
  }

  try {
    const respuesta = await fetch("https://fakestoreapi.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!respuesta.ok) {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    const data = await respuesta.json();

    // Guardamos token y estado de login en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("logueado", "true");
    localStorage.setItem("usuario", username);

    // Redirigir al index.html (página principal)
    window.location.href = "index.html";
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.classList.remove("hidden");
  }
});
