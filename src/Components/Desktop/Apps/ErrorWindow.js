import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import './ErrorWindow.css';

const errorMessages = {
    '404': {
        title: 'Page Not Found',
        message: 'The requested page could not be located in the system directory.',
        icon: 'alert'
    },
    '403': {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        icon: 'error'
    },
    '500': {
        title: 'Internal Error',
        message: 'The system encountered an unexpected error while processing your request.',
        icon: 'error'
    },
    'network': {
        title: 'Network Error',
        message: 'Unable to establish connection to the server. Please check your network connection.',
        icon: 'warning'
    },
    'generation_failed': {
        title: 'Generation Failed',
        message: 'The response generation system encountered an error.',
        icon: 'error'
    },
    'storage_failed': {
        title: 'Storage Error',
        message: 'Unable to save data to local storage.',
        icon: 'error'
    }
};

export default function ErrorWindow({ errorData, onRetry, onDismiss }) {
    const { type, message, retryCount = 0 } = errorData || {};

    const errorInfo = errorMessages[type] || {
        title: 'System Error',
        message: message || 'An unexpected error has occurred.',
        icon: 'error'
    };

    const getIcon = () => {
        switch (errorInfo.icon) {
            case 'warning':
                return <AlertTriangle className="error-icon warning" />;
            case 'alert':
                return <AlertCircle className="error-icon alert" />;
            case 'error':
            default:
                return <XCircle className="error-icon error" />;
        }
    };

    return (
        <div className="error-popup">
            <div className="error-popup-content">
                <div className="error-popup-icon">
                    {getIcon()}
                </div>
                <div className="error-popup-text">
                    <div className="error-popup-title">{errorInfo.title}</div>
                    <div className="error-popup-message">{errorInfo.message}</div>
                    {retryCount > 0 && (
                        <div className="error-popup-retry">Retry attempt {retryCount}</div>
                    )}
                </div>
            </div>
            <div className="error-popup-buttons">
                {onRetry && (
                    <button onClick={onRetry} className="error-btn error-btn-primary">
                        Retry
                    </button>
                )}
                <button onClick={onDismiss} className="error-btn error-btn-secondary">
                    OK
                </button>
            </div>
        </div>
    );
}
