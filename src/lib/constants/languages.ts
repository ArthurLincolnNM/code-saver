// Language icons from devicon.dev CDN
export const LANGUAGE_ICONS: Record<string, { icon: string; color: string }> = {
  javascript: { icon: "javascript", color: "#f7df1e" },
  typescript: { icon: "typescript", color: "#3178c6" },
  python: { icon: "python", color: "#3776ab" },
  rust: { icon: "rust", color: "#dea584" },
  go: { icon: "go", color: "#00add8" },
  java: { icon: "java", color: "#ed8b00" },
  kotlin: { icon: "kotlin", color: "#7f52ff" },
  swift: { icon: "swift", color: "#fa7343" },
  c: { icon: "c", color: "#a8b9cc" },
  "c++": { icon: "cplusplus", color: "#00599c" },
  "c#": { icon: "csharp", color: "#512bd4" },
  ruby: { icon: "ruby", color: "#cc342d" },
  php: { icon: "php", color: "#777bb4" },
  html: { icon: "html5", color: "#e34f26" },
  css: { icon: "css3", color: "#1572b6" },
  sql: { icon: "mysql", color: "#e38c00" },
  bash: { icon: "bash", color: "#4eaa25" },
  shell: { icon: "bash", color: "#4eaa25" },
  powershell: { icon: "powershell", color: "#012456" },
  dockerfile: { icon: "docker", color: "#2496ed" },
  yaml: { icon: "yaml", color: "#cb171e" },
  json: { icon: "json", color: "#292929" },
  markdown: { icon: "markdown", color: "#083fa1" },
  graphql: { icon: "graphql", color: "#e10098" },
  lua: { icon: "lua", color: "#000080" },
  r: { icon: "r", color: "#276dc3" },
  scala: { icon: "scala", color: "#dc322f" },
  haskell: { icon: "haskell", color: "#5e5086" },
  elixir: { icon: "elixir", color: "#6e4a7e" },
  erlang: { icon: "erlang", color: "#b83998" },
  dart: { icon: "dart", color: "#0175c2" },
  objectivec: { icon: "objectivec", color: "#438efb" },
  perl: { icon: "perl", color: "#39457e" },
  clojure: { icon: "clojure", color: "#5881d8" },
  fsharp: { icon: "fsharp", color: "#b845fc" },
  groovy: { icon: "groovy", color: "#4294b6" },
  gradle: { icon: "gradle", color: "#02303a" },
  makefile: { icon: "gnu", color: "#427819" },
  vim: { icon: "vim", color: "#199f73" },
  toml: { icon: "toml", color: "#9c4121" },
  xml: { icon: "xml", color: "#0060ac" },
};

// Base URL for devicon CDN
export const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export function getIconUrl(iconName: string, version: string = "original.svg"): string {
  return `${DEVICON_CDN}/${iconName}/${iconName}-${version}`;
}

// File extension to language name mapping
export const FILE_EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  pyw: "python",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  c: "c",
  h: "c",
  cpp: "c++",
  cc: "c++",
  cxx: "c++",
  hpp: "c++",
  cs: "c#",
  rb: "ruby",
  php: "php",
  html: "html",
  htm: "html",
  css: "css",
  scss: "css",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  ps1: "powershell",
  psd1: "powershell",
  dockerfile: "dockerfile",
  yaml: "yaml",
  yml: "yaml",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  graphql: "graphql",
  gql: "graphql",
  lua: "lua",
  r: "r",
  R: "r",
  scala: "scala",
  hs: "haskell",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  dart: "dart",
  m: "objectivec",
  mm: "objectivec",
  pl: "perl",
  clj: "clojure",
  fs: "fsharp",
  fsx: "fsharp",
  groovy: "groovy",
  gradle: "gradle",
  makefile: "makefile",
  vim: "vim",
  toml: "toml",
  xml: "xml",
};

export function getLanguageInfo(fileName: string): { lang: string; icon: string; iconUrl: string; color: string } | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const langName = FILE_EXT_TO_LANG[ext];
  if (!langName) return null;

  const icon = LANGUAGE_ICONS[langName];
  if (!icon) return null;

  return { lang: langName, icon: icon.icon, iconUrl: getIconUrl(icon.icon), color: icon.color };
}