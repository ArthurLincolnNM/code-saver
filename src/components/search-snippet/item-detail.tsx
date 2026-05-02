import { List } from "@vicinae/api";
import { Snippet } from "../../lib/types/dto";
import { formatDate } from "../../lib/utils/snippet-utils";
import { getLanguageInfo } from "../../lib/constants/languages";

interface ItemDetailProps {
  snippet: Snippet;
}

export function ItemDetail({ snippet }: ItemDetailProps) {
  const createdAt = formatDate(snippet.createAt);
  const lastUpdatedAt = formatDate(snippet.updateAt);

  // Get language info from filename
  const langInfo = getLanguageInfo(snippet.fileName);

  // Build code block with language hint for syntax highlighting
  const markdown = (() => {
    if (snippet.formatType === "freestyle") {
      const lang = langInfo?.lang || "";
      return lang
        ? `\`\`\`${lang}\n${snippet.content}\n\`\`\``
        : `\`\`\`\n${snippet.content}\n\`\`\``;
    }
    return snippet.content;
  })();

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Title" text={snippet.title} />
          <List.Item.Detail.Metadata.Label title="Filename" text={snippet.fileName} />
          {langInfo && (
            <List.Item.Detail.Metadata.Label
              title="Language"
              text={langInfo.lang}
            />
          )}
          <List.Item.Detail.Metadata.Label title="Created At" text={createdAt} />
          <List.Item.Detail.Metadata.Label title="Last Updated At" text={lastUpdatedAt} />
          <List.Item.Detail.Metadata.Label title="Library" text={snippet.library.name} />
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