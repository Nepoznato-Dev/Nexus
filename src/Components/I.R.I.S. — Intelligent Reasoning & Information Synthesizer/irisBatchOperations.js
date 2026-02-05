/**
 * I.R.I.S. Batch Operations System
 * ================================
 * Execute multiple actions atomically
 */

import {storage} from '../Storage/clientStorage.js';

export class BatchOperation {
  constructor(name) {
    this.id = generateId();
    this.name = name;
    this.operations = [];
    this.status = 'pending'; // pending, running, completed, failed
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Add operation to batch
   */
  addOperation(action, parameters) {
    this.operations.push({
      id: generateId(),
      action,
      parameters,
      status: 'pending',
      result: null,
    });

    return this;
  }

  /**
   * Add multiple operations
   */
  addOperations(operationList) {
    for (const op of operationList) {
      this.addOperation(op.action, op.parameters);
    }

    return this;
  }

  /**
   * Get operation count
   */
  getOperationCount() {
    return this.operations.length;
  }

  /**
   * Get pending operations
   */
  getPendingOperations() {
    return this.operations.filter((op) => op.status === 'pending');
  }

  /**
   * Get completed operations
   */
  getCompletedOperations() {
    return this.operations.filter((op) => op.status === 'completed');
  }

  /**
   * Calculate progress
   */
  getProgress() {
    const completed = this.getCompletedOperations().length;
    return {
      total: this.operations.length,
      completed,
      percentage: this.operations.length > 0 ?
        Math.round((completed / this.operations.length) * 100) : 0,
    };
  }

  /**
   * Export batch
   */
  export() {
    return {
      id: this.id,
      name: this.name,
      operationCount: this.operations.length,
      status: this.status,
      completedCount: this.getCompletedOperations().length,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime && this.startTime ?
        this.endTime - this.startTime : null,
      progress: this.getProgress(),
    };
  }
}

/**
 * Create batch operation
 */
export async function createBatchOperation(name) {
  try {
    const batch = new BatchOperation(name);

    const settings = await storage.loadSettings();
    if (!settings.batchOperations) {
      settings.batchOperations = [];
    }

    settings.batchOperations.push(batch.export());
    await storage.saveSettings(settings);

    return {success: true, batchId: batch.id, batch};
  } catch (error) {
    console.error('Error creating batch operation:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Execute batch operation with rollback
 */
export async function executeBatchOperation(batch, executeHandler) {
  try {
    batch.status = 'running';
    batch.startTime = Date.now();

    const completed = [];
    const failed = [];

    for (const operation of batch.operations) {
      try {
        operation.status = 'running';

        // Execute the operation
        const result = await executeHandler(operation.action, operation.parameters);

        operation.status = 'completed';
        operation.result = result;
        completed.push(operation);
      } catch (error) {
        operation.status = 'failed';
        operation.error = error.message;
        failed.push(operation);

        // Stop on first failure for atomic behavior
        break;
      }
    }

    batch.endTime = Date.now();

    // If any failed, rollback completed operations
    if (failed.length > 0) {
      batch.status = 'failed';

      for (const operation of completed) {
        await executeHandler(`undo:${operation.action}`, operation.parameters);
      }

      return {
        success: false,
        message: 'Batch operation failed and rolled back',
        failed: failed[0],
        completedCount: completed.length,
      };
    }

    batch.status = 'completed';
    return {
      success: true,
      message: 'Batch operation completed successfully',
      operationCount: batch.operations.length,
    };
  } catch (error) {
    console.error('Error executing batch:', error);
    batch.status = 'failed';
    batch.endTime = Date.now();

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get batch operation history
 */
export async function getBatchHistory(limit = 50) {
  try {
    const settings = await storage.loadSettings();
    const batches = settings?.batchOperations || [];

    return batches.slice(-limit);
  } catch (error) {
    console.error('Error getting batch history:', error);
    return [];
  }
}

/**
 * Get batch statistics
 */
export async function getBatchStats() {
  try {
    const settings = await storage.loadSettings();
    const batches = settings?.batchOperations || [];

    const stats = {
      totalBatches: batches.length,
      successfulBatches: batches.filter((b) => b.status === 'completed').length,
      failedBatches: batches.filter((b) => b.status === 'failed').length,
      totalOperations: batches.reduce((sum, b) => sum + b.operationCount, 0),
      averageOperationsPerBatch: batches.length > 0 ?
        (batches.reduce((sum, b) => sum + b.operationCount, 0) / batches.length).toFixed(2) : 0,
      successRate: batches.length > 0 ?
        ((batches.filter((b) => b.status === 'completed').length / batches.length) * 100).toFixed(2) : 0,
    };

    return stats;
  } catch (error) {
    console.error('Error getting batch stats:', error);
    return {totalBatches: 0};
  }
}

/**
 * Clear batch history
 */
export async function clearBatchHistory() {
  try {
    const settings = await storage.loadSettings();
    settings.batchOperations = [];
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error clearing batch history:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
