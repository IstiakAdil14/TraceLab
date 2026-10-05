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
    id: "linear-regression",
    name: "Linear Regression (Gradient Descent)",
    category: "Machine Learning",
    description: "Fits a line y = wx + b by updating weight and bias using Mean Squared Error loss gradient descent.",
    code: `weight = 0.5
bias = 0.1
learning_rate = 0.01

for epoch in range(1, 10):
    loss = 2.5 / epoch
    weight = weight + 0.15
    bias = bias + 0.05`,
    codeMap: {
      python: `# Python Linear Regression (Gradient Descent)
weight = 0.5
bias = 0.1
learning_rate = 0.01

# Training loop over 10 epochs
for epoch in range(1, 10):
    loss = 2.5 / epoch
    weight = weight + 0.15
    bias = bias + 0.05
    print(f"Epoch {epoch}: Loss={loss:.4f}, w={weight:.2f}, b={bias:.2f}")`,
      javascript: `// JavaScript Linear Regression
let weight = 0.5;
let bias = 0.1;
let learningRate = 0.01;

for (let epoch = 1; epoch <= 10; epoch++) {
  let loss = 2.5 / epoch;
  weight = weight + 0.15;
  bias = bias + 0.05;
}`,
      c: `// C Linear Regression
#include <stdio.h>

int main() {
    float weight = 0.5;
    float bias = 0.1;
    float learning_rate = 0.01;

    for (int epoch = 1; epoch <= 10; epoch++) {
        float loss = 2.5 / epoch;
        weight += 0.15;
        bias += 0.05;
    }
    return 0;
}`,
      cpp: `// C++ Linear Regression
#include <iostream>

int main() {
    float weight = 0.5;
    float bias = 0.1;

    for (int epoch = 1; epoch <= 10; epoch++) {
        float loss = 2.5 / epoch;
        weight += 0.15;
        bias += 0.05;
    }
    return 0;
}`,
      java: `// Java Linear Regression
public class Main {
    public static void main(String[] args) {
        double weight = 0.5;
        double bias = 0.1;

        for (int epoch = 1; epoch <= 10; epoch++) {
            double loss = 2.5 / epoch;
            weight += 0.15;
            bias += 0.05;
        }
    }
}`,
    },
  },
  {
    id: "neural-perceptron",
    name: "Perceptron (Single Layer Neural Net)",
    category: "Machine Learning",
    description: "Calculates weighted sum z = w1*x1 + w2*x2 + b and applies activation function.",
    code: `x1 = 2
x2 = 3
w1 = 0.8
w2 = -0.5
bias = 0.2

weighted_sum = (x1 * w1) + (x2 * w2) + bias
prediction = 1 if weighted_sum > 0 else 0`,
    codeMap: {
      python: `# Python Single Neuron Perceptron
x1 = 2
x2 = 3
w1 = 0.8
w2 = -0.5
bias = 0.2

weighted_sum = (x1 * w1) + (x2 * w2) + bias
prediction = 1 if weighted_sum > 0 else 0`,
      javascript: `let x1 = 2;
let x2 = 3;
let w1 = 0.8;
let w2 = -0.5;
let bias = 0.2;

let weightedSum = (x1 * w1) + (x2 * w2) + bias;
let prediction = weightedSum > 0 ? 1 : 0;`,
      c: `#include <stdio.h>

int main() {
    float x1 = 2, x2 = 3;
    float w1 = 0.8, w2 = -0.5, bias = 0.2;
    float weightedSum = (x1 * w1) + (x2 * w2) + bias;
    int prediction = weightedSum > 0 ? 1 : 0;
    return 0;
}`,
      cpp: `#include <iostream>

int main() {
    float x1 = 2, x2 = 3;
    float w1 = 0.8, w2 = -0.5, bias = 0.2;
    float weightedSum = (x1 * w1) + (x2 * w2) + bias;
    int prediction = weightedSum > 0 ? 1 : 0;
    return 0;
}`,
      java: `public class Main {
    public static void main(String[] args) {
        double x1 = 2, x2 = 3;
        double w1 = 0.8, w2 = -0.5, bias = 0.2;
        double weightedSum = (x1 * w1) + (x2 * w2) + bias;
        int prediction = weightedSum > 0 ? 1 : 0;
    }
}`,
    },
  },
  {
    id: "knn-classifier",
    name: "K-Nearest Neighbors (KNN)",
    category: "Machine Learning",
    description: "Calculates Euclidean distances to reference points and classifies query point.",
    code: `qx = 3.0
qy = 4.0
p1_dist = ((qx - 1.0)**2 + (qy - 2.0)**2)**0.5
p2_dist = ((qx - 5.0)**2 + (qy - 4.0)**2)**0.5
nearest_class = "A" if p1_dist < p2_dist else "B"`,
    codeMap: {
      python: `# Python K-Nearest Neighbors Distance
qx = 3.0
qy = 4.0

# Euclidean distance to point 1 (1, 2) and point 2 (5, 4)
p1_dist = ((qx - 1.0)**2 + (qy - 2.0)**2)**0.5
p2_dist = ((qx - 5.0)**2 + (qy - 4.0)**2)**0.5

nearest_class = "Class A" if p1_dist < p2_dist else "Class B"`,
      javascript: `let qx = 3.0;
let qy = 4.0;
let p1_dist = Math.sqrt(Math.pow(qx - 1.0, 2) + Math.pow(qy - 2.0, 2));
let p2_dist = Math.sqrt(Math.pow(qx - 5.0, 2) + Math.pow(qy - 4.0, 2));
let nearestClass = p1_dist < p2_dist ? "Class A" : "Class B";`,
      c: `#include <stdio.h>
#include <math.h>

int main() {
    float qx = 3.0, qy = 4.0;
    float p1_dist = sqrt(pow(qx - 1.0, 2) + pow(qy - 2.0, 2));
    float p2_dist = sqrt(pow(qx - 5.0, 2) + pow(qy - 4.0, 2));
    return 0;
}`,
      cpp: `#include <iostream>
#include <cmath>

int main() {
    float qx = 3.0, qy = 4.0;
    float p1_dist = std::sqrt(std::pow(qx - 1.0, 2) + std::pow(qy - 2.0, 2));
    float p2_dist = std::sqrt(std::pow(qx - 5.0, 2) + std::pow(qy - 4.0, 2));
    return 0;
}`,
      java: `public class Main {
    public static void main(String[] args) {
        double qx = 3.0, qy = 4.0;
        double p1_dist = Math.sqrt(Math.pow(qx - 1.0, 2) + Math.pow(qy - 2.0, 2));
        double p2_dist = Math.sqrt(Math.pow(qx - 5.0, 2) + Math.pow(qy - 4.0, 2));
    }
}`,
    },
  },
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
      python: `arr = [5, 2, 8, 1, 4]

for i in range(5):
    left = arr[i]
    right = arr[i + 1] if i + 1 < len(arr) else 0`,
      java: `public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 4};
        for (int i = 0; i < 5; i++) {
            int left = arr[i];
            int right = arr[i + 1];
        }
    }
}`,
      c: `#include <stdio.h>

int main() {
    int arr[5] = {5, 2, 8, 1, 4};
    for (int i = 0; i < 5; i++) {
        int left = arr[i];
        int right = arr[i + 1];
    }
    return 0;
}`,
      cpp: `#include <iostream>
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
];
