import Transport from "winston-transport";
import { logEmitter } from "./logEmitter.js";

export class EmitterTransport extends Transport {
  log(info: Record<string, unknown>, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });
    logEmitter.emit("log", info);
    callback();
  }
}
