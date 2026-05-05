import { useState, useEffect, useCallback } from "react";
import { Snippet, Label, Library } from "../types/dto";
import {
  getSnippets,
  getLabels,
  getLibraries,
  saveSnippet,
  deleteSnippet,
  deleteLabel,
  deleteLibrary,
  saveLabel,
  saveLibrary,
} from "../storage/storage";

export function useDataFetch<T>(data: "label" | "library") {
  const [dataList, setDataList] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const revalidate = useCallback(async () => {
    setIsLoading(true);
    try {
      if (data === "label") {
        const labels = await getLabels();
        setDataList(labels as T[]);
      } else {
        const libraries = await getLibraries();
        setDataList(libraries as T[]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return { isLoading, data: dataList, error, revalidate };
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const revalidate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSnippets();
      setSnippets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return { isLoading, data: snippets, error, revalidate };
}

export async function upsertSnippet(req: {
  uuid?: string;
  title: string;
  description?: string;
  files: { uuid?: string; fileName: string; content: string }[];
  formatType: "tldr" | "freestyle";
  libraryUUID: string;
  labelsUUID: string[];
}): Promise<string | undefined> {
  return saveSnippet(req);
}

export async function upsertLabel(req: { uuid?: string; title: string; colorHex?: string }): Promise<string | undefined> {
  return saveLabel(req);
}

export async function upsertLibrary(req: { uuid?: string; name: string }): Promise<string | undefined> {
  return saveLibrary(req);
}

export async function deleteSnippetByUUID(uuid: string): Promise<string | undefined> {
  return deleteSnippet(uuid);
}

export async function deleteLabelByUUID(uuid: string): Promise<string | undefined> {
  return deleteLabel(uuid);
}

export async function deleteLibraryByUUID(uuid: string): Promise<string | undefined> {
  return deleteLibrary(uuid);
}