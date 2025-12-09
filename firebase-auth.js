// ========================================
// AUTENTICACIÓN CON FIREBASE
// Reemplaza el sistema localStorage con Firebase
// ========================================

let currentUser = null;
let firebaseInitialized = false;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicializar Firebase
    firebaseInitialized = initFirebase();
    
    setTimeout(() => {
        checkAuth();
    }, 500);
});

// Verificar autenticación
function checkAuth() {
    console.log('🔍 Verificando autenticación...');
    
    if (firebaseInitialized && auth) {
        // Usar Firebase Authentication
        console.log('✅ Usando Firebase Authentication');
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Usuario autenticado - cargar datos básicos primero
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    nombres: user.displayName || 'Usuario',
                    username: user.email.split('@')[0]
                };
                
                // Guardar en localStorage inmediatamente
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Mostrar app de inmediato
                showApp();
                
                // Cargar datos adicionales en segundo plano
                loadUserData(user.uid).catch(err => {
                    console.log('⚠️ No se pudieron cargar datos adicionales, usando básicos');
                });
            } else {
                // No hay usuario autenticado
                showLogin();
            }
        });
    } else {
        // Modo offline - usar localStorage
        console.log('⚠️ Modo offline - usando localStorage');
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showApp();
        } else {
            showLogin();
        }
    }
}

// Cargar datos del usuario desde Firebase (en segundo plano)
async function loadUserData(uid) {
    if (!firebaseInitialized || !db) {
        return;
    }
    
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Actualizar solo si hay datos adicionales
            currentUser = {
                ...currentUser,
                ...userData,
                uid: uid
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('✅ Datos adicionales cargados desde Firebase');
        }
    } catch (error) {
        console.log('⚠️ No se pudieron cargar datos adicionales:', error.message);
        // No hacer nada, ya tenemos datos básicos
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
    console.log('🚀 Mostrando app...');
    hideLoading();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    console.log('✅ App visible');
    
    if (typeof initApp === 'function') {
        console.log('🔄 Inicializando app...');
        initApp();
    } else {
        console.warn('⚠️ initApp no está definida');
    }
}

// Ocultar loading
function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Generar nombre de usuario
function generateUsername() {
    const nombres = document.getElementById('regNombres').value.trim();
    const apellidos = document.getElementById('regApellidos').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;
    
    if (nombres && apellidos && fechaNac) {
        const primerNombre = nombres.split(' ')[0];
        const primeraLetra = primerNombre.charAt(0).toLowerCase();
        const primerApellido = apellidos.split(' ')[0].toLowerCase();
        const fecha = new Date(fechaNac);
        const dia = String(fecha.getDate()).padStart(2, '0');
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
        let strength = 0;
        if (hasMinLength) strength++;
        if (hasNumber) strength++;
        if (hasLetter) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        
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
async function handleRegister(event) {
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
    
    // Registrar con Firebase o localStorage
    if (firebaseInitialized && auth) {
        // Registrar con Firebase
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Guardar datos en localStorage primero
            const userData = {
                uid: user.uid,
                username: username,
                nombres: nombres,
                apellidos: apellidos,
                fechaNac: fechaNac,
                email: email,
                createdAt: new Date().toISOString(),
                blocked: false,
                loginAttempts: 0
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Guardar mapeo username -> email en localStorage para búsqueda rápida
            const usernameMap = JSON.parse(localStorage.getItem('usernameMap') || '{}');
            usernameMap[username] = email;
            localStorage.setItem('usernameMap', JSON.stringify(usernameMap));
            
            // Intentar guardar en Firestore (opcional)
            if (db) {
                try {
                    // Guardar en la colección users con el UID
                    await db.collection('users').doc(user.uid).set(userData);
                    
                    // Guardar también en una colección de mapeo username -> uid
                    await db.collection('usernames').doc(username).set({
                        uid: user.uid,
                        email: email
                    });
                    
                    console.log('✅ Datos guardados en Firestore');
                } catch (firestoreError) {
                    console.log('⚠️ No se pudo guardar en Firestore, pero está en localStorage');
                }
            }
            
            showToast('✅ Usuario creado correctamente');
            
            setTimeout(() => {
                showLogin();
            }, 2000);
            
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                showError(errorEl, 'El correo ya está registrado');
            } else {
                showError(errorEl, 'Error al crear usuario: ' + error.message);
            }
        }
    } else {
        // Modo offline - usar localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[username]) {
            showError(errorEl, 'El usuario ya existe');
            return;
        }
        
        const newUser = {
            username: username,
            nombres: nombres,
            apellidos: apellidos,
            fechaNac: fechaNac,
            email: email,
            password: btoa(password),
            createdAt: new Date().toISOString(),
            blocked: false,
            loginAttempts: 0
        };
        
        users[username] = newUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('✅ Usuario creado correctamente');
        
        document.getElementById('registerForm').reset();
        
        setTimeout(() => {
            showLogin();
            document.getElementById('loginUsername').value = username;
        }, 2000);
    }
}

// Manejar login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (firebaseInitialized && auth) {
        // Login con Firebase - buscar email
        let userEmail = null;
        
        // 1. Buscar en el mapa de usernames (localStorage)
        const usernameMap = JSON.parse(localStorage.getItem('usernameMap') || '{}');
        if (usernameMap[username]) {
            userEmail = usernameMap[username];
        }
        
        // 2. Si no está en localStorage, buscar en Firestore
        if (!userEmail && db) {
            try {
                const usernameDoc = await db.collection('usernames').doc(username).get();
                
                if (usernameDoc.exists) {
                    userEmail = usernameDoc.data().email;
                    // Guardar en localStorage para próximas veces
                    usernameMap[username] = userEmail;
                    localStorage.setItem('usernameMap', JSON.stringify(usernameMap));
                } else {
                    // Si no existe en usernames, buscar en users
                    console.log('⚠️ Buscando usuario en colección users...');
                    const usersSnapshot = await db.collection('users')
                        .where('username', '==', username)
                        .limit(1)
                        .get();
                    
                    if (!usersSnapshot.empty) {
                        const userData = usersSnapshot.docs[0].data();
                        userEmail = userData.email;
                        
                        // Guardar en localStorage
                        usernameMap[username] = userEmail;
                        localStorage.setItem('usernameMap', JSON.stringify(usernameMap));
                        
                        // Intentar crear el mapeo en Firestore para próximas veces
                        try {
                            await db.collection('usernames').doc(username).set({
                                uid: userData.uid,
                                email: userEmail
                            });
                            console.log('✅ Mapeo creado en Firestore');
                        } catch (err) {
                            console.log('⚠️ No se pudo crear mapeo en Firestore');
                        }
                    }
                }
            } catch (error) {
                console.log('⚠️ Error al buscar en Firestore:', error.message);
            }
        }
        
        if (!userEmail) {
            showError(errorEl, 'Usuario no encontrado');
            return;
        }
        
        // Intentar login
        try {
            await auth.signInWithEmailAndPassword(userEmail, password);
            showToast(`¡Bienvenido!`);
            // showApp se llamará automáticamente por onAuthStateChanged
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                showError(errorEl, 'Contraseña incorrecta');
            } else if (error.code === 'auth/user-not-found') {
                showError(errorEl, 'Usuario no encontrado');
            } else if (error.code === 'auth/invalid-credential') {
                showError(errorEl, 'Contraseña incorrecta');
            } else {
                showError(errorEl, 'Error al iniciar sesión');
            }
        }
        
    } else {
        // Modo offline - usar localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[username];
        
        if (!user) {
            showError(errorEl, 'Usuario no encontrado');
            return;
        }
        
        if (user.blocked) {
            showError(errorEl, 'Usuario bloqueado. Contacta al administrador.');
            return;
        }
        
        if (btoa(password) !== user.password) {
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
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showToast(`¡Bienvenido ${user.nombres}!`);
        showApp();
    }
}

// Cerrar sesión
async function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        if (firebaseInitialized && auth) {
            await auth.signOut();
        }
        
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

// Mostrar toast
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Mostrar términos
function showTerms() {
    document.getElementById('termsModal').classList.add('show');
}

// Cerrar términos
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
