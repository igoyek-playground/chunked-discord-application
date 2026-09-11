import {
    readdirSync,
    readFileSync,
    writeFileSync,
} from "node:fs";
import { extname, join } from "node:path";

import JavaScriptObfuscator from "javascript-obfuscator";

const DIST_DIR = "dist";

// Katalogi (bezpośrednio pod dist/), których NIE obfuskujemy:
// - config    -> ustawienia bota mają zostać czytelne i edytowalne
//                bez rozpakowywania kodu,
// - generated -> kod wygenerowany przez Prisma; jego zaciemnianie
//                nie chroni niczego Twojego, a tylko psuje/rozdmuchuje build.
const EXCLUDED_TOP_LEVEL_DIRS = new Set(["config", "generated"]);

/**
 * Profil "zbalansowany": mocno utrudnia czytanie kodu (spłaszczenie
 * przepływu sterowania, martwy kod, zaszyfrowana tablica stringów,
 * losowe nazwy identyfikatorów), ale NIE włącza `debugProtection`
 * ani `selfDefending`.
 *
 * Te dwie opcje potrafią realnie zaszkodzić długo działającemu botowi:
 * `debugProtection` dokłada pętlę wykrywającą DevTools/debugger (bez
 * sensu dla procesu Node na serwerze, tylko obciąża CPU), a
 * `selfDefending` sprawia, że kod "naprawia się" przy wykryciu
 * modyfikacji — w praktyce potrafi się wywalić przy zwykłym błędzie
 * minifikacji/bundlowania, dając nieczytelne stack trace'y nawet Tobie.
 * Jeśli mimo to chcesz je włączyć, dopisz je poniżej — ale przetestuj
 * dokładnie na środowisku docelowym przed wysyłką do klientów.
 */
const OBFUSCATOR_OPTIONS = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    identifierNamesGenerator: "hexadecimal",
    numbersToExpressions: true,
    renameGlobals: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 8,
    stringArray: true,
    stringArrayEncoding: ["rc4"],
    stringArrayThreshold: 0.85,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,

    debugProtection: false,
    selfDefending: false,
};

function collectJsFiles(dir) {
    const results = [];

    for (const entry of readdirSync(dir, {
        withFileTypes: true,
    })) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...collectJsFiles(fullPath));
            continue;
        }

        if (extname(entry.name) === ".js") {
            results.push(fullPath);
        }
    }

    return results;
}

function collectTargetFiles() {
    const targetFiles = [];

    for (const entry of readdirSync(DIST_DIR, {
        withFileTypes: true,
    })) {
        if (
            entry.isDirectory() &&
            EXCLUDED_TOP_LEVEL_DIRS.has(entry.name)
        ) {
            console.log(`Pomijam katalog: ${entry.name}/`);
            continue;
        }

        const fullPath = join(DIST_DIR, entry.name);

        if (entry.isDirectory()) {
            targetFiles.push(...collectJsFiles(fullPath));
        } else if (extname(entry.name) === ".js") {
            targetFiles.push(fullPath);
        }
    }

    return targetFiles;
}

function main() {
    const targetFiles = collectTargetFiles();

    console.log(`Obfuskacja ${targetFiles.length} plików...`);

    for (const file of targetFiles) {
        const source = readFileSync(file, "utf-8");

        const obfuscated = JavaScriptObfuscator.obfuscate(
            source,
            OBFUSCATOR_OPTIONS,
        ).getObfuscatedCode();

        writeFileSync(file, obfuscated, "utf-8");
    }

    console.log(
        `Gotowe — ${targetFiles.length} plików zaobfuskowanych, ` +
            `${[...EXCLUDED_TOP_LEVEL_DIRS].join(" i ")} pozostawione czytelne.`,
    );
}

main();