# AuthRecuperacion-Ecommerce
# AuthRecuperacion-Ecommerce

API RESTful para un sistema e-commerce con autenticación segura, recuperación de contraseña y autorización basada en roles. Este proyecto representa mi primera incursión en el desarrollo backend :), como estudiante de ing mecatrónica estoy más acostumbrada a coderar en proyectos de electrónica, POO y ciencia de datos, también me considero aficionada en UX, asi que esta experiencia en el bancked fue salir de mi zona de confort. Me encantaría recibir su feedback 😁!

## Tabla de Contenidos
- [Acerca del Proyecto](#acerca-del-proyecto)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)

## Acerca del Proyecto
Este proyecto es una API RESTful para un sistema e-commerce que implementa:
- **Autenticación y Seguridad:** Registro e inicio de sesión con contraseñas encriptadas usando bcrypt y autenticación mediante JWT.
- **Recuperación de Contraseña:** Envío de correos con enlaces para restablecer la contraseña. Los tokens de recuperación expiran a la 1 hora.
- **Autorización por Roles:** Solo administradores pueden gestionar productos (crear, actualizar y eliminar) y solo usuarios pueden agregar productos a sus carritos.
- **Gestión de Datos:** Persistencia en MongoDB utilizando patrones de diseño como DAO, DTO y Repositorio.
- **Manejo de Errores y Logging:** Uso de middlewares para control global de errores, manejo de rutas no definidas y registro de solicitudes con Morgan.
- **Datos Semilla:** Configuración inicial con 50 usuarios y 50 productos.

## Features
- **User Authentication:** Secure registration and login with bcrypt and JWT.
- **Password Recovery:** Generate reset tokens with a 1-hour expiration and email integration.
- **Role-based Authorization:** Middleware ensuring only administrators can manage products and only users can modify their carts.
- **Data Persistence:** MongoDB integration using DAO, DTO, and repository patterns.
- **Error Handling:** Global error handlers and custom path handlers for undefined routes.
- **Logging:** Request logging with Morgan.
- **Seed Data:** Predefined five users and fifty products to kickstart the application.

## Technologies Used
- **Node.js & Express:** For building the API.
- **MongoDB:** For data storage.
- **JWT & bcrypt:** For secure token-based authentication and password hashing.
- **Nodemailer:** For handling password recovery emails.
- **Morgan:** For HTTP request logging.
- **Design Patterns:** Implementing DAO, DTO, and Repository patterns for a clean and maintainable codebase.

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/<Aleephic>/AuthRecuperacion-Ecommerce.git
   cd AuthRecuperacion-Ecommerce

