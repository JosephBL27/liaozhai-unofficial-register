// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { useLocalStorage } from "./useLocalStorage";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("useLocalStorage", () => {
  it("falls back when persisted JSON is invalid", () => {
    window.localStorage.setItem("liaozhai.test.invalid", "{broken");
    const { result } = renderHook(() =>
      useLocalStorage("liaozhai.test.invalid", { count: 1 }),
    );

    expect(result.current[0]).toEqual({ count: 1 });
  });

  it("updates all hook instances in the current document", () => {
    const first = renderHook(() => useLocalStorage("liaozhai.test.shared", 0));
    const second = renderHook(() => useLocalStorage("liaozhai.test.shared", 0));

    act(() => first.result.current[1]((previous) => previous + 1));

    expect(first.result.current[0]).toBe(1);
    expect(second.result.current[0]).toBe(1);
  });

  it("reacts to cross-document storage events", () => {
    const { result } = renderHook(() =>
      useLocalStorage("liaozhai.test.storage-event", "initial"),
    );

    act(() => {
      window.localStorage.setItem(
        "liaozhai.test.storage-event",
        JSON.stringify("from-another-tab"),
      );
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "liaozhai.test.storage-event",
          newValue: JSON.stringify("from-another-tab"),
        }),
      );
    });

    expect(result.current[0]).toBe("from-another-tab");
  });

  it("hydrates with the server default before adopting persisted browser state", async () => {
    const key = "liaozhai.test.hydration";
    window.localStorage.setItem(key, JSON.stringify("persisted"));

    function HydrationProbe() {
      const [value] = useLocalStorage(key, "server-default");
      return <span data-testid="value">{value}</span>;
    }

    const serverHtml = renderToString(<HydrationProbe />);
    expect(serverHtml).toContain("server-default");

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.append(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <HydrationProbe />);
    });

    await waitFor(() => expect(container.textContent).toBe("persisted"));
    expect(
      consoleError.mock.calls.flat().join(" ").toLowerCase(),
    ).not.toContain("hydration");

    await act(async () => root?.unmount());
    container.remove();
  });
});
