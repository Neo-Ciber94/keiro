import net from "node:net";

const MIN_PORT_NUMBER = 1 << 10;
const MAX_PORT_NUMBER = 1 << 16;

const ports = new Set<number>();

export async function findAvailablePort(startPort: number) {
  if (startPort < MIN_PORT_NUMBER) {
    throw new Error(`startPort cannot be less than ${MIN_PORT_NUMBER}`);
  }

  ports.add(startPort);

  function isPortAvailable(port: number): Promise<boolean> {
    const server = net.createServer();
    server.unref();

    return new Promise<boolean>((resolve, reject) => {
      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err?.code === "EADDRINUSE") {
          resolve(false);
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        server.close(() => {
          resolve(true);
        });
      });
    });
  }

  for (let port = startPort; port < MAX_PORT_NUMBER; port++) {
    if (ports.has(port)) {
      continue;
    }

    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available ports in range ${startPort} - ${MAX_PORT_NUMBER}`);
}
