export interface QuizOption {
  id: number;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  explanation: string;
  code: string;
  quiz: {
    question: string;
    options: QuizOption[];
    correctOptionId: number;
    explanation: string;
  };
  challenge: {
    title: string;
    description: string;
    targetCode: string;
  };
}

export const LESSONS: Lesson[] = [
  {
    id: "variables",
    title: "Variables & Memory Slots",
    category: "Fundamentals",
    explanation: "Variables store data values in named memory slots. Declaring `let a = 2` creates a slot named 'a' with value 2.",
    code: `let a = 2;\nlet b = 3;\nlet sum = a + b;\n`,
    quiz: {
      question: "What happens in memory when `let a = 2` executes?",
      options: [
        { id: 0, text: "The code prints 2 to the screen" },
        { id: 1, text: "A memory slot named 'a' is created containing the value 2" },
        { id: 2, text: "Variable 'a' is destroyed" },
      ],
      correctOptionId: 1,
      explanation: "Correct! Memory slots are allocated to store variable identifiers and values.",
    },
    challenge: {
      title: "Create Variable 'x'",
      description: "Declare a variable named `x` equal to `10` and `y` equal to `20`.",
      targetCode: `let x = 10;\nlet y = 20;\nlet sum = x + y;\n`,
    },
  },
  {
    id: "conditions",
    title: "Conditions & If-Else Branching",
    category: "Control Flow",
    explanation: "Conditional statements evaluate boolean expressions (`a > b`). If TRUE, the 'then' branch executes; if FALSE, the 'else' branch executes.",
    code: `let a = 2;\nlet b = 3;\nif (a > b) {\n  let max = a;\n} else {\n  let max = b;\n}\n`,
    quiz: {
      question: "If `a = 2` and `b = 3`, which branch of `if (a > b)` will execute?",
      options: [
        { id: 0, text: "The IF branch" },
        { id: 1, text: "The ELSE branch" },
        { id: 2, text: "Both branches execute" },
      ],
      correctOptionId: 1,
      explanation: "Correct! 2 > 3 is FALSE, so execution flows into the ELSE branch.",
    },
    challenge: {
      title: "Check Equality",
      description: "Write an if-else statement checking if `a === b`.",
      targetCode: `let a = 5;\nlet b = 5;\nif (a === b) {\n  let same = true;\n} else {\n  let same = false;\n}\n`,
    },
  },
  {
    id: "loops",
    title: "Loops & Iterations",
    category: "Control Flow",
    explanation: "Loops execute a block of code repeatedly until a termination condition is met. Each pass is called an iteration.",
    code: `for (let i = 0; i < 3; i++) {\n  let temp = i;\n}\n`,
    quiz: {
      question: "How many iterations will `for (let i = 0; i < 3; i++)` run?",
      options: [
        { id: 0, text: "1 iteration" },
        { id: 1, text: "3 iterations (i = 0, 1, 2)" },
        { id: 2, text: "Infinite iterations" },
      ],
      correctOptionId: 1,
      explanation: "Correct! The loop runs for i = 0, i = 1, and i = 2.",
    },
    challenge: {
      title: "Loop Up to 5",
      description: "Modify the loop to run 5 times from `i = 0` to `i = 4`.",
      targetCode: `for (let i = 0; i < 5; i++) {\n  let count = i;\n}\n`,
    },
  },
  {
    id: "arrays",
    title: "Arrays & Indexing",
    category: "Data Structures",
    explanation: "Arrays store ordered lists of elements accessible by 0-based indices (`arr[0]`, `arr[1]`).",
    code: `let arr = [4, 2, 7, 1];\nlet val = arr[2];\n`,
    quiz: {
      question: "In `let arr = [4, 2, 7, 1]`, what element is at index `arr[2]`?",
      options: [
        { id: 0, text: "4" },
        { id: 1, text: "2" },
        { id: 2, text: "7" },
      ],
      correctOptionId: 2,
      explanation: "Correct! Indices start at 0, so index 0 is 4, index 1 is 2, and index 2 is 7.",
    },
    challenge: {
      title: "Access First Element",
      description: "Create an array `nums = [10, 20, 30]` and access the first element `nums[0]`.",
      targetCode: `let nums = [10, 20, 30];\nlet first = nums[0];\n`,
    },
  },
  {
    id: "functions",
    title: "Functions & Call Stack",
    category: "Modular Programming",
    explanation: "Functions package reusable code blocks. Calling a function pushes a new frame onto the call stack with bound parameters.",
    code: `function add(a, b) {\n  return a + b;\n}\nlet sum = add(2, 3);\n`,
    quiz: {
      question: "What is pushed onto the Call Stack when `add(2, 3)` is called?",
      options: [
        { id: 0, text: "A new stack frame `add(2, 3)`" },
        { id: 1, text: "Nothing is pushed" },
        { id: 2, text: "The entire program resets" },
      ],
      correctOptionId: 0,
      explanation: "Correct! A call frame is pushed to hold function parameters and local variables.",
    },
    challenge: {
      title: "Multiply Function",
      description: "Write a function `multiply(a, b)` that returns `a * b`.",
      targetCode: `function multiply(a, b) {\n  return a * b;\n}\nlet res = multiply(3, 4);\n`,
    },
  },
  {
    id: "recursion",
    title: "Recursion & Stack Unwinding",
    category: "Advanced Algorithms",
    explanation: "Recursion occurs when a function calls itself until a base condition is met, after which return values unwind back up the call stack.",
    code: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\nlet result = factorial(4);\n`,
    quiz: {
      question: "What prevents a recursive function from causing a stack overflow?",
      options: [
        { id: 0, text: "A base condition (e.g. `n <= 1`)" },
        { id: 1, text: "A while loop" },
        { id: 2, text: "A global variable" },
      ],
      correctOptionId: 0,
      explanation: "Correct! The base condition stops further recursive calls and initiates unwinding.",
    },
    challenge: {
      title: "Calculate Factorial(3)",
      description: "Run `factorial(3)` and observe 3 stack frames being pushed and unwound.",
      targetCode: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\nlet result = factorial(3);\n`,
    },
  },
];
