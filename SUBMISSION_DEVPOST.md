# IEEE ClimateChain Global Hackathon — Official Devpost Submission Draft

### Project Title
**AMARU-CLIMATE: Autonomous AI Multi-Agent C2 with Triple-Layer Blockchain Notary for Climate Resilience and Anti-Corruption Emergency Auditing**

### 🎯 Track Alignment
**Selected Track:** Climate Data & Environmental Monitoring  
**Interconnected Impact:** Sustainable Agriculture & Parametric Climate Insurance (SAC)  
AMARU-CLIMATE directly addresses the core mandate of the Climate Data & Environmental Monitoring track by transforming fragmented, raw satellite earth observations (NASA FIRMS, NOAA, Sentinel) into cryptographically certified, actionable Early Action intelligence. By binding real-time geospatial fire telemetry to Polygon blockchain Merkle notarizations, AMARU eliminates data manipulation risks, exposes 38 unrecorded "blind wildfires", and provides indisputable parametric evidence for immediate climate catastrophe relief.

---

## Inspiration
Every year, extreme climate anomalies such as the El Niño Southern Oscillation (ENSO), Amazonian megadroughts, and severe Andean freeze waves trigger catastrophic loss of life and livelihoods across the Pacific Basin and Latin America. In Peru alone, billions are budgeted annually for disaster risk reduction (e.g., Programa Presupuestal PP 0068 with over S/ 4.12 Billion), yet emergency response is consistently paralyzed by what we call the **"Tragedy of the Golden Window"**:

Local mayors and civil defense authorities face criminal prosecution under administrative abuse laws if they disburse disaster funds without exhaustive bureaucratic justification. While recent national initiatives like INDECI's mobile "EDAN Digital" modernize post-impact field census, physical ground assessments are fundamentally reactive and cannot operate during the critical pre-impact window. Hydraulic concentration times for flash floods (*huaicos*) are between 4 and 12 hours, and wildfires propagate uphill at 4 km/h through chimney effects. In remote mountainous terrain where ground evaluators cannot travel in time, municipalities become administratively blind. Terrified of wrongful liability and post-disaster audits, honest officials freeze during the Golden Window. Worse, when emergency funds are hastily unlocked under non-competitive tenders, the absence of auditable telemetry opens the door to price gouging, phantom machinery rentals, and corruption.

We were inspired by the imperative of institutional trust in public engineering: technology must protect honest civil servants from wrongful liability, break bureaucratic paralysis during critical early-warning windows, and eliminate corruption without slowing down life-saving humanitarian relief.

---

## What it does
AMARU-CLIMATE is an enterprise-grade Command and Control (C2), Early Action, and Climate Audit platform that combines autonomous AI multi-agent orchestration with a Triple-Layer Cryptographic Blockchain Notary:

1. **Autonomous Climate Multi-Agent Fusion:** Six sovereign AI agents (Kuraq, Yupaq, Qilqay, Fiscalizador, Comunitario, Satelital) continuously ingest and cross-correlate NASA FIRMS (VIIRS 375m & MODIS), Sentinel-3 SLSTR, NOAA Sea Surface Temperature anomalies, Doppler radar, Open-Meteo IFS weather feeds, and official government risk catalogs.
2. **Geodesic C2 Wildfire & Blind Fire Engine (`/incendios`):**
   - Implements automated geodesic DBSCAN clustering ($R = 12\text{ km}$) that aggregates thousands of satellite thermal hotspots into **86 high-severity national wildfire complexes**.
   - **Multi-Temporal Thermal Persistence (PTT 48h):** Employs state-machine persistence to maintain active incident tracking even during optical cloud occlusion or nighttime inversion, preventing dangerous false negatives.
   - **Cross-Validation with Ground Truth & Bridging the SINPAD/EDAN Gap:** Correlates active complexes against 118 official INDECI-COEN emergency bulletins and field registries. While digital ground forms (such as EDAN Digital) require on-site personnel and report hours or days post-event, AMARU highlights **48 validated incidents** while exposing **38 "Blind Wildfires"** (high-FRP fires raging in remote topography completely absent from administrative registries).
   - **Automated Heavy Machinery Dossiers:** Calculates mechanized firebreak length and generates compliant emergency procurement orders under Public Procurement Act Ley 30225 Art. 27.
3. **Parametric Evidence for Agricultural Insurance (SAC / MIDAGRI):**
   - Operates under a strict **Human-in-the-Loop (HITL) and Zero-PII boundary**: AMARU does not hold citizen data nor disburse funds directly. It outputs standardized OASIS CAP v1.2 geospatial damage dossiers (hectares burned, Fire Radiative Power, perimeter polygons).
   - These tamper-proof dossiers allow regional Agrarian Agencies and MIDAGRI to validate claims for Peru's *Seguro Agrícola Catastrófico* (SAC S/ 1,000 / ha) in hours rather than months, authorizing private insurers (e.g., La Positiva, Pacífico) to pay impacted smallholders directly.
4. **Triple-Layer Cryptographic Trust Engine & Blockchain Notary:**
   - **Layer 1 (Edge Micro-Proofs):** Generates local SHA-256 telemetry hashes at municipal edge servers in $< 2\text{ ms}$, ensuring zero-latency offline operation.
   - **Layer 2 (WORM Anti-Corruption Ledger):** Write-Once-Read-Many cryptographic audit ledger with RFC 3161 timestamps and ISO 27037 chain of custody, benchmarking machinery rental rates against national procurement records (OSCE/SEACE).
   - **Layer 3 (Polygon Blockchain Anchor):** Batches event hashes into balanced Merkle Trees and commits the 32-byte Merkle root onto the Polygon Amoy EVM network (`ClimateAuditAnchor.sol`, ChainID `80002`), providing immutable public notary proof.
5. **Open Climate Data Oracle:** Delivers public, certified Open API REST endpoints for international researchers, carbon auditors, and emergency responders.

---

## How we built it
- **Smart Contract & Web3:** Custom Solidity contract `ClimateAuditAnchor.sol` deployed and verified on Polygon Amoy (`0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0`), storing Merkle roots, incident counters, and block-range metadata.
- **Backend Architecture:** Python 3.12, FastAPI, Web3.py, PyCryptodome, and geodesic Haversine clustering routines optimized for low-latency spatial queries.
- **Frontend Tactical C2 Interface:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, and interactive Leaflet/Google Maps geospatial viewports designed for crisis room operations.
- **Cloud Infrastructure:** High-availability serverless containers deployed on Google Cloud Run in `us-central1` with automated container builds via Google Cloud Build.
- **Data Integrations:** NASA FIRMS API, Open-Meteo Pro, CENEPRED SIGRID risk plans, MEF Consulta Amigable (SIAF), INDECI SINPAD emergency bulletins, and compatibility layers for field data structures (including INDECI's EDAN Digital damage schemas).

---

## Challenges we ran into
- **Cartographic Discrepancies:** Municipal risk assessments often use UTM Zone 17S projections with manual cartographic annotations. We built an automated parser that transforms these coordinates into WGS84 standards with 650m tolerance buffers for satellite alignment.
- **Emergency Speed vs. Blockchain Latency:** Disaster command centers cannot wait 15–30 seconds for block confirmations. Our Triple-Layer architecture solves this: Layer 1 executes locally in $< 2\text{ ms}$, Layer 2 records into the append-only WORM ledger instantaneously, and Layer 3 periodically anchors the balanced Merkle root onto Polygon.
- **Strict Separation of Public Authority (HITL):** Financial disbursements in Latin American public administration cannot and should not be replaced by automated smart contract payouts due to constitutional and legal requirements. We solved this by designing AMARU purely as an evidentiary technical engine that feeds public authorities (MIDAGRI, COEN) without handling citizens' PII or overriding human officials.

---

## Accomplishments that we're proud of
- Deployed and tested `ClimateAuditAnchor.sol` on Polygon Amoy, achieving 100% automated Merkle root notarization from live satellite feeds.
- Uncovered 38 "Blind Wildfires" in Peru via satellite-COEN cross-validation, demonstrating real-world lifesaving value for emergency dispatchers.
- Implemented the full C2 Wildfire Module with zero TypeScript errors across 35 production routes on Google Cloud Run.
- Formulated an actionable parametric bridge with Peru's *Seguro Agrícola Catastrófico* (SAC), enabling transparent indemnification for vulnerable smallholder farmers.

---

## What we learned
- Digitizing paper forms into mobile apps (like EDAN Digital) is only step one for civil defense; the true paradigm shift is **closing the latency gap between orbital satellite telemetry and ground operations** through autonomous AI orchestration before disaster strikes.
- Blockchain’s greatest impact in climate resilience is not speculative tokens, but **immutable institutional accountability and legal protection for frontline responders**.
- Parametric disaster response and Early Action Protocols (EAPs) can reduce post-disaster expenditure by up to 40% when evidence is mathematically certified, unalterable, and synchronized with official state registries.

---

## What's next for AMARU-CLIMATE
- **Global Deployment with WMO & UNDRR:** Expand open API connectors with the WMO Global Data Store and Copernicus Open Access Hub to scale from the Andean-Pacific corridor to Southeast Asia and the Caribbean.
- **Zero-Knowledge (zk-SNARK) Parametric Claims:** Upgrade our Zero-PII module to zk-SNARK proofs on Polygon, allowing farmers and agrarian cooperatives to prove eligibility for climate insurance without exposing personal identifying information.
- **Cross-Border Early Action Corridors:** Establish multi-jurisdiction Early Action Protocols under the UN Early Warnings for All (EW4All) initiative to coordinate cross-border logistics during regional climate catastrophes.
