# 🏙️ UrbanPulse — Local-AI Urban Infrastructure Sentinel & Automated Government Dispatch Engine

[![Live Web App](https://img.shields.io/badge/Live%20Demo-urban--pulse--ai.ai.studio-brightgreen?style=for-the-badge&logo=googlechrome&logoColor=white)](https://urban-pulse-ai.ai.studio/)
> 🌐 **Live Deployed App:** [https://urban-pulse-ai.ai.studio/](https://urban-pulse-ai.ai.studio/)

[![GitHub Repository](https://img.shields.io/badge/GitHub-siva5842%2Furban--pulse--ai-181717?style=flat&logo=github)](https://github.com/siva5842/urban-pulse-ai)
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.10+-3776AB?style=flat&logo=python&logoColor=white)](https://fastapi.tiangolo.com/)
[![AI Model](https://img.shields.io/badge/AI%20Engine-Hugging%20Face%20CLIP-FFD21E?style=flat&logo=huggingface&logoColor=black)](https://huggingface.co/openai/clip-vit-base-patch32)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Mapping](https://img.shields.io/badge/Mapping-Leaflet%20%7C%20Google%20Satellite%20Hybrid-34A853?style=flat&logo=googlemaps&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A decentralized, privacy-preserving civic infrastructure sentinel running **100% on local open-source AI models** (zero paid cloud APIs). Empowers citizens to report multi-department urban defects with anti-spoofing verification, calculates cavity depth even in muddy water, and auto-escalates community-verified issues directly to municipal authorities.

---

## 🌟 Key Innovations & Features

### 1. 🧠 100% Local Intelligence (Zero Paid Cloud APIs)
* Powered by Hugging Face's open-source `openai/clip-vit-base-patch32` running locally on CPU/GPU via FastAPI.
* Sub-second inference latency ($<300\text{ ms}$) with zero cloud subscription fees and complete data sovereignty.

### 2. 🕳️ Muddy-Water Pothole Depth Estimation
* Standard computer vision fails when potholes are submerged in murky rainwater.
* **UrbanPulse** solves this by analyzing the exposed asphalt wearing-course lip ($5 - 8\text{ cm}$) combined with empirical surface area-to-depth ratios.
* Submerged craters wider than $0.5\text{ m}$ are automatically classified as **`>10 cm Axle-Breaking Blind Hazards`**, triggering emergency advisories for ambulances and two-wheelers.

### 3. 🛰️ Google Satellite Hybrid & 360° Street View
* High-resolution aerial satellite imagery (`lyrs=y`) displaying individual building rooftops, compounds, and infrastructure alignment alongside street labels.
* Integrated **360° Interactive Google Street View Modal** allowing inspectors and citizens to explore the real-world street environment directly at defect coordinates.

### 4. 🏢 Multi-Department Municipal Triage
Categorizes defects and routes work orders directly to the responsible division:
* 🕳️ **Highways & PWD:** Potholes, road craters, cave-ins.
* 💧 **TWAD Water Supply Board:** Clean drinking water pipeline bursts and open sewage leaks.
* ⚡ **TANGEDCO Electricity Board:** Dark unlit streetlights (women's night-safety zones) and loose high-voltage cables.
* 🚯 **Municipal Sanitation:** Overflowing public dumpsters and toxic open waste burning.
* ♿ **Town Planning & Footpaths:** Broken footpath slabs and wheelchair barriers.

### 5. 🛡️ Anti-Location-Spoofing & Community Consensus
* Validates device physical GPS against reported pin coordinates using the **Haversine formula**.
  * $\le 150\text{ m}$: Tagged **`🟢 On-Site Verified`** (High initial trust score).
  * $> 150\text{ m}$: Tagged **`⚠️ Remote Upload`** (Requires local citizen consensus).
* Hyper-local proximity notifications for residents within $1\text{ km}$ with **👍 True** and **👎 False** voting to auto-demote fake complaints.

### 6. 🚀 Autonomous Government Dispatch on Upvote Threshold
* When an issue reaches **5 verified community upvotes**, the backend automatically triggers an official municipal dispatch:
  * Generates a formal tracking ticket (e.g., `#TN-PWD-2026-9042`).
  * Initiates an official **24-hour emergency SLA countdown timer**.
  * Computes technical material requisitions (e.g., *"1.5 tons cold-mix asphalt + vibratory roller"*).

---

## 🏗️ System Architecture

[Mobile Camera + GPS] ──> [Haversine Anti-Spoofing Check]
│
▼
[Local Hugging Face CLIP Engine]
(Multi-Category Triage + Depth Estimation)
│
▼
[Interactive Map (Satellite)]
(Pins with 360° Street View & Voice Alert)
│
▼
[Proximity Citizen Consensus Voting]
(👍 True  /  👎 Fake Alert)
│
▼ (Threshold: 5 Votes)
[Autonomous Government Ticket Dispatcher]
(Ticket ID #TN-PWD-8921 + 24-Hour SLA Timer)


---

## 🚀 Quick Start (Run Locally)

### 1. Clone the Repository
git clone [https://github.com/siva5842/urban-pulse-ai.git](https://github.com/siva5842/urban-pulse-ai.git)
cd urban-pulse-ai
2. Start the Backend Service
Bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Runs on port 8000)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
On first startup, the Hugging Face model (openai/clip-vit-base-patch32, ~300MB) will automatically download and cache locally.

3. Start the Frontend Application
Open a new terminal tab:

Bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev -- --host
Open http://localhost:5173 (or your local IP http://192.168.x.x:5173 on your smartphone) in your browser.

👥 Contributors & Credits
Sivaprakasham Palanisamy (@siva5842) — Full-Stack Architecture, AI Engine & System Integration

Yokesh E (@Yokesh-12) — Co-Author, Mapping & Community Validation Pipelines

📜 License
This project is open-source under the MIT License.
