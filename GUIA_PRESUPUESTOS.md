# 💰 Guía de Gestión de Presupuestos

## ✨ Nuevas Funcionalidades

Ahora puedes gestionar completamente tus categorías de presupuesto:
- ✏️ Editar presupuestos
- ➕ Agregar nuevas categorías
- 🗑️ Eliminar categorías

---

## 📋 Funcionalidades

### 1️⃣ Editar Presupuesto

**Cómo hacerlo:**
1. Ve a **Menú → Presupuestos**
2. Busca la categoría que quieres editar
3. Haz clic en el botón **✏️** (azul)
4. Ingresa el nuevo monto
5. Haz clic en "Aceptar"
6. ¡Listo! El presupuesto se actualiza

**Ejemplo:**
```
Alimentación: S/. 600.00 [✏️]
↓ Clic en ✏️
↓ Ingresa: 800
↓ Presupuesto actualizado a S/. 800.00
```

---

### 2️⃣ Agregar Nueva Categoría

**Cómo hacerlo:**
1. Ve a **Menú → Presupuestos**
2. Haz clic en **"➕ Agregar Nueva Categoría"** (botón verde arriba)
3. Ingresa el nombre de la categoría (ej: "Mascotas")
4. Ingresa el presupuesto (ej: 150)
5. ¡Listo! La categoría se agrega

**Ejemplo:**
```
[➕ Agregar Nueva Categoría]
↓ Clic
↓ Nombre: "Mascotas"
↓ Presupuesto: 150
↓ Nueva categoría creada
```

**Categorías sugeridas:**
- 🐾 Mascotas
- 🎁 Regalos
- 💅 Cuidado Personal
- 🚗 Mantenimiento Auto
- 📱 Tecnología
- 🏋️ Gimnasio
- 🎨 Hobbies
- 💼 Trabajo
- 🌴 Vacaciones
- 🏥 Seguros

---

### 3️⃣ Eliminar Categoría

**Cómo hacerlo:**
1. Ve a **Menú → Presupuestos**
2. Busca la categoría que quieres eliminar
3. Haz clic en el botón **🗑️** (rojo)
4. Confirma la eliminación
5. ¡Listo! La categoría se elimina

**⚠️ IMPORTANTE:**
- Si tienes transacciones con esa categoría, las transacciones NO se eliminan
- Solo se elimina el presupuesto
- Las transacciones seguirán apareciendo en tu historial

**Ejemplo:**
```
Entretenimiento [✏️] [🗑️]
↓ Clic en 🗑️
↓ Confirmar eliminación
↓ Categoría eliminada
```

---

## 🎨 Interfaz de Presupuestos

```
┌─────────────────────────────────────┐
│  [➕ Agregar Nueva Categoría]       │
├─────────────────────────────────────┤
│  📁 Alimentación    [✏️] [🗑️] [OK] │
│  Presupuesto: S/. 600.00            │
│  ▓▓▓▓▓░░░░░ 50%                     │
│  Gastado: S/. 300.00                │
│  Disponible: S/. 300.00             │
├─────────────────────────────────────┤
│  📁 Transporte      [✏️] [🗑️] [OK] │
│  Presupuesto: S/. 200.00            │
│  ▓▓░░░░░░░░ 20%                     │
│  Gastado: S/. 40.00                 │
│  Disponible: S/. 160.00             │
└─────────────────────────────────────┘
```

---

## 💡 Consejos de Uso

### Para Editar:
- ✅ Ajusta los presupuestos según tus necesidades
- ✅ Aumenta si te quedas corto frecuentemente
- ✅ Disminuye si siempre te sobra

### Para Agregar:
- ✅ Crea categorías específicas para tus gastos
- ✅ Usa nombres claros y descriptivos
- ✅ Empieza con presupuestos realistas

### Para Eliminar:
- ✅ Elimina categorías que no uses
- ✅ Mantén solo las categorías relevantes
- ✅ Recuerda que las transacciones no se eliminan

---

## 🔄 Flujo de Trabajo Recomendado

### Configuración Inicial:
1. Revisa las categorías predeterminadas
2. Edita los montos según tu situación
3. Agrega categorías personalizadas
4. Elimina las que no necesites

### Uso Mensual:
1. Revisa tus presupuestos al inicio del mes
2. Ajusta según el mes anterior
3. Agrega nuevas categorías si es necesario
4. Monitorea tu progreso durante el mes

### Optimización:
1. Analiza qué categorías excedes
2. Ajusta los presupuestos
3. Elimina categorías sin uso
4. Crea categorías más específicas si es necesario

---

## 📊 Estados de Presupuesto

### 🟢 OK (0-79%)
- Vas bien
- Dentro del presupuesto
- Sigue así

### 🟡 ALERTA (80-99%)
- Cuidado
- Cerca del límite
- Reduce gastos

### 🔴 EXCEDIDO (100%+)
- Límite superado
- Revisa tus gastos
- Ajusta presupuesto o reduce gastos

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Ajustar Presupuesto

**Situación:** Siempre excedes el presupuesto de Alimentación

**Solución:**
1. Haz clic en ✏️ en Alimentación
2. Aumenta de S/. 600 a S/. 800
3. Monitorea el próximo mes

---

### Ejemplo 2: Agregar Categoría Personalizada

**Situación:** Tienes gastos de mascotas pero no hay categoría

**Solución:**
1. Haz clic en "➕ Agregar Nueva Categoría"
2. Nombre: "Mascotas"
3. Presupuesto: S/. 150
4. Ahora puedes registrar gastos de mascotas

---

### Ejemplo 3: Eliminar Categoría No Usada

**Situación:** Nunca usas la categoría "Educación"

**Solución:**
1. Haz clic en 🗑️ en Educación
2. Confirma la eliminación
3. La categoría desaparece

---

## 🔒 Seguridad

- ✅ Los cambios se guardan automáticamente
- ✅ Se sincronizan con Firebase (si está configurado)
- ✅ Se guardan en localStorage como respaldo
- ✅ No se pierden al cerrar sesión

---

## 🆘 Preguntas Frecuentes

### ¿Puedo recuperar una categoría eliminada?

No, pero puedes crearla de nuevo con el mismo nombre y presupuesto.

### ¿Qué pasa con las transacciones si elimino una categoría?

Las transacciones NO se eliminan. Solo se elimina el presupuesto.

### ¿Cuántas categorías puedo tener?

No hay límite. Puedes tener tantas como necesites.

### ¿Puedo cambiar el nombre de una categoría?

No directamente. Debes eliminar la categoría y crear una nueva con el nombre deseado.

### ¿Los cambios se sincronizan entre dispositivos?

Sí, si tienes Firebase configurado. Los cambios se sincronizan automáticamente.

---

**© 2024 Jordan's - Finanzas App**
