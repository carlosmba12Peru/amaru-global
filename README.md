# AMARU-GLOBAL: Sovereign Multi-Agent C2 Framework & Triple-Layer Blockchain Notary for UN-EW4All Climate Resilience

> **Submitted to:** [IEEE ClimateChain Global Hackathon: AI and BLOCKCHAIN Innovate Today for a Sustainable Tomorrow](https://ieee-climatechain-hack.devpost.com/)  
> **Track:** **Track 4 — Climate Data & Environmental Monitoring**  
> **Cross-Track Integration:** Track 1 (Carbon & Emission/Audit Transparency) & Track 3 (Sustainable Supply Chains)  
> **Smart Contract:** [`ClimateAuditAnchor.sol`](contracts/ClimateAuditAnchor.sol) deployed & verified on **Polygon Amoy Testnet** ([0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0](https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0))  
> **Live Production C2:** [coen-frontend-289004262994.us-central1.run.app/incendios](https://coen-frontend-289004262994.us-central1.run.app/incendios)  
> **Public API Gateway:** [coen-backend-289004262994.us-central1.run.app/api/v1/incendios/clusters-activos](https://coen-backend-289004262994.us-central1.run.app/api/v1/incendios/clusters-activos)  
> **Evaluator Walkthrough & Manual (Step-by-Step):** [MANUAL_NAVEGACION_EVALUADOR_IEEE.md](docs/MANUAL_NAVEGACION_EVALUADOR_IEEE.md)  
> **Devpost Submission:** [AMARU-CLIMATE Submission #1243712](https://devpost.com/submit-to/29114-ieee-climatechain-global-hackathon/manage/submissions/1243712/edit)  
> **Sovereign Territorial Sandbox:** For detailed documentation on Peru's multi-hazard civil protection suite (1,891 districts, SINAGERD, SAC agricultural insurance, and MEF PP 0068 audits), see [README_PERU.md](README_PERU.md).

---

## 📑 Table of Contents
1. [Lineage & Ecosystem Genealogy](#1-lineage--ecosystem-genealogy)
2. [The Core Dilemma: The Golden Window vs. Post-Disaster Corruption](#2-the-core-dilemma-the-golden-window-vs-post-disaster-corruption)
3. [Global Architecture: The 6 UN-EW4All / WMO Links](#3-global-architecture-the-6-un-ew4all--wmo-links)
4. [Triple-Layer Cryptographic Trust Engine & Polygon Blockchain Notary](#4-triple-layer-cryptographic-trust-engine--polygon-blockchain-notary)
5. [Ethical AI & C2 Governance: Cognitive Caging & Sovereign HITL Chain](#5-ethical-ai--c2-governance-cognitive-caging--sovereign-hitl-chain)
6. [Cybersecurity & Data Privacy: Zero-PII Shamir Secret Sharing](#6-cybersecurity--data-privacy-zero-pii-shamir-secret-sharing)
7. [Smart Contract Verification on Polygonscan](#7-smart-contract-verification-on-polygonscan)
8. [The Field Validation Testbed: Wildfires & Blind Fires](#8-the-field-validation-testbed-wildfires--blind-fires)
9. [Technology Stack](#9-technology-stack)
10. [Quickstart: Local Execution & Testing](#10-quickstart-local-execution--testing)
11. [License & IEEE Acknowledgement](#11-license--ieee-acknowledgement)

---

## 1. Lineage & Ecosystem Genealogy

The AMARU ecosystem is structured into three distinct, complementary tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE AMARU ECOSYSTEM GENEALOGY                            │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐
│ 1. AMARU-CLIMATE (WFP SEED) │ │ 2. AMARU-CLIMATE (PERU)     │ │ 3. AMARU-GLOBAL (IEEE)      │
│ Foundational Research Track │ │ Sovereign Regional Sandbox  │ │ Universal Standard Framework│
├─────────────────────────────┤ ├─────────────────────────────┤ ├─────────────────────────────┤
│• Focus: Climate Anticipatory│ │• Focus: Municipal C2 Command│ │• Focus: Global Multi-Agent  │
│  Action (EAP) & Food Secu-  │ │  & Multi-Hazard Response    │ │  Reasoning & EVM Blockchain │
│  rity under extreme ENSO.   │ │  for Peru's river basins.   │ │  Evidence Notary.           │
│• Origin: WFP AFCIA LAC 2026 │ │• Architecture: 4-Tier Civil │ │• Hackathon: IEEE Climate-   │
│  Innovation Initiative.     │ │  Protection C2 Suite.       │ │  Chain Global 2026.         │
│• Role: The Scientific Seed  │ │• Role: High-Stress Real-    │ │• Role: Universal Standard   │
│  and Prior Art foundation.  │ │  World Validation Testbed.  │ │  Engine for UN-EW4All MHEWS.│
└─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘
```

1. **AMARU-CLIMATE (WFP AFCIA LAC 2026 Seed):** Foundational research on predictive triggers and anticipatory action protocols (EAP) recognized under the **UN World Food Programme** innovation challenge.
2. **AMARU-CLIMATE (Andean-Pacific Field Testbed):** The operational, real-world deployment across Peru's 1,891 districts. Acts as our rigorous validation laboratory, demonstrating that the architecture functions under extreme geographic stress (coastal flash floods vs. high-altitude freeze surges vs. Amazonian fires). See [README_PERU.md](README_PERU.md).
3. **AMARU-GLOBAL (This Repository):** The universal, jurisdiction-agnostic Command & Control (C2) engine built for international disaster resilience. It operationalizes the **UN-EW4All 6-link protocol**, enforces **Human-in-the-Loop (HITL)** ethical constraints, and anchors decisions onto **Polygon** as mathematical proof against humanitarian corruption.

---

## 2. The Core Dilemma: The Golden Window vs. Post-Disaster Corruption

Despite billions allocated globally under the Sendai Framework and multilateral funds, Disaster Risk Management suffers from two systemic failure modes:

1. **The "Tragedy of the Golden Window" (Bureaucratic Paralysis):** Local mayors and civil defense authorities face criminal prosecution and audits if they disburse disaster funds without exhaustive justification. However, hydraulic concentration times for flash floods are between 4 and 12 hours, and wildfires propagate uphill at 4 km/h through chimney effects. Terrified of wrongful liability, honest officials wait until devastation is already underway before declaring emergencies.
2. **Post-Disaster Humanitarian Corruption & Price Gouging:** Once emergency status is hastily unlocked under non-competitive tenders, the lack of auditable data opens the door to phantom machinery rentals, inflated invoices, and aid diversion.

**AMARU-GLOBAL eliminates this trade-off:** it mathematically protects honest officials with immutable pre-disaster evidence while closing the door to post-disaster fraud.

---

## 3. Global Architecture: The 6 UN-EW4All / WMO Links

AMARU-GLOBAL bridges predictive climate intelligence with cryptographic accountability by implementing the **6 Core Links** mandated by the **World Meteorological Organization (WMO)** and the UN Secretary-General's **"Early Warnings for All" (EW4All)** initiative:

```
[1. Global Observation] ──> [2. Multi-Hazard Forecast] ──> [3. Vulnerability Prediction]
                                                                        │
[6. Blockchain WORM Audit] <── [5. C2 Humanitarian Logistics] <── [4. HITL Sovereign Gatekeeper]
```

| UN-EW4All Link | AMARU-GLOBAL Implementation | Technical Core Component |
| :--- | :--- | :--- |
| **Link 1: Observation** | Ingestion of real-time satellite Sea Surface Temperature (SST) anomalies, Doppler radar networks, and hydrometric telemetry. | Open-Meteo IFS 9km, NOAA OI-SST, Copernicus Sentinel feeds |
| **Link 2: Forecasting** | Multi-day predictive engine calculating hydrometeorological runoff and thermal anomalies up to 7 days in advance. | `backend/services/meteo_service_pro.py` |
| **Link 3: Impact Prediction** | Spatial GIS cross-validation of physical hazards against population vulnerability, road networks, and health facilities. | Spatial inference engine & risk exposure catalog parser |
| **Link 4: Authorized Warning** | **OASIS Common Alerting Protocol (CAP v1.2)** formatting, strictly caged until authorized by a credentialed human authority. | `backend/services/alerts_cascade_service.py` |
| **Link 5: Action & Logistics** | Automated dispatch of relief supply manifests, secure evacuation routing, and fair-market procurement dossiers. | `backend/services/routing/humanitarian_router.py` |
| **Link 6: Forensic Audit** | Cryptographic anchoring of decisions, tenders, and censuses onto the Polygon public blockchain via Merkle Trees. | `contracts/ClimateAuditAnchor.sol` |

---

## 4. Triple-Layer Cryptographic Trust Engine & Polygon Blockchain Notary

To resolve the trade-off between **sub-second emergency response** and **public blockchain confirmation latency**, AMARU employs a 3-Layer architecture:

```mermaid
graph TD
    A[Satellite / Telemetry Ingestion] --> B[Layer 1: Edge Micro-Proofs < 2ms SHA-256]
    B --> C[Layer 2: WORM Immutable Audit Ledger RFC 3161 / ISO 27037]
    C --> D[Balanced Merkle Tree Aggregator]
    D --> E[Layer 3: Polygon Amoy EVM Notary ClimateAuditAnchor.sol]
    E --> F[Public Verifiable Proof on Polygonscan]
```

1. **Layer 1 (Edge Micro-Proofs):** Generates local SHA-256 telemetry hashes at municipal edge servers in $< 2\text{ ms}$, ensuring zero-latency offline operation during grid blackouts.
2. **Layer 2 (WORM Anti-Corruption Ledger):** Write-Once-Read-Many cryptographic audit ledger with RFC 3161 timestamps and ISO 27037 chain of custody, benchmarking machinery rental rates against national procurement price ceilings.
3. **Layer 3 (Polygon Blockchain Anchor):** Batches event hashes into balanced Merkle Trees and commits the 32-byte Merkle root onto Polygon Amoy (`ClimateAuditAnchor.sol`), providing immutable public notary proof.

---

## 5. Ethical AI & C2 Governance: Cognitive Caging & Sovereign HITL Chain

*Directly answering IEEE Hackathon Session 4: AI Ethics, Cybersecurity, and Responsibility in ClimateChain.*

AMARU-GLOBAL establishes the principle of **Cognitive Caging**:

```mermaid
graph LR
    AI[Autonomous AI Agents] -->|Synthesize Hazard| CAGE[Cognitive Caging Engine]
    CAGE -->|Status: PENDING_HUMAN_SIGNATURE| GATEKEEPER[Sovereign HITL Gatekeeper]
    
    GATEKEEPER -->|Human Digital Signature| APPROVED[OASIS CAP v1.2 Distribution]
    GATEKEEPER -->|Rejection / Override| LOG[Forensic Rejection Log]
    
    APPROVED --> ANCHOR[Polygon Blockchain Notary]
```

1. **No Autonomous Public Sirens:** The AI engine is strictly prohibited from triggering public cell-broadcast sirens or mass media channels unilaterally.
2. **Mandatory Human Signature:** An alert generated by AI remains in the `PROPUESTA_AGENTICA_PENDIENTE` state. It cannot transition to active distribution until a certified operational officer provides their cryptographic institutional identity, verifying the hazard parameters.
3. **Decentralized Dual Quorum:** At the local operational level, emergency budget disbursements require dual cryptographic sign-off (Local Executive Authority + Civil Protection/Police Chief), preventing unilateral fund abuse.

---

## 6. Cybersecurity & Data Privacy: Zero-PII Shamir Secret Sharing

*Directly answering IEEE Hackathon Session 2: Cybersecurity & Data Privacy in Climate Tech.*

Publishing disaster damage censuses on a public blockchain introduces severe privacy risks under international data protection laws (GDPR). 

AMARU-GLOBAL implements **Zero-PII Identity Protection via Shamir’s Secret Sharing Scheme ($k=3, n=5$)**:
- **No Plaintext PII on Chain:** Sensitive citizen data (National Identity IDs, names, exact geolocated coordinates of destroyed homes) are encrypted into a secure off-chain vault.
- **Irreversible Hash Integrity:** Only the irreversible SHA-256 root hash of the census registry is committed to Polygon.
- **Threshold Key Management:** Decryption requires $k=3$ out of $n=5$ independent institutional keys (e.g., Civil Defense Authority + Public Prosecutor + Red Cross + Municipal Auditor + Ombudsman), guaranteeing zero unilateral surveillance while mathematically preventing phantom victims from being added retroactively.

---

## 7. Smart Contract Verification on Polygonscan

The notary smart contract is deployed and verified on the **Polygon Amoy EVM Testnet**:

* **Contract Address:** [`0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0`](https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0)
* **Polygonscan Explorer:** [View on Polygonscan Amoy](https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0)
* **Network:** Polygon Amoy Testnet (ChainID `80002`)
* **Solidity Source:** [`contracts/ClimateAuditAnchor.sol`](contracts/ClimateAuditAnchor.sol)

### Core Interface (`ClimateAuditAnchor.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ClimateAuditAnchor is Ownable {
    struct AnchorRecord {
        bytes32 merkleRoot;
        uint256 startBlock;
        uint256 endBlock;
        uint256 eventCount;
        uint256 timestamp;
        string recordType;        // e.g., "OASIS_CAP_ALERT", "HUMANITARIAN_CENSUS", "EMERGENCY_TENDER"
        string ipfsMetadataUri;   // Decentralized storage metadata
    }

    mapping(bytes32 => AnchorRecord) public anchors;
    bytes32[] public anchorHistory;

    event AuditAnchorCommitted(
        bytes32 indexed merkleRoot,
        string recordType,
        uint256 eventCount,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function commitAnchor(
        bytes32 _merkleRoot,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _eventCount,
        string memory _recordType,
        string memory _ipfsMetadataUri
    ) external onlyOwner {
        require(anchors[_merkleRoot].timestamp == 0, "Error: Record already anchored");
        anchors[_merkleRoot] = AnchorRecord({
            merkleRoot: _merkleRoot,
            startBlock: _startBlock,
            endBlock: _endBlock,
            eventCount: _eventCount,
            timestamp: block.timestamp,
            recordType: _recordType,
            ipfsMetadataUri: _ipfsMetadataUri
        });
        anchorHistory.push(_merkleRoot);
        emit AuditAnchorCommitted(_merkleRoot, _recordType, _eventCount, block.timestamp);
    }
}
```

---

## 8. The Field Validation Testbed: Wildfires & Blind Fires

To prove practical usefulness beyond theoretical whitepapers, AMARU operates live on real climate emergencies:

* **Geodesic DBSCAN Clustering ($R = 12\text{ km}$):** Aggregates thousands of raw NASA FIRMS (VIIRS 375m & MODIS) thermal hotspots into **86 high-severity national wildfire complexes**.
* **48-Hour Thermal Persistence (PTT):** State-machine tracking keeps incidents active even during optical cloud occlusion or nighttime thermal inversion.
* **Ground-Truth Cross-Validation:** Correlates active satellite complexes against 118 official civil defense bulletins, confirming **48 validated incidents** while exposing **38 "Blind Wildfires"** (high-FRP fires raging in remote areas with zero formal administrative reports).
* **Parametric Evidence for Agricultural Insurance (SAC):** Outputs standardized geospatial damage dossiers (burned hectares, Fire Radiative Power, perimeter polygons) without citizen PII, allowing agrarian agencies to certify catastrophe claims in hours instead of months.

---

## 9. Technology Stack

- **Blockchain & Web3:** Solidity `^0.8.20`, Polygon Amoy EVM, OpenZeppelin, Web3.py.
- **Backend C2 Architecture:** Python 3.12, FastAPI, PyCryptodome (Shamir Secret Sharing & SHA-256), NumPy, Haversine geodesic algorithms.
- **Mission-Control Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, Glassmorphic Tactical C2 UI, Leaflet / Google Maps Platform integration.
- **Cloud Infrastructure:** Google Cloud Run serverless containers, Google Cloud Build automated CI/CD.
- **Earth Observation Feeds:** NASA FIRMS API, Open-Meteo Global Ensemble (ECMWF IFS 9km), NOAA Coral Reef Watch SST, Copernicus Sentinel layers.

---

## 10. Quickstart: Local Execution & Testing

### Prerequisites
- Node.js >= 18.x
- Python >= 3.11

### 1. Backend Service
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend C2 Console
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:3000
```

### 3. Automated Verification Test Suite
```bash
cd backend
python -m unittest tests/test_blockchain_anchor.py tests/test_alerts_cascade.py
```

---

## 11. License & IEEE Acknowledgement

Developed for the **IEEE ClimateChain Global Hackathon 2026** (Organized by IEEE Blockchain Türkiye, IEEE Blockchain Technical Committee, IEEE Orange County & AI Ecosystem Association).

Licensed under the **Apache License 2.0**.
