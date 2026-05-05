import { useState } from "react";
import { List, Action, ActionPanel, Icon } from "@vicinae/api";
import { deleteLabelByUUID, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Label } from "../../lib/types/dto";
import UpsertLabelEntry from "./label-entry";

interface ManageLabelsProps {
  onSelect?: () => void;
}

export function ManageLabels({ onSelect }: ManageLabelsProps) {
  const { isLoading, data: labels, revalidate } = useDataFetch<Label>("label");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleDelete(uuid: string) {
    setIsDeleting(uuid);
    await deleteLabelByUUID(uuid);
    setIsDeleting(null);
    revalidate();
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Manage Labels"
    >
      <List.EmptyView
        title="No Labels"
        description="Create your first label to categorize snippets"
        icon={Icon.Tag}
      />
      {labels?.map((label) => (
        <List.Item
          key={label.uuid}
          title={label.title}
          icon={{ source: Icon.CircleFilled, tintColor: label.colorHex }}
          actions={
            <ActionPanel>
              <Action.Push
                title="Edit Label"
                target={
                  <UpsertLabelEntry
                    uuid={label.uuid}
                    title={label.title}
                    colorHex={label.colorHex}
                    onSuccess={revalidate}
                  />
                }
              />
              <Action
                title="Delete Label"
                onAction={() => handleDelete(label.uuid)}
                destructive
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}