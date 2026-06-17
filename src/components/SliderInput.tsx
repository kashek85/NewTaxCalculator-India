import React from 'react';

interface SliderInputProps {
  id: string;
  label: string;
  tooltip: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  labels?: string[];
  actionButton?: React.ReactNode;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  id,
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step,
  labels,
  actionButton
}) => {
  const percent = ((value - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, var(--color-primary) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value) || 0);
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    if (val > max) val = max;
    if (val < min) val = min;
    onChange(val);
  };

  const formatShort = (val: number): string => {
    if (val === 0) return '₹0';
    if (val >= 10000000) return (val / 10000000).toFixed(1).replace('.0', '') + ' Cr';
    if (val >= 100000) return (val / 100000).toFixed(1).replace('.0', '') + 'L';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  return (
    <div className="input-field-wrapper">
      <div className="input-label-row">
        {actionButton ? (
          <div className="label-with-action">
            <label htmlFor={id}>
              {label}{' '}
              <span className="help-tooltip" data-tooltip={tooltip}>
                <i className="fa-regular fa-circle-question"></i>
              </span>
            </label>
            {actionButton}
          </div>
        ) : (
          <label htmlFor={id}>
            {label}{' '}
            <span className="help-tooltip" data-tooltip={tooltip}>
              <i className="fa-regular fa-circle-question"></i>
            </span>
          </label>
        )}
        <div className="numeric-input-wrapper">
          <span className="currency-symbol">₹</span>
          <input
            type="number"
            id={`${id}-num`}
            value={value}
            min={min}
            max={max}
            onChange={handleNumChange}
          />
        </div>
      </div>
      <div className="range-slider-wrapper">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          style={sliderStyle}
          onChange={handleSliderChange}
        />
        <div className="range-labels">
          {labels ? (
            labels.map((lbl, idx) => <span key={idx}>{lbl}</span>)
          ) : (
            <>
              <span>{formatShort(min)}</span>
              <span>{formatShort(min + (max - min) / 2)}</span>
              <span>{formatShort(max)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
