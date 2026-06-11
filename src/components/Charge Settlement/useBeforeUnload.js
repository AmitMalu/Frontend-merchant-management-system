import { useEffect, useCallback } from 'react';

/**
 * Custom hook to warn users about unsaved changes before leaving the page
 * Implements native browser beforeunload event for data loss prevention
 */
export const useBeforeUnload = (hasUnsavedChanges, message = 'You have unsaved changes. Are you sure you want to leave?') => {
  
  const handleBeforeUnload = useCallback((event) => {
    if (hasUnsavedChanges) {
      // Standard way to trigger confirmation dialog
      event.preventDefault();
      event.returnValue = message; // Chrome requires returnValue to be set
      return message; // For older browsers
    }
  }, [hasUnsavedChanges, message]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [hasUnsavedChanges, handleBeforeUnload]);

  // Manual confirmation for programmatic navigation
  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(message);
    }
    return true;
  }, [hasUnsavedChanges, message]);

  return { confirmNavigation };
};