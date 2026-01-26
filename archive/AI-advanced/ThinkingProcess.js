import React from 'react';
import './ThinkingProcess.css';

/**
 * ThinkingProcess - Shows AI's decision-making process
 * Displays complexity analysis, model selection, and quality checks
 */
const ThinkingProcess = ({ thinkingData, show = true }) => {
  if (!show || !thinkingData) return null;

  const { steps, summary, estimatedTime } = thinkingData;

  return (
    <div className="thinking-process">
      <div className="thinking-header">
        <div className="thinking-title">
          <span className="thinking-icon">🧠</span>
          <span>AI Thinking Process</span>
        </div>
        <div className="thinking-summary">{summary}</div>
      </div>

      <div className="thinking-steps">
        {steps.map((step, index) => (
          <div key={index} className="thinking-step">
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <div className="step-label">{step.step}</div>
              <div className="step-detail">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {estimatedTime > 0 && (
        <div className="thinking-footer">
          <span className="thinking-time">
            ⏱️ Estimated: {(estimatedTime / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
};

export default ThinkingProcess;
