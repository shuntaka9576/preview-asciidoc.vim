import { html } from "https://deno.land/x/hono@v2.6.2/middleware.ts";

export const template = (params: { port: number }) =>
  html`<html>
    <head>
      <title>Preview |</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </head>
    <script src="https://code.jquery.com/jquery-1.11.1.js"></script>
    <script>
      const receiveMessage = ({ data }) => {
        const article = JSON.parse(data);
        document.title = "Preview | " + article.title;
        $(".pasciidoc").html(article.content);
      };

      window.onload = () => {
        socket = new WebSocket("ws://localhost:" + ${params.port} + "/ws");
        socket.addEventListener("message", receiveMessage);
      };
    </script>
    <body>
      <div class="base">
        <div class="title"></div>
        <hr />
        <br />
        <div class="editor">
          <div class="content">
            <div class="pasciidoc"></div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
