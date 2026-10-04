import { SupportedLanguage } from "@/types/languages";

export interface AlgorithmExample {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  codeMap?: Partial<Record<SupportedLanguage, string>>;
}

export const ALGORITHM_EXAMPLES: AlgorithmExample[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "Sorting",
    description: "Repeatedly steps through array, compares adjacent elements and swaps them if in wrong order.",
    code: `let arr = [5, 2, 8, 1, 4];

for (let i = 0; i < 5; i++) {
  let left = arr[i];
  let right = arr[i + 1];
}`,
    codeMap: {
      javascript: `let arr = [5, 2, 8, 1, 4];

for (let i = 0; i < 5; i++) {
  let left = arr[i];
  let right = arr[i + 1];
}`,
      python: `# Python Bubble Sort
arr = [5, 2, 8, 1, 4]

for i in range(5):
    left = arr[i]
    right = arr[i + 1] if i + 1 < len(arr) else 0
    if left > right:
        temp = left`,
      java: `// Java Bubble Sort
public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 4};
        for (int i = 0; i < 5; i++) {
            int left = arr[i];
            int right = arr[i + 1];
        }
    }
}`,
      c: `// C Bubble Sort
#include <stdio.h>

int main() {
    int arr[5] = {5, 2, 8, 1, 4};
    for (int i = 0; i < 5; i++) {
        int left = arr[i];
        int right = arr[i + 1];
    }
    return 0;
}`,
      cpp: `// C++ Bubble Sort
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {5, 2, 8, 1, 4};
    for (int i = 0; i < 5; i++) {
        int left = arr[i];
        int right = arr[i + 1];
    }
    return 0;
}`,
    },
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "Searching",
    description: "Finds target element in sorted array by dividing search interval in half.",
    code: `let arr = [1, 3, 5, 7, 9, 11, 13];
let target = 7;
let low = 0;
let high = 6;
let mid = 3;
let found = arr[mid];`,
    codeMap: {
      javascript: `let arr = [1, 3, 5, 7, 9, 11, 13];
let target = 7;
let low = 0;
let high = 6;
let mid = 3;
let found = arr[mid];`,
      python: `arr = [1, 3, 5, 7, 9, 11, 13]
target = 7
low = 0
high = 6
mid = 3
found = arr[mid]`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        int target = 7;
        int low = 0;
        int high = 6;
        int mid = 3;
        int found = arr[mid];
    }
}`,
      c: `#include <stdio.h>

int main() {
    int arr[7] = {1, 3, 5, 7, 9, 11, 13};
    int target = 7;
    int low = 0;
    int high = 6;
    int mid = 3;
    int found = arr[mid];
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {1, 3, 5, 7, 9, 11, 13};
    int target = 7;
    int low = 0;
    int high = 6;
    int mid = 3;
    int found = arr[mid];
    return 0;
}`,
    },
  },
  {
    id: "dfs",
    name: "DFS (Depth-First Search)",
    category: "Graph/Tree",
    description: "Traverses graph or tree depth-first using stack execution.",
    code: `let visited = [1, 2, 4, 5, 3];
let current = visited[2];`,
    codeMap: {
      javascript: `let visited = [1, 2, 4, 5, 3];
let current = visited[2];`,
      python: `visited = [1, 2, 4, 5, 3]
current = visited[2]`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] visited = {1, 2, 4, 5, 3};
        int current = visited[2];
    }
}`,
      c: `#include <stdio.h>

int main() {
    int visited[5] = {1, 2, 4, 5, 3};
    int current = visited[2];
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> visited = {1, 2, 4, 5, 3};
    int current = visited[2];
    return 0;
}`,
    },
  },
  {
    id: "bfs",
    name: "BFS (Breadth-First Search)",
    category: "Graph/Tree",
    description: "Traverses graph or tree level-by-level using queue execution.",
    code: `let queue = [1, 2, 3, 4, 5];
let current = queue[0];`,
    codeMap: {
      javascript: `let queue = [1, 2, 3, 4, 5];
let current = queue[0];`,
      python: `queue = [1, 2, 3, 4, 5]
current = queue[0]`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] queue = {1, 2, 3, 4, 5};
        int current = queue[0];
    }
}`,
      c: `#include <stdio.h>

int main() {
    int queue[5] = {1, 2, 3, 4, 5};
    int current = queue[0];
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> queue = {1, 2, 3, 4, 5};
    int current = queue[0];
    return 0;
}`,
    },
  },
  {
    id: "two-sum",
    name: "Two Sum",
    category: "Arrays & Hash Map",
    description: "Finds indices of two numbers that sum up to target.",
    code: `let nums = [2, 7, 11, 15];
let target = 9;
let complement = target - nums[0];`,
    codeMap: {
      javascript: `let nums = [2, 7, 11, 15];
let target = 9;
let complement = target - nums[0];`,
      python: `nums = [2, 7, 11, 15]
target = 9
complement = target - nums[0]`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int complement = target - nums[0];
    }
}`,
      c: `#include <stdio.h>

int main() {
    int nums[4] = {2, 7, 11, 15};
    int target = 9;
    int complement = target - nums[0];
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    int complement = target - nums[0];
    return 0;
}`,
    },
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    category: "Sorting",
    description: "Divide-and-conquer algorithm that divides array in halves and merges.",
    code: `let left = [2, 5];
let right = [1, 8];
let merged = [1, 2, 5, 8];`,
    codeMap: {
      javascript: `let left = [2, 5];
let right = [1, 8];
let merged = [1, 2, 5, 8];`,
      python: `left = [2, 5]
right = [1, 8]
merged = [1, 2, 5, 8]`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] left = {2, 5};
        int[] right = {1, 8};
        int[] merged = {1, 2, 5, 8};
    }
}`,
      c: `#include <stdio.h>

int main() {
    int left[2] = {2, 5};
    int right[2] = {1, 8};
    int merged[4] = {1, 2, 5, 8};
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> left = {2, 5};
    std::vector<int> right = {1, 8};
    std::vector<int> merged = {1, 2, 5, 8};
    return 0;
}`,
    },
  },
];
