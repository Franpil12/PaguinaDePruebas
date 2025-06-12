Version 3.0

Cambios en el Frontend (Página Web)
Este README detalla las modificaciones y adiciones realizadas en el código JavaScript y HTML del frontend, reflejadas por los indicadores en la estructura de archivos.

1. Archivos Modificados 
admin.html y admin.js:
Actualización (admin.js): Se corrigió la forma en que se accede al nombre del usuario en la tabla de pedidos del administrador. La referencia pedido.user.name se cambió a pedido.usuario.name para coincidir con la relación definida en el backend, asegurando que los nombres de los usuarios se muestren correctamente.
detalles.html y detalles.js:
Eliminación (detalles.html): Se eliminó por completo la barra de navegación superior (<header>) y el menú móvil (#mobile-menu) de esta página. Esto permite que la página de detalles del producto se enfoque exclusivamente en la información del producto, eliminando elementos de navegación globales.
Adaptación (detalles.js): El código JavaScript se mantiene funcional a pesar de la ausencia de los elementos de navegación eliminados, ya que utiliza comprobaciones para evitar errores.
app.js:
Se asume que app.js pudo haber sido modificado para adaptarse a los cambios generales en la autenticación o en la gestión de sesiones, aunque no se especificaron detalles concretos.
login.html y login.js:
Se asume que estos archivos pudieron haber sido modificados en relación con el proceso de autenticación o la gestión de tokens, aunque no se especificaron detalles concretos.
pedidos.html y pedidos.js:
Adición de Funcionalidad de Eliminación (pedidos.js): Se implementó la capacidad para que los usuarios (y administradores) eliminen pedidos directamente desde la página "Mis Pedidos". Se añadió la función deletePedido(pedidoId) que envía una solicitud DELETE a la API.
Actualización de Interfaz (pedidos.js): El botón "Eliminar Pedido" ahora se muestra condicionalmente, siendo interactivo solo para pedidos en estado "completado" o "cancelado" (siguiendo las reglas del backend). Se añadió una confirmación antes de la eliminación y la lista de pedidos se recarga automáticamente tras una eliminación exitosa.

2. Archivos Agregados 
agregar_direccion.html y agregar_direccion.js:
Adición: Nuevas páginas y scripts JavaScript para permitir a los usuarios agregar y gestionar sus direcciones. Esto indica la implementación de una sección dedicada a la gestión de direcciones para futuros pedidos.
carrito.html y carrito.js:
Adición: Nuevas páginas y scripts JavaScript relacionados con la funcionalidad del carrito de compras. Esto implica la implementación de una interfaz para ver, modificar y gestionar los productos en el carrito antes de finalizar la compra.
contacto.html y contacto.js:
Adición: Nuevas páginas y scripts JavaScript para una sección de contacto. Esto sugiere la inclusión de un formulario o información de contacto para los usuarios.
inicio.html y inicio.js:
Adición: Nuevas páginas y scripts JavaScript que probablemente representan la página de inicio o el panel principal de la aplicación, gestionando la carga inicial de productos o información relevante para el usuario.


Version 2.02 (Adicion del FireBase)
-Se agrego la conexion sobre la firebase para agregar imagenes atraves del formulario
-El formulario se modifico para que se puedan subir imagenes del dispositivo
-Se actualizo Admin.Html y Admin.js para su mejor conversion de datos.


Version 2.01 (Actualizacion Base de datos y Admin)

-Se cambiaron los apis por los de la base de datos Laravel
-Se adapto el codigo para su funcion correcta con la base de Datos

-Se mejoro el codigo para dectectar si el cliente es usuario o administrado
    -Si es administrador se le concede la opcion de poder editar atraves de un boton Admin

-Se agrego admin html y js
    -El htmal es la visual para que se pueda editar crear o eliminar un producto
    -Se incrusto codigo para que atraves de esta paguina se pueda actulizar la Base de datos De laravel



Paguina Web:

https://franpil12.github.io/PaguinaDePruebas/
