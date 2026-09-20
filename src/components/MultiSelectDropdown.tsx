import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
  align?: 'left' | 'right';
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter options based on local dropdown search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const allVals = options.map((o) => o.value);
    onChange(allVals);
  };

  const handleClear = () => {
    onChange([]);
  };

  // Button display label
  const isAllSelected = selectedValues.length === options.length && options.length > 0;
  const isNoneSelected = selectedValues.length === 0;

  const displaySummary = useMemo(() => {
    if (isNoneSelected) {
      return placeholder || `All ${label}s (${options.length})`;
    }
    if (isAllSelected) {
      return `All ${label}s (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const match = options.find((o) => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    if (selectedValues.length === 2) {
      const labels = selectedValues
        .map((v) => options.find((o) => o.value === v)?.label || v)
        .join(', ');
      if (labels.length <= 18) {
        return labels;
      }
    }
    return `${selectedValues.length} selected`;
  }, [isNoneSelected, isAllSelected, selectedValues, placeholder, label, options]);

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={containerRef}>
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-slate-500 flex items-center justify-between"
      >
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        {selectedValues.length > 0 && !isAllSelected && (
          <span className="text-[10px] font-bold text-indigo-600">
            {selectedValues.length} active
          </span>
        )}
      </label>

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white'
            : selectedValues.length > 0 && !isAllSelected
            ? 'border-indigo-300 bg-indigo-50/40 text-indigo-950 font-semibold'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="truncate block flex-1" title={displaySummary}>
          {displaySummary}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {selectedValues.length > 0 && !isAllSelected && (
            <span
              role="button"
              tabIndex={0}
              title="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  handleClear();
                }
              }}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}

          {selectedValues.length > 1 && !isAllSelected && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-200/80 text-indigo-800">
              {selectedValues.length}
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ minWidth: '220px' }}
        >
          {/* Header & Quick Actions */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold text-slate-700">
              {selectedValues.length === 0
                ? `All ${options.length} included`
                : `${selectedValues.length} of ${options.length} selected`}
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClear}
                disabled={selectedValues.length === 0}
                className="px-2 py-0.5 font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Search within Dropdown */}
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Checklist */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching {label.toLowerCase()} found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onClick={() => toggleOption(opt.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleOption(opt.value);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isChecked
                        ? 'bg-indigo-50 text-indigo-950 font-medium'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 truncate">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer with Apply / Done */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Multiple selections allowed
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
