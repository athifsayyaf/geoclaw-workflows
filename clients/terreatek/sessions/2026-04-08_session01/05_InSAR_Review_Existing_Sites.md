# InSAR Products Review - Existing Sites (Sikkim, India)

**Purpose:** Review existing InSAR products as methodology reference for Juiz de Fora processing  
**Date:** 2026-04-08  

---

## Overview

Six sites have been processed with InSAR (PS + SBAS methods). All are located in Sikkim, India (~28.0N, 88.6E). These serve as methodology examples for the Terreatek deliverable.

### Sites Processed

| Site | Location (approx.) | Products | Data Size |
|------|-------------------|----------|-----------|
| Gonpatang | 28.0N, 88.6E | 7 standard products | 105 MB |
| Jhepi | Sikkim, India | 7 standard products | 119 MB |
| Kerang | Sikkim, India | 7 standard products | 140 MB |
| Mamring | Sikkim, India | 7 standard products | 173 MB |
| Yumesodong | Sikkim, India | 7 standard products | 115 MB |
| Chakung | Sikkim, India | 1 product (STL only) | 1 MB |

### Standard Product Suite (per site)

1. **Baseline_Pairs.png** - SAR image pair network used for interferogram generation
2. **PS_LOS_Velocity.png** - Persistent Scatterer LOS velocity map (mm/year)
3. **PS_LOS_STL_Decompose.png** - PS displacement STL decomposition (trend + seasonal)
4. **SBAS_LOS_Velocity.png** - Small Baseline Subset LOS velocity map (mm/year)
5. **SBAS_LOS_Displacement_STL_2021.png** - SBAS displacement STL decomposition
6. **disp_ps.png** - Full PS displacement map (high resolution, 55-99 MB)
7. **displaceme_tr_sbas.png** - Full SBAS displacement map (high resolution, 31-66 MB)

---

## Site-by-Site Analysis

### Gonpatang

**PS LOS Velocity:**
- Velocity range: -40 to +40 mm/year
- Generally stable (green/yellow dominant)
- Isolated areas of subsidence (blue spots)
- POI marked with red X at ~28.0N, 88.6E

**PS STL Decomposition (2022):**
- Trend: Slight positive (uplift?) ~+15mm over 2020-2025
- Seasonal: Clear annual cycle, ~5mm amplitude
- Overall: Relatively stable site

**SBAS LOS Velocity:**
- Velocity range: -20 to +20 mm/year (lower range than PS)
- Better spatial coverage than PS
- More distributed displacement field visible

**SBAS STL Decomposition (2021):**
- Similar trend to PS but smoother
- Confirms slight positive trend
- Seasonal amplitude ~5mm

**Baseline Pairs:**
- Dense temporal network from ~2019 to 2025
- Seasonal gaps visible (likely snow/ice decorrelation)
- Good connectivity for both PS and SBAS processing

### Mamring (Most Relevant for Landslide Context)

**PS STL Decomposition (2022):**
- **Strong displacement signal detected**
- Cumulative displacement: ~60mm (0 to -20mm, peak at +60mm mid-2021)
- Sharp increase 2020-2021, then decline 2022-2025
- Returns to near-baseline by 2024
- Seasonal amplitude: ~20mm (much larger than Gonpatang)
- **This pattern is characteristic of rainfall-triggered creep movement**

**Interpretation:**
- The large seasonal amplitude suggests strong coupling with monsoon rainfall
- The multi-year trend (rise then fall) could indicate:
  - A specific event/loading in 2021 followed by consolidation
  - Or a change in drainage/land use
- This site is the best analogue for the Juiz de Fora analysis

---

## Relevance to Juiz de Fora Processing

### What to Expect (Differences)

| Factor | Sikkim (existing) | Juiz de Fora (planned) |
|--------|------------------|----------------------|
| Climate | Himalayan monsoon | Tropical (Aw/Cwa) |
| Terrain | Mountain slopes | Urban hillside |
| Vegetation | Mixed forest/agriculture | Dense tropical + urban |
| PS density | Moderate | Likely higher (more buildings) |
| SBAS coverage | Good | May decorrelate in vegetation |
| Seasonal signal | Monsoon-driven | Wet season Oct-Mar |
| Baseline | Sentinel-1 C-band | Same (Sentinel-1 C-band) |

### Processing Recommendations for Juiz de Fora

1. **Use both PS and SBAS** - PS for urban/road areas, SBAS for hillslopes
2. **STL decomposition is essential** - to separate seasonal from trend
3. **Expect smaller seasonal amplitude** than Sikkim (less extreme rainfall variation)
4. **Focus PS points on road corridor** - where boreholes are located
5. **SBAS critical for fill slopes** - where vegetation limits PS
6. **Consider atmospheric correction** - tropical moisture can cause phase delays
7. **Minimum 2-year time series** - to establish baseline trend before event

---

*Generated: 2026-04-08 | GeoClaw Research Assistant*
