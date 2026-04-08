# Terreatek / Engesis - Landslide Assessment Project

**Client:** Terreatek / Engesis Tecnologia (www.engesistecnologia.com.br)  
**Site:** Alameda Eng. Gentil Forn, Jardim Gloria, Juiz de Fora, MG, Brazil  
**Coordinates:** ~-21.76S, -43.35W  
**Started:** 2026-04-08  
**Status:** In Progress - Data Collection Phase  

---

## Project Summary

GeoClaw is delivering a remote sensing + geotechnical assessment for a landslide event. The deliverable integrates InSAR displacement analysis, rainfall data, post-event satellite imagery, and SPT borehole data to explain why the failure occurred.

**Approach:** Analytical/descriptive (NOT ML-based - single scene, insufficient data for training).

---

## Session Log

| Date | Session | Key Outputs | Status |
|------|---------|-------------|--------|
| 2026-04-08 | [Session 01](sessions/2026-04-08_session01/) | Project assessment, SPT analysis, failure hypothesis, report structure, data gaps identified | Complete |

---

## Data Status Tracker

| Data | Status | Priority | Notes |
|------|--------|----------|-------|
| SPT Borehole Data (14 holes) | HAVE | - | Translated report available |
| AutoCAD Design (DWG) | HAVE | - | 279 MB road surface design |
| Orthophoto (ECW) | HAVE | - | Area 06 |
| Landslide Points (KMZ) | HAVE | - | Event locations |
| InSAR for Juiz de Fora | MISSING | CRITICAL | Need to process Sentinel-1 |
| Hourly Rainfall | MISSING | HIGH | ERA5/CHIRPS via GEE |
| Planet Post-Event Imagery | MISSING | HIGH | Check for additional landslides |
| Borehole KML Coordinates | INCOMPLETE | LOW | KML has empty coords |

---

## Key Findings (Session 01)

1. **3-layer soil profile:** Soft fill (N=2-5) → Residual soil → Rock decomposition
2. **Failure mechanism:** Translational slide along fill-residual soil interface, triggered by intense rainfall
3. **Critical gap:** No InSAR processed for Brazil AOI (existing products are Sikkim, India examples)
4. **Risk level:** HIGH - soft fill on steep slopes with seasonal rainfall
5. **SP13 anomaly:** 20.08m to rock = buried valley, potential preferential flow path

---

## Next Steps

- [ ] Process Sentinel-1 InSAR for Juiz de Fora AOI
- [ ] Write GEE script for ERA5/CHIRPS hourly rainfall
- [ ] Query Planet for post-event imagery
- [ ] Create SPT borehole visualization (Python cross-sections)
- [ ] Draft client report
- [ ] Fix borehole KML coordinates from DWG/orthophoto

---

## Local Data Location

`D:\The_worker\Geo_claw_company\Clients\Terreatek\`
