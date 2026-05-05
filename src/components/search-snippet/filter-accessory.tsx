import { List, Icon } from "@vicinae/api";
import { Library, Label } from "../../lib/types/dto";

export type FilterType = 
  | "all"
  | `library_${string}`
  | `label_${string}`;

export function FilterAccessory({
  filter,
  setFilter,
  libraries,
  labels,
}: {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  libraries: Library[];
  labels: Label[];
}) {
  return (
    <List.Dropdown
      tooltip="Filter by Library/Label"
      value={filter}
      onChange={(v) => setFilter(v as FilterType)}
    >
      <List.Dropdown.Item title="All Snippets" value="all" icon={Icon.Code} />
      
      <List.Dropdown.Section title="By Library">
        {libraries.map((lib) => (
          <List.Dropdown.Item
            key={lib.uuid}
            title={lib.name}
            value={`library_${lib.uuid}`}
            icon={Icon.Folder}
          />
        ))}
      </List.Dropdown.Section>
      
      {labels.length > 0 && (
        <List.Dropdown.Section title="By Label">
          {labels.map((label) => (
            <List.Dropdown.Item
              key={label.uuid}
              title={label.title}
              value={`label_${label.uuid}`}
              icon={{ source: Icon.CircleFilled, tintColor: label.colorHex }}
            />
          ))}
        </List.Dropdown.Section>
      )}
    </List.Dropdown>
  );
}