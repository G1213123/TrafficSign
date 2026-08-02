import React from 'react';

const normalizeAngleValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

export const getNextAngle = (angles, currentValue, direction = 'right') => {
  if (!Array.isArray(angles) || angles.length === 0) {
    return currentValue;
  }

  const normalizedAngles = angles.map(normalizeAngleValue);
  const normalizedCurrent = normalizeAngleValue(currentValue);
  let currentIndex = normalizedAngles.findIndex((angle) => angle === normalizedCurrent);

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  const offset = direction === 'left' ? -1 : 1;
  const nextIndex = (currentIndex + offset + normalizedAngles.length) % normalizedAngles.length;
  return normalizedAngles[nextIndex];
};

const iconStyle = {
  width: 16,
  height: 16,
  display: 'block',
};

const buttonStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: '1px solid #4a4a4a',
  background: '#2a2a2a',
  color: '#f0f0f0',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flex: '0 0 auto',
};

const selectStyle = {
  flex: '1 1 auto',
  minWidth: 0,
  backgroundColor: '#121212',
  border: '1px solid #4a4a4a',
  borderRadius: 6,
  color: '#f2f2f2',
  fontSize: 14,
  padding: '8px 10px',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

function AngleArrow({ direction }) {
  const path = direction === 'left'
    ? 'M14.5 5.5L8.5 12l6 6.5'
    : 'M9.5 5.5l6 6.5-6 6.5';

  return (
    <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true" focusable="false">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AngleSelector({ value, options = [], label = 'Angle', onRotateLeft, onRotateRight, onChange }) {
  const displayValue = value === null || value === undefined || value === '' ? 0 : value;
  const normalizedOptions = Array.isArray(options) && options.length > 0 ? options : [displayValue];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <button
        type="button"
        title={`${label} rotate left`}
        aria-label={`${label} rotate left`}
        onClick={onRotateLeft}
        disabled={!onRotateLeft}
        style={buttonStyle}
      >
        <AngleArrow direction="left" />
      </button>
      <select
        className="input-field property-input-field property-input-select"
        value={String(displayValue)}
        onChange={(event) => {
          if (typeof onChange === 'function') {
            const nextValue = Number(event.target.value);
            onChange(Number.isFinite(nextValue) ? nextValue : event.target.value);
          }
        }}
        aria-label={label}
        style={selectStyle}
      >
        {normalizedOptions.map((option) => {
          const optionValue = String(option);
          return (
            <option key={optionValue} value={optionValue}>
              {`${optionValue}°`}
            </option>
          );
        })}
      </select>
      <button
        type="button"
        title={`${label} rotate right`}
        aria-label={`${label} rotate right`}
        onClick={onRotateRight}
        disabled={!onRotateRight}
        style={buttonStyle}
      >
        <AngleArrow direction="right" />
      </button>
    </div>
  );
}