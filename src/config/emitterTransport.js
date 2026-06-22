import Transport from "winston-transport";
import { logEmitter } from "./logEmitter.js";
export class EmitterTransport extends Transport {
    log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        logEmitter.emit("log", info);
        callback();
    }
}
//# sourceMappingURL=emitterTransport.js.map