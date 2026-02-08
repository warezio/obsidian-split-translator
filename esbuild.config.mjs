import * as esbuild from "esbuild";
import { writeFileSync } from "fs";
import { resolve } from "path";

const isWatch = process.argv.includes("--watch");
const isDebug = process.argv.includes("--debug");

const config = {
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "main.js",
    format: "cjs",
    external: ["obsidian"],
    sourcemap: isDebug ? "inline" : false,
};

if (isWatch) {
    const ctx = await esbuild.context({
        ...config,
        sourcemap: "inline",
    });
    await ctx.watch();
    console.log("[watch] Build started...");
} else {
    const result = await esbuild.build({
        ...config,
        write: !isDebug,
    });

    if (isDebug && result.outputFiles) {
        let code = result.outputFiles[0].text;

        // Inject sourceRoot with absolute workspace path so Chrome DevTools
        // resolves source files to the correct local paths for breakpoints.
        const match = code.match(
            /\/\/# sourceMappingURL=data:application\/json;base64,(.+)$/m
        );
        if (match) {
            const sm = JSON.parse(
                Buffer.from(match[1], "base64").toString()
            );
            sm.sourceRoot = resolve(".");
            const b64 = Buffer.from(JSON.stringify(sm)).toString("base64");
            code = code.replace(
                match[0],
                `//# sourceMappingURL=data:application/json;base64,${b64}`
            );
        }
        writeFileSync("main.js", code);
    }
}
