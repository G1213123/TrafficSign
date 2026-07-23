import React, { useEffect, useSyncExternalStore } from 'react';

const TOAST_EXIT_MS = 450;

const toastState = {
  toast: null,
  version: 0,
  listeners: new Set(),
  closeTimerId: null,
  removeTimerId: null,

  notify() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  getSnapshot() {
    return this.version;
  },

  clearTimers() {
    if (this.closeTimerId) {
      clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }

    if (this.removeTimerId) {
      clearTimeout(this.removeTimerId);
      this.removeTimerId = null;
    }
  },

  show(message, type = 'success', duration = 3000) {
    this.clearTimers();
    this.toast = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message: String(message ?? ''),
      type,
      duration: Math.max(0, Number(duration) || 0),
      closing: false,
    };
    this.notify();

    this.closeTimerId = setTimeout(() => {
      if (!this.toast) return;
      this.toast = { ...this.toast, closing: true };
      this.notify();

      this.removeTimerId = setTimeout(() => {
        this.toast = null;
        this.notify();
      }, TOAST_EXIT_MS);
    }, this.toast.duration);
  },

  hide() {
    this.clearTimers();
    this.toast = null;
    this.notify();
  },
};

export function showToast(message, type = 'success', duration = 3000) {
  toastState.show(message, type, duration);
}

if (typeof window !== 'undefined') {
  window.GeneralHandler = window.GeneralHandler || {};
  window.GeneralHandler.showToast = showToast;
}

const toastPalette = {
  success: { border: '#3ddc97', glow: 'rgba(61, 220, 151, 0.22)' },
  warning: { border: '#f4c95d', glow: 'rgba(244, 201, 93, 0.24)' },
  error: { border: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.24)' },
  info: { border: '#7cc7ff', glow: 'rgba(124, 199, 255, 0.24)' },
};

export default function ToastBox() {
  useSyncExternalStore(
    (listener) => toastState.subscribe(listener),
    () => toastState.getSnapshot(),
    () => toastState.getSnapshot()
  );

  const toast = toastState.toast;

  useEffect(() => () => toastState.hide(), []);

  if (!toast) {
    return null;
  }

  const palette = toastPalette[toast.type] || toastPalette.info;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: toast.closing ? 'translate(-50%, -18px) scale(0.98)' : 'translateX(-50%)',
        zIndex: 10050,
        pointerEvents: 'none',
        transition: 'opacity 180ms ease, transform 180ms ease',
        opacity: toast.closing ? 0 : 1,
      }}
    >
      <div
        role="status"
        style={{
          minWidth: 'min(520px, calc(100vw - 32px))',
          maxWidth: 'min(720px, calc(100vw - 32px))',
          borderRadius: '14px',
          border: `1px solid ${palette.border}`,
          background: 'rgba(20, 22, 28, 0.96)',
          //boxShadow: `0 18px 45px ${palette.glow}, 0 8px 20px rgba(0, 0, 0, 0.28)`,
          color: '#f4f7fb',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '999px',
            background: palette.border,
            //boxShadow: `0 0 0 5px ${palette.glow}`,
            flex: '0 0 auto',
          }}
        />
        <div
          style={{
            fontSize: '14px',
            lineHeight: 1.45,
            fontWeight: 500,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {toast.message}
        </div>
      </div>
    </div>
  );
}