// ========================================
// SISTEMA DE AUTENTICACIÓN
// ========================================

let currentUser = null;
let loginAttempts = {};

// Función para ocultar loading
function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Inicializar autenticación
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        checkAuth();
    }, 500);
});

// Verificar si hay sesión activa
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLogin();
    }
}

// Mostrar pantalla de login
function showLogin() {
    hideLoading();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
}

// Mostrar pantalla de registro
function showRegister() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

// Mostrar app
function showApp() {
    hideLoading();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Inicializar app con datos del usuario
    if (typeof initApp === 'function') {
        initApp();
    } else {
        loadData();
        updateUI();
    }
}

// Generar nombre de usuario automáticamente
function generateUsername() {
    const nombres = document.getElementById('regNombres').value.trim();
    const apellidos = document.getElementById('regApellidos').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;
    
    if (nombres && apellidos && fechaNac) {
        // Obtener primera letra del primer nombre
        const primerNombre = nombres.split(' ')[0];
        const primeraLetra = primerNombre.charAt(0).toLowerCase();
        
        // Obtener primer apellido
        const primerApellido = apellidos.split(' ')[0].toLowerCase();
        
        // Obtener día de nacimiento
        const fecha = new Date(fechaNac);
        const dia = String(fecha.getDate()).padStart(2, '0');
        
        // Generar username: jmorales08
        const username = primeraLetra + primerApellido + dia;
        
        document.getElementById('regUsername').value = username;
    }
}

// Validar contraseña
function validatePassword() {
    const password = document.getElementById('regPassword').value;
    const strengthEl = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthEl.textContent = '';
        strengthEl.className = 'password-strength';
        return;
    }
    
    // Validar requisitos
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasMinLength) {
        strengthEl.textContent = '❌ Mínimo 8 caracteres';
        strengthEl.className = 'password-strength weak';
    } else if (!hasNumber) {
        strengthEl.textContent = '❌ Debe incluir al menos un número';
        strengthEl.className = 'password-strength weak';
    } else if (!hasLetter) {
        strengthEl.textContent = '❌ Debe incluir letras';
        strengthEl.className = 'password-strength weak';
    } else {
        // Calcular fortaleza
        let strength = 0;
        if (hasMinLength) strength++;
        if (hasNumber) strength++;
        if (hasLetter) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;
        
        if (strength <= 3) {
            strengthEl.textContent = '⚠️ Contraseña débil';
            strengthEl.className = 'password-strength weak';
        } else if (strength <= 4) {
            strengthEl.textContent = '✓ Contraseña media';
            strengthEl.className = 'password-strength medium';
        } else {
            strengthEl.textContent = '✓ Contraseña fuerte';
            strengthEl.className = 'password-strength strong';
        }
    }
}

// Manejar registro
function handleRegister(event) {
    event.preventDefault();
    
    const nombres = document.getElementById('regNombres').value.trim();
    const apellidos = document.getElementById('regApellidos').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const terms = document.getElementById('regTerms').checked;
    
    const errorEl = document.getElementById('registerError');
    
    // Validaciones
    if (!terms) {
        showError(errorEl, 'Debes aceptar los términos y políticas');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.com')) {
        showError(errorEl, 'El correo debe contener @ y .com');
        return;
    }
    
    if (password.length < 8) {
        showError(errorEl, 'La contraseña debe tener mínimo 8 caracteres');
        return;
    }
    
    if (!/\d/.test(password)) {
        showError(errorEl, 'La contraseña debe incluir al menos un número');
        return;
    }
    
    if (password !== passwordConfirm) {
        showError(errorEl, 'Las contraseñas no coinciden');
        return;
    }
    
    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        showError(errorEl, 'El usuario ya existe. Intenta con otro nombre.');
        return;
    }
    
    // Crear usuario
    const newUser = {
        username: username,
        nombres: nombres,
        apellidos: apellidos,
        fechaNac: fechaNac,
        email: email,
        password: btoa(password), // Codificar contraseña (básico)
        createdAt: new Date().toISOString(),
        blocked: false,
        loginAttempts: 0
    };
    
    users[username] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mostrar mensaje de éxito
    showToast('✅ Usuario creado correctamente');
    
    // Limpiar formulario
    document.getElementById('registerForm').reset();
    
    // Ir a login después de 2 segundos
    setTimeout(() => {
        showLogin();
        document.getElementById('loginUsername').value = username;
    }, 2000);
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const errorEl = document.getElementById('loginError');
    
    // Obtener usuarios
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    
    if (!user) {
        showError(errorEl, 'Usuario no encontrado');
        return;
    }
    
    // Verificar si está bloqueado
    if (user.blocked) {
        showError(errorEl, 'Usuario bloqueado. Contacta al administrador.');
        return;
    }
    
    // Verificar contraseña
    if (btoa(password) !== user.password) {
        // Incrementar intentos fallidos
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        if (user.loginAttempts >= 3) {
            user.blocked = true;
            users[username] = user;
            localStorage.setItem('users', JSON.stringify(users));
            showError(errorEl, 'Usuario bloqueado por múltiples intentos fallidos');
        } else {
            const remaining = 3 - user.loginAttempts;
            users[username] = user;
            localStorage.setItem('users', JSON.stringify(users));
            showError(errorEl, `Contraseña incorrecta. Te quedan ${remaining} intentos`);
        }
        return;
    }
    
    // Login exitoso
    user.loginAttempts = 0;
    user.lastLogin = new Date().toISOString();
    users[username] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Guardar sesión
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Mostrar app
    showToast(`¡Bienvenido ${user.nombres}!`);
    showApp();
}

// Cerrar sesión
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showToast('Sesión cerrada');
        showLogin();
    }
}

// Mostrar error
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Mostrar/ocultar términos
function showTerms() {
    document.getElementById('termsModal').classList.add('show');
}

function closeTerms() {
    document.getElementById('termsModal').classList.remove('show');
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('termsModal');
    if (event.target == modal) {
        closeTerms();
    }
}
