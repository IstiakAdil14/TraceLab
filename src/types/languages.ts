export type SupportedLanguage = "javascript" | "python" | "java" | "c" | "cpp";

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  badge: string;
  filename: string;
  monacoLang: string;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: "javascript",
    name: "JavaScript",
    badge: "JS",
    filename: "main.js",
    monacoLang: "javascript",
    defaultCode: `// JavaScript TraceLab Execution
let arr = [5, 2, 8, 1, 4];

for (let i = 0; i < 5; i++) {
  let left = arr[i];
  let right = arr[i + 1];
  if (left > right) {
    let temp = left;
  }
}
`,
  },
  {
    id: "python",
    name: "Python",
    badge: "PY",
    filename: "main.py",
    monacoLang: "python",
    defaultCode: `# Python TraceLab Execution
arr = [5, 2, 8, 1, 4]

for i in range(5):
    left = arr[i]
    right = arr[i + 1] if i + 1 < len(arr) else 0
    if left > right:
        temp = left
`,
  },
  {
    id: "java",
    name: "Java",
    badge: "JAVA",
    filename: "Main.java",
    monacoLang: "java",
    defaultCode: `// Java TraceLab Execution
public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 4};
        for (int i = 0; i < 5; i++) {
            int left = arr[i];
            int right = arr[i + 1];
            if (left > right) {
                int temp = left;
            }
        }
    }
}
`,
  },
  {
    id: "c",
    name: "C",
    badge: "C",
    filename: "main.c",
    monacoLang: "c",
    defaultCode: `// C TraceLab Execution
#include <stdio.h>

int main() {
    printf("Greetings! Welcome to TraceLab!\\n");
    int status = 1;
    if (status == 1) {
        printf("Ready to visualize your code step-by-step.\\n");
    }
    return 0;
}
`,
  },
  {
    id: "cpp",
    name: "C++",
    badge: "C++",
    filename: "main.cpp",
    monacoLang: "cpp",
    defaultCode: `// C++ TraceLab Execution
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {5, 2, 8, 1, 4};
    for (int i = 0; i < 5; i++) {
        int left = arr[i];
        int right = arr[i + 1];
        if (left > right) {
            int temp = left;
        }
    }
    return 0;
}
`,
  },
];

/**
 * Intelligent Language Detector
 * Analyzes code structure, imports, keywords, and patterns to automatically detect language.
 */
export function detectLanguageFromCode(code: string): SupportedLanguage {
  if (!code || !code.trim()) return "javascript";

  const text = code.trim();

  // 1. Check Python syntax patterns
  if (
    text.includes("def ") ||
    text.includes("elif ") ||
    text.includes("range(") ||
    text.includes("__init__") ||
    text.includes("self.") ||
    text.includes("import sys") ||
    text.includes("import os") ||
    /for\s+\w+\s+in\s+/.test(text)
  ) {
    if (!text.includes("#include") && !text.includes("public class") && !text.includes("function") && !text.includes("let ") && !text.includes("const ")) {
      return "python";
    }
  }

  // 2. Check C++ syntax patterns
  if (
    text.includes("#include <iostream>") ||
    text.includes("#include<iostream>") ||
    text.includes("using namespace std") ||
    text.includes("std::cout") ||
    text.includes("std::vector") ||
    text.includes("std::cin") ||
    text.includes("cout <<") ||
    text.includes("cin >>") ||
    text.includes("std::endl")
  ) {
    return "cpp";
  }

  // 3. Check C syntax patterns
  if (
    text.includes("#include <stdio.h>") ||
    text.includes("#include<stdio.h>") ||
    text.includes("#include <stdlib.h>") ||
    text.includes("#include<stdlib.h>") ||
    text.includes("printf(") ||
    text.includes("scanf(") ||
    text.includes("int main()") ||
    text.includes("void main()")
  ) {
    return "c";
  }

  // 4. Check Java syntax patterns
  if (
    text.includes("public class") ||
    text.includes("public static void main") ||
    text.includes("System.out.println") ||
    text.includes("System.out.print") ||
    text.includes("import java.")
  ) {
    return "java";
  }

  // 5. Check Python standalone print syntax e.g. print("...", x)
  if (text.startsWith("print(") || text.includes("\nprint(")) {
    if (!text.includes(";") && !text.includes("let ") && !text.includes("const ") && !text.includes("function")) {
      return "python";
    }
  }

  // 6. Check JavaScript syntax patterns
  if (
    text.includes("console.log") ||
    text.includes("function ") ||
    text.includes("let ") ||
    text.includes("const ") ||
    text.includes("=>")
  ) {
    return "javascript";
  }

  return "javascript";
}
