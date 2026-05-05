import { useState } from "react";
import { List, Action, ActionPanel, Clipboard, closeMainWindow, Icon } from "@vicinae/api";
import { Snippet } from "../../lib/types/dto";
import { ItemDetail, getLanguageInfo } from "./item-detail";
import { deleteSnippetByUUID, useDataFetch, useSnippets } from "../../lib/hooks/use-data-ops";
import InitError from "../init/init-error";
import { useNavigation } from "@vicinae/api";
import UpsertSnippetEntry from "../creation/snippet-entry";
import { parsePage } from "../../lib/utils/snippet-utils";
import { FilterAccessory, FilterType } from "./filter-accessory";

interface ItemActionsProps {
  snippet: Snippet;
  onUpdateSuccess?: () => void;
}

function ItemActions({ snippet, onUpdateSuccess }: ItemActionsProps) {
  const { push } = useNavigation();

  const handleDelete = async () => {
    const err = await deleteSnippetByUUID(snippet.uuid);
    if (err) {
      push(<InitError errMarkdown={`# Failed to Delete\n\n${err}`} />);
    }
    if (onUpdateSuccess) {
      onUpdateSuccess();
    }
  };

  // Get first file for actions
  const firstFile = snippet.files?.[0];
  const content = firstFile?.content || "";

  return (
    <ActionPanel>
      {snippet.formatType === "freestyle" && content ? (
        <Action
          title="Copy to Clipboard"
          onAction={async () => {
            await Clipboard.copy(content);
          }}
        />
      ) : snippet.formatType === "tldr" && firstFile ? (
        <Action
          title="View Commands"
          onAction={() => {
            push(<CommandList page={parsePage(content, firstFile.fileName)} />);
          }}
        />
      ) : null}

      <Action
        title="Update Snippet"
        onAction={() => {
          push(
            <UpsertSnippetEntry
              props={{
                snippetUUID: snippet.uuid,
                title: snippet.title,
                description: snippet.description,
                fileName: firstFile?.fileName || "",
                content: content,
                formatType: snippet.formatType,
                libraryUUID: snippet.library.uuid,
                labelsUUID: snippet.labels.map((l) => l.uuid),
                onUpdateSuccess,
              }}
            />
          );
        }}
      />
      <Action title="Delete Snippet" onAction={handleDelete} />
    </ActionPanel>
  );
}

function CommandList({ page }: { page: ReturnType<typeof parsePage> }) {
  return (
    <List navigationTitle={page.command}>
      {page.items.map((item, i) => (
        <List.Item
          key={i}
          title={item.command}
          subtitle={item.description}
          actions={
            <ActionPanel>
              <Action
                title="Copy Command"
                onAction={async () => {
                  await Clipboard.copy(item.command);
                  await closeMainWindow();
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

interface SnippetItemProps {
  snippet: Snippet;
  onUpdateSuccess: () => void;
}

function SnippetItem({ snippet, onUpdateSuccess }: SnippetItemProps) {
  // Get first file for display
  const firstFile = snippet.files?.[0];
  const fileName = firstFile?.fileName || "untitled.txt";
  const langInfo = getLanguageInfo(fileName);

  // Build accessories array
  const accessories: List.Item.Accessory[] = [];

  // Language icon
  if (langInfo) {
    accessories.push({
      icon: langInfo.iconUrl,
      tooltip: langInfo.lang,
    });
  }

  // Format badge for tldr
  if (snippet.formatType === "tldr") {
    accessories.push({ text: "TLDR" });
  }

  // Multiple files indicator
  if (snippet.files && snippet.files.length > 1) {
    accessories.push({ text: `${snippet.files.length} files` });
  }

  // Label badges
  if (snippet.labels.length > 0) {
    accessories.push({ 
      text: snippet.labels[0].title,
      icon: { source: Icon.CircleFilled, tintColor: snippet.labels[0].colorHex }
    });
  }

  return (
    <List.Item
      title={snippet.title}
      subtitle={fileName}
      accessories={accessories}
      detail={<ItemDetail snippet={snippet} />}
      actions={<ItemActions snippet={snippet} onUpdateSuccess={onUpdateSuccess} />}
    />
  );
}

export default function SearchSnippetsEntry() {
  const { isLoading: isLibLoading, data: libraries, revalidate: revalidateLib } = useDataFetch<{ uuid: string; name: string }>("library");
  const { isLoading: isLabelLoading, data: labels, revalidate: revalidateLabel } = useDataFetch<{ uuid: string; title: string; colorHex: string }>("label");
  const { isLoading: isSnippetLoading, data: snippets, revalidate: revalidateSnippets } = useSnippets();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const isLoading = isLabelLoading || isLibLoading || isSnippetLoading;

  const trimmedSearchQuery = searchQuery.trim().toLowerCase();

  // Apply search and filter
  const filteredSnippets = snippets?.filter((snippet) => {
    // Apply filter by library or label
    if (filter !== "all") {
      if (filter.startsWith("library_")) {
        const libUUID = filter.replace("library_", "");
        if (snippet.library.uuid !== libUUID) return false;
      } else if (filter.startsWith("label_")) {
        const labelUUID = filter.replace("label_", "");
        if (!snippet.labels.some((l) => l.uuid === labelUUID)) return false;
      }
    }

    // Apply search query
    if (trimmedSearchQuery.length === 0) {
      return true;
    }

    // Search in title, description, content, and filename
    const searchIn = [
      snippet.title,
      snippet.description || "",
      ...snippet.files.map(f => f.fileName),
      ...snippet.files.map(f => f.content),
    ].join(" ").toLowerCase();

    return searchIn.includes(trimmedSearchQuery);
  });

  return (
    <List
      searchText={searchQuery}
      onSearchTextChange={setSearchQuery}
      isShowingDetail={true}
      isLoading={isLoading}
      searchBarPlaceholder="Search Snippets"
      searchBarAccessory={
        <FilterAccessory
          filter={filter}
          setFilter={setFilter}
          libraries={libraries || []}
          labels={labels || []}
        />
      }
      throttle
    >
      {(filteredSnippets || []).map((snippet) => (
        <SnippetItem
          key={snippet.uuid}
          snippet={snippet}
          onUpdateSuccess={revalidateSnippets}
        />
      ))}
    </List>
  );
}