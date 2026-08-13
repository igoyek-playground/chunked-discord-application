import {
    existsSync,
    readdirSync,
    statSync,
} from "node:fs";

import { join } from "node:path";

export function findFiles(
    directory: string,
    pattern: RegExp,
): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    const files: string[] = [];

    for (const entry of readdirSync(directory)) {
        const fullPath = join(directory, entry);

        if (statSync(fullPath).isDirectory()) {
            files.push(...findFiles(fullPath, pattern));
            continue;
        }

        if (pattern.test(entry)) {
            files.push(fullPath);
        }
    }

    return files;
}