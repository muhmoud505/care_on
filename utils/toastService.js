  /**
 * Global Toast Service
 * Centralized toast notifications with consistent styling and behavior
 */

import Toast from 'react-native-toast-message';

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export const ToastPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  CENTER: 'center',
};

export const ToastDurations = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 4000,
  EXTRA_LONG: 6000,
};

/**
 * Show success toast
 */
export const showSuccess = (title, message, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.SUCCESS,
    text1: title,
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.MEDIUM,
    ...options,
  });
};

/**
 * Show error toast
 */
export const showError = (title, message, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.ERROR,
    text1: title,
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });
};

/**
 * Show info toast
 */
export const showInfo = (title, message, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.INFO,
    text1: title,
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.MEDIUM,
    ...options,
  });
};

/**
 * Show warning toast
 */
export const showWarning = (title, message, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.WARNING,
    text1: title,
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.MEDIUM,
    ...options,
  });
};

/**
 * Show loading toast
 */
export const showLoading = (message, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.INFO,
    text1: t ? t('common.loading') : 'Loading...',
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.MEDIUM,
    ...options,
  });
};

/**
 * Show network error toast with retry option
 */
export const showNetworkError = (message, onRetry = null, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.network_error') : 'Network Error',
    text2: message,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });

  // Show retry toast after delay
  if (onRetry) {
    setTimeout(() => {
      showInfo(t ? t('common.retry') : 'Retry', t ? t('common.tap_to_retry') : 'Tap to retry', t, {
        position: ToastPositions.TOP,
        duration: ToastDurations.SHORT,
      });
    }, 1000);
  }
};

/**
 * Show validation error toast
 */
export const showValidationError = (fieldName, message = null, t = null) => {
  const errorMessage = message || `Please check the ${fieldName} field`;
  
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.validation_error') : 'Validation Error',
    text2: errorMessage,
    position: ToastPositions.TOP,
    visibilityTime: ToastDurations.MEDIUM,
  });
};

/**
 * Show auth error toast
 */
export const showAuthError = (message = null, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.auth_error') : 'Authentication Error',
    text2: message || (t ? t('common.session_expired') : 'Your session has expired'),
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });
};

/**
 * Show file upload error toast
 */
export const showFileError = (fileName = null, t = null, options = {}) => {
  const errorMessage = fileName ? (t ? t('common.file_upload_failed_with_name', { fileName }) : `Failed to upload ${fileName}`) : (t ? t('common.file_upload_failed') : 'File upload failed');
  
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.file_error') : 'File Error',
    text2: errorMessage,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });
};

/**
 * Show server error toast
 */
export const showServerError = (message = null, t = null, options = {}) => {
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.server_error') : 'Server Error',
    text2: message || (t ? t('common.server_maintenance') : 'Server is under maintenance'),
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });
};

/**
 * Show permission denied toast
 */
export const showPermissionDenied = (permission = null, t = null, options = {}) => {
  const defaultMessage = t ? t('common.permission_denied') : 'Permission Denied';
  const errorMessage = permission ? (t ? t('common.permission_denied_with_permission', { permission }) : `Permission denied: ${permission}`) : defaultMessage;
  
  Toast.show({
    type: ToastTypes.ERROR,
    text1: t ? t('common.permission_denied') : 'Permission Denied',
    text2: errorMessage,
    position: options.position || ToastPositions.TOP,
    visibilityTime: options.duration || ToastDurations.LONG,
    ...options,
  });
};

/**
 * Dismiss all active toasts
 */
export const dismissAll = () => {
  Toast.hide();
};

/**
 * Configure global toast settings (optional)
 */
export const configureToast = (config) => {
  // You can configure global toast behavior here
  // For example, default position, duration, etc.
};
