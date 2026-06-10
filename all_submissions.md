# GenLayer Points Portal Submissions

### 1. Projects & Milestones

#### AuraMarket DApp
**Title:** AuraMarket: AI-Resolved Prediction Market
**Description:**
AuraMarket is a decentralized prediction market running entirely on GenLayer Studionet. Instead of relying on human oracles or centralized APIs for market resolution, AuraMarket uses GenVM's native `gl.nondet.web.get` to actively scrape evidence from user-defined resolution URLs. The intelligent contract then feeds this live web data into an LLM via `gl.nondet.exec_prompt` wrapped in a `prompt_comparative` consensus check to autonomously decide if the market resolves to YES or NO.

- **Contract Address:** `0xe5Ea8D654775Fb8883BDB9949f1B5254ae02fF2A`
- **Explorer Link:** [View on GenLayer Studio](https://explorer-studio.genlayer.com/address/0xe5Ea8D654775Fb8883BDB9949f1B5254ae02fF2A)
- **Live Vercel App:** [AuraMarket Production](https://auramarket-three.vercel.app)
- **Source Code:** [GitHub Repository](https://github.com/Dark-Brain07/AuraMarket)

---

### 2. Tools & Infrastructure

#### AuraMarket Intelligent Contract (Truth Oracle)
**Title:** AuraMarket Oracle Engine
**Description:**
A highly complex intelligent contract that acts as an autonomous Truth Oracle. It accepts a prediction market question and a web URL. Upon resolution, the contract uses `gl.nondet.web.get` to fetch the HTML content, passes it to the GenLayer LLM module, and enforces a `prompt_comparative` principle to ensure AI validators reach deterministic consensus on the truthfulness of real-world events.

- **Contract Address:** `0xe5Ea8D654775Fb8883BDB9949f1B5254ae02fF2A`
- **Explorer Link:** [View on GenLayer Studio](https://explorer-studio.genlayer.com/address/0xe5Ea8D654775Fb8883BDB9949f1B5254ae02fF2A)
- **Source Code:** [GitHub Repository](https://github.com/Dark-Brain07/AuraMarket)
