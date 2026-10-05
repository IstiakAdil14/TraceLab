/**
 * Jupyter Notebook (.ipynb) Parser Utility for TraceLab
 * Parses JSON structure of .ipynb files and extracts clean executable Python code cells.
 */

export interface IpynbCell {
  cell_type: "code" | "markdown" | "raw";
  source: string | string[];
  outputs?: any[];
}

export interface IpynbNotebook {
  cells: IpynbCell[];
  metadata?: any;
  nbformat?: number;
}

export function parseJupyterNotebook(jsonContent: string): { code: string; markdownSummary: string[] } {
  try {
    const notebook: IpynbNotebook = JSON.parse(jsonContent);

    if (!notebook || !Array.isArray(notebook.cells)) {
      throw new Error("Invalid Jupyter Notebook (.ipynb) format");
    }

    const codeLines: string[] = [];
    const markdownSummary: string[] = [];

    notebook.cells.forEach((cell, idx) => {
      const sourceStr = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";

      if (cell.cell_type === "code") {
        codeLines.push(`# === Cell [${idx + 1}] ===`);
        
        // Clean source lines (filter out magic commands like %matplotlib or !pip)
        const lines = sourceStr.split("\n");
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("%") || trimmed.startsWith("!")) {
            codeLines.push(`# ${line} (skipped notebook magic)`);
          } else {
            codeLines.push(line);
          }
        });

        codeLines.push("\n");
      } else if (cell.cell_type === "markdown") {
        markdownSummary.push(sourceStr);
      }
    });

    return {
      code: codeLines.join("\n").trim(),
      markdownSummary,
    };
  } catch (error: any) {
    console.error("Failed to parse .ipynb file:", error);
    return {
      code: `# Error reading Jupyter Notebook: ${error?.message || "Invalid JSON"}`,
      markdownSummary: [],
    };
  }
}
