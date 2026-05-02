import { useState } from "react";
import { Form, Action, ActionPanel, showToast, Toast, Icon } from "@vicinae/api";
import { upsertSnippet, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Label, Library } from "../../lib/types/dto";
import { useNavigation, popToRoot } from "@vicinae/api";
import UpsertLibraryEntry from "./library-entry";
import UpsertLabelEntry from "./label-entry";

export interface SnippetValues {
  snippetUUID?: string;
  title: string;
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

  async function handleSubmit(values: {
    title: string;
    fileName: string;
    content: string;
    formatType: "tldr" | "freestyle";
    libraryUUID: string;
    labelsUUID: string[];
  }) {
    if (!values.title.trim()) {
      setTitleError("Snippet title is required");
      return;
    }
    if (!values.fileName.trim()) {
      setFileNameError("Filename is required");
      return;
    }
    if (!values.content.trim()) {
      setContentError("Content is required");
      return;
    }

    setIsSubmitting(true);
    const response = await upsertSnippet({
      uuid: props?.snippetUUID,
      title: values.title,
      fileName: values.fileName,
      content: values.content,
      formatType: values.formatType,
      libraryUUID: values.libraryUUID,
      labelsUUID: values.labelsUUID,
    });
    setIsSubmitting(false);

    if (response === undefined) {
      showToast(Toast.Style.Success, "Snippet saved", `"${values.title}" was saved.`);

      if (props?.snippetUUID) {
        props?.onUpdateSuccess?.();
        popToRoot();
      } else {
        popToRoot();
      }
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
        <Form.TagPicker
          id="labelsUUID"
          title="Labels"
          defaultValue={props?.labelsUUID ?? []}
        >
          {allLabels.map((label) => (
            <Form.TagPicker.Item
              key={label.uuid}
              value={label.uuid}
              title={label.title}
              icon={{ source: Icon.CircleFilled, tintColor: label.colorHex }}
            />
          ))}
        </Form.TagPicker>
      )}
    </Form>
  );
}