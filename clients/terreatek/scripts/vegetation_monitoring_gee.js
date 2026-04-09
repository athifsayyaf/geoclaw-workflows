// ============================================================================
// GeoClaw - Terreatek Vegetation Monitoring (10-Year)
// Google Earth Engine Script - Sentinel-2
// ============================================================================
// Site:      Terreatek AOI, Santa Catarina, Brazil
// Center:    -48.682521 lon, -26.634742 lat
// Buffer:    10 km radius
// Period:    2016-2026 (Sentinel-2 available from mid-2015)
// Event:     Landslide on February 23, 2026
// Indices:   NDVI, EVI, NDMI, SAVI, BSI
// ============================================================================
// HOW TO USE:
//   1. Open https://code.earthengine.google.com/
//   2. Paste this entire script
//   3. Click "Run"
//   4. Charts in Console (bottom-right)
//   5. Map layers in Map panel (toggle in Layers)
//   6. CSV/GeoTIFF exports in Tasks tab (top-right) - click RUN
// ============================================================================


// =====================
// 0. CONFIGURATION
// =====================

var site = ee.Geometry.Point([-48.682521, -26.634742]);
var BUFFER_RADIUS = 10000; // 10 km
var aoi = site.buffer(BUFFER_RADIUS);

var LANDSLIDE_DATE = '2026-02-23';
var START_DATE = '2016-01-01';
var END_DATE   = '2026-04-01';

// Cloud masking threshold
var CLOUD_THRESH = 20; // max cloud cover percentage per scene

// Colors
var RED    = '#E74C3C';
var GREEN  = '#27AE60';
var BLUE   = '#3498DB';
var ORANGE = '#E67E22';
var PURPLE = '#8E44AD';
var GRAY   = '#95A5A6';
var DARK   = '#2C3E50';

Map.centerObject(aoi, 12);
Map.addLayer(aoi, {color: '0000FF'}, 'AOI (10km buffer)');
Map.addLayer(site, {color: RED}, 'Landslide Point');

print('===============================================');
print('  GEOCLAW VEGETATION MONITORING - SENTINEL-2');
print('  10km buffer | 10 years (2016-2026)');
print('  Landslide: ' + LANDSLIDE_DATE);
print('===============================================');


// =====================
// 1. SENTINEL-2 DATA LOADING & CLOUD MASKING
// =====================

// Cloud mask function using QA60 band + SCL (Scene Classification)
function maskS2clouds(image) {
  var qa = image.select('QA60');
  // Bits 10 and 11 are clouds and cirrus
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Also use SCL if available (S2 L2A)
  var scl = image.select('SCL');
  var sclMask = scl.neq(3)  // cloud shadow
    .and(scl.neq(8))        // cloud medium probability
    .and(scl.neq(9))        // cloud high probability
    .and(scl.neq(10))       // thin cirrus
    .and(scl.neq(11));      // snow/ice

  return image.updateMask(mask).updateMask(sclMask)
    .divide(10000) // Scale reflectance to 0-1
    .copyProperties(image, ['system:time_start', 'CLOUDY_PIXEL_PERCENTAGE']);
}

// Load Sentinel-2 Level-2A (Surface Reflectance)
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate(START_DATE, END_DATE)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', CLOUD_THRESH))
  .map(maskS2clouds);

print('Total Sentinel-2 scenes after cloud filter:', s2.size());


// =====================
// 2. VEGETATION INDEX CALCULATIONS
// =====================

function addIndices(image) {
  // NDVI = (NIR - Red) / (NIR + Red)
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

  // EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
  var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'BLUE': image.select('B2')
    }).rename('EVI');

  // NDMI (Normalized Difference Moisture Index) = (NIR - SWIR) / (NIR + SWIR)
  // Sensitive to vegetation water content - drops before/during landslides
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');

  // SAVI (Soil Adjusted Vegetation Index) = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
  // L = 0.5 (standard), better than NDVI in sparse vegetation / exposed soil
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
      'NIR': image.select('B8'),
      'RED': image.select('B4')
    }).rename('SAVI');

  // BSI (Bare Soil Index) = ((SWIR + Red) - (NIR + Blue)) / ((SWIR + Red) + (NIR + Blue))
  // Increases where vegetation is removed (landslide scars, deforestation)
  var bsi = image.expression(
    '((SWIR + RED) - (NIR + BLUE)) / ((SWIR + RED) + (NIR + BLUE))', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'BLUE': image.select('B2'),
      'SWIR': image.select('B11')
    }).rename('BSI');

  return image.addBands([ndvi, evi, ndmi, savi, bsi]);
}

var s2_indices = s2.map(addIndices);


// =====================
// 3. MONTHLY COMPOSITES (10-year time series)
// =====================

// Create monthly median composites for smoother time series
var years = ee.List.sequence(2016, 2026);
var monthList = ee.List.sequence(1, 12);

var monthlyComposites = ee.ImageCollection(years.map(function(y) {
  return monthList.map(function(m) {
    var start = ee.Date.fromYMD(y, m, 1);
    var end = start.advance(1, 'month');
    var monthly = s2_indices.filterDate(start, end).median();
    return monthly
      .set('system:time_start', start.millis())
      .set('year', y)
      .set('month', m)
      .set('date_label', start.format('YYYY-MM'));
  });
}).flatten());

// Filter out empty composites
var monthlyValid = monthlyComposites
  .filter(ee.Filter.listContains('system:band_names', 'NDVI'));

print('Monthly composites created:', monthlyValid.size());


// =====================
// 4. CHARTS - FULL 10-YEAR TIME SERIES
// =====================

print('===============================================');
print('  10-YEAR VEGETATION TIME SERIES');
print('===============================================');

// -----------------------------------------------
// CHART 1: NDVI Monthly Time Series (10 years)
// -----------------------------------------------

var chart1_ndvi = ui.Chart.image.series({
  imageCollection: monthlyValid.select('NDVI'),
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 100
})
.setOptions({
  title: 'CHART 1: NDVI Monthly Mean (2016-2026) - 10km AOI\n' +
         'Red line = Landslide date (Feb 23, 2026)',
  hAxis: {title: 'Date', gridlines: {count: 20}},
  vAxis: {title: 'NDVI', minValue: 0, maxValue: 1},
  lineWidth: 2,
  pointSize: 3,
  colors: [GREEN],
  chartArea: {width: '80%', height: '60%'},
  trendlines: {0: {type: 'linear', color: GRAY, lineWidth: 1, opacity: 0.5}}
});
print(chart1_ndvi);


// -----------------------------------------------
// CHART 2: EVI Monthly Time Series
// -----------------------------------------------

var chart2_evi = ui.Chart.image.series({
  imageCollection: monthlyValid.select('EVI'),
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 100
})
.setOptions({
  title: 'CHART 2: EVI Monthly Mean (2016-2026) - 10km AOI\n' +
         'Better than NDVI in dense tropical vegetation',
  hAxis: {title: 'Date', gridlines: {count: 20}},
  vAxis: {title: 'EVI'},
  lineWidth: 2,
  pointSize: 3,
  colors: [DARK],
  chartArea: {width: '80%', height: '60%'}
});
print(chart2_evi);


// -----------------------------------------------
// CHART 3: NDMI (Moisture) Time Series
// -----------------------------------------------

var chart3_ndmi = ui.Chart.image.series({
  imageCollection: monthlyValid.select('NDMI'),
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 100
})
.setOptions({
  title: 'CHART 3: NDMI Monthly Mean (2016-2026) - Vegetation Moisture\n' +
         'Drop in NDMI = drying / water stress before landslide',
  hAxis: {title: 'Date', gridlines: {count: 20}},
  vAxis: {title: 'NDMI'},
  lineWidth: 2,
  pointSize: 3,
  colors: [BLUE],
  chartArea: {width: '80%', height: '60%'}
});
print(chart3_ndmi);


// -----------------------------------------------
// CHART 4: BSI (Bare Soil Index) Time Series
// -----------------------------------------------

var chart4_bsi = ui.Chart.image.series({
  imageCollection: monthlyValid.select('BSI'),
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 100
})
.setOptions({
  title: 'CHART 4: BSI Monthly Mean (2016-2026) - Bare Soil Index\n' +
         'Increase = vegetation removal / landslide scar exposure',
  hAxis: {title: 'Date', gridlines: {count: 20}},
  vAxis: {title: 'BSI'},
  lineWidth: 2,
  pointSize: 3,
  colors: [ORANGE],
  chartArea: {width: '80%', height: '60%'}
});
print(chart4_bsi);


// -----------------------------------------------
// CHART 5: All Indices Together (at landslide point)
// -----------------------------------------------

var chart5_all = ui.Chart.image.series({
  imageCollection: monthlyValid.select(['NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI']),
  region: site.buffer(500), // 500m around landslide point
  reducer: ee.Reducer.mean(),
  scale: 30
})
.setOptions({
  title: 'CHART 5: All Indices at Landslide Point (500m buffer)\n' +
         'Detects local vegetation change around the failure',
  hAxis: {title: 'Date', gridlines: {count: 20}},
  vAxis: {title: 'Index Value'},
  lineWidth: 1.5,
  pointSize: 2,
  colors: [GREEN, DARK, BLUE, PURPLE, ORANGE],
  chartArea: {width: '75%', height: '55%'}
});
print(chart5_all);


// =====================
// 5. SEASONAL ANALYSIS
// =====================

print('===============================================');
print('  SEASONAL NDVI ANALYSIS');
print('===============================================');

// -----------------------------------------------
// CHART 6: NDVI by Month (Seasonal Pattern)
// -----------------------------------------------
// Average NDVI for each month across all years

var monthlyNDVI_byMonth = monthList.map(function(m) {
  var monthImgs = monthlyValid
    .filter(ee.Filter.eq('month', m))
    .select('NDVI');
  var meanVal = monthImgs.mean()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: aoi, scale: 100});
  var stdVal = monthImgs.reduce(ee.Reducer.stdDev())
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: aoi, scale: 100});
  return ee.Feature(null, {
    'month': m,
    'NDVI_mean': meanVal.get('NDVI'),
    'NDVI_std': stdVal.get('NDVI_stdDev')
  });
});

var monthlyNDVI_FC = ee.FeatureCollection(monthlyNDVI_byMonth);

var chart6_seasonal = ui.Chart.feature.byFeature({
  features: monthlyNDVI_FC,
  xProperty: 'month',
  yProperties: ['NDVI_mean']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 6: Average NDVI by Month (2016-2025 baseline)\n' +
         'Wet season (Oct-Mar) vs Dry season (Apr-Sep)',
  hAxis: {
    title: 'Month',
    ticks: [{v:1,f:'Jan'},{v:2,f:'Feb'},{v:3,f:'Mar'},{v:4,f:'Apr'},
            {v:5,f:'May'},{v:6,f:'Jun'},{v:7,f:'Jul'},{v:8,f:'Aug'},
            {v:9,f:'Sep'},{v:10,f:'Oct'},{v:11,f:'Nov'},{v:12,f:'Dec'}]
  },
  vAxis: {title: 'Mean NDVI', minValue: 0},
  colors: [GREEN],
  chartArea: {width: '70%', height: '60%'},
  bar: {groupWidth: '70%'}
});
print(chart6_seasonal);


// -----------------------------------------------
// CHART 7: Annual Mean NDVI (Year-on-Year Trend)
// -----------------------------------------------

var annualNDVI = years.map(function(y) {
  var yearImgs = monthlyValid
    .filter(ee.Filter.eq('year', y))
    .select('NDVI');
  var meanVal = yearImgs.mean()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: aoi, scale: 100});
  return ee.Feature(null, {
    'year': y,
    'annual_NDVI': meanVal.get('NDVI')
  });
});

var annualFC = ee.FeatureCollection(annualNDVI);

var chart7_annual = ui.Chart.feature.byFeature({
  features: annualFC,
  xProperty: 'year',
  yProperties: ['annual_NDVI']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 7: Annual Mean NDVI (2016-2026)\n' +
         '2026 = Landslide year - vegetation loss?',
  hAxis: {title: 'Year', format: '####'},
  vAxis: {title: 'Annual Mean NDVI', minValue: 0},
  colors: [GREEN],
  chartArea: {width: '70%', height: '60%'},
  bar: {groupWidth: '65%'}
});
print(chart7_annual);


// =====================
// 6. PRE vs POST LANDSLIDE CHANGE DETECTION
// =====================

print('===============================================');
print('  PRE vs POST LANDSLIDE CHANGE');
print('===============================================');

// Pre-event composite: Dec 2025 - Feb 15, 2026 (before landslide)
var preEvent = s2_indices
  .filterDate('2025-12-01', '2026-02-15')
  .median();

// Post-event composite: Mar 2026 (after landslide, allowing cloud clearance)
var postEvent = s2_indices
  .filterDate('2026-03-01', '2026-04-01')
  .median();

// NDVI Change
var ndviChange = postEvent.select('NDVI').subtract(preEvent.select('NDVI')).rename('NDVI_change');

// EVI Change
var eviChange = postEvent.select('EVI').subtract(preEvent.select('EVI')).rename('EVI_change');

// BSI Change
var bsiChange = postEvent.select('BSI').subtract(preEvent.select('BSI')).rename('BSI_change');

// NDMI Change
var ndmiChange = postEvent.select('NDMI').subtract(preEvent.select('NDMI')).rename('NDMI_change');

// Combine all changes
var changeStack = ndviChange.addBands(eviChange).addBands(bsiChange).addBands(ndmiChange);

// Landslide scar detection: NDVI dropped AND BSI increased
var landslideScars = ndviChange.lt(-0.15)   // NDVI dropped by >0.15
  .and(bsiChange.gt(0.05))                   // BSI increased (more bare soil)
  .selfMask()
  .rename('potential_scars');


// -----------------------------------------------
// MAP LAYERS - Change Detection
// -----------------------------------------------

// RGB composites
var rgbVis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3};
var nirVis = {bands: ['B8', 'B4', 'B3'], min: 0, max: 0.4};

Map.addLayer(preEvent, rgbVis, 'Pre-Event RGB (Dec25-Feb26)', false);
Map.addLayer(postEvent, rgbVis, 'Post-Event RGB (Mar 2026)', false);
Map.addLayer(preEvent, nirVis, 'Pre-Event NIR False Color', false);
Map.addLayer(postEvent, nirVis, 'Post-Event NIR False Color', false);

// NDVI maps
var ndviVis = {min: 0, max: 0.9, palette: ['#8B0000', '#FF4500', '#FFD700', '#ADFF2F', '#006400']};
Map.addLayer(preEvent.select('NDVI'), ndviVis, 'Pre-Event NDVI', false);
Map.addLayer(postEvent.select('NDVI'), ndviVis, 'Post-Event NDVI', false);

// Change maps
var changeVis = {min: -0.3, max: 0.3,
  palette: ['#8B0000', '#FF0000', '#FF6347', '#FFFFFF', '#90EE90', '#228B22', '#006400']};
Map.addLayer(ndviChange, changeVis, 'NDVI Change (post - pre)', true);

var bsiChangeVis = {min: -0.2, max: 0.2,
  palette: ['#006400', '#90EE90', '#FFFFFF', '#FF6347', '#8B0000']};
Map.addLayer(bsiChange, bsiChangeVis, 'BSI Change (post - pre)', false);

Map.addLayer(ndmiChange, changeVis, 'NDMI Change (post - pre)', false);

// Landslide scars
Map.addLayer(landslideScars, {palette: [RED]}, 'Potential Landslide Scars', true);


// -----------------------------------------------
// CHART 8: Pre vs Post Index Comparison (at point)
// -----------------------------------------------

var preStats = preEvent.select(['NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI'])
  .reduceRegion({reducer: ee.Reducer.mean(), geometry: site.buffer(500), scale: 30});
var postStats = postEvent.select(['NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI'])
  .reduceRegion({reducer: ee.Reducer.mean(), geometry: site.buffer(500), scale: 30});

print('Pre-event indices (at landslide point, 500m buffer):', preStats);
print('Post-event indices (at landslide point, 500m buffer):', postStats);

// Build comparison feature collection
var indices = ['NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI'];
var compFeatures = indices.map(function(idx) {
  return ee.Feature(null, {
    'index': idx,
    'Pre-Event': preStats.get(idx),
    'Post-Event': postStats.get(idx)
  });
});
var compFC = ee.FeatureCollection(compFeatures);

var chart8_comparison = ui.Chart.feature.byFeature({
  features: compFC,
  xProperty: 'index',
  yProperties: ['Pre-Event', 'Post-Event']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 8: Vegetation Indices - Pre vs Post Landslide\n' +
         'At landslide point (500m buffer)',
  hAxis: {title: 'Index'},
  vAxis: {title: 'Value'},
  colors: [GREEN, RED],
  chartArea: {width: '65%', height: '60%'},
  bar: {groupWidth: '60%'}
});
print(chart8_comparison);


// =====================
// 7. LONG-TERM NDVI ANOMALY MAP
// =====================

print('===============================================');
print('  NDVI ANOMALY MAPS');
print('===============================================');

// 10-year Feb NDVI baseline (2016-2025)
var febBaseline = ee.ImageCollection(ee.List.sequence(2016, 2025).map(function(y) {
  return s2_indices
    .filterDate(ee.Date.fromYMD(y, 2, 1), ee.Date.fromYMD(y, 3, 1))
    .select('NDVI')
    .median()
    .set('system:time_start', ee.Date.fromYMD(y, 2, 1).millis());
}));

var febMean = febBaseline.mean().rename('NDVI_feb_mean');
var febStd = febBaseline.reduce(ee.Reducer.stdDev()).rename('NDVI_feb_std');

// Feb 2026 NDVI
var feb2026 = s2_indices
  .filterDate('2026-02-01', '2026-03-01')
  .select('NDVI')
  .median()
  .rename('NDVI_feb_2026');

// Z-score anomaly: (current - mean) / std
var ndviAnomaly = feb2026.subtract(febMean).divide(febStd).rename('NDVI_zscore');

var anomalyVis = {min: -3, max: 3,
  palette: ['#8B0000', '#FF0000', '#FF6347', '#FFFFFF', '#90EE90', '#228B22', '#006400']};
Map.addLayer(ndviAnomaly, anomalyVis, 'NDVI Anomaly Z-score (Feb 2026 vs baseline)', false);
Map.addLayer(feb2026, ndviVis, 'Feb 2026 NDVI', false);
Map.addLayer(febMean, ndviVis, 'Feb Baseline NDVI (2016-2025)', false);


// =====================
// 8. EXPORTS
// =====================

print('===============================================');
print('  EXPORTS - Check Tasks tab');
print('===============================================');

// Export 1: Monthly NDVI time series as CSV
var ndviTimeSeries = monthlyValid.select('NDVI').map(function(img) {
  var stats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 100,
    bestEffort: true
  });
  var pointStats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: site.buffer(500),
    scale: 30,
    bestEffort: true
  });
  return ee.Feature(null, {
    'date': ee.Date(img.get('system:time_start')).format('YYYY-MM-dd'),
    'year': img.get('year'),
    'month': img.get('month'),
    'NDVI_aoi_mean': stats.get('NDVI'),
    'NDVI_point_mean': pointStats.get('NDVI')
  });
});

Export.table.toDrive({
  collection: ee.FeatureCollection(ndviTimeSeries),
  description: 'NDVI_Monthly_TimeSeries_2016_2026',
  fileFormat: 'CSV',
  selectors: ['date', 'year', 'month', 'NDVI_aoi_mean', 'NDVI_point_mean']
});

// Export 2: All indices monthly time series
var allIndicesTS = monthlyValid.select(['NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI']).map(function(img) {
  var stats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 100,
    bestEffort: true
  });
  return ee.Feature(null, {
    'date': ee.Date(img.get('system:time_start')).format('YYYY-MM-dd'),
    'year': img.get('year'),
    'month': img.get('month'),
    'NDVI': stats.get('NDVI'),
    'EVI': stats.get('EVI'),
    'NDMI': stats.get('NDMI'),
    'SAVI': stats.get('SAVI'),
    'BSI': stats.get('BSI')
  });
});

Export.table.toDrive({
  collection: ee.FeatureCollection(allIndicesTS),
  description: 'All_Indices_Monthly_TimeSeries_2016_2026',
  fileFormat: 'CSV',
  selectors: ['date', 'year', 'month', 'NDVI', 'EVI', 'NDMI', 'SAVI', 'BSI']
});

// Export 3: Annual NDVI summary
Export.table.toDrive({
  collection: annualFC,
  description: 'Annual_NDVI_Summary_2016_2026',
  fileFormat: 'CSV',
  selectors: ['year', 'annual_NDVI']
});

// Export 4: Seasonal NDVI by month
Export.table.toDrive({
  collection: monthlyNDVI_FC,
  description: 'Seasonal_NDVI_By_Month',
  fileFormat: 'CSV',
  selectors: ['month', 'NDVI_mean', 'NDVI_std']
});

// Export 5: Pre vs Post comparison
Export.table.toDrive({
  collection: compFC,
  description: 'Pre_Post_Landslide_Index_Comparison',
  fileFormat: 'CSV',
  selectors: ['index', 'Pre-Event', 'Post-Event']
});

// Export 6: NDVI Change raster (GeoTIFF)
Export.image.toDrive({
  image: ndviChange,
  description: 'NDVI_Change_Pre_Post_Landslide',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

// Export 7: BSI Change raster
Export.image.toDrive({
  image: bsiChange,
  description: 'BSI_Change_Pre_Post_Landslide',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

// Export 8: Landslide scar detection raster
Export.image.toDrive({
  image: landslideScars.unmask(0),
  description: 'Potential_Landslide_Scars_Detection',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

// Export 9: NDVI Anomaly Z-score map
Export.image.toDrive({
  image: ndviAnomaly,
  description: 'NDVI_Anomaly_Zscore_Feb2026',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

// Export 10: Pre-event RGB composite
Export.image.toDrive({
  image: preEvent.select(['B4', 'B3', 'B2']).multiply(10000).toInt16(),
  description: 'PreEvent_RGB_Composite',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

// Export 11: Post-event RGB composite
Export.image.toDrive({
  image: postEvent.select(['B4', 'B3', 'B2']).multiply(10000).toInt16(),
  description: 'PostEvent_RGB_Composite',
  scale: 10,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

print('');
print('11 exports queued. Go to Tasks tab -> click RUN on each.');


// =====================
// 9. LEGEND
// =====================

var legend = ui.Panel({style: {position: 'bottom-left', padding: '8px 15px'}});
legend.add(ui.Label({value: 'GeoClaw - Vegetation Monitoring',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0'}}));
legend.add(ui.Label('Sentinel-2 | 10km buffer | 2016-2026'));
legend.add(ui.Label('Landslide: Feb 23, 2026'));
legend.add(ui.Label('Indices: NDVI, EVI, NDMI, SAVI, BSI'));
legend.add(ui.Label(''));
legend.add(ui.Label({value: 'NDVI Change Color Scale:',
  style: {fontWeight: 'bold', fontSize: '11px'}}));
legend.add(ui.Label('Red = Vegetation Loss | Green = Growth'));
legend.add(ui.Label({value: 'Yellow markers = Potential Scars',
  style: {color: RED}}));
Map.add(legend);


print('===============================================');
print('  SCRIPT COMPLETE');
print('  Charts: 8 (in Console)');
print('  Map layers: 14 (toggle in Layers panel)');
print('  Exports: 11 (5 CSV + 6 GeoTIFF in Tasks tab)');
print('===============================================');
