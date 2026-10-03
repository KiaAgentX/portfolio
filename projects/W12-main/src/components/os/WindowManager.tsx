"use client";

import { useOS } from "@/store/os";
import WindowFrame from "@/components/os/WindowFrame";
import { APP_COMPONENTS } from "@/components/apps/registry";
import { APP_MAP } from "@/lib/apps";

export default function WindowManager() {
  const windows = useOS((s) => s.windows);

  return (
    <>
      {windows.map((win) => {
        const Component = APP_COMPONENTS[win.appId];
        const def = APP_MAP[win.appId];
        if (!Component || !def) return null;
        return (
          <WindowFrame key={win.id} win={win}>
            <Component appId={win.id} />
          </WindowFrame>
        );
      })}
    </>
  );
}
