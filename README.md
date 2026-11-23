<div align="center">

# ⚡ NEXUS-DEEP
### The Open-Source Autonomous Deep Research Swarm
**Free, Local-First Alternative to OpenAI's \$200/month "Deep Research"**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Google Gemini Flash](https://img.shields.io/badge/Engine-Gemini%202.0%20Flash-0ea5e9.svg)](https://aistudio.google.com/)
[![Hosting Cost](https://img.shields.io/badge/Hosting%20Cost-%240.00-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com)

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#byok-setup">Free API Key</a> •
  <a href="#roadmap">Empire Roadmap</a>
</p>

---

</div>

## 🎯 The Problem & The Mission

OpenAI anchored autonomous deep research at **\$200/month (\$2,400/year)** with ChatGPT Pro. 

Most researchers, students, developers, and founders are locked out of autonomous deep synthesis by subscription paywalls or rate limits.

**NexusDeep democratizes autonomous deep research for \$0.** 

Using local-first architecture and the **Free-Tier Gemini 2.0 Flash API** (with 15 requests/minute free and built-in Google Search grounding), NexusDeep runs an autonomous multi-agent swarm right inside your browser with **zero subscription fees and zero server costs.**

---

## ⚡ Superpowers

- 🧠 **Autonomous Inquiry Decomposition:** Deconstructs any complex thesis or inquiry into 3 to 7 orthogonal research vectors.
- 🌐 **Real-Time Live Search Grounding:** Queries real-time web nodes and academic literature, harvesting primary sources and verifiable citations.
- 🔬 **Cross-Examination & Anomaly Detection:** Compares claims across independent sources, detects contradictions, and calculates empirical confidence ratings.
- 📄 **Publication-Ready Dossier Synthesis:** Automatically writes executive-grade research reports with structured comparison tables, vulnerability audits, and clickable footnoted citations.
- 💾 **1-Click Export:** Instantly download as Markdown (`.md`), copy raw text, or print to PDF with publication typography.
- 🔒 **100% Private (BYOK):** Your queries and API keys are stored in your browser's `localStorage`. No tracking, no data harvesting.

---

## 🛠️ Architecture

```
                    ┌────────────────────────────────────────┐
                    │            USER INQUIRY                │
                    │  "Solid-State vs Sodium-Ion Batteries" │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │         1. LEAD PLANNER AGENT          │
                    │    Formulates Orthogonal Hypotheses    │
                    │       [Vec 1] [Vec 2] [Vec 3]...       │
                    └───────────────────┬────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
            ┌────────────────────────┐    ┌────────────────────────┐
            │     SCOUT AGENT A      │    │     SCOUT AGENT B      │
            │  Web Search Grounding  │    │  Web Search Grounding  │
            │    Evidence Extractor  │    │    Evidence Extractor  │
            └────────────┬───────────┘    └────────────┬───────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
                    ┌────────────────────────────────────────┐
                    │      3. CROSS-EXAMINER & ANALYST       │
                    │  Detects Discrepancies & Anomaly Score │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │         4. SYNTHESIS ENGINE            │
                    │   Streams Executive OSINT Dossier:     │
                    │   - Benchmark Matrix Table             │
                    │   - Multi-Vector Deep Dive             │
                    │   - Footnoted Citation Bibliography    │
                    └────────────────────────────────────────┘
```

---

## 🚀 Quickstart

Run NexusDeep locally in under 60 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/nexus-deep.git

# 2. Enter directory
cd nexus-deep

# 3. Install dependencies
npm install

# 4. Start the local engine
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Getting Your Free Gemini Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** (takes 10 seconds, no credit card required).
3. In NexusDeep, click the **Settings (Gear Icon)** in the top right.
4. Paste your key and hit **Save**.
5. You get **15 requests per minute 100% free forever** on Gemini 2.0 Flash!

*(You can also use the built-in **Simulator Mode** to test the entire visual swarm workflow without entering any key!)*

---

## 📈 The Empire Roadmap

- [x] **v1.0 (Core Engine):** Multi-vector decomposition, live search grounding, real-time visual swarm timeline, publication dossier synthesis, PDF/Markdown export.
- [ ] **v1.1 (Graph Intelligence):** Interactive 3D/2D visual knowledge graph mapping nodes, verified facts, and contradictions.
- [ ] **v1.2 (Local LLM Support):** Direct native integration with local Ollama models (Llama 3, DeepSeek R1, Mistral).
- [ ] **v1.3 (Document Ingestion):** Upload 50-page PDFs, CSVs, or audio files into the research swarm context.
- [ ] **v2.0 (Nexus Cloud):** Hosted cloud team collaboration with shared corporate dossiers and continuous research alerts.

---

## 📄 License

MIT License. Free for personal, academic, and commercial use. Built with pride for open-source intelligence.
