import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";
import { Hono } from "https://deno.land/x/hono@v2.6.2/mod.ts";
import { open } from "https://deno.land/x/opener@v1.0.1/mod.ts";
import { Server } from "https://deno.land/std@0.168.0/http/server.ts";
import { join } from "https://deno.land/std@0.168.0/path/mod.ts";
import { template } from "./template.ts";
import { getMimeType } from "https://deno.land/x/hono@v2.6.2/utils/mime.ts";

type Config = {
  shell: string;
  pluginPath: string;
  imagesDir: string;
};

const Console = console;
const sockets = new Set<WebSocket>();

let config: Config;
let isDocBuilding = false;

export const main = async (denops: Denops) => {
  denops.dispatcher = {
    refreshContent: async (): Promise<void> => {
      const bufnr = await denops.call("bufnr", "%");
      const lines = (await denops.call(
        "getbufline",
        bufnr,
        1,
        "$",
      )) as string[];

      const text = lines.join("\n");
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const command = `echo '${text}' | asciidoctor \
-a imagesdir@=images \
-a imagesoutdir=${config.imagesDir} \
-r asciidoctor-diagram \
-o - -`;

      if (isDocBuilding === false) {
        const p = Deno.run({
          cmd: [config.shell],
          cwd: config.pluginPath,
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
            }),
          )
        );
      }
    },
    initServer: async (): Promise<void> => {
      try {
        config = await initConfig(denops);
        await initializeWebSocketServer(config);
      } catch (e) {
        throw e;
      }
    },
  };
};

const initConfig = async (
  denops: Denops,
): Promise<Config> => {
  try {
    const shell = getDefaultShell();
    const pluginPath = await denops.call("eval", "g:padoc_root_dir");
    if (pluginPath == undefined || typeof pluginPath !== "string") {
      throw Error("unknown error[pluginPath]");
    }

    const imagesDir = join(pluginPath, "images");
    if (await fileExists(imagesDir)) {
      for await (const dirEntry of Deno.readDir(imagesDir)) {
        if (dirEntry.isFile) {
          const filePath = `${imagesDir}/${dirEntry.name}`;
          await Deno.remove(filePath);
        }
      }
    }

    if (
      shell === undefined ||
      pluginPath === undefined ||
      imagesDir === undefined
    ) {
      throw new Error("invalid config");
    }

    return {
      shell,
      pluginPath,
      imagesDir,
    };
  } catch (e) {
    throw e;
  }
};

const fileExists = async (filepath: string): Promise<boolean> => {
  try {
    await Deno.stat(filepath);
    return true;
  } catch (e) {
    return false;
  }
};

const initializeWebSocketServer = async (config: Config) => {
  let port = 8064;
  const hostname = "localhost";
  const app = new Hono();

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

      app.get("/images/*", async (c) => {
        const url = new URL(c.req.url);
        const path = join(config.pluginPath, url.pathname);

        const content = await Deno.readFile(path);
        const mimeType = getMimeType(path);
        if (mimeType) {
          c.header("Content-Type", mimeType);
        }

        return c.body(content);
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
