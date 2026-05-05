import { SnippetMarkdownFormatType } from "../constants/db-name";

export type SnippetFile = {
  uuid: string;
  fileName: string;
  content: string;
};

export type Snippet = {
  uuid: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  files: SnippetFile[];
  formatType: SnippetMarkdownFormatType;
  library: Library;
  labels: Label[];
};

export type Label = {
  uuid: string;
  colorHex: string;
  title: string;
};

export type Library = {
  uuid: string;
  name: string;
};

export type SnippetReq = {
  uuid?: string;
  title: string;
  description?: string;
  files: SnippetFile[];
  formatType: SnippetMarkdownFormatType;
  libraryUUID: string;
  labelsUUID: string[];
};

export type LibraryReq = {
  uuid?: string;
  name: string;
};

export type LabelReq = {
  uuid?: string;
  colorHex?: string;
  title: string;
};