import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation as ToolInvocationType } from "ai";
import { ToolInvocation, getToolMessage } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

// --- getToolMessage ---------------------------------------------------------

test("getToolMessage describes file creation with the file name", () => {
  expect(
    getToolMessage("str_replace_editor", {
      command: "create",
      path: "/components/Button.jsx",
    })
  ).toBe("Creating Button.jsx");
});

test("getToolMessage describes str_replace edits", () => {
  expect(
    getToolMessage("str_replace_editor", {
      command: "str_replace",
      path: "/App.jsx",
    })
  ).toBe("Editing App.jsx");
});

test("getToolMessage describes insert edits", () => {
  expect(
    getToolMessage("str_replace_editor", {
      command: "insert",
      path: "/App.jsx",
    })
  ).toBe("Editing App.jsx");
});

test("getToolMessage describes file views", () => {
  expect(
    getToolMessage("str_replace_editor", {
      command: "view",
      path: "/styles/theme.css",
    })
  ).toBe("Viewing theme.css");
});

test("getToolMessage describes undo as reverting changes", () => {
  expect(
    getToolMessage("str_replace_editor", {
      command: "undo_edit",
      path: "/App.jsx",
    })
  ).toBe("Reverting changes in App.jsx");
});

test("getToolMessage describes rename with both file names", () => {
  expect(
    getToolMessage("file_manager", {
      command: "rename",
      path: "/components/Old.jsx",
      new_path: "/components/New.jsx",
    })
  ).toBe("Renaming Old.jsx to New.jsx");
});

test("getToolMessage describes delete with the file name", () => {
  expect(
    getToolMessage("file_manager", {
      command: "delete",
      path: "/components/Unused.jsx",
    })
  ).toBe("Deleting Unused.jsx");
});

test("getToolMessage falls back gracefully when args are missing", () => {
  expect(getToolMessage("str_replace_editor", undefined)).toBe(
    "Modifying file"
  );
  expect(getToolMessage("file_manager", undefined)).toBe("Managing files");
});

test("getToolMessage falls back to the raw tool name for unknown tools", () => {
  expect(getToolMessage("some_other_tool", { path: "/x" })).toBe(
    "some_other_tool"
  );
});

// --- ToolInvocation component ------------------------------------------------

test("ToolInvocation renders a friendly message instead of the tool name", () => {
  const toolInvocation = {
    state: "call",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
  } as unknown as ToolInvocationType;

  render(<ToolInvocation toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("ToolInvocation shows a spinner while the tool is running", () => {
  const toolInvocation = {
    state: "call",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
  } as unknown as ToolInvocationType;

  const { container } = render(
    <ToolInvocation toolInvocation={toolInvocation} />
  );

  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("ToolInvocation shows a completion dot once the tool returns a result", () => {
  const toolInvocation = {
    state: "result",
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
    result: "File created successfully",
  } as unknown as ToolInvocationType;

  const { container } = render(
    <ToolInvocation toolInvocation={toolInvocation} />
  );

  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
