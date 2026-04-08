# Data Gaps & Action Items

**Project:** Terreatek Landslide Assessment  
**Date:** 2026-04-08  

---

## Critical Data Gaps

### GAP 1: InSAR for Juiz de Fora AOI (CRITICAL)

**Current State:** Existing InSAR products are for Sikkim, India (6 sites). No InSAR processed for Brazil AOI.

**Required:**
- Sentinel-1 SAR data for Juiz de Fora area
- Processing: PS-InSAR + SBAS
- Time period: minimum 2 years pre-event
- Products: LOS velocity, displacement time series, STL decomposition, baseline pairs

**Tools:** ISCE2, StaMPS, MintPy, or SNAP/SNAPHU pipeline

**AOI Coordinates:** ~-21.76S, -43.35W (Juiz de Fora, MG)

**Note:** C-band may decorrelate in vegetated tropical terrain. SBAS will be more useful than PS. Consider ALOS-2 L-band as backup.

---

### GAP 2: Rainfall Data (HIGH PRIORITY)

**Current State:** No rainfall data collected.

**Required:**
- Hourly rainfall for the AOI
- Pre-event period: at least 30 days before the landslide event
- Historical context: monthly/annual totals for baseline

**Sources (via Google Earth Engine):**
- **ERA5-Land Hourly** (preferred for temporal resolution): 0.1 degree, hourly, near-real-time
- **CHIRPS** (preferred for spatial resolution): 0.05 degree, daily (pentadal for sub-daily)
- **GPM IMERG** (alternative): 0.1 degree, half-hourly

**GEE Script needed:** Extract time series for AOI, compute cumulative rainfall, intensity analysis

---

### GAP 3: Planet Post-Event Imagery (HIGH PRIORITY)

**Current State:** No post-event satellite imagery analyzed.

**Required:**
- Post-event high-resolution imagery (3-5m) from Planet
- Pre-event imagery for change detection
- Coverage of surrounding area to check for additional landslides

**Access:** Planet Explorer or Planet API
- PlanetScope: 3-5m daily coverage
- SkySat: 0.5m (if available for the area)

---

### GAP 4: KML Borehole Coordinates (LOW PRIORITY)

**Current State:** KML file has empty coordinates for borehole locations.

**Required:** Digitize borehole positions from:
- AutoCAD DWG file (has engineering survey coordinates)
- Or manually from orthophoto (ECW file)
- Convert to WGS84 for integration with InSAR/satellite data

---

## Action Item Tracker

| # | Action | Owner | Priority | Status | Deliverable |
|---|--------|-------|----------|--------|-------------|
| 1 | Process Sentinel-1 InSAR for JdF AOI | GeoClaw | CRITICAL | Not Started | Velocity map + time series |
| 2 | Write GEE script for ERA5 hourly rainfall | GeoClaw | HIGH | Not Started | Python/JS script + rainfall CSV |
| 3 | Write GEE script for CHIRPS rainfall | GeoClaw | HIGH | Not Started | Python/JS script + rainfall CSV |
| 4 | Query Planet for post-event imagery | GeoClaw | HIGH | Not Started | Image tiles + change map |
| 5 | Python SPT visualization script | GeoClaw | MEDIUM | Not Started | Borehole cross-section plots |
| 6 | Extract borehole coords from DWG | GeoClaw | LOW | Not Started | Updated KML/shapefile |
| 7 | Draft client report (skeleton) | GeoClaw | MEDIUM | Not Started | Word/PDF report template |
| 8 | Slope stability calculation | Terreatek | MEDIUM | Pending Data | Factor of safety assessment |

---

*Generated: 2026-04-08 | GeoClaw Research Assistant*
