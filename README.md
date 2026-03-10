# TaskApp - Plataforma de Gestión de Tareas (Senior Challenge)

## 📌 Descripción del Proyecto
TaskApp es una aplicación móvil de alto rendimiento desarrollada con **React Native** y **Expo**. La solución se enfoca en la gestión eficiente de tareas, integrando seguridad de nivel empresarial con **AWS Amplify v6** y una arquitectura de persistencia local para garantizar la disponibilidad de datos en entornos sin conexión.



## 🛠️ Stack Tecnológico y Versiones
Para este proyecto se utilizaron las versiones más recientes del ecosistema para asegurar compatibilidad y seguridad:

* **Core:** `expo`: ~55.0.5, `react`: 19.2.0, `react-native`: 0.83.2
* **Backend & Auth:** `aws-amplify`: ^6.16.2, `@aws-amplify/auth`: ^6.19.1
* **Persistencia:** `@react-native-async-storage/async-storage`: ^2.2.0

## 💻 Entorno de Desarrollo y Compatibilidad
Este proyecto fue desarrollado y testeado íntegramente en un entorno **Windows 11**.

* **Pruebas en Android:** Se realizaron pruebas exhaustivas en dispositivos físicos y emuladores, garantizando la estabilidad de la APK distribuida.
* **Compatibilidad con iOS:** Aunque el desarrollo fue en Windows, la arquitectura (Expo Router + Amplify v6) es 100% agnóstica. Con la configuración de certificados de Apple correspondiente, el proyecto es totalmente compatible en iOS.

## 📲 Descarga de la APK (Distribución)
Para facilitar la revisión, la aplicación ha sido compilada mediante **EAS Build**. Puede descargar e instalar la APK directamente en un dispositivo Android desde el siguiente enlace:

👉 **[Descargar APK - TaskApp en Expo](https://expo.dev/accounts/frjolito03/projects/TaskApp/builds/df309c3a-f54b-4890-8968-0b0298adc77c)**

## 🚀 Guía de Ejecución Local

### 1. Requisitos Previos
* Node.js (v18 o superior).
* Cuenta de Expo configurada.

### 2. Instalación y Ejecución
1. Clonar el repositorio.
2. Instalar dependencias con flag de compatibilidad: `npm install --legacy-peer-deps`.
3. Asegurar la presencia de `aws-exports.js` en la raíz.
4. Ejecutar Bundler: `npx expo start`.
5. Comandos directos: `npm run android` o `npm run ios`.

## 🔐 Seguridad y Resiliencia
* **AuthN/AuthZ:** Flujo completo de Registro, Login y Recuperación de clave con AWS Cognito, usando el esquema `taskapp://` para deep linking seguro.
* **Offline First:** Estrategia de caché local mediante `AsyncStorage` para una experiencia de usuario sin latencia de red.

## 🧪 Desafíos Técnicos Resueltos
> **Nota sobre Jest:** Debido a restricciones de arquitectura entre Expo 55 (motor Winter) y el sistema de archivos de Windows 11, se resolvió un conflicto de "scope" en las pruebas unitarias mediante la implementación de **Mocks Virtuales**, asegurando la validación aislada de la lógica de negocio.

---
## 🎥 Evidencia de Funcionamiento
(https://youtu.be/QI9m8CrxSoM)

Aspectos clave de mi entrega:

Seguridad: Implementación completa de AuthN/AuthZ con AWS Amplify v6 (Cognito), incluyendo flujos de recuperación de contraseña y validación de seguridad.

Resiliencia: Estrategia Offline-First mediante persistencia local con AsyncStorage.

Documentación: El archivo README.md incluye detalles de arquitectura, versiones de librerías (React 19 / Expo 55) y el enlace directo para descargar la APK de distribución generada con EAS.

Entorno: El desarrollo se consolidó en Windows 11, aplicando soluciones técnicas específicas para garantizar la integridad de los tests y la build de Android.