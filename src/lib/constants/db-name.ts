export const DB_NAME = "code-saver.db";
export const MIGRATIONS_FOLDER = "drizzle";

// tldr style can be found: https://github.com/tldr-pages/tldr/blob/main/contributing-guides/style-guide.md
// freestyle means it can be:
// 1. code
// 2. markdown doc
export const SnippetMarkdownFormatTypeEnumArray = ["tldr", "freestyle"] as const;
export type SnippetMarkdownFormatType = (typeof SnippetMarkdownFormatTypeEnumArray)[number];