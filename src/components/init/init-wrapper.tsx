import { useState, useEffect } from "react";
import { List, ActionPanel, Action } from "@vicinae/api";
import InitError from "./init-error";
import { getLibraries } from "../../lib/storage/storage";

interface InitWrapperProps {
  children: React.ReactNode;
}

export function InitWrapper({ children }: InitWrapperProps) {
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");
  const [tasks, setTasks] = useState<Array<{ name: string; status: "pending" | "running" | "done" | "error"; error?: string }>>([
    { name: "check storage", status: "pending" },
  ]);

  useEffect(() => {
    const checkStorage = async () => {
      setTasks((prev) =>
        prev.map((t, i) => (i === 0 ? { ...t, status: "running" } : t))
      );

      try {
        await getLibraries();
        setTasks((prev) =>
          prev.map((t, i) => (i === 0 ? { ...t, status: "done" } : t))
        );
        setStatus("ready");
      } catch (err) {
        setTasks((prev) =>
          prev.map((t, i) =>
            i === 0 ? { ...t, status: "error", error: String(err) } : t
          )
        );
        setStatus("error");
      }
    };

    checkStorage();
  }, []);

  if (status === "ready") {
    return <>{children}</>;
  }

  if (status === "error") {
    const errorTask = tasks.find((t) => t.status === "error");
    return (
      <InitError
        errMarkdown={`# Failed to Initialize\n\n\`\`\`\n${errorTask?.error || "Unknown error"}\n\`\`\`\n`}
      />
    );
  }

  return (
    <List>
      <List.Item
        title="Checking storage..."
        subtitle={tasks.map((t) => `${t.status === "done" ? "✅" : t.status === "running" ? "⏳" : "⏸"} ${t.name}`).join(" | ")}
      />
    </List>
  );
}