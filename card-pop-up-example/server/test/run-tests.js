import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = fs
  .readdirSync(__dirname)
  .filter((fileName) => fileName.endsWith(".test.js"))
  .sort();

const runTestFile = (fileName) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(__dirname, fileName)], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => resolve(code));
  });

let failedTests = 0;

for (const testFile of testFiles) {
  console.log(`Running ${testFile}`);

  const exitCode = await runTestFile(testFile);

  if (exitCode !== 0) {
    failedTests += 1;
  }
}

if (failedTests > 0) {
  console.error(`${failedTests} test file(s) failed`);
  process.exitCode = 1;
} else {
  console.log(`${testFiles.length} test file(s) passed`);
}
