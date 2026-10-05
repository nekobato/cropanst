import assert from "node:assert/strict";
import { request } from "node:http";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createServer } from "vitepress";

test(
  "docs reject editor launches while serving pages and HMR",
  { timeout: 15000 },
  async (t) => {
    const root = fileURLToPath(new URL("..", import.meta.url));
    // The test exercises request routing without Vite's speculative background transforms.
    const server = await createServer(root, {
      host: "127.0.0.1",
      port: 0,
      preTransformRequests: false,
    });
    t.after(async () => {
      await server.close();
    });

    const editorLayers = server.middlewares.stack.filter(
      (layer) => layer.route === "/__open-in-editor"
    );
    assert.equal(editorLayers.length, 2);
    const nativeEditor = editorLayers.find(
      (layer) => layer.handle.name === "launchEditorMiddleware"
    );
    assert.ok(nativeEditor, "Vite's real editor middleware must be installed");
    assert.equal(
      editorLayers.at(-1),
      nativeEditor,
      "guard must precede Vite's editor middleware"
    );
    let editorInvocations = 0;
    nativeEditor.handle = (_request, response) => {
      editorInvocations++;
      response.statusCode = 418;
      response.end("Unexpected editor middleware invocation");
    };

    await server.listen();
    const address = server.httpServer.address();
    assert.ok(address && typeof address === "object");

    function get(rawPath) {
      return new Promise((resolve, reject) => {
        const req = request(
          { hostname: "127.0.0.1", port: address.port, path: rawPath },
          (response) => {
            let body = "";
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
              body += chunk;
            });
            response.on("end", () =>
              resolve({ status: response.statusCode, body })
            );
            response.on("error", reject);
          }
        );
        req.on("error", reject);
        req.setTimeout(5000, () =>
          req.destroy(new Error(`Request timed out: ${rawPath}`))
        );
        req.end();
      });
    }

    const editorPaths = [
      "/__open-in-editor",
      "/__OPEN-IN-EDITOR",
      "/__open-in-editor/subpath",
      "/__open-in-editor.json",
      "/__open-in-editor/../../safe",
    ];
    const basePrefix = server.config.base.slice(0, -1);
    for (const prefix of ["", basePrefix, basePrefix.toUpperCase()]) {
      for (const endpoint of editorPaths) {
        const rawPath = `${prefix}${endpoint}?file=${encodeURIComponent(`${root}/index.md`)}`;
        assert.equal((await get(rawPath)).status, 404, rawPath);
      }
    }
    assert.equal(editorInvocations, 0);

    const page = await get(server.config.base);
    assert.equal(page.status, 200);
    assert.match(page.body, /<div id="app"><\/div>/);
    const markdown = await get(`${server.config.base}index.md`);
    assert.equal(markdown.status, 200);
    assert.match(markdown.body, /home: true/);
    const hmr = await get(`${server.config.base}@vite/client`);
    assert.equal(hmr.status, 200);
    assert.match(hmr.body, /createHotContext/);
  }
);
