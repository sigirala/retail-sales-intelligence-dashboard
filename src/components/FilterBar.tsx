import React, { useMemo } from 'react';
import {
  Filter,
  RotateCcw,
  Search,
  Calendar,
  MapPin,
  Store,
  Building2,
  Tag,
  Boxes,
  X,
} from 'lucide-react';
import { FilterState, MergedSalesRecord } from '../types';
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown';

interface FilterBarProps {
  data: MergedSalesRecord[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  data,
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
}) => {
  // 1. Week options
  const weekOptions: MultiSelectOption[] = useMemo(() => {
    const uniqueWeeks = Array.from(new Set(data.map((d) => d.week))).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
    return uniqueWeeks.map((w) => ({
      value: w,
      label: `Week ${w}`,
    }));
  }, [data]);

  // 2. Region options
  const regionOptions: MultiSelectOption[] = useMemo(() => {
    const uniqueRegions = Array.from(
      new Set(data.map((d) => d.region).filter(Boolean))
    ).sort();
    return uniqueRegions.map((r) => ({
      value: r,
      label: `${r} Region`,
    }));
  }, [data]);

  // 3. Store options (contextual to selected regions if any)
  const storeOptions: MultiSelectOption[] = useMemo(() => {
    const relevantData =
      filters.regions.length > 0
        ? data.filter((d) =>
            filters.regions.some((r) => r.toLowerCase() === d.region.toLowerCase())
          )
        : data;

    const storeMap = new Map<
      string,
      { id: string; name: string; region: string; city: string; format: string }
    >();
    for (const d of relevantData) {
      if (!storeMap.has(d.storeId)) {
        storeMap.set(d.storeId, {
          id: d.storeId,
          name: d.storeName,
          region: d.region,
          city: d.city,
          format: d.storeFormat,
        });
      }
    }
    return Array.from(storeMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({
        value: s.id,
        label: s.name,
        sublabel: `${s.region} • ${s.city} • ${s.format}`,
      }));
  }, [data, filters.regions]);

  // 4. City options (contextual to selected regions if any)
  const cityOptions: MultiSelectOption[] = useMemo(() => {
    const relevantData =
      filters.regions.length > 0
        ? data.filter((d) =>
            filters.regions.some((r) => r.toLowerCase() === d.region.toLowerCase())
          )
        : data;

    const uniqueCities = Array.from(
      new Set(relevantData.map((d) => d.city).filter(Boolean))
    ).sort();

    return uniqueCities.map((c) => {
      const sample = relevantData.find(
        (d) => d.city.toLowerCase() === c.toLowerCase()
      );
      return {
        value: c,
        label: c,
        sublabel: sample ? `${sample.region} Region` : undefined,
      };
    });
  }, [data, filters.regions]);

  // 5. Store Format options
  const formatOptions: MultiSelectOption[] = useMemo(() => {
    const uniqueFormats = Array.from(
      new Set(data.map((d) => d.storeFormat).filter(Boolean))
    ).sort();
    return uniqueFormats.map((f) => ({
      value: f,
      label: f,
    }));
  }, [data]);

  // 6. Category options
  const categoryOptions: MultiSelectOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(data.map((d) => d.category).filter(Boolean))
    ).sort();
    return uniqueCategories.map((c) => ({
      value: c,
      label: c,
    }));
  }, [data]);

  // Handle multi-select changes
  const handleMultiChange = (
    field: keyof Omit<FilterState, 'searchQuery'>,
    values: string[]
  ) => {
    onFilterChange({
      ...filters,
      [field]: values,
    });
  };

  // Remove single filter item from active chips
  const removeSingleFilter = (
    field: keyof Omit<FilterState, 'searchQuery'>,
    valToRemove: string
  ) => {
    const updated = (filters[field] as string[]).filter((v) => v !== valToRemove);
    onFilterChange({
      ...filters,
      [field]: updated,
    });
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-6">
      {/* Top bar: Title + Search + Reset */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Interactive Slicers & Multi-Select Filters
            </h2>
            <p className="text-[11px] text-slate-400">
              Select multiple weeks, regions, stores, cities, formats, and product categories
            </p>
          </div>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              {activeFiltersCount} Active
            </span>
          )}
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search store, city, category..."
              value={filters.searchQuery || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              id="clear-all-filters-btn"
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Core Multi-Select Slicers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {/* 1. Week */}
        <MultiSelectDropdown
          id="filter-week-multiselect"
          label="Week"
          icon={<Calendar className="w-3 h-3 text-slate-400" />}
          options={weekOptions}
          selectedValues={filters.weeks}
          onChange={(vals) => handleMultiChange('weeks', vals)}
          placeholder={`All Weeks (${weekOptions.length})`}
        />

        {/* 2. Region */}
        <MultiSelectDropdown
          id="filter-region-multiselect"
          label="Region"
          icon={<MapPin className="w-3 h-3 text-slate-400" />}
          options={regionOptions}
          selectedValues={filters.regions}
          onChange={(vals) => handleMultiChange('regions', vals)}
          placeholder={`All Regions (${regionOptions.length})`}
        />

        {/* 3. Store */}
        <MultiSelectDropdown
          id="filter-store-multiselect"
          label="Store"
          icon={<Store className="w-3 h-3 text-slate-400" />}
          options={storeOptions}
          selectedValues={filters.storeIds}
          onChange={(vals) => handleMultiChange('storeIds', vals)}
          placeholder={`All Stores (${storeOptions.length})`}
        />

        {/* 4. City */}
        <MultiSelectDropdown
          id="filter-city-multiselect"
          label="City"
          icon={<Building2 className="w-3 h-3 text-slate-400" />}
          options={cityOptions}
          selectedValues={filters.cities}
          onChange={(vals) => handleMultiChange('cities', vals)}
          placeholder={`All Cities (${cityOptions.length})`}
        />

        {/* 5. Store Format */}
        <MultiSelectDropdown
          id="filter-format-multiselect"
          label="Store Format"
          icon={<Boxes className="w-3 h-3 text-slate-400" />}
          options={formatOptions}
          selectedValues={filters.storeFormats}
          onChange={(vals) => handleMultiChange('storeFormats', vals)}
          placeholder={`All Formats (${formatOptions.length})`}
          align="right"
        />

        {/* 6. Product Category */}
        <MultiSelectDropdown
          id="filter-category-multiselect"
          label="Category"
          icon={<Tag className="w-3 h-3 text-slate-400" />}
          options={categoryOptions}
          selectedValues={filters.categories}
          onChange={(vals) => handleMultiChange('categories', vals)}
          placeholder={`All Categories (${categoryOptions.length})`}
          align="right"
        />
      </div>

      {/* Active Filter Chips / Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            Active Filters ({activeFiltersCount}):
          </span>

          {/* Weeks Chips */}
          {filters.weeks.map((w) => (
            <span
              key={`w-${w}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="text-slate-400 font-normal">Week:</span> W{w}
              <button
                type="button"
                onClick={() => removeSingleFilter('weeks', w)}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                title={`Remove Week ${w}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Regions Chips */}
          {filters.regions.map((r) => (
            <span
              key={`r-${r}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <span className="text-indigo-400 font-normal">Region:</span> {r}
              <button
                type="button"
                onClick={() => removeSingleFilter('regions', r)}
                className="text-indigo-400 hover:text-indigo-700 ml-0.5"
                title={`Remove ${r} Region`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Store Chips */}
          {filters.storeIds.map((id) => {
            const storeItem = data.find((d) => d.storeId === id);
            return (
              <span
                key={`s-${id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors max-w-xs truncate"
              >
                <span className="text-slate-400 font-normal">Store:</span>{' '}
                <span className="truncate">{storeItem?.storeName || id}</span>
                <button
                  type="button"
                  onClick={() => removeSingleFilter('storeIds', id)}
                  className="text-slate-400 hover:text-slate-700 ml-0.5 shrink-0"
                  title="Remove Store"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* City Chips */}
          {filters.cities.map((c) => (
            <span
              key={`c-${c}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="text-slate-400 font-normal">City:</span> {c}
              <button
                type="button"
                onClick={() => removeSingleFilter('cities', c)}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                title={`Remove City ${c}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Format Chips */}
          {filters.storeFormats.map((f) => (
            <span
              key={`f-${f}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="text-slate-400 font-normal">Format:</span> {f}
              <button
                type="button"
                onClick={() => removeSingleFilter('storeFormats', f)}
                className="text-slate-400 hover:text-slate-700 ml-0.5"
                title={`Remove Format ${f}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Category Chips */}
          {filters.categories.map((cat) => (
            <span
              key={`cat-${cat}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <span className="text-emerald-400 font-normal">Category:</span> {cat}
              <button
                type="button"
                onClick={() => removeSingleFilter('categories', cat)}
                className="text-emerald-400 hover:text-emerald-700 ml-0.5"
                title={`Remove Category ${cat}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Search Query Chip */}
          {filters.searchQuery?.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
              <span className="text-amber-500 font-normal">Search:</span> &quot;
              {filters.searchQuery}&quot;
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ ...filters, searchQuery: '' })
                }
                className="text-amber-500 hover:text-amber-800 ml-0.5"
                title="Clear Search Query"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Quick Clear All Link */}
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 ml-1.5 underline cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
