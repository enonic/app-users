/**
 * Timing logger utility for tracking wait and pause operations
 */

class TimingLogger {
    constructor() {
        this.enabled = process.env.LOG_TIMING === 'true';
    }

    /**
     * Logs the duration of a wait operation
     * @param {string} operation - Name of the operation (e.g., 'waitForOpened', 'pause')
     * @param {number} duration - Duration in milliseconds
     * @param {string} context - Additional context (e.g., element name)
     */
    logWait(operation, duration, context = '') {
        if (this.enabled) {
            const contextStr = context ? ` [${context}]` : '';
            console.log(`[TIMING] ${operation}${contextStr}: ${duration}ms`);
        }
    }

    /**
     * Wraps an async function to measure and log its execution time
     * @param {Function} fn - Async function to wrap
     * @param {string} operationName - Name of the operation for logging
     * @param {string} context - Additional context
     * @returns {Promise} - Result of the wrapped function
     */
    async measureAsync(fn, operationName, context = '') {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            this.logWait(operationName, duration, context);
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logWait(`${operationName} (failed)`, duration, context);
            throw error;
        }
    }

    /**
     * Logs a pause operation
     * @param {number} ms - Pause duration in milliseconds
     * @param {string} context - Additional context
     */
    logPause(ms, context = '') {
        this.logWait('pause', ms, context);
    }
}

module.exports = new TimingLogger();
