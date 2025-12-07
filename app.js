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
    updateUI();
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
    }
}

// Guardar datos en localStorage (por usuario)
function saveData() {
    if (!currentUser) return;
    
    const userKey = `user_${currentUser.username}`;
    localStorage.setItem(`${userKey}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${userKey}_budgets`, JSON.stringify(budgets));
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
    
    // Cerrar menú
    toggleMenu();
    
    // Actualizar contenido según la pantalla
    if (screenName === 'home') {
        updateHomeScreen();
    } else if (screenName === 'budget') {
        updateBudgetScreen();
    } else if (screenName === 'stats') {
        updateStatsScreen();
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
function saveTransaction(event) {
    event.preventDefault();
    
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value || 'Sin descripción';
    
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
    
    transactions.unshift(transaction);
    saveData();
    
    // Limpiar formulario
    document.getElementById('transactionForm').reset();
    
    // Mostrar mensaje
    showToast(`✅ ${currentType} guardado: S/. ${monto.toFixed(2)}`);
    
    // Volver al inicio
    setTimeout(() => {
        showScreen('home');
    }, 1000);
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
    document.getElementById('totalIngresos').textContent = `S/. ${totalIngresos.toFixed(2)}`;
    document.getElementById('totalGastos').textContent = `S/. ${totalGastos.toFixed(2)}`;
    document.getElementById('balance').textContent = `S/. ${balance.toFixed(2)}`;
    
    // Actualizar lista de transacciones
    const transactionsList = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <p style="font-size: 48px; margin-bottom: 10px;">📝</p>
                <p>No hay transacciones aún</p>
                <p style="font-size: 14px; margin-top: 10px;">Toca el botón ➕ para agregar una</p>
            </div>
        `;
    } else {
        const recentTransactions = transactions.slice(0, 10);
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
            
            return `
                <div class="transaction-item">
                    <div class="transaction-icon">${icon}</div>
                    <div class="transaction-content">
                        <div class="transaction-desc">${t.descripcion}</div>
                        <div class="transaction-meta">${t.categoria} • ${dateStr}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        S/. ${t.monto.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
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
    budgetList.innerHTML = Object.keys(budgets).map(categoria => {
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
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-category">📁 ${categoria}</div>
                    <div class="budget-status ${status}">${statusText}</div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${Math.min(porcentaje, 100)}%; background: ${color};"></div>
                </div>
                <div class="budget-info">
                    <span>Gastado: S/. ${gastado.toFixed(2)} (${porcentaje.toFixed(0)}%)</span>
                    <span>Disponible: S/. ${disponible.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
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


// ========================================
// FUNCIONES DE GOOGLE SHEETS
// ========================================

// Inicializar Google API cuando la app carga
window.addEventListener('load', () => {
    if (typeof initGoogleAPI === 'function') {
        initGoogleAPI();
    }
});

// Manejar autorización de Google
async function handleGoogleAuthorization() {
    try {
        showToast('🔑 Solicitando autorización...');
        await authorizeGoogleSheets();
        updateGoogleSheetsUI();
        showToast('✅ Autorización exitosa');
    } catch (error) {
        console.error('Error en autorización:', error);
        showToast('❌ Error al autorizar');
    }
}

// Manejar sincronización a Google Sheets
async function handleSyncToSheets() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (transactions.length === 0) {
        showToast('⚠️ No hay transacciones para sincronizar');
        return;
    }
    
    const success = await syncToGoogleSheets(transactions);
    if (success) {
        updateGoogleSheetsUI();
    }
}

// Manejar importación desde Google Sheets
async function handleImportFromSheets() {
    if (confirm('¿Deseas importar datos desde Google Sheets? Esto sobrescribirá tus datos locales.')) {
        const success = await importFromGoogleSheets();
        if (success) {
            updateGoogleSheetsUI();
        }
    }
}

// Manejar revocación de acceso
function handleRevokeGoogle() {
    if (confirm('¿Estás seguro de que quieres revocar el acceso a Google Sheets?')) {
        revokeGoogleAccess();
        updateGoogleSheetsUI();
    }
}

// Actualizar UI de Google Sheets
function updateGoogleSheetsUI() {
    const isAuthorized = gapi && gapi.client && gapi.client.getToken() !== null;
    
    document.getElementById('googleNotAuthorized').style.display = isAuthorized ? 'none' : 'block';
    document.getElementById('googleAuthorized').style.display = isAuthorized ? 'block' : 'none';
    
    if (isAuthorized && currentUser) {
        const infoEl = document.getElementById('spreadsheetInfo');
        if (currentUser.spreadsheetUrl) {
            infoEl.innerHTML = `
                <strong>📄 Archivo:</strong> Finanzas Personales - ${currentUser.nombres}<br>
                <strong>🔗 URL:</strong> <a href="${currentUser.spreadsheetUrl}" target="_blank">Abrir en Google Sheets</a><br>
                <strong>📅 Creado:</strong> ${new Date(currentUser.spreadsheetCreated).toLocaleDateString('es-PE')}
            `;
        } else {
            infoEl.textContent = 'Aún no has creado tu archivo de Google Sheets. Sincroniza para crearlo automáticamente.';
        }
    }
}

// Mostrar pantalla de Google Sheets
function showGoogleSheetsScreen() {
    showScreen('googleSheets');
    updateGoogleSheetsUI();
}
