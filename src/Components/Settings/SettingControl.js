import React from 'react';
import { Switch } from '../UI/switch.js';
import { Slider } from '../UI/slider.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../UI/select.js';
import { Label } from '../UI/label.js';

export default function SettingControl({
  title,
  description,
  type, // 'toggle', 'slider', 'dropdown', 'color', 'text'
  value,
  onChange,
  min,
  max,
  step = 1,
  options = [],
  suffix = '',
  formatValue,
  isRAM = false,
  placeholder = '',
  textQuickActions = []
}) {
  // Format RAM display: show as GB if >= 1000 MB
  const formatRAM = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)} GB`;
    }
    return `${val} MB`;
  };

  const displayValue = isRAM ? formatRAM(value) : (formatValue ? formatValue(value) : `${value}${suffix}`);
  return (
    <div className="flex items-start justify-between gap-6 p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <div className="flex items-center gap-2 min-w-[140px]">
        {type === 'toggle' && (
          <Switch checked={value} onCheckedChange={onChange} />
        )}
        {type === 'slider' && (
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-sm font-mono">
                {displayValue}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([val]) => onChange(val)}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
          </div>
        )}
        {type === 'dropdown' && (
          <div className="w-[18rem] sm:w-[22rem]">
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[20rem] w-[18rem] sm:w-[22rem] overflow-y-auto">
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {type === 'color' && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/20"
          />
        )}
        {type === 'text' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors w-48"
            />
            {textQuickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  const baseValue = typeof value === 'string' ? value : '';
                  onChange(`${baseValue}${action.value}`);
                }}
                className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
                title={action.title || `Insert ${action.label}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}