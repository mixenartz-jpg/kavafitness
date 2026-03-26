# Kava Project: Agent Skill Profile & Development Guidelines

This document serves as the primary technical guide for autonomous AI agents operating within the Kava project ecosystem. It defines the project's architecture, tooling preferences, coding standards, and operational workflows.

---

## 1. Project Overview & Role

**Project Name:** Kava
**Agent Role:** Technical Co-pilot & Autonomous Developer
**Goal:** To assist in building, testing, and maintaining the Kava application, adhering strictly to the architectural decisions and tooling choices outlined below.

---

## 2. Core Tech Stack & Tooling Preferences

Agents must prioritize these tools and technologies. Do not introduce alternative libraries without explicit human approval.

| Component | Technology | Agent Guidelines |
| :--- | :--- | :--- |
| **Frontend Framework** | [Örn: Next.js / React] | Use functional components with Hooks. Prioritize performance. |
| **UI Development** | **Magic MCP (Required)** | **All UI components and layouts must be generated or modified using Magic MCP.** Do not write raw CSS or Tailwind classes manually unless Magic MCP cannot achieve the desired result. Refer to Magic MCP documentation for integration. |
| **Styling** | [Örn: Tailwind CSS] | Used *through* Magic MCP. |
| **Backend** | [Örn: Node.js with Express] | Follow RESTful principles for APIs. |
| **Database** | [Örn: PostgreSQL] | Use [Örn: Prisma] for ORM. |
| **Testing** | [Örn: Jest & Playwright] | Ensure high test coverage for new features. |

---

## 3. Operational Workflows

### 3.1. Autonomous Persona Selection (Mandatory First Step)
For every new task, before writing any code or executing commands, you MUST always scan the `.agent` folder. Automatically select the most appropriate expert persona file (.md) based on the nature of the given task, adopt the specific rules and mindset outlined in that file, and execute the task as that dedicated expert.

### 3.2. UI Development with Magic MCP

When a task involves creating or modifying a User Interface (UI):

1.  **Analyze Request:** Understand the UI requirement (e.g., "Create a login form").
2.  **Invoke Magic MCP:** Use the available Magic MCP integration to generate the component code.
    * *Command Example (Hypothetical):* `magic-mcp generate component LoginForm --type="shadow-dom"`
3.  **Review Generated Code:** Inspect the output from Magic MCP to ensure it meets the requirements and integrates correctly with Kava's state management.
4.  **Do Not Manually Style:** Resist the urge to manually tweak CSS/Tailwind classes. If adjustments are needed, attempt to prompt Magic MCP again for a revised version.

### 3.3. Parallel Task Execution

Agents are expected to work as part of a swarm.

* **Isolation:** Prioritize tasks that are isolated to specific directories (e.g., `server/api/` vs. `client/components/`) to avoid merge conflicts.
* **API Contracts:** When working on Backend/Frontend in parallel, the Backend agent *must* provide a mock JSON response and a defined API contract before the Frontend agent begins UI integration.

### 3.4. Browser Validation (Using Browser Agent)

For tasks involving user flows:

1.  After code implementation, spawn a Browser Agent.
2.  Task the Browser Agent to: "Navigate to [Kava Local URL], perform [User Flow, e.g., Login], and verify that [Outcome, e.g., Dashboard is visible]."
3.  **Required Output:** The verification must include a recorded video session or a series of numbered screenshots.

---

## 4. Coding Standards & Constraints

* **Language:** Write all code in [Örn: TypeScript]. Ensure strict type checking.
* **Security:** Follow OWASP guidelines. Never commit secrets.
* **Git:** Always work in a feature branch (`feature/your-task`). Submit clean Pull Requests with descriptive titles and summaries of changes.

---

## 5. Decision Log (Agent)

*Use this section to record significant architectural decisions made by the agent for future context.*

* *[Date]: [Decision, e.g., Implemented Redis for caching user sessions]* - *Rationale: [Why?]*

---