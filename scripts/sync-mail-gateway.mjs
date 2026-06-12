import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceDir = path.resolve(repoRoot, "..", "mail-gateway-java");
const destinationDir = path.resolve(repoRoot, "mail-gateway-java");

async function pathExists(targetPath) {
	try {
		await stat(targetPath);
		return true;
	} catch {
		return false;
	}
}

const ignoredNames = new Set([
	".git",
	".idea",
	".vscode",
	"node_modules",
	"target",
]);

function shouldIgnore(sourcePath) {
	const name = path.basename(sourcePath);
	return ignoredNames.has(name);
}

async function main() {
	if (!(await pathExists(sourceDir))) {
		console.error(`Source project not found: ${sourceDir}`);
		console.error("Expected sibling directory ../mail-gateway-java.");
		process.exit(1);
	}

	await rm(destinationDir, { recursive: true, force: true });
	await mkdir(path.dirname(destinationDir), { recursive: true });

	await cp(sourceDir, destinationDir, {
		recursive: true,
		filter: (src) => !shouldIgnore(src),
	});

	console.log(`Synchronized ${sourceDir} -> ${destinationDir}`);
}

main().catch((error) => {
	console.error("Failed to synchronize mail-gateway-java project.");
	console.error(error);
	process.exit(1);
});
