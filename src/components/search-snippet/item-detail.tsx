import { List, Icon } from "@vicinae/api";
import { Snippet } from "../../lib/types/dto";
import { formatDate } from "../../lib/utils/snippet-utils";
import { getLanguageInfo } from "../../lib/constants/languages";

interface ItemDetailProps {
  snippet: Snippet;
}

function getFileContent(snippet: Snippet): { fileName: string; content: string } {
  // For single file snippets, or for backward compatibility
  if (snippet.files && snippet.files.length > 0) {
    return { fileName: snippet.files[0].fileName, content: snippet.files[0].content };
  }
  return { fileName: "untitled.txt", content: "" };
}

export function ItemDetail({ snippet }: ItemDetailProps) {
  const { fileName, content } = getFileContent(snippet);
  const langInfo = getLanguageInfo(fileName);

  // Build markdown for code rendering
  const markdown = (() => {
    if (snippet.formatType === "freestyle") {
      const lang = langInfo?.lang || "";
      return lang
        ? `\`\`\`${lang}\n${content}\n\`\`\``
        : `\`\`\`\n${content}\n\`\`\``;
    }
    return content;
  })();

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Title" text={snippet.title} />
          <List.Item.Detail.Metadata.Label title="Filename" text={fileName} />
          {langInfo && (
            <List.Item.Detail.Metadata.Label title="Language" text={langInfo.lang} />
          )}
          {snippet.description && (
            <List.Item.Detail.Metadata.Label title="Description" text={snippet.description} />
          )}
          <List.Item.Detail.Metadata.Label title="Created At" text={formatDate(snippet.createAt)} />
          <List.Item.Detail.Metadata.Label title="Last Updated At" text={formatDate(snippet.updateAt)} />
          <List.Item.Detail.Metadata.Label title="Library" text={snippet.library.name} icon={Icon.Folder} />
          <List.Item.Detail.Metadata.Label 
            title="Format" 
            text={snippet.formatType === "tldr" ? "TLDR" : "Freestyle"} 
          />
          {snippet.files.length > 1 && (
            <List.Item.Detail.Metadata.Label title="Files" text={`${snippet.files.length} files`} />
          )}
          {snippet.labels.length > 0 && (
            <List.Item.Detail.Metadata.TagList title="Labels">
              {snippet.labels.map((label) => (
                <List.Item.Detail.Metadata.TagList.Item
                  key={label.uuid}
                  text={label.title}
                  color={label.colorHex}
                />
              ))}
            </List.Item.Detail.Metadata.TagList>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
}

// Export for use in other components
export { getLanguageInfo } from "../../lib/constants/languages";