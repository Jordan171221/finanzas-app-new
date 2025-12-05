// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

// INSTRUCCIONES PARA CONFIGURAR:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un proyecto nuevo (gratis)
// 3. Agrega una app web
// 4. Copia la configuración aquí abajo
// 5. Habilita Firestore Database
// 6. Habilita Authentication (Email/Password)

// CONFIGURACIÓN DE FIREBASE
// Reemplaza estos valores con los tuyos de Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAF0aouv4bl-rT69T1KlWRsvgkhyAptHao",
    authDomain: "finanzas-app-new.firebaseapp.com",
    projectId: "finanzas-app-new",
    storageBucket: "finanzas-app-new.firebasestorage.app",
    messagingSenderId: "322100744170",
    appId: "1:322100744170:web:db153ecf2f1eceaf466c93"
};

// Inicializar Firebase (se hace en index.html)
let db = null;
let auth = null;

function initFirebase() {
    try {
        // Verificar si Firebase está cargado
        if (typeof firebase === 'undefined') {
            console.error('Firebase no está cargado');
            return false;
        }

        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Obtener referencias
        db = firebase.firestore();
        auth = firebase.auth();

        console.log('✅ Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        return false;
    }
}

// Verificar si Firebase está configurado
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "TU_API_KEY_AQUI";
}

// Modo offline (si Firebase no está configurado)
const OFFLINE_MODE = !isFirebaseConfigured();

if (OFFLINE_MODE) {
    console.warn('⚠️ Firebase no configurado. Funcionando en modo offline (localStorage)');
    console.log('📖 Lee GUIA_FIREBASE.md para configurar la sincronización en la nube');
}
