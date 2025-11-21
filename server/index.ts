import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";
import { log } from "./logger";

(async () => {
  const app = await createApp();
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const desiredPort = Number(process.env.PORT) || 5000;
  const canRetryOnRandomPort = !process.env.PORT && desiredPort === 5000;

  const startServer = (port: number, allowRetry: boolean) => {
    const listenOptions: Record<string, any> = {
      port,
      host: "0.0.0.0",
    };

    const shouldReusePort =
      process.env.REUSE_PORT === "true" ||
      (process.env.REUSE_PORT !== "false" && process.env.REPL_ID);

    if (shouldReusePort) {
      listenOptions.reusePort = true;
    }

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && allowRetry) {
        log(`Port ${port} is in use locally. Retrying on a random open port…`);
        server.off("error", onError);
        startServer(0, false);
        return;
      }

      server.off("error", onError);
      throw err;
    };

    server.once("error", onError);

    server.listen(listenOptions, () => {
      server.off("error", onError);
      const address = server.address();
      const actualPort =
        typeof address === "object" && address !== null
          ? address.port
          : address ?? port;
      log(`serving on port ${actualPort}`);
    });
  };

  startServer(desiredPort, canRetryOnRandomPort);
})();
