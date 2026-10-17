import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localUnifiedPage } from "./local-unified-page.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const outputDirectory = path.resolve(repositoryRoot, "tmp/team-test-pages-build");
const allowedOutputParent = path.resolve(repositoryRoot, "tmp");

if (path.dirname(outputDirectory) !== allowedOutputParent) {
  throw new Error("Refusing to build outside the repository tmp directory.");
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const directory of ["assets", "library", "try-it", "self-directed-attention"]) {
  await cp(path.join(repositoryRoot, directory), path.join(outputDirectory, directory), { recursive: true });
}

for (const entry of await readdir(repositoryRoot, { withFileTypes: true })) {
  if (entry.isFile() && (entry.name.endsWith(".html") || ["robots.txt", "sitemap.xml"].includes(entry.name))) {
    await cp(path.join(repositoryRoot, entry.name), path.join(outputDirectory, entry.name));
  }
}

const unifiedDirectory = path.join(outputDirectory, "unified-zero");
await mkdir(unifiedDirectory, { recursive: true });
await writeFile(path.join(unifiedDirectory, "index.html"), localUnifiedPage, "utf8");

console.log(outputDirectory);
