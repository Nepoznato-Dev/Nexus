/**
 * I.R.I.S. Export System
 * =======================
 * Export user data in various formats (JSON, CSV, ZIP, etc.)
 */

import {storage} from '../Storage/clientStorage.js';

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  HTML: 'html',
  MARKDOWN: 'markdown',
  ZIP: 'zip',
};

/**
 * Export all settings as JSON
 */
export async function exportSettingsJSON(includeMemory = false) {
  try {
    const settings = await storage.loadSettings();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      exportFormat: 'json',
      settings,
    };

    if (!includeMemory) {
      // Remove sensitive memory data
      delete exportData.settings.conversationHistory;
      delete exportData.settings.userProfile;
    }

    return {
      success: true,
      data: exportData,
      filename: `nexus_export_${Date.now()}.json`,
    };
  } catch (error) {
    console.error('Error exporting settings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export profile packs as CSV
 */
export async function exportProfilePacksCSV() {
  try {
    const packs = (await import('./irisProfilePacks.js')).getAllProfilePacks();

    let csv = 'PackID,Name,Version,Created,Modified,Contents\n';

    for (const pack of packs) {
      const contents = [];
      if (pack.settings) contents.push('Settings');
      if (pack.layout) contents.push('Layout');
      if (pack.widgets) contents.push('Widgets');
      if (pack.bindings) contents.push('Bindings');
      if (pack.personality) contents.push('Personality');

      const row = [
        pack.id,
        `"${pack.name}"`,
        pack.version,
        new Date(pack.created).toISOString(),
        new Date(pack.modified).toISOString(),
        `"${contents.join(', ')}"`,
      ].join(',');

      csv += row + '\n';
    }

    return {
      success: true,
      data: csv,
      filename: `profile_packs_${Date.now()}.csv`,
    };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export as HTML report
 */
export async function exportHTMLReport() {
  try {
    const settings = await storage.loadSettings();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nexus I.R.I.S. Export Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .section { margin: 20px 0; }
    .info { background: #f0f0f0; padding: 10px; border-left: 4px solid #007bff; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; }
    .metadata { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Nexus I.R.I.S. Export Report</h1>
    <div class="metadata">
      <p>Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="section">
      <h2>Settings Summary</h2>
      <div class="info">
        <p><strong>AI Provider:</strong> ${settings.aiProvider || 'Not set'}</p>
        <p><strong>Theme:</strong> ${settings.appearance?.theme || 'Not set'}</p>
        <p><strong>Language:</strong> ${settings.language || 'Not set'}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>Layout Configuration</h2>
      ${
        settings.layout
          ? `<div class="info"><pre>${JSON.stringify(settings.layout, null, 2)}</pre></div>`
          : '<p>No custom layout</p>'
      }
    </div>
    
    <div class="section">
      <h2>Feature Status</h2>
      <table>
        <tr><th>Feature</th><th>Status</th></tr>
        ${Object.entries(settings.featureFlags || {})
          .map(
            ([flag, enabled]) =>
              `<tr><td>${flag}</td><td>${enabled ? '✓ Enabled' : '✗ Disabled'}</td></tr>`
          )
          .join('')}
      </table>
    </div>
  </div>
</body>
</html>
    `;

    return {
      success: true,
      data: html,
      filename: `nexus_report_${Date.now()}.html`,
    };
  } catch (error) {
    console.error('Error exporting HTML:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export as Markdown documentation
 */
export async function exportMarkdownDocs() {
  try {
    const settings = await storage.loadSettings();

    const md = `# Nexus I.R.I.S. Configuration Export

**Export Date:** ${new Date().toISOString()}

## Settings

- **AI Provider:** ${settings.aiProvider || 'Not configured'}
- **Theme:** ${settings.appearance?.theme || 'Default'}
- **Font Size:** ${settings.appearance?.fontSize || 'Default'}
- **Language:** ${settings.language || 'English'}

## Feature Flags

| Feature | Status |
|---------|--------|
${Object.entries(settings.featureFlags || {})
  .map(([flag, enabled]) => `| ${flag} | ${enabled ? '✓' : '✗'} |`)
  .join('\n')}

## Layout

${
  settings.layout
    ? `\`\`\`json\n${JSON.stringify(settings.layout, null, 2)}\n\`\`\``
    : 'No custom layout configured'
}

## Actions

Total actions logged: ${(settings.actionLog || []).length}

## Snapshots

Total snapshots: ${(settings.snapshots || []).length}

---
*This document was automatically generated by Nexus I.R.I.S.*
    `;

    return {
      success: true,
      data: md,
      filename: `nexus_config_${Date.now()}.md`,
    };
  } catch (error) {
    console.error('Error exporting Markdown:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export specific data category
 */
export async function exportCategory(category, format = EXPORT_FORMATS.JSON) {
  try {
    const settings = await storage.loadSettings();

    const categoryData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      category,
      data: {},
    };

    switch (category) {
      case 'settings':
        categoryData.data = settings;
        break;
      case 'widgets':
        categoryData.data = settings.widgets || {};
        break;
      case 'bindings':
        categoryData.data = settings.actionBindings || [];
        break;
      case 'featureFlags':
        categoryData.data = settings.featureFlags || {};
        break;
      case 'snapshots':
        categoryData.data = settings.snapshots || [];
        break;
      case 'history':
        categoryData.data = {
          actions: (settings.actionLog || []).slice(-100),
          patches: (settings.patchLog || []).slice(-100),
          conflicts: (settings.conflictLog || []).slice(-50),
        };
        break;
      default:
        return {success: false, error: `Unknown category: ${category}`};
    }

    return {
      success: true,
      data: categoryData,
      filename: `${category}_export_${Date.now()}.${format === EXPORT_FORMATS.CSV ? 'csv' : 'json'}`,
    };
  } catch (error) {
    console.error('Error exporting category:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get export options (what can be exported)
 */
export async function getExportOptions() {
  try {
    const settings = await storage.loadSettings();

    return {
      categories: [
        {
          name: 'Full Settings',
          key: 'settings',
          description: 'All settings and configuration',
          size: JSON.stringify(settings).length,
        },
        {
          name: 'Widgets',
          key: 'widgets',
          description: 'Widget layout and configuration',
          count: Object.keys(settings.widgets || {}).length,
        },
        {
          name: 'Bindings',
          key: 'bindings',
          description: 'Action bindings and hotkeys',
          count: (settings.actionBindings || []).length,
        },
        {
          name: 'Feature Flags',
          key: 'featureFlags',
          description: 'Feature toggle states',
          count: Object.keys(settings.featureFlags || {}).length,
        },
        {
          name: 'Snapshots',
          key: 'snapshots',
          description: 'Saved state snapshots',
          count: (settings.snapshots || []).length,
        },
        {
          name: 'History',
          key: 'history',
          description: 'Action, patch, and conflict logs',
          count:
            (settings.actionLog || []).length +
            (settings.patchLog || []).length +
            (settings.conflictLog || []).length,
        },
      ],
      formats: [EXPORT_FORMATS.JSON, EXPORT_FORMATS.CSV, EXPORT_FORMATS.HTML, EXPORT_FORMATS.MARKDOWN],
    };
  } catch (error) {
    console.error('Error getting export options:', error);
    return {categories: [], formats: []};
  }
}
