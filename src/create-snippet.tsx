import { InitWrapper } from "./components/init/init-wrapper";
import UpsertSnippetEntry from "./components/creation/snippet-entry";

export default function CreateSnippet() {
  return (
    <InitWrapper>
      <UpsertSnippetEntry />
    </InitWrapper>
  );
}