/*
    IndexedDB Database Management for Real Estate Management App
    Author: Jules
    Date: 2025-08-19
    Description: Database wrapper for IndexedDB operations with proper error handling
*/

/* ===== DATABASE CONFIGURATION ===== */
const DB_NAME = 'estate_pro_db';
const DB_VERSION = 1;
let db;

const OBJECT_STORES = [
    'customers', 'units', 'partners', 'unitPartners', 'contracts', 'installments',
    'partnerDebts', 'safes', 'transfers', 'auditLog', 'vouchers', 'brokerDues',
    'brokers', 'partnerGroups', 'settings', 'keyval' // 'keyval' for misc data like migration status
];

/* ===== DATABASE CONNECTION ===== */
function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Database error: ' + event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            console.log('Running onupgradeneeded');

            OBJECT_STORES.forEach(storeName => {
                if (!dbInstance.objectStoreNames.contains(storeName)) {
                    if (storeName === 'settings' || storeName === 'keyval') {
                        // For stores that will hold single objects or key-value pairs
                        dbInstance.createObjectStore(storeName, { keyPath: 'key' });
                    } else {
                        // For stores that hold arrays of objects with a unique 'id'
                        dbInstance.createObjectStore(storeName, { keyPath: 'id' });
                    }
                    console.log(`Object store created: ${storeName}`);
                }
            });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully.');
            resolve(db);
        };
    });
}

/* ===== GENERIC DATABASE OPERATIONS ===== */

/**
 * Get all items from a specific store
 * @param {string} storeName - Name of the object store
 * @returns {Promise<Array>} Array of items from the store
 */
function getAll(storeName) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error(`Error getting all from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/**
 * Add or update an item in a specific store
 * @param {string} storeName - Name of the object store
 * @param {Object} item - Item to add or update
 * @returns {Promise<any>} Result of the operation
 */
function put(storeName, item) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(item);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error(`Error putting item in ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/**
 * Bulk add or update items in a specific store
 * @param {string} storeName - Name of the object store
 * @param {Array} items - Array of items to add or update
 * @returns {Promise<void>}
 */
function bulkPut(storeName, items) {
    return new Promise((resolve, reject) => {
        if (!items || items.length === 0) {
            return resolve();
        }

        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);

                const promises = items.map(item => {
                    return new Promise((resolveItem, rejectItem) => {
                        const request = store.put(item);
                        request.onsuccess = () => resolveItem();
                        request.onerror = (e) => rejectItem(e.target.error);
                    });
                });

                Promise.all(promises)
                    .then(() => resolve())
                    .catch(err => {
                        console.error(`Error in bulk put for ${storeName}:`, err);
                        transaction.abort(); // Abort transaction on error
                        reject(err);
                    });
            })
            .catch(reject);
    });
}

/**
 * Delete an item from a specific store
 * @param {string} storeName - Name of the object store
 * @param {string|number} key - Key of the item to delete
 * @returns {Promise<void>}
 */
function deleteItem(storeName, key) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = (event) => {
                    console.error(`Error deleting item from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/**
 * Get a single item from a specific store
 * @param {string} storeName - Name of the object store
 * @param {string|number} key - Key of the item to retrieve
 * @returns {Promise<Object|null>} The item or null if not found
 */
function get(storeName, key) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result || null);
                };

                request.onerror = (event) => {
                    console.error(`Error getting item from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/* ===== KEY-VALUE STORE OPERATIONS ===== */

/**
 * Get a single value from the keyval store
 * @param {string} key - Key to retrieve
 * @returns {Promise<any>} The value associated with the key
 */
async function getKeyVal(key) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction('keyval', 'readonly');
                const store = transaction.objectStore('keyval');
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : undefined);
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/**
 * Set a single value in the keyval store
 * @param {string} key - Key to set
 * @param {any} value - Value to store
 * @returns {Promise<any>} Result of the operation
 */
async function setKeyVal(key, value) {
    return put('keyval', { key, value });
}

/* ===== UTILITY FUNCTIONS ===== */

/**
 * Clear all data from a specific store
 * @param {string} storeName - Name of the object store
 * @returns {Promise<void>}
 */
function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = (event) => {
                    console.error(`Error clearing store ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            })
            .catch(reject);
    });
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Object containing store names and their item counts
 */
async function getDatabaseStats() {
    const stats = {};
    
    try {
        for (const storeName of OBJECT_STORES) {
            const items = await getAll(storeName);
            stats[storeName] = items.length;
        }
        return stats;
    } catch (error) {
        console.error('Error getting database stats:', error);
        throw error;
    }
}

/**
 * Export all data from the database
 * @returns {Promise<Object>} Object containing all data from all stores
 */
async function exportAllData() {
    const exportData = {};
    
    try {
        for (const storeName of OBJECT_STORES) {
            exportData[storeName] = await getAll(storeName);
        }
        return exportData;
    } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
    }
}

/**
 * Import data into the database
 * @param {Object} data - Object containing data for each store
 * @returns {Promise<void>}
 */
async function importData(data) {
    try {
        for (const [storeName, items] of Object.entries(data)) {
            if (OBJECT_STORES.includes(storeName) && Array.isArray(items)) {
                await clearStore(storeName);
                if (items.length > 0) {
                    await bulkPut(storeName, items);
                }
            }
        }
    } catch (error) {
        console.error('Error importing data:', error);
        throw error;
    }
}

/**
 * Close the database connection
 */
function closeDB() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed.');
    }
}

/* ===== ERROR HANDLING UTILITIES ===== */

/**
 * Handle database errors gracefully
 * @param {Error} error - The error to handle
 * @param {string} operation - Description of the operation that failed
 */
function handleDatabaseError(error, operation) {
    console.error(`Database error during ${operation}:`, error);
    
    // You can add custom error handling logic here
    // For example, showing user-friendly error messages
    if (error.name === 'QuotaExceededError') {
        console.error('Database quota exceeded. Consider clearing old data.');
    } else if (error.name === 'VersionError') {
        console.error('Database version mismatch. Consider refreshing the page.');
    }
}

/* ===== DATABASE MAINTENANCE ===== */

/**
 * Perform database maintenance tasks
 * @returns {Promise<void>}
 */
async function performMaintenance() {
    try {
        console.log('Starting database maintenance...');
        
        // Get database stats
        const stats = await getDatabaseStats();
        console.log('Database stats:', stats);
        
        // You can add more maintenance tasks here
        // For example, cleaning up old audit logs, optimizing indexes, etc.
        
        console.log('Database maintenance completed.');
    } catch (error) {
        console.error('Error during database maintenance:', error);
        throw error;
    }
}

/**
 * Check if the database is healthy
 * @returns {Promise<boolean>} True if database is healthy, false otherwise
 */
async function isDatabaseHealthy() {
    try {
        await openDB();
        const stats = await getDatabaseStats();
        
        // Basic health checks
        const hasRequiredStores = OBJECT_STORES.every(storeName => 
            stats.hasOwnProperty(storeName)
        );
        
        return hasRequiredStores;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}
