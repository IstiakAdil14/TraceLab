# 🚀 TraceLab — Visual Runtime Engine & Algorithm Platform

<p align="center">
  <b>An interactive, real-time code execution visualizer and algorithm learning engine supporting C, C++, Java, Python, and JavaScript.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
</p>

---

## 🌟 Key Features

### 💻 1. Multi-Language Real-Time Execution Engine
* **Supported Languages**: **C**, **C++**, **Java**, **Python**, and **JavaScript**.
* **Automatic Language Detection**: Smart code heuristic classifier automatically selects the active language mode, Monaco syntax highlighter, and parser tab on input.
* **AST & Line Evaluation Engine**: Step-by-step timeline tracing for variable creations, assignments, arithmetic evaluation, conditions (`if`/`else`), loops (`for`/`while`), arrays, function calls, and recursion.

### 📊 2. Dynamic Memory & Data Structure Visualizers
* **Memory Slot Variables**: Real-time memory box cards tracking active variable names, current values, previous state changes, and line numbers.
* **Array Index Map**: Aligned `Index` and `Value` rows with glowing active index highlights and mutation tracking (`arr[i] = x`).
* **Call Stack & Recursion Cascade**: Stack frame visualizer tracking function parameters, depth growth, call chains (`add(add(1,2), 3)`), and return value unwinding (`factorial(4) → 24`).
* **Visualizer Suite**: Specialized Canvas & SVG renderers for **Arrays**, **Stacks**, **Queues**, **Linked Lists**, **Trees**, **Graphs**, and **Hash Maps**.

### ⏱️ 3. Execution Timeline Controls
* **Step Controls**: **Play**, **Pause**, **Step Forward**, **Step Backward**, and **Reset**.
* **Scrubbing Slider**: Drag or click along the timeline bar to jump directly to any step in execution history.
* **Speed Selectors**: Configurable playback speeds (`0.5x`, `1x`, `2x`).

### 👤 4. User Accounts & OAuth Authentication (Phase 18)
* **OAuth Login**: Seamless **Google Login** and **GitHub Login** via NextAuth.js.
* **Gamified Progress Tracking**: Earn **XP** (+50 XP per lesson), level up developer ranks (`Lvl = ⌊XP / 100⌋ + 1`), and track completed lessons.
* **Achievements**: Unlock achievement badges (*"First Step"*, *"Algorithm Explorer"*) stored under user profile modals.

### 🗄️ 5. PostgreSQL & Prisma Database (Phase 19)
* **OR Mapping**: Prisma ORM schema mapping **Users**, **Accounts**, **Sessions**, **Lessons**, **Progress**, and **Achievements**.
* **Database Driver**: Direct native PostgreSQL pool (`pg`) integration with full migration support.

### 🎓 6. Guided Learning & Algorithm Presets
* **Pre-built Lessons**: Binary Search, Bubble Sort, Quick Sort, Factorial Recursion, BFS/DFS Tree Traversals.
* **Interactive Code Injection**: Load preset code directly into the editor with explanation cards and quizzes.

---

## 🏗️ Architecture & Engine Overview

```mermaid
graph TD
    A[Monaco Code Editor] -->|Raw Code Input| B[Language Auto-Detector]
    B -->|C / C++ / Java / Py / JS| C[Multi-Language Parser]
    C -->|Parse AST & Line Traces| D[Runtime Execution Engine]
    D -->|Emit Step Events| E[Zustand Execution Store]
    E -->|Timeline Events| F[Timeline Controls & Slider]
    E -->|State Snapshots| G[Visualizer Panel]
    G --> H[Memory Slots]
    G --> I[Array Index Grid]
    G --> J[Recursion Stack Cascade]
    G --> K[Trees / Graphs / Linked Lists]
    E -->|Lesson Complete| L[NextAuth API & PostgreSQL Prisma DB]
```

---

## 🧪 Runtime Engine Test Suite (17/17 Passed)

TraceLab core engine has been verified against 17 execution test cases:

| Test # | Test Name | Key Engine Mechanics | Status |
|:---:|:---|:---|:---:|
| **1** | **Variable Creation** | Declarations, multiple variables, uninitialized slots | **PASSED** |
| **2** | **Variable Update** | Assignments, previous value history | **PASSED** |
| **3** | **Arithmetic Operations** | `+`, `-`, `*`, `/` expressions & variable reads | **PASSED** |
| **4** | **Condition Execution** | Comparison operators, `TRUE` branch execution | **PASSED** |
| **5** | **If Else** | Decision branching & `ELSE` branch execution | **PASSED** |
| **6** | **Nested Conditions** | Multi-level block evaluation & scope guards | **PASSED** |
| **7** | **For Loop** | Counter initialization, step checks (`i < n`), increments | **PASSED** |
| **8** | **Loop + Variable Update** | Iterative accumulation (`sum = sum + i`) | **PASSED** |
| **9** | **While Loop** | While condition checks & loop body increments | **PASSED** |
| **10** | **Array Creation** | Index grid alignment (`0..n-1`) & cell rendering | **PASSED** |
| **11** | **Array Access** | Index lookup (`arr[2]`) & cell highlight | **PASSED** |
| **12** | **Array Update** | In-place element mutation (`arr[3] = 100`) | **PASSED** |
| **13** | **Function Call** | Stack frame creation, parameter passing, return values | **PASSED** |
| **14** | **Nested Function Calls** | Nested evaluations (`add(add(1,2), 3)`) | **PASSED** |
| **15** | **Recursion** | Stack growth, base case exit, stack unwinding | **PASSED** |
| **16** | **Scope Handling** | Block scope entry/exit & variable shadowing | **PASSED** |
| **17** | **Ultimate Combined Test** | Full integration: functions + loops + arrays + printf | **PASSED** |

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16.3.8 (App Router)](https://nextjs.org/)
* **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
* **Code Editor**: [@monaco-editor/react](https://github.com/sueyont/monaco-react)
* **AST Parsers**: `@babel/parser`, `@babel/traverse`, custom Multi-Language Regex/AST Evaluator
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/), `pg` Pool
* **Authentication**: [NextAuth.js](https://next-auth.js.org/) with `@auth/prisma-adapter`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** v20+ 
* **npm** or **pnpm**
* **PostgreSQL** database (optional for local mock auth testing)

### 2. Clone the Repository
```bash
git clone https://github.com/IstiakAdil14/TraceLab.git
cd TraceLab
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials in `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tracelab?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start tracing code!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ for Computer Science students & Developers.
</p>
