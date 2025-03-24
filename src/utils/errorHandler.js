/**
 * Safely formats error objects for display
 * Prevents React "Objects are not valid as React child" errors
 * 
 * @param {any} error - The error object or string to format
 * @param {string} defaultMessage - Default message to show if error cannot be extracted
 * @returns {string} A safely formatted error message string
 */
export const formatErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message;
    }
    
    if (error.error && typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.statusText) {
      return error.statusText;
    }
    
    // Try to stringify the error object, but be safe about it
    try {
      const errorString = JSON.stringify(error);
      if (errorString && errorString !== '{}') {
        return errorString;
      }
    } catch (e) {
      // If JSON.stringify fails, fall back to default message
    }
  }
  
  return defaultMessage;
};

/**
 * Safely logs errors to console
 * 
 * @param {string} context - The context where the error occurred
 * @param {any} error - The error object
 */
export const logError = (context, error) => {
  console.error(`Error in ${context}:`, error);
}; 