import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("repairs an incomplete React DevTools hook before Fast Refresh loads", async () => {
  const layout = await readFile(new URL("./layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /var h=window\.__REACT_DEVTOOLS_GLOBAL_HOOK__;if\(h&&typeof h\.onCommitFiberRoot!=="function"\)h\.onCommitFiberRoot=function\(\)\{\}/);
});
