import { useState } from "react";
import { Form, Action, ActionPanel, showToast, Toast, Icon } from "@vicinae/api";
import { upsertSnippet, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Label, Library } from "../../lib/types/dto";
import { useNavigation, popToRoot } from "@vicinae/api";
import UpsertLibraryEntry from "./library-entry";
import UpsertLabelEntry from "./label-entry";
import { ManageLibraries } from "./manage-libraries";
import { ManageLabels } from "./manage-labels";

export interface SnippetValues {
  snippetUUID?: string;
  title: string;
  description?: string;
  fileName: string;
  content: string;
  formatType: "tldr" | "freestyle";
  libraryUUID: string;
  labelsUUID: string[];
  onUpdateSuccess?: () => void;
}

interface UpsertSnippetEntryProps {
  props?: SnippetValues;
}

export default function UpsertSnippetEntry({ props }: UpsertSnippetEntryProps) {
  const { isLoading: isLibLoading, data: allLibs, revalidate: revalidateLib } = useDataFetch<Library>("library");
  const { isLoading: isLabelLoading, data: allLabels, revalidate: revalidateLabel } = useDataFetch<Label>("label");

  const [titleError, setTitleError] = useState<string | undefined>();
  const [fileNameError, setFileNameError] = useState<string | undefined>();
  const [contentError, setContentError] = useState<string | undefined>();
  const [libraryError, setLibraryError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { push } = useNavigation();

  async function handleSubmit(values: Record<string, unknown>) {
    // Extract labels from checkbox values
    const labelsUUID = Object.entries(values)
      .filter(([key, value]) => key.startsWith('label_') && value === true)
      .map(([key]) => key.replace('label_', ''));


    // Validation
    if (!values.title || !(values.title as string).trim()) {
      setTitleError("Snippet title is required");
      return;
    }
    if (!values.fileName || !(values.fileName as string).trim()) {
      setFileNameError("Filename is required");
      return;
    }
    if (!values.content || !(values.content as string).trim()) {
      setContentError("Content is required");
      return;
    }

    setIsSubmitting(true);
    
    const response = await upsertSnippet({
      uuid: props?.snippetUUID,
      title: (values.title as string).trim(),
      description: (values.description as string)?.trim() || undefined,
      files: [{
        uuid: props?.snippetUUID,
        fileName: (values.fileName as string).trim(),
        content: values.content as string,
      }],
      formatType: (values.formatType as "tldr" | "freestyle") || "freestyle",
      libraryUUID: (values.libraryUUID as string) || allLibs?.[0]?.uuid || "",
      labelsUUID,
    });
    
    setIsSubmitting(false);

    if (response === undefined) {
      showToast(Toast.Style.Success, "Snippet saved", `"${values.title}" was saved.`);
      popToRoot();
    } else {
      showToast(Toast.Style.Failure, "Error", response);
    }
  }

  return (
    <Form
      isLoading={isLibLoading || isLabelLoading || isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Save Snippet" />
          <Action.Push
            icon={Icon.Plus}
            target={<UpsertLibraryEntry onSuccess={() => { revalidateLib(); }} />}
            title="Create Library"
          />
          <Action.Push
            icon={Icon.Plus}
            target={<UpsertLabelEntry onSuccess={() => { revalidateLabel(); }} />}
            title="Create Label"
          />
          <Action.Push
            icon={Icon.Folder}
            target={<ManageLibraries />}
            title="Manage Libraries"
          />
          <Action.Push
            icon={Icon.Tag}
            target={<ManageLabels />}
            title="Manage Labels"
          />
        </ActionPanel>
      }
      navigationTitle={props?.snippetUUID ? "Update Snippet" : "Create Snippet"}
    >
      <Form.TextField
        id="title"
        title="Snippet Title"
        placeholder="Enter title"
        error={titleError}
        autoFocus
        defaultValue={props?.title ?? ""}
      />
      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Optional description (supports markdown)"
        info="Brief description of what this snippet does"
        defaultValue={props?.description ?? ""}
      />
      <Form.TextField
        id="fileName"
        title="Filename"
        placeholder="example.sh"
        error={fileNameError}
        defaultValue={props?.fileName ?? ""}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Paste your code here..."
        error={contentError}
        defaultValue={props?.content ?? ""}
      />
      <Form.Dropdown
        id="formatType"
        title="Format"
        defaultValue={props?.formatType ?? "freestyle"}
      >
        <Form.Dropdown.Item value="freestyle" title="Freestyle" />
        <Form.Dropdown.Item value="tldr" title="TLDR" />
      </Form.Dropdown>
      <Form.Dropdown
        id="libraryUUID"
        title="Library"
        error={libraryError}
        defaultValue={props?.libraryUUID ?? allLibs?.[0]?.uuid}
      >
        {allLibs?.map((lib) => (
          <Form.Dropdown.Item key={lib.uuid} value={lib.uuid} title={lib.name} />
        ))}
      </Form.Dropdown>
      {allLabels && allLabels.length > 0 && (
        <>
          <Form.Separator />
          <Form.Description text="Labels" />
          {allLabels.map((label) => (
            <Form.Checkbox
              key={label.uuid}
              id={`label_${label.uuid}`}
              label={label.title}
              defaultValue={props?.labelsUUID?.includes(label.uuid) ?? false}
              labelStyle={{ color: label.colorHex }}
            />
          ))}
        </>
      )}
    </Form>
  );
}