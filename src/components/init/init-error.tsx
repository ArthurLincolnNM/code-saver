import { Detail, Action, ActionPanel } from "@vicinae/api";

interface InitErrorProps {
  errMarkdown: string;
}

export default function InitError({ errMarkdown }: InitErrorProps) {
  return (
    <Detail
      navigationTitle="Failed to initialize"
      markdown={errMarkdown}
    />
  );
}