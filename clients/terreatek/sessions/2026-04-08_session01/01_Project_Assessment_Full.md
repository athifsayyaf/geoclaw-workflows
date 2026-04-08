# GeoClaw - Terreatek Landslide Assessment: Project Assessment Report

**Prepared by:** GeoClaw (Research Assistant Output)  
**Date:** 2026-04-08  
**Project:** Landslide Analysis - Alameda Eng. Gentil Forn, Juiz de Fora, MG, Brazil  
**Client:** Terreatek / Engesis Tecnologia  

---

## 1. Project Overview

GeoClaw has been engaged by Terreatek (Engesis group) to deliver a geospatial product supporting their geotechnical expertise for a landslide event at Alameda Engenheiro Gentil Forn, Jardim Gloria neighborhood, Juiz de Fora, Minas Gerais, Brazil.

The deliverable integrates:
- InSAR (Interferometric Synthetic Aperture Radar) displacement analysis
- Rainfall data analysis (hourly, from CHIRPS or ERA5 via Google Earth Engine)
- Post-event satellite imagery analysis (Planet) for additional landslide identification
- Geotechnical data interpretation (SPT borehole data)

**Important Note:** This is a single-scene analysis. ML-based InSAR/rainfall modeling is NOT feasible with this dataset. The approach is analytical/descriptive, building a causal understanding of the failure mechanism.

---

## 2. Available Datasets Inventory

### 2.1 Datasets In-Hand

| Dataset | Format | Size | Description |
|---------|--------|------|-------------|
| SPT Boring Report #004/26 | PDF (PT + EN) | ~3 MB | 14 boreholes, 102.24m total drilled length |
| AutoCAD Road Surface Design | DWG | 279 MB | Eng. Gentil Forn area engineering design |
| Digital Orthophoto Mosaic | ECW | 44.5 MB | Area 06 high-resolution raster |
| Borehole Survey Points | KML | 1.5 KB | FUROS GENTIL FORN - 2nd Phase (coordinates empty) |
| Landslide Point Locations | KMZ | 793 bytes | Landslide event locations |
| Site Video | MP4 | 30.5 MB | Morro do Cristo footage |
| Reference InSAR Products | PNG | 652 MB | 6 sites from Sikkim, India (methodology examples) |
| Remote Sensing Datasheet | PDF | 1.2 MB | Engesis/Terratek capabilities document |
| News Articles | PDF | ~4 MB | Brazil floods/landslides context articles |

### 2.2 Datasets Needed

| Dataset | Source | Status | Priority |
|---------|--------|--------|----------|
| InSAR for Juiz de Fora AOI | Sentinel-1 processing | **NOT PROCESSED** | CRITICAL |
| Hourly Rainfall | CHIRPS or ERA5 via GEE | **NOT COLLECTED** | HIGH |
| Post-Event Planet Imagery | Planet Explorer API | **NOT COLLECTED** | HIGH |
| Pre-Event Planet Imagery | Planet Explorer API | **NOT COLLECTED** | MEDIUM |

### 2.3 Critical Data Gap

The 6 existing InSAR folders (Gonpatang, Jhepi, Kerang, Mamring, Yumesodong, Chakung) contain InSAR results for **Sikkim, India** (coordinates ~28.0N, 88.6E), NOT for the Juiz de Fora, Brazil AOI. These serve as methodology examples but **new InSAR processing is required for the actual project site.**

---

## 3. Geotechnical Analysis (SPT Report Interpretation)

### 3.1 Investigation Summary

- **Client:** ENGEDRAIN CONSTRUCOES LTDA
- **Contractor:** GFM2 Empreendimentos Imobiliarios LTDA
- **Location:** Alameda Eng. Gentil Forn, Jardim Gloria, Juiz de Fora, MG
- **Date:** March 2026 (Phase 1)
- **Standards:** NBR-6484 (SPT) and NBR-6502 (Soil Classification)
- **Equipment:** 2.5" casing, 35/51mm sampler, 65kg hammer at 75cm drop
- **Total:** 14 boreholes (SP01-SP14), 102.24m combined depth

### 3.2 Subsurface Stratigraphy (3-Layer Model)

#### Layer 1: FILL MATERIAL (0 to 2-5m depth)
- **Composition:** Heterogeneous silty clay to sandy clay, yellow-brown with occasional gravel/rubble
- **Consistency:** Very soft to soft
- **N(SPT):** 2-12 (mostly 2-5)
- **Present in:** Most boreholes except SP04 (road) and SP14 (natural ground)
- **CRITICAL:** This is the primary weak layer driving landslide susceptibility

#### Layer 2: RESIDUAL SOIL / SAPROLITE (variable depth)
- **Composition:** Clayey silt to silty clay, predominantly yellow to vermilion (reddish)
- **Weathering:** Lateritic weathering profile
- **Consistency:** Medium to hard
- **N(SPT):** 4-32
- **Thickness:** Varies significantly across the site

#### Layer 3: ROCK DECOMPOSITION SOIL (base of all boreholes)
- **Composition:** Very sandy silt, dark gray with yellow/white veins
- **Origin:** Highly weathered gneissic/granitic rock (saprolite/saprock)
- **N(SPT):** >30, impenetrable to wash boring
- **Depth range:** 1.05m (SP04, road pavement) to 20.08m (SP13)

### 3.3 Borehole Summary Table

| BH ID | Depth (m) | Termination | Water Level | Key Observation |
|-------|-----------|-------------|-------------|-----------------|
| SP01 | 6.15 | Impenetrable (wash) | Detected | Minor seepage (0.02-0.03m) |
| SP02 | 2.06 | Impenetrable (wash) | Not found | Shallow rock decomposition |
| SP03 | 5.80 | Impenetrable (wash) | Not found | Soft fill over residual |
| SP04 | 1.05 | Impenetrable (wash) | Not found | Road pavement only |
| SP05 | 7.70 | Impenetrable (wash) | Not found | Hard clayey silt at 3.9-5m |
| SP06 | 2.65 | Impenetrable (wash) | Not found | Very shallow profile |
| SP07 | 9.90 | Impenetrable (wash) | Not found | Good fill-to-rock transition |
| SP08 | 5.60 | Impenetrable (wash) | Not found | Soft fill material dominant |
| SP09 | 8.80 | Impenetrable (wash) | Detected | Minor seepage (0.01m) |
| SP10 | 4.60 | Impenetrable (wash) | Detected | Minor seepage (0.01m) |
| SP11 | 11.10 | Impenetrable (wash) | Not found | 6m casing used |
| SP12 | 5.25 | Impenetrable (wash) | Not found | Typical road corridor |
| SP13 | 20.08 | Stopped by penetration | Not found | Deepest - buried valley/pocket |
| SP14 | 11.50 | Impenetrable (wash) | Detected | Natural ground, minor seepage |

### 3.4 Groundwater Conditions

- Water detected in only **4 of 14 boreholes** (SP01, SP09, SP10, SP14)
- Very minor seepage levels (0.01-0.07m)
- Generally dry conditions indicate water table below investigated depths
- **However:** Perched water in fill material during wet seasons is highly probable
- Consistent with hillside terrain with good natural drainage under dry conditions

### 3.5 Depth to Refusal (Bedrock Topography)

| Zone | Boreholes | Depth to Rock | Interpretation |
|------|-----------|---------------|----------------|
| Shallowest | SP04 | 1.05m | Road alignment (pavement structure) |
| Along road (typical) | SP02, SP03, SP06, SP08, SP10, SP12 | 2-6m | Standard road corridor |
| Deeper zones | SP01, SP05, SP07, SP09, SP11, SP14 | 7-11m | Hillside cuts or thicker fill |
| Deepest | SP13 | 20.08m | Buried valley or deep weathering pocket |

The variation indicates **irregular bedrock topography**, typical of gneissic/granitic terrain in the Juiz de Fora region.

### 3.6 Slope Stability Risk Factors

1. **Significant fill deposits** (up to 5m thick) on hillside terrain indicate prior earthworks
2. **Very soft fill material** (N(SPT) = 2-5) overlying competent residual soil creates **potential slip surfaces**
3. **Variable depth to rock** suggests irregular bedrock - differential settlement risk
4. **SP13** (deepest at 20.08m) may indicate a buried valley or deep weathering zone - potential **preferential groundwater flow path**
5. **Low water table** is favorable but **may change seasonally** in this tropical climate region

---

## 4. InSAR Analysis Review (Existing Sikkim Products)

### 4.1 Methodology Reference (from existing 6 sites)

The existing InSAR products demonstrate GeoClaw's processing capability using two complementary methods:

**Persistent Scatterer (PS) InSAR:**
- Identifies stable radar reflectors (buildings, exposed rock, infrastructure)
- Provides millimetric displacement measurements
- Best for urban/built-up areas
- Products: PS LOS Velocity maps, PS displacement time series

**Small Baseline Subset (SBAS):**
- Uses distributed scatterers (soil, vegetation)
- Better spatial coverage in rural/vegetated areas
- Products: SBAS LOS Velocity maps, SBAS displacement time series

**STL Decomposition:**
- Seasonal and Trend decomposition using Loess
- Separates displacement signal into: Trend (long-term movement), Seasonal (cyclic patterns), Residual (noise)
- Critical for identifying accelerating slopes vs. seasonal thermal/moisture effects

### 4.2 Key Observations from Existing Sites

**Gonpatang (Sikkim):**
- PS LOS Velocity: Range -40 to +40 mm/year
- STL Trend: Slight positive (uplift?) trend 2020-2025 (~+15mm total)
- Seasonal component: Clear annual cycle ~5mm amplitude

**Mamring (Sikkim):**
- PS STL Decompose: **Strong subsidence signal** - ~60mm cumulative displacement (2020-2022), then reversal
- Peak displacement mid-2021, followed by apparent recovery
- Much larger seasonal amplitude (~20mm) compared to Gonpatang
- **This pattern is characteristic of rainfall-triggered creep movement**

### 4.3 Required: Juiz de Fora InSAR Processing

For the actual deliverable, new InSAR processing is needed:
- **Sensor:** Sentinel-1 (C-band, 12-day repeat)
- **AOI:** Alameda Eng. Gentil Forn and surrounding hillslopes, Juiz de Fora
- **Time period:** At minimum 2 years pre-event to capture baseline trends
- **Processing:** Both PS and SBAS methods
- **Products needed:**
  - LOS velocity map
  - Displacement time series at key points
  - STL decomposition
  - Baseline pair network plot

---

## 5. Failure Mechanism Hypothesis

### 5.1 Causal Chain (Preliminary)

Based on the available geotechnical data and regional context:

```
PREDISPOSING FACTORS:
  - Steep hillside terrain (Morro do Cristo area)
  - Thick fill deposits (2-5m) on natural slopes
  - Very soft fill material (N=2-5) over competent residual soil
  - Irregular bedrock creating preferential drainage paths
  - Buried valley at SP13 concentrating subsurface flow

TRIGGERING FACTOR:
  - Intense/prolonged rainfall event
  - (Quantification pending - needs ERA5/CHIRPS data)

FAILURE MECHANISM:
  1. Heavy rainfall infiltrates porous fill material
  2. Perched water table develops at fill-residual soil interface
  3. Pore water pressure increase reduces effective stress
  4. Shear strength at fill-residual soil contact drops below driving forces
  5. Translational slide along the fill-residual soil interface
  6. Possible retrogressive failure expanding upslope

CONTRIBUTING FACTORS:
  - Road loading (SP04 shows pavement at surface)
  - Prior earthworks may have oversteepened slopes
  - Possible inadequate drainage on fill slopes
```

### 5.2 Evidence Supporting This Hypothesis

- SPT data shows very soft fill over competent base = classic translational slide setup
- Water detected in 4 boreholes even during investigation (March = wet season in MG)
- News articles reference "21 inches (533mm) in 6 hours" rainfall events in Brazil
- Irregular rock surface creates differential drainage, concentrating pore pressures
- InSAR from analogous sites (Mamring) shows displacement patterns correlating with seasonal rainfall

### 5.3 What's Needed to Confirm

1. **Rainfall data:** Quantify the actual rainfall event (intensity, duration, cumulative)
2. **InSAR time series:** Show whether pre-event creep was occurring
3. **Planet imagery:** Confirm landslide extent and check for retrogressive features
4. **Topographic analysis:** Slope angle from DEM to assess factor of safety

---

## 6. Proposed Report Structure (Client Deliverable)

### Chapter 1: Introduction & Site Description
- Project context and objectives
- Location map and terrain description
- Land use and development history
- Morro do Cristo area context

### Chapter 2: Data & Methods
- Datasets used (satellite, geotechnical, meteorological)
- InSAR processing methodology (PS + SBAS)
- Rainfall data source and processing
- Satellite imagery analysis approach

### Chapter 3: Geotechnical Investigation Summary
- SPT borehole results and subsurface model
- 3-layer stratigraphy interpretation
- Groundwater conditions
- Slope stability risk factors from soil data

### Chapter 4: InSAR Displacement Analysis
- Pre-event velocity maps (LOS)
- Time series at key monitoring points
- STL decomposition (trend vs. seasonal)
- Spatial correlation with landslide location

### Chapter 5: Rainfall Analysis
- Hourly rainfall time series (ERA5/CHIRPS)
- Cumulative rainfall leading to the event
- Rainfall intensity-duration analysis
- Comparison with regional thresholds
- Correlation with InSAR displacement timeline

### Chapter 6: Post-Event Satellite Analysis
- Planet imagery analysis
- Landslide inventory mapping
- Other locations showing disturbance
- Change detection (pre vs. post-event)

### Chapter 7: Integrated Failure Analysis
- Causal chain: predisposing + triggering factors
- InSAR displacement + rainfall + soil profile integration
- Failure mechanism interpretation
- Limitations and uncertainties

### Chapter 8: Conclusions & Recommendations
- Key findings summary
- Monitoring recommendations
- Areas requiring further investigation
- Risk mitigation suggestions

---

## 7. Immediate Action Items

| # | Task | Tool/Platform | Priority | Status |
|---|------|---------------|----------|--------|
| 1 | Process InSAR for Juiz de Fora AOI | ISCE2/StaMPS/MintPy | CRITICAL | Not started |
| 2 | GEE script for ERA5/CHIRPS rainfall | Google Earth Engine | HIGH | Not started |
| 3 | Planet post-event imagery query | Planet Explorer API | HIGH | Not started |
| 4 | SPT data visualization (Python) | matplotlib/plotly | MEDIUM | Not started |
| 5 | Report skeleton document | Word/LaTeX | MEDIUM | Not started |
| 6 | Fix KML coordinates for boreholes | Manual/GIS | LOW | Not started |

---

## 8. Technical Notes

### 8.1 Why Not ML-Based Analysis
- Single scene / single event = insufficient training data
- ML models require multiple events across space/time to learn patterns
- Appropriate approach: analytical/descriptive with expert interpretation
- Can use statistical correlation (rainfall vs. displacement) but not predictive ML

### 8.2 InSAR Limitations for This Site
- Juiz de Fora is tropical with dense vegetation - may limit PS point density
- SBAS will be more useful than PS for vegetated hillslopes
- C-band (Sentinel-1) decorrelation in vegetated areas
- Consider L-band (ALOS-2) if C-band coverage is poor

### 8.3 Coordinate Reference
- Juiz de Fora, MG approximate center: -21.76S, -43.35W
- The KML file for boreholes has empty coordinates - need to digitize from CAD/orthophoto
- UTM Zone: 23S (EPSG:31983 - SIRGAS 2000)

---

*Report generated: 2026-04-08*  
*GeoClaw Research Assistant Output - Session 01*
