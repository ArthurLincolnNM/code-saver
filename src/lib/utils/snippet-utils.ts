import { Icon, Color } from "@vicinae/api";
import { Label } from "../types/dto";

export function labelIcon(label: Label) {
  return {
    source: Icon.CircleFilled,
    tintColor: label.colorHex,
  };
}

export function formatDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${month}/${day}/${year}, ${hour12}:${minutes} ${ampm}`;
}

export function generateRandomColor(): string {
  const getRGB = () => (Math.floor(Math.random() * 127) + 127).toString(16).padStart(2, "0");
  return `#${getRGB()}${getRGB()}${getRGB()}`;
}

export function parsePage(markdown: string, filename: string): { command: string; subtitle?: string; url?: string; items: { description: string; command: string }[] } {
  const lines = markdown.split("\n");
  const subtitle: string[] = [];
  const commands: string[] = [];
  const descriptions: string[] = [];

  for (const line of lines) {
    if (line.startsWith(">")) subtitle.push(line.slice(2));
    else if (line.startsWith("`")) commands.push(line.slice(1, -1));
    else if (line.startsWith("-")) descriptions.push(line.slice(2));
  }

  const match = markdown.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/);
  const url = match ? match[0] : undefined;

  return {
    command: lines[0]?.slice(2) || filename,
    subtitle: subtitle[0],
    url,
    items: commands.map((command, i) => ({
      command,
      description: descriptions[i] || "",
    })),
  };
}