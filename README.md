# 💰 Finanzas App - PWA

Aplicación web progresiva para gestión de finanzas personales.

---

## 🚀 Inicio Rápido

### Abrir Localmente:
```bash
python -m http.server 8000
```
Luego abre: `http://localhost:8000/pwa_app/`

### Subir a GitHub:
1. Sube todos los archivos de `pwa_app/` a tu repositorio
2. Activa GitHub Pages en Settings → Pages
3. Accede a: `https://tu-usuario.github.io/tu-repo/pwa_app/`

---

## ✨ Funcionalidades

- ✅ Registro e inicio de sesión
- ✅ Agregar ingresos y gastos
- ✅ Presupuestos por categoría (editables)
- ✅ Estadísticas personalizables
- ✅ Tema claro/oscuro
- ✅ Exportar datos
- ✅ Limpiar datos
- ✅ Funciona offline (PWA)
- ✅ Instalable en celular

---

## 🔧 Configuración Opcional

### Firebase (Sincronización en la nube):
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Habilita Firestore Database
4. Copia tu configuración a `firebase-config.js`
5. Configura las reglas de Firestore (ver `GUIA_FIREBASE.md`)

### Google Sheets (Excel personal):
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita Google Sheets API y Google Drive API
3. Crea credenciales OAuth 2.0 y API Key
4. Configura en `google-sheets.js`
5. Ver guía completa en `GUIA_GOOGLE_SHEETS_API.md`

---

## 📱 Instalar en Celular

1. Abre la app en tu navegador móvil
2. Menú → "Agregar a pantalla de inicio"
3. ¡Listo! Funciona como app nativa

---

## 🎨 Características

### Tema Claro/Oscuro
- Botón en el header (🌙/☀️)
- Se guarda tu preferencia

### Editar Presupuestos
- Ve a Presupuestos
- Haz clic en el botón ✏️
- Ingresa el nuevo monto

### Limpiar Datos
- Menú → Limpiar Datos
- Doble confirmación
- Elimina todas las transacciones

---

## 📂 Archivos Principales

```
pwa_app/
├── index.html          # Interfaz principal
├── app.js              # Lógica de la aplicación
├── styles.css          # Estilos
├── firebase-auth.js    # Autenticación
├── firebase-config.js  # Configuración Firebase
├── google-sheets.js    # Integración Google Sheets
├── manifest.json       # Configuración PWA
└── sw.js               # Service Worker (offline)
```

---

## 🆘 Problemas Comunes

### No veo mis cambios en GitHub Pages:
- Presiona `Ctrl + Shift + R` para limpiar caché
- Espera 2-5 minutos después de subir
- Prueba en modo incógnito

### Error "Missing or insufficient permissions":
- Configura las reglas de Firestore (ver `GUIA_FIREBASE.md`)
- O desactiva Firebase temporalmente

### No puedo iniciar sesión:
- Verifica que Firebase esté configurado
- Limpia el localStorage: F12 → Console → `localStorage.clear()`
- Registra un nuevo usuario

---

## 📖 Documentación Completa

- `GUIA_FIREBASE.md` - Configurar Firebase
- `GUIA_GOOGLE_SHEETS_API.md` - Configurar Google Sheets
- `GUIA_AUTENTICACION.md` - Sistema de autenticación
- `GUIA_INSTALACION_PWA.md` - Instalar como PWA
- `README.md` - Información general

---

## 🔒 Seguridad

- Las contraseñas se manejan con Firebase Authentication
- Los datos se guardan en tu Google Drive personal
- Funciona offline con localStorage
- No compartimos tus datos con terceros

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Lee la documentación correspondiente
3. Verifica que todos los archivos estén subidos

---

**© 2024 Jordan's - Todos los derechos reservados**
