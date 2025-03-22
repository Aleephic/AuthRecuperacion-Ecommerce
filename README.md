# AuthRecuperacion-Ecommerce
# AuthRecuperacion-Ecommerce

API RESTful para un sistema e-commerce con autenticación segura, recuperación de contraseña y autorización basada en roles. Este proyecto representa mi primera incursión en el desarrollo backend, complementando mi experiencia en electrónica, ciencia de datos y UX.

## Tabla de Contenidos
- [Acerca del Proyecto](#acerca-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Contribuciones](#contribuciones)
- [Reconocimientos](#reconocimientos)
- [Licencia](#licencia)

## Acerca del Proyecto
Este proyecto es una API RESTful para un sistema e-commerce que implementa:
- **Autenticación y Seguridad:** Registro e inicio de sesión con contraseñas encriptadas usando bcrypt y autenticación mediante JWT.
- **Recuperación de Contraseña:** Envío de correos con enlaces para restablecer la contraseña. Los tokens de recuperación expiran a la 1 hora.
- **Autorización por Roles:** Solo administradores pueden gestionar productos (crear, actualizar y eliminar) y solo usuarios pueden agregar productos a sus carritos.
- **Gestión de Datos:** Persistencia en MongoDB utilizando patrones de diseño como DAO, DTO y Repositorio.
- **Manejo de Errores y Logging:** Uso de middlewares para control global de errores, manejo de rutas no definidas y registro de solicitudes con Morgan.
- **Datos Semilla:** Configuración inicial con 5 usuarios y 50 productos.

## Estructura del Proyecto
