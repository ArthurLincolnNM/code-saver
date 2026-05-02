import { useState } from "react";
import { Form, Action, ActionPanel } from "@vicinae/api";
import { upsertLabel, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Label } from "../../lib/types/dto";
import { useNavigation } from "@vicinae/api";
import InitError from "../init/init-error";

interface UpsertLabelEntryProps {
  uuid?: string;
  title?: string;
  colorHex?: string;
  onSuccess: () => void;
}

export default function UpsertLabelEntry({ uuid, title, colorHex, onSuccess }: UpsertLabelEntryProps) {
  const { isLoading, data: allLabels, revalidate } = useDataFetch<Label>("label");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [colorHexError, setColorHexError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pop } = useNavigation();

  async function handleSubmit(values: { title: string; colorHex: string }) {
    if (!values.title.trim()) {
      setTitleError("Label title is required");
      return;
    }
    if (values.colorHex && !/^#[0-9a-fA-F]{3,6}$/.test(values.colorHex)) {
      setColorHexError("Color format error");
      return;
    }

    setIsSubmitting(true);
    const response = await upsertLabel({
      title: values.title,
      colorHex: values.colorHex || undefined,
      uuid,
    });
    setIsSubmitting(false);

    if (response === undefined) {
      onSuccess();
      revalidate();
      pop();
    }
  }

  return (
    <Form
      isLoading={isLoading || isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Save Label" />
        </ActionPanel>
      }
      navigationTitle={uuid ? "Update Label" : "Create Label"}
    >
      <Form.TextField
        id="title"
        title="Label Title"
        placeholder="Enter label title"
        error={titleError}
        autoFocus
        defaultValue={title ?? ""}
      />
      <Form.TextField
        id="colorHex"
        title="Color Hex"
        placeholder="#FAFBFC"
        info="Leave blank for random color"
        error={colorHexError}
        defaultValue={colorHex ?? ""}
      />
    </Form>
  );
}