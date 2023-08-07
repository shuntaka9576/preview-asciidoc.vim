import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";
import { Hono } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { open } from "https://deno.land/x/opener@v1.0.1/mod.ts";
import { Server } from "https://deno.land/std@0.168.0/http/server.ts";
import { template } from "./template.ts";
import { serveStatic } from "https://deno.land/x/hono@v2.6.2/middleware.ts";

const Console = console;
const sockets = new Set<WebSocket>();
let shell = "bash";
const imagesDir = "./images";

let isDocBuilding = false;

export const main = async (denops: Denops) => {
  denops.dispatcher = {
    refreshContent: async (): Promise<void> => {
      const bufnr = await denops.call("bufnr", "%");
      const lines = (await denops.call(
        "getbufline",
        bufnr,
        1,
        "$"
      )) as string[];

      const text = lines.join("\n");
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const command = `echo '${text}' | asciidoctor \
-a imagesdir@=images \
-a imagesoutdir=${imagesDir} \
-r asciidoctor-diagram \
-o - -`;

      if (isDocBuilding === false) {
        const p = Deno.run({
          cmd: [shell],
          stdout: "piped",
          stdin: "piped",
        });

        isDocBuilding = true;
        await p.stdin.write(encoder.encode(command));
        p.stdin.close();
        isDocBuilding = false;

        const output = await p.output();
        p.close();

        const buildedText = decoder.decode(output);

        sockets.forEach((ws) =>
          ws.send(
            JSON.stringify({
              title: "document",
              content: buildedText,
            })
          )
        );
      }
    },
    initServer: async (): Promise<void> => {
      await initializeWebSocketServer();

      shell = getDefaultShell();
    },
  };
};

const initializeWebSocketServer = async () => {
  let port = 8064;
  const hostname = "localhost";
  const app = new Hono();

  app.use(
    "/images/*",
    serveStatic({
      root: ".",
    })
  );

  app.get("/ws", (c: any) => {
    const { response, socket } = Deno.upgradeWebSocket(c.req);

    socket.onopen = () => {};
    socket.onclose = () => {};
    socket.onmessage = (_message) => {};

    sockets.add(socket);

    return response;
  });

  for (let retry = 0; retry < 3; retry++) {
    try {
      app.get("/", (c) => {
        return c.html(template({ port: port }));
      });

      const server = new Server({
        port: port,
        hostname: hostname,
        handler: app.fetch,
      });

      Console.log(`preview port: ${port}`);
      await open(`http://${hostname}:${port}`);

      return await server.listenAndServe();
    } catch (e) {
      if (e.code === "EADDRINUSE") {
        Console.log(`already in use ${port} port. retry ${retry}`);
        port += 1;
        continue;
      } else {
        throw e;
      }
    }
  }
};

const getDefaultShell = (): string => {
  let shell = "bash";
  const envShell = Deno.env.get("SHELL");

  if (envShell != null) {
    shell = envShell;
  }

  return shell;
};
