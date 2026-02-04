import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AIChat from './AIChat.js';
import './AIDropdown.css';

/**
 * AIDropdown - ChatGPT-style AI dropdown (60% width, 50% height, centered)
 * Opens from top when AI mode is activated
 */
export default function AIDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="ai-dropdown-backdrop" onClick={onClose} />

      {/* Dropdown panel */}
      <div
        ref={dropdownRef}
        className={`ai-dropdown-panel ${isOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="ai-dropdown-header">
          <div className="ai-dropdown-title">
            <span className="ai-icon">✨</span>
            <h2>Nexus AI Assistant</h2>
          </div>
          <button
            className="ai-dropdown-close"
            onClick={onClose}
            title="Close AI (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Chat Content */}
        <div className="ai-dropdown-content">
          <AIChat />
        </div>
      </div>
    </>
  );
}
