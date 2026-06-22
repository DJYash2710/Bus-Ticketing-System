import fs from "fs/promises";
import path from "path";
export async function readRecentLogs(lines = 100) {
    const logPath = path.join("logs", "app.log");
    try {
        const content = await fs.readFile(logPath, "utf-8");
        const allLines = content.split("\n").filter(Boolean);
        const tail = allLines.slice(-lines);
        return {
            file: logPath,
            linesRequested: lines,
            linesReturned: tail.length,
            logs: tail.map((line) => {
                try {
                    return JSON.parse(line);
                }
                catch {
                    return { raw: line };
                }
            }),
        };
    }
    catch {
        return {
            file: logPath,
            linesRequested: lines,
            linesReturned: 0,
            logs: [],
            message: "Log file not found or empty yet",
        };
    }
}
//# sourceMappingURL=logs.service.js.map