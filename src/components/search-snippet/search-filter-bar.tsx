import { Library, Label } from "../../lib/types/dto";
import { FilterAccessory, FilterType } from "./filter-accessory";

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  libraries: Library[];
  labels: Label[];
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  libraries,
  labels,
}: SearchFilterBarProps) {
  return (
    <FilterAccessory
      filter={filter}
      setFilter={onFilterChange}
      libraries={libraries}
      labels={labels}
    />
  );
}