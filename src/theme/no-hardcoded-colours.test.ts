import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guard rail for the "no hard-coded colours" requirement: colours may only be
 * literal inside the token/colour-maths layer or the mock server data. Feature,
 * component and navigation code must read from `useTheme()`.
 */
const SCANNED_DIRS = ["src/features", "src/components", "src/navigation"];
const COLOUR_PATTERN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(/;

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(ts|tsx)$/.test(entry) && !entry.includes(".test.") ? [path] : [];
  });
}

describe("theme discipline", () => {
  it("has no colour literals outside the theme layer", () => {
    const offenders = SCANNED_DIRS.flatMap((directory) =>
      filesUnder(directory).flatMap((path) =>
        readFileSync(path, "utf8")
          .split("\n")
          .map((line, index) => ({ path, line, index }))
          .filter(({ line }) => COLOUR_PATTERN.test(line))
          .map(({ path, index, line }) => `${path}:${index + 1} → ${line.trim()}`),
      ),
    );

    expect(offenders).toEqual([]);
  });
});
