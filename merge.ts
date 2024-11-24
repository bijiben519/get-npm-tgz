import * as fs from "fs";
import * as path from "path";

/**
 * Merge multiple source folders into a destination folder.
 * @param sourcePaths Array of source folder paths.
 * @param destinationPath The path of the destination folder.
 */
async function mergeMultipleFolders(sourcePaths: string[], destinationPath: string): Promise<void> {
    for (const sourcePath of sourcePaths) {
        console.log(`Merging folder: ${sourcePath} into ${destinationPath}`);
        await mergeFolders(sourcePath, destinationPath);
    }
    console.log("All folders merged successfully.");
}

/**
 * Merge the contents of one folder into another folder.
 * @param sourcePath The path of the source folder.
 * @param destinationPath The path of the destination folder.
 */
async function mergeFolders(sourcePath: string, destinationPath: string): Promise<void> {
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
        throw new Error(`Source path "${sourcePath}" is not a valid directory.`);
    }

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    const items = fs.readdirSync(sourcePath);
    for (const item of items) {
        const sourceItemPath = path.join(sourcePath, item);
        const destinationItemPath = path.join(destinationPath, item);

        if (fs.statSync(sourceItemPath).isDirectory()) {
            await mergeFolders(sourceItemPath, destinationItemPath);
        } else {
            if (fs.existsSync(destinationItemPath)) {
                console.log(`File conflict: ${destinationItemPath}`);
                const action = await getConflictResolutionAction(destinationItemPath);
                if (action === "overwrite") {
                    fs.copyFileSync(sourceItemPath, destinationItemPath);
                } else if (action === "rename") {
                    const newDestinationItemPath = getUniqueFilePath(destinationItemPath);
                    fs.copyFileSync(sourceItemPath, newDestinationItemPath);
                }
            } else {
                fs.copyFileSync(sourceItemPath, destinationItemPath);
            }
        }
    }
}

/**
 * Prompt user to resolve a file conflict.
 * @param filePath The conflicting file path.
 * @returns The chosen action: "overwrite", "skip", or "rename".
 */
async function getConflictResolutionAction(filePath: string): Promise<"overwrite" | "skip" | "rename"> {
    console.log(`Conflict with file: ${filePath}`);
    const userInput = "skip"; // Replace with actual input logic
    return userInput as "overwrite" | "skip" | "rename";
}

/**
 * Generate a unique file path by appending a numeric suffix.
 * @param filePath The original file path.
 * @returns A unique file path.
 */
function getUniqueFilePath(filePath: string): string {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    let counter = 1;
    let uniquePath = path.join(dir, `${base}_${counter}${ext}`);
    while (fs.existsSync(uniquePath)) {
        counter++;
        uniquePath = path.join(dir, `${base}_${counter}${ext}`);
    }

    return uniquePath;
}

// Example usage:
(async () => {
    const sourceFolders = ["./target/basic/tgz", "./target/fastify/tgz", "./target/in-source-test/tgz", "./target/lit/tgz", "./target/typecheck/tgz"];
    const destinationFolder = "./merge";

    try {
        await mergeMultipleFolders(sourceFolders, destinationFolder);
    } catch (error) {
        console.error("Error merging folders:", error);
    }
})();