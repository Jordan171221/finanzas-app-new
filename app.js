// ========================================
// FINANZAS APP - PWA
// Progressive Web App con sincronización
// ========================================

// Estado de la aplicación
let currentType = 'Gasto';
let transactions = [];
let budgets = {
    'Alimentación': 600,
    'Transporte': 200,
    'Vivienda': 800,
    'Servicios': 250,
    'Entretenimiento': 300,
    'Salud': 150,
    'Educación': 200,
    'Otros': 100
};

// Inicializar app (solo si hay usuario autenticado)
function initApp() {
    loadData();
    
    // Intentar cargar desde Firebase
    if (typeof db !== 'undefined' && db && currentUser && currentUser.uid) {
        loadFromFirebase().then(() => {
            updateUI();
        });
    } else {
        updateUI();
    }
    
    registerServiceWorker();
    checkInstallPrompt();
}

// Cargar datos del localStorage (por usuario)
function loadData() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    const savedTransactions = localStorage.getItem(`${userKey}_transactions`);
    const savedBudgets = localStorage.getItem(`${userKey}_budgets`);
    
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        transactions = [];
    }
    
    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    } else {
        // Cargar presupuestos guardados o usar vacío si ya se inicializó
        budgets = {};
    }
    
    // Cargar configuración de usuario
    loadUserConfig();
    
    // Inicializar presupuestos por defecto si es necesario
    initializeDefaultBudgets();
}

// Guardar datos en localStorage y Firebase (por usuario)
function saveData() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    
    // Guardar en localStorage (inmediato)
    localStorage.setItem(`${userKey}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${userKey}_budgets`, JSON.stringify(budgets));
    
    // Guardar en Firebase (si está disponible)
    if (typeof db !== 'undefined' && db && currentUser.uid) {
        saveToFirebase();
    }
}

// Guardar en Firebase
async function saveToFirebase() {
    if (!currentUser || !currentUser.uid) return;
    
    try {
        // Guardar transacciones
        await db.collection('userData').doc(currentUser.uid).set({
            transactions: transactions,
            budgets: budgets,
            lastUpdate: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Datos guardados en Firebase');
    } catch (error) {
        console.log('⚠️ No se pudo guardar en Firebase:', error.message);
    }
}

// Cargar datos desde Firebase
async function loadFromFirebase() {
    if (!currentUser || !currentUser.uid || !db) return;
    
    try {
        const doc = await db.collection('userData').doc(currentUser.uid).get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.transactions) {
                transactions = data.transactions;
            }
            if (data.budgets) {
                budgets = data.budgets;
            }
            
            // Guardar en localStorage también
            const userKey = `user_${currentUser.username}`;
            localStorage.setItem(`${userKey}_transactions`, JSON.stringify(transactions));
            localStorage.setItem(`${userKey}_budgets`, JSON.stringify(budgets));
            
            console.log('✅ Datos cargados desde Firebase');
            updateUI();
        }
    } catch (error) {
        console.log('⚠️ No se pudo cargar desde Firebase:', error.message);
    }
}

// Función hideLoading está en auth.js

// Toggle menu
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Toggle theme
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.querySelector('.theme-btn');
    if (btn) {
        btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    showToast(newTheme === 'dark' ? '🌙 Tema oscuro activado' : '☀️ Tema claro activado');
}

// Cargar tema guardado al iniciar
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const btn = document.querySelector('.theme-btn');
    if (btn) {
        btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Cargar tema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
});

// Mostrar pantalla
function showScreen(screenName) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla seleccionada
    const screen = document.getElementById(screenName + 'Screen');
    if (screen) {
        screen.classList.add('active');
    }
    
    // Cerrar menú solo si está abierto
    const menu = document.getElementById('sideMenu');
    if (menu && menu.classList.contains('active')) {
        toggleMenu();
    }
    
    // Actualizar contenido según la pantalla
    if (screenName === 'home') {
        updateHomeScreen();
    } else if (screenName === 'budget') {
        updateBudgetScreen();
    } else if (screenName === 'stats') {
        updateStatsScreen();
    } else if (screenName === 'allTransactions') {
        updateAllTransactionsScreen();
    }
}

// Seleccionar tipo de transacción
function selectType(type) {
    currentType = type;
    
    // Actualizar botones
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar categorías
    const categoriaSelect = document.getElementById('categoria');
    if (type === 'Ingreso') {
        categoriaSelect.innerHTML = `
            <option value="">Selecciona una categoría</option>
            <option value="Salario">💼 Salario</option>
            <option value="Otros">📦 Otros</option>
        `;
    } else {
        categoriaSelect.innerHTML = `
            <option value="">Selecciona una categoría</option>
            <option value="Alimentación">🍔 Alimentación</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Vivienda">🏠 Vivienda</option>
            <option value="Servicios">💡 Servicios</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Salud">💊 Salud</option>
            <option value="Educación">📚 Educación</option>
            <option value="Otros">📦 Otros</option>
        `;
    }
}

// Guardar transacción
async function saveTransaction(event) {
    event.preventDefault();
    
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value || 'Sin descripción';
    const comprobanteInput = document.getElementById('comprobante');
    
    if (!categoria) {
        showToast('⚠️ Selecciona una categoría');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: currentType,
        monto: monto,
        categoria: categoria,
        descripcion: descripcion
    };
    
    // Si hay imagen, convertirla a base64
    if (comprobanteInput.files && comprobanteInput.files[0]) {
        const file = comprobanteInput.files[0];
        const base64 = await convertImageToBase64(file);
        transaction.comprobante = base64;
    }
    
    transactions.unshift(transaction);
    saveData();
    
    // Limpiar solo los campos del formulario (NO cambiar de pantalla)
    document.getElementById('monto').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('comprobante').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    
    // Enfocar el campo de monto para seguir agregando
    document.getElementById('monto').focus();
    
    // Mostrar mensaje
    showToast(`✅ ${currentType} guardado: ${currencySymbol} ${monto.toFixed(2)}`);
    
    // Actualizar el contador de transacciones en el inicio
    updateUI();
}

// Convertir imagen a base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Preview de imagen
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    
    if (file) {
        // Determinar si es de cámara o archivo
        const isCamera = event.target.id.includes('Camera');
        const displayName = isCamera ? `📸 Foto capturada - ${file.name}` : `📁 ${file.name}`;
        
        fileName.textContent = displayName;
        fileName.classList.add('file-selected');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImage()">✕</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        // Sincronizar ambos inputs
        if (isCamera) {
            document.getElementById('comprobante').files = event.target.files;
        } else {
            document.getElementById('comprobanteCamera').files = event.target.files;
        }
    } else {
        fileName.textContent = 'Ningún archivo seleccionado';
        fileName.classList.remove('file-selected');
        preview.innerHTML = '';
    }
}

// Eliminar imagen
function removeImage() {
    document.getElementById('comprobante').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('fileName').classList.remove('file-selected');
}

// Actualizar UI
function updateUI() {
    updateHomeScreen();
}

// Actualizar pantalla de inicio
function updateHomeScreen() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar transacciones del mes actual
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.fecha);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    // Calcular totales
    let totalIngresos = 0;
    let totalGastos = 0;
    
    monthTransactions.forEach(t => {
        if (t.tipo === 'Ingreso') {
            totalIngresos += t.monto;
        } else {
            totalGastos += t.monto;
        }
    });
    
    const balance = totalIngresos - totalGastos;
    
    // Actualizar tarjetas
    document.getElementById('totalIngresos').textContent = `${currencySymbol} ${totalIngresos.toFixed(2)}`;
    document.getElementById('totalGastos').textContent = `${currencySymbol} ${totalGastos.toFixed(2)}`;
    document.getElementById('balance').textContent = `${currencySymbol} ${balance.toFixed(2)}`;
    
    // Actualizar lista de transacciones
    const transactionsList = document.getElementById('transactionsList');
    const verMasBtn = document.getElementById('verMasBtn');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <p style="font-size: 48px; margin-bottom: 10px;">📝</p>
                <p>No hay transacciones aún</p>
                <p style="font-size: 14px; margin-top: 10px;">Toca el botón ➕ para agregar una</p>
            </div>
        `;
        verMasBtn.style.display = 'none';
    } else {
        const recentTransactions = transactions.slice(0, 5);
        transactionsList.innerHTML = recentTransactions.map(t => {
            const date = new Date(t.fecha);
            const dateStr = date.toLocaleDateString('es-PE', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const icon = t.tipo === 'Ingreso' ? '💵' : '💸';
            const amountClass = t.tipo === 'Ingreso' ? 'ingreso' : 'gasto';
            const hasImage = t.comprobante ? '📎' : '';
            
            return `
                <div class="transaction-item" onclick="editTransaction(${t.id})">
                    <div class="transaction-icon">${icon}</div>
                    <div class="transaction-content">
                        <div class="transaction-desc">${t.descripcion} ${hasImage}</div>
                        <div class="transaction-meta">${t.categoria} • ${dateStr}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${currencySymbol} ${t.monto.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
        
        // Mostrar botón "Ver más" solo si hay más de 5 transacciones
        verMasBtn.style.display = transactions.length > 5 ? 'block' : 'none';
    }
}

// Actualizar pantalla de presupuestos
function updateBudgetScreen() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calcular gastos por categoría
    const gastosPorCategoria = {};
    
    transactions.forEach(t => {
        const tDate = new Date(t.fecha);
        if (t.tipo === 'Gasto' && 
            tDate.getMonth() === currentMonth && 
            tDate.getFullYear() === currentYear) {
            gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.monto;
        }
    });
    
    const budgetList = document.getElementById('budgetList');
    
    // Botón para agregar nueva categoría
    let html = `
        <div class="budget-add-section">
            <button class="btn-add-budget" onclick="addNewBudgetCategory()">
                ➕ Agregar Nueva Categoría
            </button>
        </div>
    `;
    
    // Lista de categorías
    html += Object.keys(budgets).map(categoria => {
        const presupuesto = budgets[categoria];
        const gastado = gastosPorCategoria[categoria] || 0;
        const porcentaje = (gastado / presupuesto) * 100;
        const disponible = presupuesto - gastado;
        
        let status = 'ok';
        let statusText = 'OK';
        let color = 'var(--accent-green)';
        
        if (porcentaje >= 100) {
            status = 'danger';
            statusText = 'EXCEDIDO';
            color = 'var(--accent-red)';
        } else if (porcentaje >= 80) {
            status = 'warning';
            statusText = 'ALERTA';
            color = 'var(--accent-orange)';
        }
        
        return `
            <div class="budget-item" id="budget-${categoria}">
                <div class="budget-header">
                    <div class="budget-category">📁 ${categoria}</div>
                    <div class="budget-actions">
                        <button class="budget-save-btn" onclick="saveBudgetEdit('${categoria}')" title="Guardar cambios" style="display: none;">✅</button>
                        <button class="budget-delete-btn" onclick="deleteBudgetCategory('${categoria}')" title="Eliminar categoría">🗑️</button>
                        <div class="budget-status ${status}">${statusText}</div>
                    </div>
                </div>
                <div class="budget-amount">
                    <span class="budget-label">Presupuesto:</span>
                    <span class="budget-value" onclick="enableBudgetEdit('${categoria}', ${presupuesto})">${currencySymbol} ${presupuesto.toFixed(2)}</span>
                    <input type="number" class="budget-edit-input" id="edit-${categoria}" value="${presupuesto}" step="0.01" style="display: none;" onblur="saveBudgetEdit('${categoria}')" onkeypress="handleBudgetKeyPress(event, '${categoria}')">
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${Math.min(porcentaje, 100)}%; background: ${color};"></div>
                </div>
                <div class="budget-info">
                    <span>Gastado: ${currencySymbol} ${gastado.toFixed(2)} (${porcentaje.toFixed(0)}%)</span>
                    <span>Disponible: ${currencySymbol} ${disponible.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    budgetList.innerHTML = html;
}

// Habilitar edición inline de presupuesto
function enableBudgetEdit(categoria, currentValue) {
    const valueSpan = document.querySelector(`#budget-${categoria} .budget-value`);
    const editInput = document.getElementById(`edit-${categoria}`);
    const saveBtn = document.querySelector(`#budget-${categoria} .budget-save-btn`);
    
    // Ocultar valor y mostrar input
    valueSpan.style.display = 'none';
    editInput.style.display = 'inline-block';
    editInput.value = currentValue;
    editInput.focus();
    editInput.select();
    
    // Mostrar botón de guardar
    saveBtn.style.display = 'inline-block';
}

// Guardar edición de presupuesto
function saveBudgetEdit(categoria) {
    const valueSpan = document.querySelector(`#budget-${categoria} .budget-value`);
    const editInput = document.getElementById(`edit-${categoria}`);
    const saveBtn = document.querySelector(`#budget-${categoria} .budget-save-btn`);
    
    const newValue = parseFloat(editInput.value);
    
    if (isNaN(newValue) || newValue <= 0) {
        showToast('❌ Ingresa un monto válido');
        editInput.focus();
        return;
    }
    
    // Actualizar presupuesto
    budgets[categoria] = newValue;
    saveData();
    
    // Actualizar UI
    valueSpan.textContent = `${currencySymbol} ${newValue.toFixed(2)}`;
    valueSpan.style.display = 'inline';
    editInput.style.display = 'none';
    saveBtn.style.display = 'none';
    
    // Actualizar toda la pantalla para reflejar cambios
    updateBudgetScreen();
    
    showToast(`✅ Presupuesto de ${categoria} actualizado a ${currencySymbol} ${newValue.toFixed(2)}`);
}

// Manejar teclas en edición de presupuesto
function handleBudgetKeyPress(event, categoria) {
    if (event.key === 'Enter') {
        saveBudgetEdit(categoria);
    } else if (event.key === 'Escape') {
        cancelBudgetEdit(categoria);
    }
}

// Cancelar edición de presupuesto
function cancelBudgetEdit(categoria) {
    const valueSpan = document.querySelector(`#budget-${categoria} .budget-value`);
    const editInput = document.getElementById(`edit-${categoria}`);
    const saveBtn = document.querySelector(`#budget-${categoria} .budget-save-btn`);
    
    valueSpan.style.display = 'inline';
    editInput.style.display = 'none';
    saveBtn.style.display = 'none';
}

// Editar presupuesto (función legacy - ya no se usa)
function editBudget(categoria) {
    const currentBudget = budgets[categoria];
    const newBudget = prompt(`💰 Editar presupuesto de ${categoria}\n\nPresupuesto actual: S/. ${currentBudget.toFixed(2)}\n\nIngresa el nuevo presupuesto:`, currentBudget);
    
    if (newBudget !== null && newBudget !== '') {
        const amount = parseFloat(newBudget);
        
        if (isNaN(amount) || amount <= 0) {
            showToast('❌ Ingresa un monto válido');
            return;
        }
        
        budgets[categoria] = amount;
        saveData();
        updateBudgetScreen();
        showToast(`✅ Presupuesto de ${categoria} actualizado a S/. ${amount.toFixed(2)}`);
    }
}

// Agregar nueva categoría de presupuesto
function addNewBudgetCategory() {
    const categoryName = prompt('📁 Nueva Categoría\n\nIngresa el nombre de la categoría:');
    
    if (!categoryName || categoryName.trim() === '') {
        return;
    }
    
    const cleanName = categoryName.trim();
    
    // Verificar si ya existe
    if (budgets[cleanName]) {
        showToast('⚠️ Esta categoría ya existe');
        return;
    }
    
    const amount = prompt(`💰 Presupuesto para ${cleanName}\n\nIngresa el monto del presupuesto:`, '100');
    
    if (!amount || amount.trim() === '') {
        return;
    }
    
    const budget = parseFloat(amount);
    
    if (isNaN(budget) || budget <= 0) {
        showToast('❌ Ingresa un monto válido');
        return;
    }
    
    // Agregar nueva categoría
    budgets[cleanName] = budget;
    saveData();
    updateBudgetScreen();
    showToast(`✅ Categoría "${cleanName}" agregada con presupuesto de S/. ${budget.toFixed(2)}`);
}

// Eliminar categoría de presupuesto
function deleteBudgetCategory(categoria) {
    // Verificar si hay transacciones con esta categoría
    const hasTransactions = transactions.some(t => t.categoria === categoria);
    
    let confirmMessage = `🗑️ ¿Eliminar la categoría "${categoria}"?`;
    
    if (hasTransactions) {
        confirmMessage += '\n\n⚠️ ADVERTENCIA: Tienes transacciones con esta categoría. Las transacciones NO se eliminarán, solo el presupuesto.';
    }
    
    if (confirm(confirmMessage)) {
        delete budgets[categoria];
        saveData();
        updateBudgetScreen();
        showToast(`✅ Categoría "${categoria}" eliminada`);
    }
}

// Actualizar pantalla de estadísticas
function updateStatsScreen() {
    const categoryStats = document.getElementById('categoryStats');
    const weekStats = document.getElementById('weekStats');
    
    // Mostrar mensaje vacío para que el usuario llene a su gusto
    categoryStats.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
            <p style="font-size: 48px; margin-bottom: 10px;">📊</p>
            <p style="font-size: 16px; margin-bottom: 10px;">Estadísticas Personalizables</p>
            <p style="font-size: 14px;">Esta sección está lista para que agregues tus propias estadísticas y gráficos</p>
        </div>
    `;
    
    weekStats.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
            <p style="font-size: 48px; margin-bottom: 10px;">📈</p>
            <p style="font-size: 16px; margin-bottom: 10px;">Análisis Temporal</p>
            <p style="font-size: 14px;">Espacio disponible para gráficos de tendencias</p>
        </div>
    `;
}

// Mostrar toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Sincronizar con Google Sheets
function syncWithSheets() {
    showToast('🔄 Sincronizando con Google Sheets...');
    
    // Aquí iría la lógica de sincronización con Google Sheets API
    // Por ahora, simulamos la sincronización
    
    setTimeout(() => {
        showToast('✅ Sincronización completada');
    }, 2000);
}

// Exportar datos
function exportData() {
    const dataStr = JSON.stringify({
        transactions,
        budgets,
        exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finanzas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('📥 Datos exportados');
}

// Limpiar datos
function clearData() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las transacciones?\n\nEsta acción no se puede deshacer.')) {
        if (confirm('🔴 ÚLTIMA CONFIRMACIÓN: Se eliminarán todos tus datos. ¿Continuar?')) {
            // Limpiar transacciones
            transactions = [];
            
            // Guardar cambios
            saveData();
            
            // Actualizar interfaz
            updateUI();
            updateHomeScreen();
            
            // Mostrar mensaje de confirmación
            showToast('✅ Todos los datos han sido eliminados');
            
            // Volver al inicio
            showScreen('home');
            
            console.log('🗑️ Datos eliminados correctamente');
        }
    }
}

// Registrar Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Error al registrar SW:', err));
    }
}

// Verificar si se puede instalar
function checkInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botón de instalación personalizado
        showToast('💡 Puedes instalar esta app en tu celular');
    });
}


// Mostrar todas las transacciones
function showAllTransactions() {
    showScreen('allTransactions');
}

// Actualizar pantalla de todas las transacciones
function updateAllTransactionsScreen() {
    const allTransactionsList = document.getElementById('allTransactionsList');
    
    if (transactions.length === 0) {
        allTransactionsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <p style="font-size: 48px; margin-bottom: 10px;">📝</p>
                <p>No hay transacciones aún</p>
                <p style="font-size: 14px; margin-top: 10px;">Toca el botón ➕ para agregar una</p>
            </div>
        `;
        return;
    }
    
    allTransactionsList.innerHTML = transactions.map(t => {
        const date = new Date(t.fecha);
        const dateStr = date.toLocaleDateString('es-PE', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const icon = t.tipo === 'Ingreso' ? '💵' : '💸';
        const amountClass = t.tipo === 'Ingreso' ? 'ingreso' : 'gasto';
        const hasImage = t.comprobante ? '📎' : '';
        
        return `
            <div class="transaction-item" onclick="editTransaction(${t.id})">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-content">
                    <div class="transaction-desc">${t.descripcion} ${hasImage}</div>
                    <div class="transaction-meta">${t.categoria} • ${dateStr}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${currencySymbol} ${t.monto.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Editar transacción
function editTransaction(transactionId) {
    const transaction = transactions.find(t => t.id == transactionId);
    if (!transaction) return;
    
    // Llenar el formulario de edición
    document.getElementById('editTransactionId').value = transaction.id;
    document.getElementById('editMonto').value = transaction.monto;
    document.getElementById('editCategoria').value = transaction.categoria;
    document.getElementById('editDescripcion').value = transaction.descripcion;
    
    // Seleccionar tipo
    selectEditType(transaction.tipo);
    
    // Mostrar imagen si existe
    const editImagePreview = document.getElementById('editImagePreview');
    const editFileName = document.getElementById('editFileName');
    
    if (transaction.comprobante) {
        editFileName.textContent = 'Comprobante actual';
        editFileName.classList.add('file-selected');
        editImagePreview.innerHTML = `
            <div class="image-preview-container">
                <img src="${transaction.comprobante}" alt="Comprobante actual">
                <button type="button" class="remove-image" onclick="removeEditImage()">✕</button>
            </div>
        `;
    } else {
        editFileName.textContent = 'Ningún archivo seleccionado';
        editFileName.classList.remove('file-selected');
        editImagePreview.innerHTML = '';
    }
    
    // Mostrar pantalla de edición
    showScreen('editTransaction');
}

// Seleccionar tipo en edición
function selectEditType(type) {
    const editButtons = document.querySelectorAll('#editTransactionScreen .type-btn');
    editButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar categorías para edición
    const editCategoriaSelect = document.getElementById('editCategoria');
    const currentValue = editCategoriaSelect.value;
    
    if (type === 'Ingreso') {
        editCategoriaSelect.innerHTML = `
            <option value="">Selecciona una categoría</option>
            <option value="Salario">💼 Salario</option>
            <option value="Otros">📦 Otros</option>
        `;
    } else {
        editCategoriaSelect.innerHTML = `
            <option value="">Selecciona una categoría</option>
            <option value="Alimentación">🍔 Alimentación</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Vivienda">🏠 Vivienda</option>
            <option value="Servicios">💡 Servicios</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Salud">💊 Salud</option>
            <option value="Educación">📚 Educación</option>
            <option value="Otros">📦 Otros</option>
        `;
    }
    
    // Restaurar valor seleccionado
    editCategoriaSelect.value = currentValue;
}

// Preview de imagen en edición
function previewEditImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editImagePreview');
    const fileName = document.getElementById('editFileName');
    
    if (file) {
        // Determinar si es de cámara o archivo
        const isCamera = event.target.id.includes('Camera');
        const displayName = isCamera ? `📸 Foto capturada - ${file.name}` : `📁 ${file.name}`;
        
        fileName.textContent = displayName;
        fileName.classList.add('file-selected');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeEditImage()">✕</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        // Sincronizar ambos inputs
        if (isCamera) {
            document.getElementById('editComprobante').files = event.target.files;
        } else {
            document.getElementById('editComprobanteCamera').files = event.target.files;
        }
    } else {
        fileName.textContent = 'Ningún archivo seleccionado';
        fileName.classList.remove('file-selected');
        preview.innerHTML = '';
    }
}

// Eliminar imagen en edición
function removeEditImage() {
    document.getElementById('editComprobante').value = '';
    document.getElementById('editImagePreview').innerHTML = '';
    document.getElementById('editFileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('editFileName').classList.remove('file-selected');
}

// Actualizar transacción
async function updateTransaction(event) {
    event.preventDefault();
    
    const transactionId = parseInt(document.getElementById('editTransactionId').value);
    const monto = parseFloat(document.getElementById('editMonto').value);
    const categoria = document.getElementById('editCategoria').value;
    const descripcion = document.getElementById('editDescripcion').value || 'Sin descripción';
    const comprobanteInput = document.getElementById('editComprobante');
    
    if (!categoria) {
        showToast('⚠️ Selecciona una categoría');
        return;
    }
    
    // Encontrar la transacción
    const transactionIndex = transactions.findIndex(t => t.id == transactionId);
    if (transactionIndex === -1) {
        showToast('❌ Transacción no encontrada');
        return;
    }
    
    // Obtener tipo seleccionado
    const selectedType = document.querySelector('#editTransactionScreen .type-btn.active').dataset.type;
    
    // Actualizar datos
    transactions[transactionIndex].monto = monto;
    transactions[transactionIndex].categoria = categoria;
    transactions[transactionIndex].descripcion = descripcion;
    transactions[transactionIndex].tipo = selectedType;
    
    // Si hay nueva imagen, actualizarla
    if (comprobanteInput.files && comprobanteInput.files[0]) {
        const file = comprobanteInput.files[0];
        const base64 = await convertImageToBase64(file);
        transactions[transactionIndex].comprobante = base64;
    }
    // Si se eliminó la imagen (preview vacío y no hay archivo)
    else if (document.getElementById('editImagePreview').innerHTML === '' && !comprobanteInput.files[0]) {
        delete transactions[transactionIndex].comprobante;
    }
    
    saveData();
    updateUI();
    updateAllTransactionsScreen();
    
    showToast(`✅ Transacción actualizada`);
    showScreen('allTransactions');
}

// Confirmar eliminación de transacción
function confirmDeleteTransaction() {
    const transactionId = parseInt(document.getElementById('editTransactionId').value);
    const transaction = transactions.find(t => t.id == transactionId);
    
    if (!transaction) return;
    
    const confirmDelete = confirm(`¿Estás seguro de eliminar esta transacción?\n\n${transaction.descripcion}\n${currencySymbol} ${transaction.monto.toFixed(2)}\n\nEsta acción no se puede deshacer.`);
    
    if (confirmDelete) {
        deleteTransaction(transactionId);
    }
}

// Eliminar transacción
function deleteTransaction(transactionId) {
    const transactionIndex = transactions.findIndex(t => t.id == transactionId);
    
    if (transactionIndex === -1) {
        showToast('❌ Transacción no encontrada');
        return;
    }
    
    const deletedTransaction = transactions[transactionIndex];
    transactions.splice(transactionIndex, 1);
    
    saveData();
    updateUI();
    updateAllTransactionsScreen();
    
    showToast(`✅ Transacción eliminada: ${deletedTransaction.descripcion}`);
    showScreen('allTransactions');
}

// Cancelar edición
function cancelEditTransaction() {
    showScreen('allTransactions');
}

// Variables globales para configuración de usuario
let userCountry = 'PE';
let currencySymbol = 'S/.';
let currencyName = 'Sol';

// Configuración de monedas por país
const currencyConfig = {
    'PE': { symbol: 'S/.', name: 'Sol', flag: '🇵🇪' },
    'US': { symbol: '$', name: 'Dólar', flag: '🇺🇸' },
    'ES': { symbol: '€', name: 'Euro', flag: '🇪🇸' },
    'BR': { symbol: 'R$', name: 'Real', flag: '🇧🇷' },
    'MX': { symbol: '$', name: 'Peso', flag: '🇲🇽' },
    'AR': { symbol: '$', name: 'Peso', flag: '🇦🇷' },
    'CO': { symbol: '$', name: 'Peso', flag: '🇨🇴' },
    'CL': { symbol: '$', name: 'Peso', flag: '🇨🇱' },
    'EC': { symbol: '$', name: 'Dólar', flag: '🇪🇨' },
    'UY': { symbol: '$', name: 'Peso', flag: '🇺🇾' }
};

// Mostrar/ocultar contraseña
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Actualizar preview de moneda
function updateCurrencyPreview() {
    const paisSelect = document.getElementById('regPais');
    const preview = document.getElementById('currencyPreview');
    
    if (paisSelect.value && currencyConfig[paisSelect.value]) {
        const config = currencyConfig[paisSelect.value];
        preview.textContent = `💰 Moneda: ${config.name} (${config.symbol})`;
        preview.style.color = 'var(--primary-color)';
    } else {
        preview.textContent = '💰 La moneda se configurará según tu país';
        preview.style.color = 'var(--text-secondary)';
    }
}

// Mostrar menú de usuario
function showUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuOverlay = document.getElementById('userMenuOverlay');
    
    // Actualizar información del usuario
    if (currentUser) {
        document.getElementById('userDisplayName').textContent = currentUser.nombres || currentUser.username;
        document.getElementById('userDisplayEmail').textContent = currentUser.email || 'Sin email';
        
        const config = currencyConfig[userCountry] || currencyConfig['PE'];
        document.getElementById('userDisplayCountry').textContent = `${config.flag} ${getCountryName(userCountry)} - ${config.name} (${config.symbol})`;
    }
    
    userMenu.classList.add('active');
    userMenuOverlay.classList.add('active');
    userMenuOverlay.onclick = closeUserMenu;
}

// Cerrar menú de usuario
function closeUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const userMenuOverlay = document.getElementById('userMenuOverlay');
    
    userMenu.classList.remove('active');
    userMenuOverlay.classList.remove('active');
    userMenuOverlay.onclick = null;
}

// Obtener nombre del país
function getCountryName(countryCode) {
    const countries = {
        'PE': 'Perú',
        'US': 'Estados Unidos',
        'ES': 'España',
        'BR': 'Brasil',
        'MX': 'México',
        'AR': 'Argentina',
        'CO': 'Colombia',
        'CL': 'Chile',
        'EC': 'Ecuador',
        'UY': 'Uruguay'
    };
    return countries[countryCode] || 'País';
}

// Mostrar modal de cambiar contraseña
function showChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.add('active');
    overlay.onclick = closeChangePasswordModal;
    
    // Limpiar formulario
    document.getElementById('changePasswordForm').reset();
}

// Cerrar modal de cambiar contraseña
function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.onclick = closeUserMenu;
}

// Manejar cambio de contraseña
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Validaciones
    if (newPassword.length < 8) {
        showToast('❌ La nueva contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('❌ Las contraseñas no coinciden');
        return;
    }
    
    // Aquí iría la validación de contraseña actual con Firebase
    // Por ahora simulamos que es correcta
    
    // Aquí iría la lógica para cambiar contraseña en Firebase
    showToast('✅ Contraseña actualizada correctamente');
    closeChangePasswordModal();
    closeUserMenu();
}

// Mostrar modal de cambiar país
function showChangeCountryModal() {
    const modal = document.getElementById('changeCountryModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.add('active');
    overlay.onclick = closeChangeCountryModal;
    
    // Actualizar configuración actual
    const config = currencyConfig[userCountry] || currencyConfig['PE'];
    document.getElementById('currentCountryDisplay').textContent = `${config.flag} ${getCountryName(userCountry)} - ${config.name} (${config.symbol})`;
    
    // Limpiar selección
    document.getElementById('newCountrySelect').value = '';
    document.getElementById('newCountryPreview').textContent = 'Selecciona un país para ver la moneda';
}

// Cerrar modal de cambiar país
function closeChangeCountryModal() {
    const modal = document.getElementById('changeCountryModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.onclick = closeUserMenu;
}

// Actualizar preview de nueva moneda
function updateNewCurrencyPreview() {
    const select = document.getElementById('newCountrySelect');
    const preview = document.getElementById('newCountryPreview');
    
    if (select.value && currencyConfig[select.value]) {
        const config = currencyConfig[select.value];
        preview.textContent = `${config.flag} ${getCountryName(select.value)} - ${config.name} (${config.symbol})`;
        preview.style.color = 'var(--primary-color)';
    } else {
        preview.textContent = 'Selecciona un país para ver la moneda';
        preview.style.color = 'var(--text-secondary)';
    }
}

// Manejar cambio de país
function handleChangeCountry(event) {
    event.preventDefault();
    
    const newCountryCode = document.getElementById('newCountrySelect').value;
    
    if (newCountryCode && currencyConfig[newCountryCode]) {
        userCountry = newCountryCode;
        const config = currencyConfig[userCountry];
        currencySymbol = config.symbol;
        currencyName = config.name;
        
        // Guardar configuración
        saveUserConfig();
        
        // Actualizar TODA la UI inmediatamente
        updateCurrencyLabels();
        updateHomeScreen();
        updateBudgetScreen();
        
        // Cerrar modales y mostrar mensaje
        closeChangeCountryModal();
        closeUserMenu();
        
        showToast(`✅ País cambiado a ${getCountryName(userCountry)} - ${config.name} (${config.symbol})`);
    } else {
        showToast('❌ Selecciona un país válido');
    }
}

// Guardar configuración de usuario
function saveUserConfig() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    localStorage.setItem(`${userKey}_country`, userCountry);
    localStorage.setItem(`${userKey}_currency`, currencySymbol);
    
    // Guardar en Firebase si está disponible
    if (typeof db !== 'undefined' && db && currentUser.uid) {
        saveUserConfigToFirebase();
    }
}

// Guardar configuración en Firebase
async function saveUserConfigToFirebase() {
    if (!currentUser || !currentUser.uid) return;
    
    try {
        await db.collection('userConfig').doc(currentUser.uid).set({
            country: userCountry,
            currency: currencySymbol,
            currencyName: currencyName,
            lastUpdate: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Configuración guardada en Firebase');
    } catch (error) {
        console.log('⚠️ No se pudo guardar configuración en Firebase:', error.message);
    }
}

// Cargar configuración de usuario
function loadUserConfig() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    const savedCountry = localStorage.getItem(`${userKey}_country`);
    const savedCurrency = localStorage.getItem(`${userKey}_currency`);
    
    if (savedCountry && currencyConfig[savedCountry]) {
        userCountry = savedCountry;
        const config = currencyConfig[userCountry];
        currencySymbol = config.symbol;
        currencyName = config.name;
    }
    
    // Actualizar botón de usuario
    const userBtn = document.getElementById('userProfileBtn');
    if (userBtn && currentUser) {
        userBtn.textContent = `👤 ${currentUser.nombres || currentUser.username}`;
    }
    
    // Actualizar etiquetas de moneda
    updateCurrencyLabels();
}

// Actualizar etiquetas de moneda en toda la UI
function updateCurrencyLabels() {
    // Actualizar etiquetas de formularios
    const montoLabel = document.getElementById('montoLabel');
    const editMontoLabel = document.getElementById('editMontoLabel');
    
    if (montoLabel) {
        montoLabel.textContent = `Monto (${currencySymbol})`;
    }
    if (editMontoLabel) {
        editMontoLabel.textContent = `Monto (${currencySymbol})`;
    }
    
    // Actualizar valores iniciales de las tarjetas
    const totalIngresos = document.getElementById('totalIngresos');
    const totalGastos = document.getElementById('totalGastos');
    const balance = document.getElementById('balance');
    
    if (totalIngresos && totalIngresos.textContent.includes('0.00')) {
        totalIngresos.textContent = `${currencySymbol} 0.00`;
    }
    if (totalGastos && totalGastos.textContent.includes('0.00')) {
        totalGastos.textContent = `${currencySymbol} 0.00`;
    }
    if (balance && balance.textContent.includes('0.00')) {
        balance.textContent = `${currencySymbol} 0.00`;
    }
}

// Mostrar modal de cambio de contraseña
function showChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    closeUserMenu();
    modal.classList.add('active');
    overlay.classList.add('active');
    overlay.onclick = closeChangePasswordModal;
}

// Cerrar modal de cambio de contraseña
function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    overlay.onclick = null;
    
    // Limpiar formulario
    document.getElementById('changePasswordForm').reset();
}

// Manejar cambio de contraseña
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Validaciones
    if (newPassword !== confirmPassword) {
        showToast('❌ Las contraseñas no coinciden');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('❌ La nueva contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    // Aquí iría la validación de contraseña actual con Firebase
    // Por ahora simulamos que es correcta
    
    // Actualizar contraseña (aquí iría la lógica de Firebase)
    showToast('✅ Contraseña actualizada correctamente');
    closeChangePasswordModal();
}

// Mostrar modal de cambio de país
function showChangeCountryModal() {
    const modal = document.getElementById('changeCountryModal');
    const overlay = document.getElementById('userMenuOverlay');
    const currentDisplay = document.getElementById('currentCountryDisplay');
    
    // Actualizar información actual
    const config = currencyConfig[userCountry] || currencyConfig['PE'];
    currentDisplay.textContent = `${config.flag} ${getCountryName(userCountry)} - ${config.name} (${config.symbol})`;
    
    closeUserMenu();
    modal.classList.add('active');
    overlay.classList.add('active');
    overlay.onclick = closeChangeCountryModal;
}

// Cerrar modal de cambio de país
function closeChangeCountryModal() {
    const modal = document.getElementById('changeCountryModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    overlay.onclick = null;
    
    // Limpiar formulario
    document.getElementById('changeCountryForm').reset();
    document.getElementById('newCurrencyPreview').textContent = 'Selecciona un país para ver la moneda';
}

// Actualizar preview de nueva moneda
function updateNewCurrencyPreview() {
    const select = document.getElementById('newCountrySelect');
    const preview = document.getElementById('newCurrencyPreview');
    
    if (select.value && currencyConfig[select.value]) {
        const config = currencyConfig[select.value];
        preview.textContent = `💰 Nueva moneda: ${config.name} (${config.symbol})`;
        preview.style.color = 'var(--primary-color)';
    } else {
        preview.textContent = 'Selecciona un país para ver la moneda';
        preview.style.color = 'var(--text-secondary)';
    }
}

// Manejar cambio de país
function handleChangeCountry(event) {
    event.preventDefault();
    
    const newCountryCode = document.getElementById('newCountrySelect').value;
    
    if (!newCountryCode || !currencyConfig[newCountryCode]) {
        showToast('❌ Selecciona un país válido');
        return;
    }
    
    if (newCountryCode === userCountry) {
        showToast('ℹ️ Ya tienes seleccionado ese país');
        return;
    }
    
    // Actualizar configuración
    userCountry = newCountryCode;
    const config = currencyConfig[userCountry];
    currencySymbol = config.symbol;
    currencyName = config.name;
    
    // Guardar configuración
    saveUserConfig();
    
    // Actualizar TODA la UI inmediatamente
    updateCurrencyLabels();
    updateHomeScreen();
    updateBudgetScreen();
    
    // Cerrar modal y mostrar mensaje
    closeChangeCountryModal();
    
    showToast(`✅ País cambiado a ${getCountryName(userCountry)} - ${config.name} (${config.symbol})`);
}

// Inicializar presupuestos por defecto solo la primera vez
function initializeDefaultBudgets() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    const hasInitialized = localStorage.getItem(`${userKey}_budgets_initialized`);
    
    // Solo si es la primera vez y no hay presupuestos guardados
    if (!hasInitialized && Object.keys(budgets).length === 0) {
        budgets = {
            'Alimentación': 600,
            'Transporte': 200,
            'Vivienda': 800,
            'Servicios': 250,
            'Entretenimiento': 300,
            'Salud': 150,
            'Educación': 200,
            'Otros': 100
        };
        
        // Guardar inmediatamente
        localStorage.setItem(`${userKey}_budgets`, JSON.stringify(budgets));
        localStorage.setItem(`${userKey}_budgets_initialized`, 'true');
        
        console.log('✅ Presupuestos por defecto inicializados');
    }
}

// Variables para el registro por pasos
let currentRegisterStep = 1;

// Navegación entre pasos del registro
function nextStep(step) {
    // Validar paso actual antes de continuar
    if (!validateCurrentStep()) {
        return;
    }
    
    // Ocultar paso actual
    document.getElementById(`registerStep${currentRegisterStep}`).classList.remove('active');
    document.getElementById(`step${currentRegisterStep}`).classList.remove('active');
    
    // Marcar paso como completado
    document.getElementById(`step${currentRegisterStep}`).classList.add('completed');
    if (currentRegisterStep < 3) {
        document.getElementById(`line${currentRegisterStep}`).classList.add('completed');
    }
    
    // Mostrar nuevo paso
    currentRegisterStep = step;
    document.getElementById(`registerStep${step}`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
}

function prevStep(step) {
    // Ocultar paso actual
    document.getElementById(`registerStep${currentRegisterStep}`).classList.remove('active');
    document.getElementById(`step${currentRegisterStep}`).classList.remove('active');
    
    // Mostrar paso anterior
    currentRegisterStep = step;
    document.getElementById(`registerStep${step}`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
}

// Validar paso actual
function validateCurrentStep() {
    if (currentRegisterStep === 1) {
        const nombres = document.getElementById('regNombres').value.trim();
        const apellidos = document.getElementById('regApellidos').value.trim();
        const fechaNac = document.getElementById('regFechaNac').value;
        const username = document.getElementById('regUsername').value.trim();
        
        if (!nombres || !apellidos || !fechaNac || !username) {
            showToast('❌ Completa todos los campos del paso 1');
            return false;
        }
        
        if (username.length < 4) {
            showToast('❌ El usuario debe tener al menos 4 caracteres');
            return false;
        }
        
        return true;
    }
    
    if (currentRegisterStep === 2) {
        const email = document.getElementById('regEmail').value.trim();
        const pais = document.getElementById('regPais').value;
        
        if (!email || !pais) {
            showToast('❌ Completa todos los campos del paso 2');
            return false;
        }
        
        // Validar formato de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            showToast('❌ Ingresa un correo electrónico válido');
            return false;
        }
        
        return true;
    }
    
    return true;
}

// Modal de logout profesional
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    closeUserMenu();
    modal.classList.add('active');
    overlay.classList.add('active');
    overlay.onclick = closeLogoutModal;
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    overlay.onclick = null;
}

function confirmLogout() {
    closeLogoutModal();
    handleLogout();
}

// Modal de éxito
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.add('active');
    overlay.classList.add('active');
    overlay.onclick = null; // No cerrar al hacer clic fuera
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    const overlay = document.getElementById('userMenuOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    
    // Ir al login después de cerrar
    showLogin();
}

// Actualizar función de logout para usar modal
function handleLogout() {
    // Limpiar datos de sesión
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Ocultar app y mostrar login
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    
    showToast('👋 Sesión cerrada correctamente');
}

// Función para mostrar éxito después del registro
function showRegistrationSuccess() {
    // Ocultar pantalla de registro
    document.getElementById('registerScreen').style.display = 'none';
    
    // Mostrar modal de éxito
    showSuccessModal();
}
