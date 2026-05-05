import { useState } from "react";
import { List, Action, ActionPanel, Icon } from "@vicinae/api";
import { deleteLibraryByUUID, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Library } from "../../lib/types/dto";
import UpsertLibraryEntry from "./library-entry";

interface ManageLibrariesProps {
  onSelect?: () => void;
}

export function ManageLibraries({ onSelect }: ManageLibrariesProps) {
  const { isLoading, data: libraries, revalidate } = useDataFetch<Library>("library");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleDelete(uuid: string) {
    setIsDeleting(uuid);
    await deleteLibraryByUUID(uuid);
    setIsDeleting(null);
    revalidate();
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Manage Libraries"
    >
      <List.EmptyView
        title="No Libraries"
        description="Create your first library to organize snippets"
        icon={Icon.Folder}
      />
      {libraries?.map((lib) => (
        <List.Item
          key={lib.uuid}
          title={lib.name}
          icon={Icon.Folder}
          actions={
            <ActionPanel>
              <Action.Push
                title="Edit Library"
                target={
                  <UpsertLibraryEntry
                    uuid={lib.uuid}
                    name={lib.name}
                    onSuccess={revalidate}
                  />
                }
              />
              {libraries.length > 1 && (
                <Action
                  title="Delete Library"
                  onAction={() => handleDelete(lib.uuid)}
                  destructive
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}