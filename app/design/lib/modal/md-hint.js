'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HintLoader } from '../../components/presentations/hintLoader.js';

const HINT_WIDTH = 600;
const HINT_MARGIN = 40;


export const HintModal = ({ isOpen, onClose, hintPath, anchorRect, onMouseEnter, onMouseLeave }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalStyle = useMemo(() => {
    if (!anchorRect) {
      return {};
    }

    const sidebar = document.querySelector('.main-panel');
    const sidebarRight = sidebar ? sidebar.getBoundingClientRect().right : 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const top = anchorRect.top;
    const left = Math.max(sidebarRight + 16, Math.min(sidebarRight + 16, viewportWidth - HINT_WIDTH - HINT_MARGIN));
    const estimatedHeight = Math.max(0, Math.min(480, viewportHeight - HINT_MARGIN));
    const overflowingBottom = top + estimatedHeight > viewportHeight - HINT_MARGIN;

    return {
      position: 'fixed',
      left: `${left}px`,
      top: overflowingBottom ? 'auto' : `${top}px`,
      bottom: overflowingBottom ? `${HINT_MARGIN}px` : 'auto',
      width: `${HINT_WIDTH}px`,
      maxWidth: `calc(100vw - ${HINT_MARGIN * 2}px)`,
      height: `${estimatedHeight}px`,
      maxHeight: `${estimatedHeight}px`,
      zIndex: 2000,
    };
  }, [anchorRect]);

  useEffect(() => {
    let cancelled = false;

    const loadHint = async () => {
      if (!isOpen || !hintPath) {
        setContent('');
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const html = await HintLoader.loadHint(hintPath);
        if (!cancelled) {
          setContent(html || '<p>No help available for this item.</p>');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load help content.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadHint();

    return () => {
      cancelled = true;
    };
  }, [isOpen, hintPath]);

  if (!isOpen || !hintPath) return null;

  return (
    <div 
      className="hint-modal-shell" 
      style={modalStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="hint-modal-panel">
        <div className="hint-modal-header">
          <button
            type="button"
            onClick={onClose}
            className="hint-modal-close"
            aria-label="Close hint modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="hint-modal-body">
          {isLoading ? (
            <div className="hint-modal-loading">
              <div className="hint-modal-spinner" />
            </div>
          ) : error ? (
            <div className="hint-modal-empty">
              <p>{error === 'Hint not found' ? 'No help available for this item.' : 'Failed to load help content.'}</p>
            </div>
          ) : (
            <div
              className="hint-modal-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Removed default export to avoid confusion with named export
