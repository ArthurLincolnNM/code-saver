import { useState } from "react";
import { List, Action, ActionPanel, Clipboard, closeMainWindow, Icon, Color } from "@vicinae/api";
import { Snippet } from "../../lib/types/dto";
import { ItemDetail, getLanguageInfo } from "./item-detail";
import { deleteSnippetByUUID, useDataFetch, useSnippets } from "../../lib/hooks/use-data-ops";
import InitError from "../init/init-error";
import { useNavigation } from "@vicinae/api";
import UpsertSnippetEntry from "../creation/snippet-entry";
import { parsePage } from "../../lib/utils/snippet-utils";

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

  return (
    <ActionPanel>
      {snippet.formatType === "freestyle" ? (
        <>
          <Action
            title="Copy to Clipboard"
            onAction={async () => {
              await Clipboard.copy(snippet.content);
            }}
          />
        </>
      ) : (
        <Action
          title="View Commands"
          onAction={() => {
            push(<CommandList page={parsePage(snippet.content, snippet.fileName)} />);
          }}
        />
      )}

      <Action
        title="Update Snippet"
        onAction={() => {
          push(
            <UpsertSnippetEntry
              props={{
                snippetUUID: snippet.uuid,
                title: snippet.title,
                fileName: snippet.fileName,
                content: snippet.content,
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
  const langInfo = getLanguageInfo(snippet.fileName);

  // Build accessories array
  const accessories: List.Item.Accessory[] = [];

  // Language badge (most prominent)
  if (langInfo) {
    accessories.push({
      text: langInfo.abbrev,
      color: langInfo.color,
      tooltip: langInfo.lang,
    });
  }

  // Format badge for tldr
  if (snippet.formatType === "tldr") {
    accessories.push({ text: "TLDR" });
  }

  return (
    <List.Item
      title={snippet.title}
      subtitle={snippet.fileName}
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
  const [filter, setFilter] = useState<string>("all");

  const isLoading = isLabelLoading || isLibLoading || isSnippetLoading;

  const trimmedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSnippets = snippets?.filter((snippet) => {
    if (trimmedSearchQuery.length === 0) {
      return true;
    }
    return (
      snippet.title.toLowerCase().includes(trimmedSearchQuery) ||
      snippet.content.toLowerCase().includes(trimmedSearchQuery) ||
      snippet.fileName.toLowerCase().includes(trimmedSearchQuery)
    );
  });

  return (
    <List
      searchText={searchQuery}
      onSearchTextChange={setSearchQuery}
      isShowingDetail={true}
      isLoading={isLoading}
      searchBarPlaceholder="Search Snippets"
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