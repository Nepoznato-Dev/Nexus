/**
 * I.R.I.S. Command Palette System
 * ==============================
 * Searchable command palette with fuzzy matching
 */

import {storage} from '../Storage/clientStorage.js';

export class Command {
  constructor(id, name, handler, options = {}) {
    this.id = id;
    this.name = name;
    this.handler = handler;
    this.description = options.description || '';
    this.category = options.category || 'General';
    this.keywords = options.keywords || [];
    this.icon = options.icon || null;
  }

  /**
   * Execute command
   */
  async execute(args = {}) {
    try {
      return await this.handler(args);
    } catch (error) {
      console.error(`Error executing command ${this.id}:`, error);
      return {success: false, error: error.message};
    }
  }
}

/**
 * Command Palette
 */
export class CommandPalette {
  constructor() {
    this.commands = new Map();
    this.history = [];
    this.recentCommands = [];
    this.maxRecentCount = 30;
  }

  /**
   * Register command
   */
  registerCommand(command) {
    this.commands.set(command.id, command);
  }

  /**
   * Register multiple commands
   */
  registerCommands(commandList) {
    for (const command of commandList) {
      this.registerCommand(command);
    }
  }

  /**
   * Get command by id
   */
  getCommand(id) {
    return this.commands.get(id) || null;
  }

  /**
   * Search commands
   */
  search(query) {
    if (!query || query.trim() === '') {
      return Array.from(this.commands.values());
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const command of this.commands.values()) {
      const score = this.calculateRelevance(command, lowerQuery);
      if (score > 0) {
        results.push({command, score});
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.map((r) => r.command);
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(command, query) {
    let score = 0;

    // Exact match
    if (command.name.toLowerCase() === query) {
      score += 100;
    }

    // Name contains
    if (command.name.toLowerCase().includes(query)) {
      score += 50;
    }

    // Description contains
    if (command.description.toLowerCase().includes(query)) {
      score += 25;
    }

    // Keywords match
    for (const keyword of command.keywords) {
      if (keyword.toLowerCase().includes(query)) {
        score += 10;
      }
    }

    // Fuzzy match
    if (this.fuzzyMatch(query, command.name)) {
      score += 5;
    }

    return score;
  }

  /**
   * Fuzzy match
   */
  fuzzyMatch(pattern, text) {
    let patternIdx = 0;

    for (let i = 0; i < text.length; i++) {
      if (pattern.charCodeAt(patternIdx) === text.charCodeAt(i)) {
        patternIdx++;
      }
    }

    return patternIdx === pattern.length;
  }

  /**
   * Execute command
   */
  async executeCommand(commandId, args) {
    const command = this.getCommand(commandId);

    if (!command) {
      return {success: false, error: 'Command not found'};
    }

    const result = await command.execute(args);

    // Record execution
    this.recordExecution(commandId);

    return result;
  }

  /**
   * Record command execution
   */
  recordExecution(commandId) {
    this.history.push({
      commandId,
      timestamp: Date.now(),
    });

    // Keep last 1000 executions
    if (this.history.length > 1000) {
      this.history.shift();
    }

    // Update recent commands
    this.recentCommands = this.recentCommands.filter((id) => id !== commandId);
    this.recentCommands.unshift(commandId);

    if (this.recentCommands.length > this.maxRecentCount) {
      this.recentCommands.pop();
    }
  }

  /**
   * Get recent commands
   */
  getRecentCommands() {
    return this.recentCommands
      .map((id) => this.getCommand(id))
      .filter((cmd) => cmd !== null);
  }

  /**
   * Get command statistics
   */
  getCommandStats() {
    const stats = {
      totalCommands: this.commands.size,
      totalExecutions: this.history.length,
      byCategory: {},
      mostUsed: [],
    };

    // Count by category
    for (const command of this.commands.values()) {
      stats.byCategory[command.category] = (stats.byCategory[command.category] || 0) + 1;
    }

    // Find most used
    const usageMap = new Map();
    for (const execution of this.history) {
      usageMap.set(execution.commandId, (usageMap.get(execution.commandId) || 0) + 1);
    }

    const sorted = Array.from(usageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    stats.mostUsed = sorted.map(([id, count]) => ({
      commandId: id,
      commandName: this.getCommand(id)?.name || 'Unknown',
      count,
    }));

    return stats;
  }

  /**
   * Get all commands grouped by category
   */
  getCommandsByCategory() {
    const grouped = {};

    for (const command of this.commands.values()) {
      if (!grouped[command.category]) {
        grouped[command.category] = [];
      }

      grouped[command.category].push(command);
    }

    return grouped;
  }
}

const globalPalette = new CommandPalette();

/**
 * Get global command palette
 */
export function getCommandPalette() {
  return globalPalette;
}

/**
 * Save command history
 */
export async function saveCommandHistory() {
  try {
    const settings = await storage.loadSettings();
    settings.commandHistory = globalPalette.history;
    settings.recentCommands = globalPalette.recentCommands;
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving command history:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Load command history
 */
export async function loadCommandHistory() {
  try {
    const settings = await storage.loadSettings();

    if (settings?.commandHistory) {
      globalPalette.history = settings.commandHistory;
    }

    if (settings?.recentCommands) {
      globalPalette.recentCommands = settings.recentCommands;
    }

    return {success: true};
  } catch (error) {
    console.error('Error loading command history:', error);
    return {success: false, error: error.message};
  }
}
