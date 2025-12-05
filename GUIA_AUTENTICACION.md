# 🔐 Guía del Sistema de Autenticación

## 🎉 Nueva Funcionalidad: Multi-Usuario

Ahora tu app soporta múltiples usuarios, cada uno con sus propios datos financieros.

---

## ✨ Características del Sistema

### 🔒 Seguridad
- ✅ Contraseñas encriptadas
- ✅ Bloqueo automático después de 3 intentos fallidos
- ✅ Validación de email con @ y .com
- ✅ Contraseñas de mínimo 8 caracteres con números
- ✅ Términos y políticas de Jordan's

### 👤 Gestión de Usuarios
- ✅ Registro con datos completos
- ✅ Generación automática de nombre de usuario
- ✅ Datos separados por usuario
- ✅ Sesión persistente

### 🎨 Interfaz
- ✅ Pantallas de login y registro profesionales
- ✅ Footer con marca "Jordan's" en todas las pantallas
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros

---

## 📝 Cómo Registrarse

### Paso 1: Primera Vez

1. **Abre la app**
2. **Haz clic** en "Regístrate aquí"
3. **Completa el formulario:**

#### Datos Personales:
- **Nombres Completos:** Jordan Alejandro
- **Apellidos Completos:** Morales Vasquez
- **Fecha de Nacimiento:** 08/05/2001

#### Usuario Generado Automáticamente:
- Se genera al completar los datos anteriores
- **Formato:** Primera letra del nombre + Primer apellido + Día de nacimiento
- **Ejemplo:** `jmorales08`

#### Datos de Acceso:
- **Correo:** jordan@ejemplo.com (debe tener @ y .com)
- **Contraseña:** Mínimo 8 caracteres, incluir números
  - ✅ Válida: `jordan2024`
  - ✅ Válida: `finanzas123`
  - ❌ Inválida: `jordan` (muy corta)
  - ❌ Inválida: `jordanmorales` (sin números)

- **Confirmar Contraseña:** Repite la misma contraseña

#### Términos:
- ✅ Marca "Acepto los términos y políticas de Jordan's"
- Puedes hacer clic en el enlace para leerlos

4. **Haz clic** en "Crear Cuenta"
5. **Verás:** "✅ Usuario creado correctamente"
6. **Automáticamente** te redirige al login

---

## 🔑 Cómo Iniciar Sesión

### Paso 1: Login

1. **Ingresa tu usuario:** `jmorales08`
2. **Ingresa tu contraseña:** La que creaste
3. **Haz clic** en "Iniciar Sesión"
4. **¡Listo!** Accedes a tu app

### ⚠️ Intentos Fallidos

Si te equivocas al ingresar la contraseña:

- **1er intento:** "Contraseña incorrecta. Te quedan 2 intentos"
- **2do intento:** "Contraseña incorrecta. Te queda 1 intento"
- **3er intento:** "Usuario bloqueado por múltiples intentos fallidos"

**Si te bloqueas:**
- Contacta al administrador (Jordan's)
- O elimina los datos del navegador y crea una cuenta nueva

---

## 🚪 Cerrar Sesión

1. **Haz clic** en el botón 🚪 (arriba a la derecha)
2. **Confirma** que quieres cerrar sesión
3. **Vuelves** a la pantalla de login

---

## 👥 Múltiples Usuarios

### Ejemplo de Uso:

**Usuario 1: Jordan**
- Usuario: `jmorales08`
- Datos: Sus propias transacciones y presupuestos

**Usuario 2: María**
- Usuario: `mgarcia15`
- Datos: Sus propias transacciones y presupuestos (separadas de Jordan)

**Cada usuario tiene:**
- ✅ Sus propias transacciones
- ✅ Sus propios presupuestos
- ✅ Sus propias estadísticas
- ✅ Datos completamente separados

---

## 🔐 Seguridad de Contraseñas

### Requisitos Mínimos:
- ✅ Mínimo 8 caracteres
- ✅ Al menos un número
- ✅ Letras (mayúsculas o minúsculas)

### Fortaleza:
- **Débil:** 8 caracteres, solo letras y números
  - Ejemplo: `jordan12`
  
- **Media:** 8+ caracteres, letras, números
  - Ejemplo: `jordan2024`
  
- **Fuerte:** 12+ caracteres, mayúsculas, minúsculas, números, símbolos
  - Ejemplo: `Jordan2024!`

---

## 📧 Validación de Email

El email debe cumplir:
- ✅ Contener `@`
- ✅ Contener `.com`

**Ejemplos válidos:**
- jordan@gmail.com ✅
- maria@hotmail.com ✅
- usuario@empresa.com ✅

**Ejemplos inválidos:**
- jordan@gmail ❌ (falta .com)
- jordangmail.com ❌ (falta @)
- jordan@ ❌ (incompleto)

---

## 📜 Términos y Políticas de Jordan's

Al registrarte, aceptas:

1. **Privacidad:** Tus datos se guardan localmente
2. **Responsabilidad:** Eres responsable de tu cuenta
3. **Uso:** Uso personal y responsable de la app
4. **Modificaciones:** Jordan's puede actualizar los términos
5. **Contacto:** contacto@jordans.com

---

## 🎨 Marca Jordan's

En todas las pantallas verás:

**Footer:**
```
© 2024 Jordan's - Todos los derechos reservados
```

Esto identifica que la app es propiedad de Jordan's.

---

## 🔄 Flujo Completo

### Primera Vez:
```
1. Abrir app
2. Ver pantalla de login
3. Clic en "Regístrate aquí"
4. Completar formulario
5. Usuario generado automáticamente
6. Aceptar términos
7. Crear cuenta
8. Mensaje: "Usuario creado correctamente"
9. Redirigir a login
10. Ingresar usuario y contraseña
11. Acceder a la app
```

### Siguientes Veces:
```
1. Abrir app
2. Ver pantalla de login
3. Ingresar usuario y contraseña
4. Acceder a la app
```

---

## 💡 Consejos

### Para Recordar tu Contraseña:
- Usa algo memorable pero seguro
- Combina palabras y números
- Ejemplo: `finanzas2024`, `ahorro123`

### Para Compartir con tu Compañero:
1. Comparte la URL de la app
2. Él se registra con sus propios datos
3. Cada uno tiene su propia cuenta
4. Los datos están separados

### Si Olvidas tu Contraseña:
- Por ahora, no hay recuperación automática
- Debes crear una cuenta nueva
- O contactar al administrador

---

## 🚀 Actualizar la App

Para activar el sistema de autenticación:

1. **Sube los archivos nuevos** a GitHub:
   - `index.html` (actualizado)
   - `styles.css` (actualizado)
   - `app.js` (actualizado)
   - `auth.js` (nuevo)

2. **Espera 2-3 minutos** (GitHub actualiza)

3. **En tu celular:**
   - Desinstala la app actual
   - Abre el navegador
   - Ve a tu URL
   - Instala de nuevo

4. **¡Listo!** Verás la pantalla de login

---

## 📊 Ejemplo Completo

### Registro de Jordan:

```
Nombres: Jordan Alejandro
Apellidos: Morales Vasquez
Fecha Nac: 08/05/2001
Usuario: jmorales08 (generado automáticamente)
Email: jordan@gmail.com
Contraseña: jordan2024
Confirmar: jordan2024
✅ Acepto términos
```

**Resultado:** Usuario `jmorales08` creado

### Login de Jordan:

```
Usuario: jmorales08
Contraseña: jordan2024
```

**Resultado:** Acceso a la app con sus datos

---

## 🎉 ¡Listo!

Ahora tu app tiene:
- ✅ Sistema de autenticación completo
- ✅ Múltiples usuarios
- ✅ Datos separados por usuario
- ✅ Seguridad con bloqueo
- ✅ Marca Jordan's en todas las pantallas

**¡Disfruta tu app multi-usuario!** 👥💰
