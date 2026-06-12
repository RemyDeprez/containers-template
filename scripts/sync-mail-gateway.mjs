import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const siblingSourceDir = path.resolve(repoRoot, "..", "mail-gateway-java");
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
	const hasSiblingSource = await pathExists(siblingSourceDir);
	const hasRepoProject = await pathExists(destinationDir);

	// CI/remote builds only see repository files. If the project is already
	// present in-repo, do not fail when no sibling directory exists.
	if (!hasSiblingSource && hasRepoProject) {
		console.log(
			`Using in-repo project at ${destinationDir} (no sibling source found).`,
		);
		return;
	}

	if (!hasSiblingSource) {
		console.error(`Source project not found: ${siblingSourceDir}`);
		console.error(
			"Expected sibling directory ../mail-gateway-java or in-repo ./mail-gateway-java.",
		);
		process.exit(1);
	}

	await rm(destinationDir, { recursive: true, force: true });
	await mkdir(path.dirname(destinationDir), { recursive: true });

	await cp(siblingSourceDir, destinationDir, {
		recursive: true,
		filter: (src) => !shouldIgnore(src),
	});

	console.log(`Synchronized ${siblingSourceDir} -> ${destinationDir}`);
}

main().catch((error) => {
	console.error("Failed to synchronize mail-gateway-java project.");
	console.error(error);
	process.exit(1);
});
