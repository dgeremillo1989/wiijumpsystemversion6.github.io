// ===== Admin Console Core Script =====
// Handles authentication, session management, and admin operations

const ADMIN_CONFIG = {
    STORAGE_KEY_PASS: 'admin_pass',
    STORAGE_KEY_AUTH: 'admin_session',
    STORAGE_KEY_SESSIONS: 'wii_sessions',
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
};

let adminLoginAttempts = 0;
let adminLockoutUntil = null;

// ===== Initialize Admin Password on First Load =====
function initializeAdminPassword() {
    if (!localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_PASS)) {
        // Set default admin password on first use
        localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY_PASS, 'Admin123!');
        console.warn('Admin system initialized with default password: Admin123!');
        console.warn('⚠️ IMPORTANT: Change this password immediately in production!');
    }
}

// ===== Utility: Sanitize HTML =====
function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Utility: Show/Hide Alert =====
function showAdminAlert(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `${type === 'error' ? 'error-msg' : 'success-msg'}`;
        element.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 4000);
        }
    }
}

function clearAdminAlert(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
        element.textContent = '';
    }
}

// ===== Admin Login Handler =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPassword();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportData);
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClearData);
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }

    // Check if already logged in
    checkAdminSession();
});

// ===== Login Handler =====
function handleAdminLogin(e) {
    e.preventDefault();
    clearAdminAlert('loginError');

    // Check lockout status
    if (adminLockoutUntil && Date.now() < adminLockoutUntil) {
        const remainingMinutes = Math.ceil((adminLockoutUntil - Date.now()) / 1000 / 60);
        showAdminAlert('loginError', `Too many login attempts. Try again in ${remainingMinutes} minute(s).`);
        return;
    }

    
    cconst storedUsername = localStorage.getItem('admin_user');
const storedPassword = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_PASS);

if (username === storedUsername && password === storedPassword) {
    // Valid credentials
    ...
}
const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    if (!username || !password) {
        showAdminAlert('loginError', 'Username and password are required.');
        return;
    }

    // Disable button during submission
    loginBtn.disabled = true;
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Authenticating...';

    // Simulate auth delay
    setTimeout(() => {
        try {
            const storedPassword = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_PASS);

            if (username === 'admin' && password === storedPassword) {
                // Valid credentials
                adminLoginAttempts = 0;
                adminLockoutUntil = null;
                const sessionToken = generateSecureAdminToken();
                sessionStorage.setItem(ADMIN_CONFIG.STORAGE_KEY_AUTH, sessionToken);
                sessionStorage.setItem(ADMIN_CONFIG.STORAGE_KEY_AUTH + '_expires', 
                    Date.now() + ADMIN_CONFIG.SESSION_TIMEOUT);
                
                checkAdminSession();
            } else {
                // Invalid credentials
                adminLoginAttempts++;
                if (adminLoginAttempts >= ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
                    adminLockoutUntil = Date.now() + ADMIN_CONFIG.LOCKOUT_DURATION;
                    showAdminAlert('loginError', 'Too many failed attempts. Account locked for 15 minutes.');
                } else {
                    showAdminAlert('loginError', 
                        `Invalid credentials. Attempts remaining: ${ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS - adminLoginAttempts}`);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showAdminAlert('loginError', 'An error occurred during authentication.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    }, 600);
}

// ===== Generate Secure Token =====
function generateSecureAdminToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ===== Check Admin Session =====
function checkAdminSession() {
    const token = sessionStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_AUTH);
    const expiresAt = sessionStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_AUTH + '_expires');
    const loginSection = document.getElementById('loginSection');
    const consoleSection = document.getElementById('adminConsoleSection');
    const logoutLink = document.getElementById('logoutLink');

    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
        // Session is valid
        if (loginSection) loginSection.style.display = 'none';
        if (consoleSection) consoleSection.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        // Session invalid or expired
        handleLogout();
    }
}

// ===== Handle Logout =====
function handleLogout() {
    sessionStorage.removeItem(ADMIN_CONFIG.STORAGE_KEY_AUTH);
    sessionStorage.removeItem(ADMIN_CONFIG.STORAGE_KEY_AUTH + '_expires');
    
    const loginSection = document.getElementById('loginSection');
    const consoleSection = document.getElementById('adminConsoleSection');
    const logoutLink = document.getElementById('logoutLink');
    
    if (loginSection) loginSection.style.display = 'block';
    if (consoleSection) consoleSection.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'none';
    
    clearAdminAlert('loginError');
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
}

// ===== Password Change Handler =====
function handlePasswordChange(e) {
    e.preventDefault();
    clearAdminAlert('passMsg');

    const currentPass = document.getElementById('currPass').value;
    const newPass = document.getElementById('newPass').value;
    const changePassBtn = document.getElementById('changePassBtn');

    if (!currentPass || !newPass) {
        showAdminAlert('passMsg', 'Both password fields are required.', 'error');
        return;
    }

    if (currentPass === newPass) {
        showAdminAlert('passMsg', 'New password must be different from current password.', 'error');
        return;
    }

    if (newPass.length < 8) {
        showAdminAlert('passMsg', 'New password must be at least 8 characters.', 'error');
        return;
    }

    changePassBtn.disabled = true;
    const originalText = changePassBtn.textContent;
    changePassBtn.textContent = 'Updating...';

    setTimeout(() => {
        try {
            const storedPassword = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_PASS);

            if (currentPass === storedPassword) {
                localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY_PASS, newPass);
                showAdminAlert('passMsg', 'Password updated successfully!', 'success');
                document.getElementById('changePasswordForm').reset();
            } else {
                showAdminAlert('passMsg', 'Current password does not match.', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showAdminAlert('passMsg', 'An error occurred while updating password.', 'error');
        } finally {
            changePassBtn.disabled = false;
            changePassBtn.textContent = originalText;
        }
    }, 600);
}

// ===== Initialize Admin Credentials on First Load =====
function initializeAdminCredentials() {
    if (!localStorage.getItem('admin_user')) {
        // Set default admin username
        localStorage.setItem('admin_user', 'admin');
        console.warn('Admin system initialized with default username: admin');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_PASS)) {
        // Set default admin password
        localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY_PASS, 'Admin123!');
        console.warn('Admin system initialized with default password: Admin123!');
        console.warn('⚠️ IMPORTANT: Change this password immediately in production!');
    }
}

// ===== Export Data to CSV =====
function handleExportData() {
    try {
        const sessions = JSON.parse(localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY_SESSIONS) || '[]');
        
        if (sessions.length === 0) {
            showAdminAlert('exportStatus', 'No session data to export.', 'error');
            document.getElementById('exportStatus').style.display = 'block';
            return;
        }

        // Create CSV header
        let csv = 'ID,Customer Name,Phone,Package,Check-In Time,Minutes,Status\n';

        // Add rows
        sessions.forEach(session => {
            const checkInDate = new Date(session.checkIn).toLocaleString();
            const row = [
                sanitizeHtml(session.id || ''),
                sanitizeHtml(session.name || ''),
                sanitizeHtml(session.phone || ''),
                session.minutes === 9999 ? 'Unlimited' : session.minutes,
                checkInDate,
                session.minutes,
                sanitizeHtml(session.status || 'Unknown')
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            
            csv += row + '\n';
        });

        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `wiijump_sessions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAdminAlert('exportStatus', `Successfully exported ${sessions.length} session(s).`, 'success');
        document.getElementById('exportStatus').style.display = 'block';
    } catch (error) {
        console.error('Export error:', error);
        showAdminAlert('exportStatus', 'Error exporting data.', 'error');
        document.getElementById('exportStatus').style.display = 'block';
    }
}

// ===== Clear Cache Data =====
function handleClearData() {
    const confirmed = confirm(
        'Are you sure you want to delete ALL session data? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
        localStorage.removeItem(ADMIN_CONFIG.STORAGE_KEY_SESSIONS);
        showAdminAlert('exportStatus', 'All session data has been cleared.', 'success');
        document.getElementById('exportStatus').style.display = 'block';
    } catch (error) {
        console.error('Clear data error:', error);
        showAdminAlert('exportStatus', 'Error clearing data.', 'error');
        document.getElementById('exportStatus').style.display = 'block';
    }
}
