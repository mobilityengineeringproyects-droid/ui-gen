"use client";

import type { ToolInvocation as ToolInvocationType } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationProps {
  toolInvocation: ToolInvocationType;
}

// Returns the last segment of a path, e.g. "/components/Button.jsx" -> "Button.jsx"
function basename(path: string): string {
  if (!path) return "";
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? path;
}

// Translates a raw tool call into a short, human-friendly description of what
// the model is doing, e.g. "Creating Button.jsx" instead of "str_replace_editor".
export function getToolMessage(
  toolName: string,
  args: Record<string, unknown> | undefined
): string {
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;
  const newPath = args?.new_path as string | undefined;
  const name = path ? basename(path) : undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return name ? `Creating ${name}` : "Creating file";
      case "str_replace":
      case "insert":
        return name ? `Editing ${name}` : "Editing file";
      case "view":
        return name ? `Viewing ${name}` : "Viewing file";
      case "undo_edit":
        return name ? `Reverting changes in ${name}` : "Reverting changes";
      default:
        return name ? `Modifying ${name}` : "Modifying file";
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return name && newPath
          ? `Renaming ${name} to ${basename(newPath)}`
          : "Renaming file";
      case "delete":
        return name ? `Deleting ${name}` : "Deleting file";
      default:
        return name ? `Managing ${name}` : "Managing files";
    }
  }

  // Fall back to the raw tool name for any unrecognized tool.
  return toolName;
}

export function ToolInvocation({ toolInvocation }: ToolInvocationProps) {
  const message = getToolMessage(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown> | undefined
  );
  const isComplete =
    toolInvocation.state === "result" && Boolean(toolInvocation.result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
