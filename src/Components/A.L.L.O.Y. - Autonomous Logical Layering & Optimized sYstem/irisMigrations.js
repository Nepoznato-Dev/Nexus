/**
 * I.R.I.S. Migrations System
 * ==========================
 * Handle version updates and data transformations
 */

import {storage} from '../Storage/clientStorage.js';

export const CURRENT_VERSION = '2.0.0';

/**
 * Migration: 1.0 -> 1.1 (Add feature flags)
 */
async function migrate_1_0_to_1_1(settings) {
  console.log('Migrating 1.0 -> 1.1: Adding feature flags');

  if (!settings.featureFlags) {
    const featureFlags = await import('./irisFeatureFlags.js');
    settings.featureFlags = featureFlags.DEFAULT_FEATURE_FLAGS;
  }

  return settings;
}

/**
 * Migration: 1.1 -> 1.2 (Add action bindings)
 */
async function migrate_1_1_to_1_2(settings) {
  console.log('Migrating 1.1 -> 1.2: Adding action bindings');

  if (!settings.actionBindings) {
    settings.actionBindings = [];
  }

  return settings;
}

/**
 * Migration: 1.2 -> 1.3 (Add permissions)
 */
async function migrate_1_2_to_1_3(settings) {
  console.log('Migrating 1.2 -> 1.3: Adding permissions');

  if (!settings.permissions) {
    settings.permissions = {};
  }

  if (!settings.permissionLog) {
    settings.permissionLog = [];
  }

  return settings;
}

/**
 * Migration: 1.3 -> 2.0 (Major refactor - consolidation)
 */
async function migrate_1_3_to_2_0(settings) {
  console.log('Migrating 1.3 -> 2.0: Major consolidation');

  // Initialize all new structures
  if (!settings.undoRedoState) {
    settings.undoRedoState = {undoCount: 0, redoCount: 0};
  }

  if (!settings.snapshots) {
    settings.snapshots = [];
  }

  if (!settings.patchLog) {
    settings.patchLog = [];
  }

  if (!settings.conflictLog) {
    settings.conflictLog = [];
  }

  if (!settings.profilePacks) {
    settings.profilePacks = [];
  }

  if (!settings.memoryCapsules) {
    settings.memoryCapsules = [];
  }

  if (!settings.storageQuotas) {
    settings.storageQuotas = {
      conversations: 50,
      analysis: 1000,
      settings: 1,
      snapshots: 20,
      memoryCapsules: 50,
      logs: 1000,
      media: 10,
    };
  }

  if (!settings.secrets) {
    settings.secrets = {};
  }

  if (!settings.layoutPresets) {
    settings.layoutPresets = [];
  }

  if (!settings.customThemes) {
    settings.customThemes = [];
  }

  return settings;
}

/**
 * List all available migrations
 */
export const MIGRATIONS = [
  {from: '1.0', to: '1.1', migrate: migrate_1_0_to_1_1},
  {from: '1.1', to: '1.2', migrate: migrate_1_1_to_1_2},
  {from: '1.2', to: '1.3', migrate: migrate_1_2_to_1_3},
  {from: '1.3', to: '2.0', migrate: migrate_1_3_to_2_0},
];

/**
 * Get current settings version
 */
export async function getCurrentVersion() {
  try {
    const settings = await storage.loadSettings();
    return settings.version || '1.0';
  } catch (error) {
    console.error('Error getting version:', error);
    return '1.0';
  }
}

/**
 * Migrate settings to target version
 */
export async function migrateToVersion(targetVersion = CURRENT_VERSION) {
  try {
    const currentVersion = await getCurrentVersion();

    console.log(`Migrating from ${currentVersion} to ${targetVersion}`);

    const settings = await storage.loadSettings();

    // Find migration path
    const path = findMigrationPath(currentVersion, targetVersion);

    if (path.length === 0) {
      return {
        success: true,
        message: 'Already at target version',
        version: currentVersion,
      };
    }

    // Apply migrations
    let migratedSettings = settings;

    for (const migration of path) {
      console.log(`Applying migration: ${migration.from} -> ${migration.to}`);
      migratedSettings = await migration.migrate(migratedSettings);
    }

    // Update version
    migratedSettings.version = targetVersion;
    migratedSettings.lastMigrated = Date.now();

    await storage.saveSettings(migratedSettings);

    return {
      success: true,
      from: currentVersion,
      to: targetVersion,
      migrationsApplied: path.length,
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Check if migration is needed
 */
export async function isMigrationNeeded() {
  try {
    const current = await getCurrentVersion();
    return current !== CURRENT_VERSION;
  } catch (error) {
    console.error('Error checking migration:', error);
    return false;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus() {
  try {
    const current = await getCurrentVersion();
    const settings = await storage.loadSettings();

    const needed = current !== CURRENT_VERSION;

    return {
      currentVersion: current,
      targetVersion: CURRENT_VERSION,
      needsMigration: needed,
      lastMigrated: settings.lastMigrated || null,
      migrationPath: needed ? findMigrationPath(current, CURRENT_VERSION) : [],
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    return {error: error.message};
  }
}

/**
 * Create backup before migration
 */
export async function createMigrationBackup() {
  try {
    const settings = await storage.loadSettings();
    const backup = {
      version: await getCurrentVersion(),
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(settings)),
    };

    const newSettings = await storage.loadSettings();
    if (!newSettings.migrationBackups) {
      newSettings.migrationBackups = [];
    }

    newSettings.migrationBackups.push(backup);

    // Keep last 5 backups
    if (newSettings.migrationBackups.length > 5) {
      newSettings.migrationBackups = newSettings.migrationBackups.slice(-5);
    }

    await storage.saveSettings(newSettings);

    return {success: true, backupId: backup.timestamp};
  } catch (error) {
    console.error('Error creating backup:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Restore from migration backup
 */
export async function restoreMigrationBackup(backupId) {
  try {
    const settings = await storage.loadSettings();
    const backup = (settings.migrationBackups || []).find((b) => b.timestamp === backupId);

    if (!backup) {
      return {success: false, error: 'Backup not found'};
    }

    await storage.saveSettings(backup.data);

    console.log(`Restored backup from ${new Date(backup.timestamp).toISOString()}`);

    return {success: true, restored: backup.version};
  } catch (error) {
    console.error('Error restoring backup:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get migration backups
 */
export async function getMigrationBackups() {
  try {
    const settings = await storage.loadSettings();
    return (settings.migrationBackups || []).map((b) => ({
      id: b.timestamp,
      version: b.version,
      timestamp: new Date(b.timestamp).toISOString(),
    }));
  } catch (error) {
    console.error('Error getting backups:', error);
    return [];
  }
}

/**
 * Auto-migrate on startup if needed
 */
export async function autoMigrateIfNeeded() {
  try {
    const needed = await isMigrationNeeded();

    if (!needed) {
      return {success: true, migrated: false};
    }

    console.log('Auto-migration triggered');

    // Create backup first
    await createMigrationBackup();

    // Perform migration
    const result = await migrateToVersion(CURRENT_VERSION);

    return {
      success: result.success,
      migrated: true,
      ...result,
    };
  } catch (error) {
    console.error('Error in auto-migration:', error);
    return {success: false, error: error.message};
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Find migration path from one version to another
 */
function findMigrationPath(from, to) {
  const start = parseVersion(from);
  const end = parseVersion(to);

  // Build version matrix
  const versions = new Map();

  for (const migration of MIGRATIONS) {
    versions.set(migration.from, migration);
  }

  const path = [];
  let current = from;

  while (current !== to) {
    const migration = versions.get(current);

    if (!migration) {
      break; // No path found
    }

    path.push(migration);
    current = migration.to;
  }

  return path;
}

/**
 * Parse version string
 */
function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  };
}
