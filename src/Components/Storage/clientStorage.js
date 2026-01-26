// Client-side encrypted storage utility using IndexedDB
const DB_NAME = 'NexusDB';
const DB_VERSION = 1;

let db = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains('user')) {
        database.createObjectStore('user', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('favorites')) {
        database.createObjectStore('favorites', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('aiHistory')) {
        database.createObjectStore('aiHistory', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('widgets')) {
        database.createObjectStore('widgets', { keyPath: 'id' });
      }
    };
  });
};

// Simple encryption/decryption using account code as key
// ⚠️ WARNING: This is NOT cryptographically secure encryption
// It's only basic obfuscation using btoa/atob
// For sensitive data, use a proper crypto library like TweetNaCl.js or libsodium.js
// This implementation protects against casual inspection but NOT against determined attacks
const encrypt = (data, key) => {
  try {
    if (!key || typeof key !== 'string') {
      console.error('Encryption key must be a non-empty string');
      return null;
    }
    const str = JSON.stringify(data);
    const encoded = btoa(str + '::' + key.slice(0, 8));
    return encoded;
  } catch (e) {
    console.error('Encryption failed:', e);
    return null;
  }
};

const decrypt = (encrypted, key) => {
  try {
    if (!key || typeof key !== 'string') {
      console.error('Decryption key must be a non-empty string');
      return null;
    }
    const decoded = atob(encrypted);
    const [str, checksum] = decoded.split('::');
    if (!checksum || checksum !== key.slice(0, 8)) {
      throw new Error('Invalid key or corrupted data');
    }
    return JSON.parse(str);
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
};

export const storage = {
  async init() {
    return initDB();
  },
  
  async saveUser(username, accountCode) {
    const db = await initDB();
    const userData = { username, createdAt: new Date().toISOString(), accessCode: accountCode };
    const encrypted = encrypt(userData, accountCode);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['user'], 'readwrite');
      const store = tx.objectStore('user');
      const request = store.put({ id: accountCode, data: encrypted });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async loadUser(accountCode) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['user'], 'readonly');
      const store = tx.objectStore('user');
      const request = store.get(accountCode);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
        } else {
          const decrypted = decrypt(result.data, accountCode);
          resolve(decrypted);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Invite code management
  getInviteCode() {
    const code = localStorage.getItem('nexus_invite_code');
    if (!code) {
      // Generate initial code
      const newCode = this.regenerateInviteCode();
      return newCode;
    }
    return code;
  },

  regenerateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    localStorage.setItem('nexus_invite_code', code);
    return code;
  },

  // Role management
  getRoleData() {
    try {
      const data = localStorage.getItem('nexus_roles');
      if (!data) {
        // Initialize with owner role
        const roles = {
          owner: '091587',
          admin: 'ADMIN-NEXUS',
          users: [] // { code, role, discordId, verified, banned }
        };
        localStorage.setItem('nexus_roles', JSON.stringify(roles));
        return roles;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse role data:', err);
      // Return safe default on corruption
      const roles = {
        owner: '091587',
        admin: 'ADMIN-NEXUS',
        users: []
      };
      localStorage.setItem('nexus_roles', JSON.stringify(roles));
      return roles;
    }
  },

  saveRoleData(data) {
    localStorage.setItem('nexus_roles', JSON.stringify(data));
  },

  getUserRole(accessCode) {
    const roles = this.getRoleData();
    
    // Check owner
    if (accessCode === roles.owner) {
      return { role: 'owner', verified: true, banned: false, approved: true };
    }
    
    // Check admin
    if (accessCode === roles.admin) {
      return { role: 'admin', verified: true, banned: false, approved: true };
    }
    
    // Check registered users
    const user = roles.users.find(u => u.code === accessCode);
    if (user) {
      return { 
        role: user.role || 'verified', 
        verified: user.verified || false, 
        banned: user.banned || false,
        approved: user.approved !== undefined ? user.approved : false
      };
    }
    
    // Default guest
    return { role: 'guest', verified: false, banned: false, approved: false };
  },

  saveUserRole(accessCode, roleData) {
    const roles = this.getRoleData();
    const existingIndex = roles.users.findIndex(u => u.code === accessCode);
    
    if (existingIndex >= 0) {
      roles.users[existingIndex] = { ...roles.users[existingIndex], ...roleData };
    } else {
      roles.users.push({ code: accessCode, ...roleData });
    }
    
    this.saveRoleData(roles);
  },

  banUser(accessCode, duration = false) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (user) {
      user.banned = true;
      if (duration && typeof duration === 'number') {
        // Temporary ban - duration in minutes
        user.banExpires = Date.now() + (duration * 60 * 1000);
      } else if (duration === false || duration === null) {
        // Permanent ban
        user.banExpires = null;
      } else {
        // Backwards compatibility - if boolean true, default to 10 minutes
        user.banExpires = Date.now() + (10 * 60 * 1000);
      }
      this.saveRoleData(roles);
    }
  },

  unbanUser(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (user) {
      user.banned = false;
      user.banExpires = null;
      this.saveRoleData(roles);
    }
  },

  isBanned(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (!user || !user.banned) return false;
    
    // Check if ban has expired
    if (user.banExpires && Date.now() > user.banExpires) {
      // Auto-unban
      user.banned = false;
      user.banExpires = null;
      this.saveRoleData(roles);
      return false;
    }
    
    return true;
  },

  getBanInfo(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (!user || !user.banned) return null;
    
    // Check if expired
    if (user.banExpires && Date.now() > user.banExpires) {
      user.banned = false;
      user.banExpires = null;
      this.saveRoleData(roles);
      return null;
    }
    
    return {
      isPermanent: !user.banExpires,
      expiresAt: user.banExpires,
      timeRemaining: user.banExpires ? user.banExpires - Date.now() : null
    };
  },

  getAllUsers() {
    const roles = this.getRoleData();
    return roles.users;
  },

  // Auto-moderation functions
  recordViolation(accessCode, violationType = 'inappropriate_content') {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (!user) return { warnings: 0, shouldBan: false };
    
    if (!user.violations) {
      user.violations = [];
    }
    
    user.violations.push({
      type: violationType,
      timestamp: Date.now()
    });
    
    // Count recent violations (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentViolations = user.violations.filter(v => v.timestamp > oneDayAgo);
    
    // Clean up old violations to prevent array bloat
    user.violations = recentViolations;
    
    const warningCount = recentViolations.length;
    const shouldBan = warningCount >= 3;
    
    this.saveRoleData(roles);
    
    return { warnings: warningCount, shouldBan };
  },

  getViolationCount(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (!user || !user.violations) return 0;
    
    // Count violations from last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return user.violations.filter(v => v.timestamp > oneDayAgo).length;
  },

  clearViolations(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (user) {
      user.violations = [];
      this.saveRoleData(roles);
    }
  },

  // Account approval functions
  approveUser(accessCode) {
    const roles = this.getRoleData();
    const user = roles.users.find(u => u.code === accessCode);
    if (user) {
      user.approved = true;
      this.saveRoleData(roles);
    }
  },

  rejectUser(accessCode) {
    const roles = this.getRoleData();
    const userIndex = roles.users.findIndex(u => u.code === accessCode);
    if (userIndex >= 0) {
      roles.users.splice(userIndex, 1);
      this.saveRoleData(roles);
    }
  },

  getPendingUsers() {
    const roles = this.getRoleData();
    return roles.users.filter(u => !u.approved && u.role !== 'owner' && u.role !== 'admin');
  },

  isApproved(accessCode) {
    const roleData = this.getUserRole(accessCode);
    return roleData.approved || roleData.role === 'owner' || roleData.role === 'admin';
  },
  
  async saveSettings(settings) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['settings'], 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ id: 'current', ...settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async loadSettings() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async saveBrowserState(browserState) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['settings'], 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ id: 'browserState', ...browserState });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async loadBrowserState() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('browserState');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },
  
  async saveFavorites(favorites) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['favorites'], 'readwrite');
      const store = tx.objectStore('favorites');
      const request = store.put({ id: 'current', games: favorites });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async loadFavorites() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['favorites'], 'readonly');
      const store = tx.objectStore('favorites');
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result?.games || []);
      request.onerror = () => reject(request.error);
    });
  },
  
  async saveAIHistory(message) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['aiHistory'], 'readwrite');
      const store = tx.objectStore('aiHistory');
      const request = store.add({ ...message, timestamp: new Date().toISOString() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async loadAIHistory() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['aiHistory'], 'readonly');
      const store = tx.objectStore('aiHistory');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },
  
  async clearAIHistory() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['aiHistory'], 'readwrite');
      const store = tx.objectStore('aiHistory');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async deleteAllData() {
    const db = await initDB();
    const stores = ['user', 'settings', 'favorites', 'aiHistory', 'widgets'];
    return Promise.all(stores.map(storeName => 
      new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ));
  },
  
  async exportData() {
    const db = await initDB();
    const stores = ['user', 'settings', 'favorites', 'aiHistory', 'widgets'];
    const data = {};
    
    for (const storeName of stores) {
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      data[storeName] = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return data;
  }
};

// Session management
export const session = {
  set(accountCode, remember = false, role = 'guest') {
    const data = JSON.stringify({ code: accountCode, role: role });
    if (remember) {
      localStorage.setItem('nexus_session', btoa(data));
    } else {
      sessionStorage.setItem('nexus_session', btoa(data));
    }
  },
  
  get() {
    const persistent = localStorage.getItem('nexus_session');
    const temp = sessionStorage.getItem('nexus_session');
    const encoded = persistent || temp;
    if (!encoded) return null;
    try {
      const data = JSON.parse(atob(encoded));
      return data.code;
    } catch {
      return null;
    }
  },

  getRole() {
    const persistent = localStorage.getItem('nexus_session');
    const temp = sessionStorage.getItem('nexus_session');
    const encoded = persistent || temp;
    if (!encoded) return 'guest';
    try {
      const data = JSON.parse(atob(encoded));
      return data.role || 'guest';
    } catch {
      return 'guest';
    }
  },
  
  isAdmin() {
    const role = this.getRole();
    return role === 'admin' || role === 'owner';
  },

  isOwner() {
    return this.getRole() === 'owner';
  },

  isVerified() {
    const role = this.getRole();
    return role === 'verified' || role === 'admin' || role === 'owner';
  },

  isGuest() {
    return this.getRole() === 'guest';
  },
  
  clear() {
    localStorage.removeItem('nexus_session');
    sessionStorage.removeItem('nexus_session');
  },
  
  isActive() {
    return !!this.get();
  }
};
