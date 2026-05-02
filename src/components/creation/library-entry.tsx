import { useState } from "react";
import { List, Form, Action, ActionPanel } from "@vicinae/api";
import { upsertLibrary, useDataFetch } from "../../lib/hooks/use-data-ops";
import { Library } from "../../lib/types/dto";
import { useNavigation } from "@vicinae/api";
import InitError from "../init/init-error";

interface UpsertLibraryEntryProps {
  uuid?: string;
  name?: string;
  onSuccess: () => void;
}

export default function UpsertLibraryEntry({ uuid, name, onSuccess }: UpsertLibraryEntryProps) {
  const { isLoading, data: allLibs, revalidate } = useDataFetch<Library>("library");
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pop } = useNavigation();

  async function handleSubmit(values: { name: string }) {
    if (!values.name.trim()) {
      setNameError("Library name is required");
      return;
    }
    if (allLibs?.some((lib) => lib.name === values.name && lib.uuid !== uuid)) {
      setNameError("Library name is duplicated");
      return;
    }

    setIsSubmitting(true);
    const response = await upsertLibrary({ name: values.name, uuid });
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
          <Action.SubmitForm onSubmit={handleSubmit} title="Save Library" />
        </ActionPanel>
      }
      navigationTitle={uuid ? "Update Library" : "Create Library"}
    >
      <Form.TextField
        id="name"
        title="Library Name"
        placeholder="Enter library name"
        error={nameError}
        autoFocus
        defaultValue={name ?? ""}
      />
    </Form>
  );
}