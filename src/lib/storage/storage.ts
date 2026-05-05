import { LocalStorage } from "@vicinae/api";
import { Snippet, Label, Library } from "../types/dto";

const SNIPPETS_KEY = "code-saver-snippets";
const LABELS_KEY = "code-saver-labels";
const LIBRARIES_KEY = "code-saver-libraries";

interface StoredSnippet {
  uuid: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  files: {
    uuid: string;
    fileName: string;
    content: string;
  }[];
  formatType: "tldr" | "freestyle";
  libraryUUID: string;
  labelUUIDs: string[];
}

interface StoredLabel {
  uuid: string;
  colorHex: string;
  title: string;
}

interface StoredLibrary {
  uuid: string;
  name: string;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getSnippets(): Promise<Snippet[]> {
  const data = await LocalStorage.getItem<string>(SNIPPETS_KEY);
  if (!data || data === "undefined" || data === "null") return [];

  try {
    const stored: StoredSnippet[] = JSON.parse(data);
    const libraries = await getLibraries();
    const labels = await getLabels();

    return stored.map((s) => ({
      uuid: s.uuid,
      createAt: new Date(s.createAt),
      updateAt: new Date(s.updateAt),
      title: s.title,
      description: s.description || "",
      files: s.files && s.files.length > 0 ? s.files : [{
        uuid: generateUUID(),
        fileName: "untitled.txt",
        content: ""
      }],
      formatType: s.formatType || "freestyle",
      library: libraries.find((l) => l.uuid === s.libraryUUID) || { uuid: "", name: "Default" },
      labels: labels.filter((l) => s.labelUUIDs?.includes(l.uuid)),
    }));
  } catch {
    return [];
  }
}

export async function getLabels(): Promise<Label[]> {
  const data = await LocalStorage.getItem<string>(LABELS_KEY);
  if (!data || data === "undefined" || data === "null") return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getLibraries(): Promise<Library[]> {
  const data = await LocalStorage.getItem<string>(LIBRARIES_KEY);
  if (!data || data === "undefined" || data === "null") {
    return [{ uuid: generateUUID(), name: "Default" }];
  }
  try {
    const libs: Library[] = JSON.parse(data);
    return libs.length > 0 ? libs : [{ uuid: generateUUID(), name: "Default" }];
  } catch {
    return [{ uuid: generateUUID(), name: "Default" }];
  }
}

export async function saveSnippet(req: {
  uuid?: string;
  title: string;
  description?: string;
  files: { uuid?: string; fileName: string; content: string }[];
  formatType: "tldr" | "freestyle";
  libraryUUID: string;
  labelsUUID: string[];
}): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(SNIPPETS_KEY);
    const snippets: StoredSnippet[] = rawData && rawData !== "undefined" && rawData !== "null"
      ? JSON.parse(rawData)
      : [];

    const now = new Date().toISOString();
    const normalizedFiles = req.files.map(f => ({
      uuid: f.uuid || generateUUID(),
      fileName: f.fileName,
      content: f.content,
    }));

    if (req.uuid) {
      const idx = snippets.findIndex((s) => s.uuid === req.uuid);
      if (idx !== -1) {
        snippets[idx] = {
          ...snippets[idx],
          title: req.title,
          description: req.description || "",
          files: normalizedFiles,
          formatType: req.formatType,
          libraryUUID: req.libraryUUID,
          labelUUIDs: req.labelsUUID,
          updateAt: now
        };
      }
    } else {
      snippets.push({
        uuid: generateUUID(),
        createAt: now,
        updateAt: now,
        title: req.title,
        description: req.description || "",
        files: normalizedFiles,
        formatType: req.formatType,
        libraryUUID: req.libraryUUID,
        labelUUIDs: req.labelsUUID,
      });
    }

    await LocalStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

export async function deleteSnippet(snippetUUID: string): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(SNIPPETS_KEY);
    const snippets: StoredSnippet[] = rawData ? JSON.parse(rawData) : [];
    const filtered = snippets.filter((s) => s.uuid !== snippetUUID);
    await LocalStorage.setItem(SNIPPETS_KEY, JSON.stringify(filtered));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

export async function deleteLabel(labelUUID: string): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(LABELS_KEY);
    const labels: StoredLabel[] = rawData ? JSON.parse(rawData) : [];
    const filtered = labels.filter((l) => l.uuid !== labelUUID);
    await LocalStorage.setItem(LABELS_KEY, JSON.stringify(filtered));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

export async function deleteLibrary(libraryUUID: string): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(LIBRARIES_KEY);
    let libraries: StoredLibrary[] = rawData ? JSON.parse(rawData) : [];
    // Prevent deleting the last library
    if (libraries.length <= 1) {
      return "Cannot delete the last library";
    }
    const filtered = libraries.filter((l) => l.uuid !== libraryUUID);
    await LocalStorage.setItem(LIBRARIES_KEY, JSON.stringify(filtered));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

export async function saveLabel(req: { uuid?: string; title: string; colorHex?: string }): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(LABELS_KEY);
    const labels: StoredLabel[] = rawData ? JSON.parse(rawData) : [];
    const color = req.colorHex || generateRandomColor();

    if (req.uuid) {
      const idx = labels.findIndex((l) => l.uuid === req.uuid);
      if (idx !== -1) {
        labels[idx] = { ...labels[idx], title: req.title, colorHex: color };
      }
    } else {
      if (labels.some((l) => l.title === req.title)) {
        return "Label title is duplicated.";
      }
      labels.push({ uuid: generateUUID(), title: req.title, colorHex: color });
    }

    await LocalStorage.setItem(LABELS_KEY, JSON.stringify(labels));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

export async function saveLibrary(req: { uuid?: string; name: string }): Promise<string | undefined> {
  try {
    const rawData = await LocalStorage.getItem<string>(LIBRARIES_KEY);
    let libraries: StoredLibrary[] = rawData ? JSON.parse(rawData) : [];

    if (libraries.length === 0) {
      libraries = [{ uuid: generateUUID(), name: "Default" }];
    }

    if (req.uuid) {
      const idx = libraries.findIndex((l) => l.uuid === req.uuid);
      if (idx !== -1) {
        libraries[idx] = { ...libraries[idx], name: req.name };
      }
    } else {
      if (libraries.some((l) => l.name === req.name)) {
        return "Library name is duplicated.";
      }
      libraries.push({ uuid: generateUUID(), name: req.name });
    }

    await LocalStorage.setItem(LIBRARIES_KEY, JSON.stringify(libraries));
    return undefined;
  } catch (exc) {
    return String(exc);
  }
}

function generateRandomColor(): string {
  const getRGB = () => (Math.floor(Math.random() * 127) + 127).toString(16).padStart(2, "0");
  return `#${getRGB()}${getRGB()}${getRGB()}`;
}