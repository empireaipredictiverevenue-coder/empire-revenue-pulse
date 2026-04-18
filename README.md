# ⚡ Empire Revenue Pulse: Command Tower
> **Predictive Revenue for the Modern Operator.**

This repository houses the central HUD for **Empire AI**. It bridges the gap between atmospheric storm data and commercial roof repair contracts, automating the identification and outreach of high-value targets.

---

## 🛰️ The Mission
To convert high-velocity weather data into actionable intelligence. The system monitors the National Weather Service (NWS) for extreme events, identifies warehouse structures in the strike zone, and triggers the **Ali Intelligence Wing** to forge damage reports.

## 🛠️ Tech Stack
* **The Radar:** Python 3.10 (NWS API hooks)
* **The Vault:** Supabase / PostgreSQL (Project: `clmuzwbagzcyymfqswbn`)
* **The Brain:** Claude 3.5 Sonnet (Logic & Report Forging)
* **The HUD:** React + Tailwind CSS (Cyberpunk/Industrial Theme)

## 📂 File Structure
* `index.html` / `App.js`: The Revenue Pulse visual dashboard.
* `apex_orchestrator.py`: The Python background worker (The Radar).
* `schema.sql`: The database structure for the `radar_targets` table.

## 🚀 Setup Instructions
1.  **Database:** Run the SQL scripts in the Supabase SQL Editor to build the `radar_targets` table.
2.  **Environment Variables:** Configure the following secrets in your deployment environment (Vercel/GitHub):
    * `SUPABASE_URL`: Your project endpoint.
    * `SUPABASE_ANON_KEY`: Your project's anonymous public key.
3.  **The Radar:** Deploy the Python script to Replit or a VPS to run on a 15-minute cron cycle.

## 📊 The Ali Protocol (Business Logic)
1.  **HUNT:** Identify wind speeds > 60mph or severe hail alerts.
2.  **TARGET:** Isolate commercial warehouses via zoning/GPS cross-reference.
3.  **FORGE:** Trigger Claude to generate a 2-page customized damage assessment.
4.  **DEPLOY:** Dispatch the payload to affiliate partners for contract closing.

---
**Property of Empire AI. Fully Automated. Built for Speed.**
