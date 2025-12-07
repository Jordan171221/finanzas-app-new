// ========================================
// INTEGRACIÓN CON GOOGLE SHEETS
// Cada usuario tiene su propio archivo Excel en Google Drive
// ========================================

// Configuración de Google API
// IMPORTANTE: Crea un archivo 'google-sheets-config.js' con tus credenciales
// Usa 'google-sheets-config.example.js' como plantilla
const GOOGLE_CLIENT_ID = '965122297432-oag7khugg1ikc1980q4tjl644i6uglik.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyC6LmxwopDqpTZIgKJfBLERTGE8K9EZ_Uw';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let gisInited = false;
let tokenClient;
let userSpreadsheetId = null;

// Inicializar Google API
function initGoogleAPI() {
    gapi.load('client', initializeGapiClient);
    gisInited = true;
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // Se define después
    });
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
}

// Solicitar autorización de Google
function authorizeGoogleSheets() {
    return new Promise((resolve, reject) => {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                reject(resp);
                return;
            }
            
            // Guardar token en Firebase para el usuario
            if (currentUser && firebaseInitialized) {
                await db.collection('users').doc(currentUser.uid).update({
                    googleAuthorized: true,
                    lastGoogleAuth: new Date().toISOString()
                });
            }
            
            resolve(resp);
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

// Crear archivo de Google Sheets para el usuario
async function createUserSpreadsheet() {
    try {
        showToast('📊 Creando tu archivo de finanzas...');
        
        const userName = currentUser.nombres || 'Usuario';
        const spreadsheetTitle = `Finanzas Personales - ${userName}`;
        
        // Crear el spreadsheet
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: {
                title: spreadsheetTitle
            },
            sheets: [
                {
                    properties: {
                        title: 'Transacciones',
                        gridProperties: {
                            frozenRowCount: 1
                        }
                    }
                },
                {
                    properties: {
                        title: 'Presupuestos'
                    }
                },
                {
                    properties: {
                        title: 'Resumen'
                    }
                }
            ]
        });
        
        const spreadsheetId = response.result.spreadsheetId;
        userSpreadsheetId = spreadsheetId;
        
        // Configurar encabezados
        await setupSpreadsheetHeaders(spreadsheetId);
        
        // Guardar ID en Firebase
        if (currentUser && firebaseInitialized) {
            await db.collection('users').doc(currentUser.uid).update({
                spreadsheetId: spreadsheetId,
                spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
                spreadsheetCreated: new Date().toISOString()
            });
        }
        
        showToast('✅ Archivo creado exitosamente');
        return spreadsheetId;
        
    } catch (error) {
        console.error('Error al crear spreadsheet:', error);
        showToast('❌ Error al crear archivo');
        throw error;
    }
}

// Configurar encabezados del spreadsheet
async function setupSpreadsheetHeaders(spreadsheetId) {
    const requests = [
        {
            updateCells: {
                range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 6
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'Fecha' } },
                        { userEnteredValue: { stringValue: 'Tipo' } },
                        { userEnteredValue: { stringValue: 'Categoría' } },
                        { userEnteredValue: { stringValue: 'Descripción' } },
                        { userEnteredValue: { stringValue: 'Monto' } },
                        { userEnteredValue: { stringValue: 'ID' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        },
        {
            repeatCell: {
                range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                        textFormat: {
                            foregroundColor: { red: 1, green: 1, blue: 1 },
                            bold: true
                        }
                    }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
        }
    ];
    
    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: { requests: requests }
    });
}

// Obtener o crear spreadsheet del usuario
async function getUserSpreadsheet() {
    if (userSpreadsheetId) {
        return userSpreadsheetId;
    }
    
    // Verificar si el usuario ya tiene un spreadsheet
    if (currentUser && firebaseInitialized) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (userData.spreadsheetId) {
            userSpreadsheetId = userData.spreadsheetId;
            return userSpreadsheetId;
        }
    }
    
    // Crear nuevo spreadsheet
    return await createUserSpreadsheet();
}

// Sincronizar transacciones a Google Sheets
async function syncToGoogleSheets(transactions) {
    try {
        if (!gapiInited || !gapi.client.getToken()) {
            showToast('⚠️ Debes autorizar Google Sheets primero');
            return false;
        }
        
        showToast('☁️ Sincronizando con Google Sheets...');
        
        const spreadsheetId = await getUserSpreadsheet();
        
        // Limpiar datos existentes (excepto encabezados)
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheetId,
            range: 'Transacciones!A2:F'
        });
        
        // Preparar datos
        const values = transactions.map(t => [
            t.fecha,
            t.tipo,
            t.categoria,
            t.descripcion || '',
            t.monto,
            t.id
        ]);
        
        // Subir datos
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: 'Transacciones!A2',
            valueInputOption: 'USER_ENTERED',
            resource: { values: values }
        });
        
        // Actualizar presupuestos
        await syncBudgetsToSheets(spreadsheetId);
        
        showToast('✅ Sincronizado con Google Sheets');
        return true;
        
    } catch (error) {
        console.error('Error al sincronizar:', error);
        showToast('❌ Error al sincronizar');
        return false;
    }
}

// Sincronizar presupuestos
async function syncBudgetsToSheets(spreadsheetId) {
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    
    const values = [
        ['Categoría', 'Presupuesto', 'Gastado', 'Disponible']
    ];
    
    for (const [categoria, presupuesto] of Object.entries(budgets)) {
        const gastado = calcularGastadoPorCategoria(categoria);
        const disponible = presupuesto - gastado;
        values.push([categoria, presupuesto, gastado, disponible]);
    }
    
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Presupuestos!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: values }
    });
}

// Importar desde Google Sheets
async function importFromGoogleSheets() {
    try {
        if (!gapiInited || !gapi.client.getToken()) {
            showToast('⚠️ Debes autorizar Google Sheets primero');
            return false;
        }
        
        showToast('📥 Importando desde Google Sheets...');
        
        const spreadsheetId = await getUserSpreadsheet();
        
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Transacciones!A2:F'
        });
        
        const rows = response.result.values;
        
        if (!rows || rows.length === 0) {
            showToast('ℹ️ No hay datos para importar');
            return false;
        }
        
        const transactions = rows.map(row => ({
            fecha: row[0],
            tipo: row[1],
            categoria: row[2],
            descripcion: row[3] || '',
            monto: parseFloat(row[4]),
            id: row[5]
        }));
        
        // Guardar en Firebase o localStorage
        if (firebaseInitialized && currentUser) {
            const batch = db.batch();
            transactions.forEach(t => {
                const docRef = db.collection('transactions').doc(t.id);
                batch.set(docRef, {
                    ...t,
                    userId: currentUser.uid
                });
            });
            await batch.commit();
        } else {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
        
        showToast('✅ Datos importados correctamente');
        loadTransactions();
        return true;
        
    } catch (error) {
        console.error('Error al importar:', error);
        showToast('❌ Error al importar datos');
        return false;
    }
}

// Abrir Google Sheets del usuario
function openUserSpreadsheet() {
    if (userSpreadsheetId) {
        window.open(`https://docs.google.com/spreadsheets/d/${userSpreadsheetId}`, '_blank');
    } else if (currentUser && currentUser.spreadsheetUrl) {
        window.open(currentUser.spreadsheetUrl, '_blank');
    } else {
        showToast('⚠️ Aún no tienes un archivo de Google Sheets');
    }
}

// Calcular gastado por categoría
function calcularGastadoPorCategoria(categoria) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions
        .filter(t => t.tipo === 'Gasto' && t.categoria === categoria)
        .reduce((sum, t) => sum + t.monto, 0);
}

// Revocar acceso a Google
function revokeGoogleAccess() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        showToast('✅ Acceso revocado');
    }
}
