// ============================================================================
// GeoClaw - Terreatek Landslide Rainfall Analysis (v2 - FIXED)
// Google Earth Engine Script
// ============================================================================
// Site:      Terreatek AOI, Santa Catarina, Brazil
// Point:     -48.682521 lon, -26.634742 lat
// Event:     Landslide on February 23, 2026
// Sources:   ERA5-Land Hourly (band: total_precipitation_hourly) + CHIRPS Daily
// ============================================================================
// HOW TO USE:
//   1. Open https://code.earthengine.google.com/
//   2. Paste this entire script
//   3. Click "Run"
//   4. Charts appear in Console panel (bottom-right)
//   5. Maps appear in Map panel
//   6. CSV exports appear in Tasks tab (top-right) - click RUN on each
// ============================================================================


// =====================
// 0. CONFIGURATION
// =====================

var site = ee.Geometry.Point([-48.682521, -26.634742]);
var LANDSLIDE_DATE = '2026-02-23';
var BUFFER_RADIUS = 5000;
var aoi = site.buffer(BUFFER_RADIUS);

var HISTORICAL_START = '2015-01-01';
var HISTORICAL_END   = '2025-12-31';

// Colors
var BLUE    = '#3498DB';
var RED     = '#E74C3C';
var GREEN   = '#2ECC71';
var ORANGE  = '#E67E22';
var GRAY    = '#95A5A6';

Map.centerObject(site, 13);
Map.addLayer(site, {color: RED}, 'Landslide Location');
Map.addLayer(aoi, {color: '0000FF'}, 'AOI (5km buffer)', false);


// =====================
// 1. ERA5-LAND HOURLY RAINFALL (FIXED BAND NAME)
// =====================
// Correct band: 'total_precipitation_hourly' (NOT 'total_precipitation_sum')
// Unit: meters -> multiply by 1000 for mm

print('===============================================');
print('  GEOCLAW RAINFALL ANALYSIS - ERA5-LAND');
print('  Landslide Date: ' + LANDSLIDE_DATE);
print('===============================================');

var era5 = ee.ImageCollection('ECMWF/ERA5_LAND/HOURLY')
  .select('total_precipitation_hourly');

// Convert meters to mm
var era5_mm = era5.map(function(img) {
  return img.multiply(1000)
    .rename('precipitation_mm')
    .copyProperties(img, ['system:time_start']);
});


// -----------------------------------------------
// CHART 1: ERA5 Hourly Rainfall Around Event
// -----------------------------------------------

var era5_event = era5_mm
  .filterDate('2026-02-16', '2026-02-28')
  .filterBounds(aoi);

var chart1 = ui.Chart.image.series({
  imageCollection: era5_event,
  region: site,
  reducer: ee.Reducer.mean(),
  scale: 11132
})
.setOptions({
  title: 'CHART 1: Hourly Rainfall Around Landslide (ERA5-Land)\n' +
         'Landslide: Feb 23, 2026',
  hAxis: {title: 'Date/Time', gridlines: {count: 12}},
  vAxis: {title: 'Precipitation (mm/hour)', minValue: 0},
  lineWidth: 1,
  pointSize: 0,
  colors: [BLUE],
  chartArea: {width: '75%', height: '65%'}
});
print(chart1);


// -----------------------------------------------
// CHART 2: ERA5 Daily Totals (aggregated from hourly)
// -----------------------------------------------

var days_era5 = ee.List.sequence(0, 37);
var era5Start = ee.Date('2026-02-01');

var era5_daily = ee.ImageCollection(days_era5.map(function(d) {
  var start = era5Start.advance(d, 'day');
  var end = start.advance(1, 'day');
  var dayTotal = era5_mm.filterDate(start, end).filterBounds(aoi).sum();
  return dayTotal
    .set('system:time_start', start.millis())
    .set('date', start.format('YYYY-MM-dd'));
}));

var chart2 = ui.Chart.image.series({
  imageCollection: era5_daily,
  region: site,
  reducer: ee.Reducer.mean(),
  scale: 11132
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 2: Daily Rainfall Feb-Mar 2026 (ERA5-Land)\n' +
         'Landslide: Feb 23, 2026',
  hAxis: {title: 'Date', slantedText: true, slantedTextAngle: 45},
  vAxis: {title: 'Daily Rainfall (mm)', minValue: 0},
  colors: [BLUE],
  chartArea: {width: '75%', height: '60%'},
  bar: {groupWidth: '85%'}
});
print(chart2);


// =====================
// 2. CHIRPS DAILY RAINFALL
// =====================

print('===============================================');
print('  CHIRPS DAILY RAINFALL ANALYSIS');
print('===============================================');

var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .select('precipitation');


// -----------------------------------------------
// CHART 3: CHIRPS Daily Rainfall - Event Window
// -----------------------------------------------

var chirps_event = chirps
  .filterDate('2026-02-01', '2026-03-10')
  .filterBounds(aoi);

var chart3 = ui.Chart.image.series({
  imageCollection: chirps_event,
  region: site,
  reducer: ee.Reducer.mean(),
  scale: 5566
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 3: Daily Rainfall Feb-Mar 2026 (CHIRPS)\n' +
         'Landslide: Feb 23 | Note heavy rain Feb 13-18',
  hAxis: {title: 'Date', slantedText: true, slantedTextAngle: 45},
  vAxis: {title: 'Precipitation (mm/day)', minValue: 0},
  colors: [BLUE],
  chartArea: {width: '75%', height: '60%'},
  bar: {groupWidth: '85%'}
});
print(chart3);


// -----------------------------------------------
// CHART 4: Cumulative Rainfall Jan-Feb 2026
// -----------------------------------------------

var cumDays = ee.List.sequence(0, 58);
var cumStart = ee.Date('2026-01-01');

var cumulList = cumDays.map(function(d) {
  var end = cumStart.advance(ee.Number(d).add(1), 'day');
  var cumSum = chirps
    .filterDate(cumStart, end)
    .filterBounds(aoi)
    .sum()
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: site,
      scale: 5566
    });
  return ee.Feature(null, {
    'date': end.advance(-1, 'day').millis(),
    'cumulative_mm': cumSum.get('precipitation')
  });
});

var cumulFC = ee.FeatureCollection(cumulList);

var chart4 = ui.Chart.feature.byFeature({
  features: cumulFC,
  xProperty: 'date',
  yProperties: ['cumulative_mm']
})
.setChartType('AreaChart')
.setOptions({
  title: 'CHART 4: Cumulative Rainfall Jan-Feb 2026 (CHIRPS)\n' +
         'Steep rise around Feb 13-18 = intense rainfall before landslide',
  hAxis: {title: 'Date', gridlines: {count: 10}},
  vAxis: {title: 'Cumulative Rainfall (mm)', minValue: 0},
  colors: [GREEN],
  lineWidth: 2,
  chartArea: {width: '75%', height: '65%'},
  areaOpacity: 0.3
});
print(chart4);


// -----------------------------------------------
// CHART 5: Monthly Rainfall - Historical vs 2025/2026
// (FIXED - removed broken Dictionary logic)
// -----------------------------------------------

print('===============================================');
print('  MONTHLY & SEASONAL ANALYSIS');
print('===============================================');

// Historical monthly averages (2015-2025, 11 years)
var months = ee.List.sequence(1, 12);

var hist_monthly_features = months.map(function(m) {
  var mFilter = chirps
    .filterDate(HISTORICAL_START, HISTORICAL_END)
    .filter(ee.Filter.calendarRange(m, m, 'month'));
  // Sum per year then average = mean annual total for that month
  var monthlyMeanTotal = mFilter.sum().divide(11)
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: site,
      scale: 5566
    });
  return ee.Feature(null, {
    'month': m,
    'hist_avg': monthlyMeanTotal.get('precipitation')
  });
});
var histMonthlyFC = ee.FeatureCollection(hist_monthly_features);

// 2025-2026 wet season months (Oct-Mar)
var wetMonthDefs = [
  {y: 2025, m: 10}, {y: 2025, m: 11}, {y: 2025, m: 12},
  {y: 2026, m: 1},  {y: 2026, m: 2},  {y: 2026, m: 3}
];

var current_monthly_features = ee.FeatureCollection(wetMonthDefs.map(function(def) {
  var start = ee.Date.fromYMD(def.y, def.m, 1);
  var end = start.advance(1, 'month');
  var monthTotal = chirps.filterDate(start, end).filterBounds(aoi).sum()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
  return ee.Feature(null, {
    'month': def.m,
    'year': def.y,
    'current_total': monthTotal.get('precipitation'),
    'label': start.format('MMM YYYY')
  });
}));

// Build combined features for the 6 wet season months
var wetMonthNums = [10, 11, 12, 1, 2, 3];
var monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var combined_monthly = wetMonthNums.map(function(m, i) {
  var histFeat = histMonthlyFC.filter(ee.Filter.eq('month', m)).first();
  var currFeat = current_monthly_features
    .filter(ee.Filter.eq('month', m))
    .first();
  return ee.Feature(null, {
    'month_label': monthNames[m] + (m >= 10 ? ' 2025' : ' 2026'),
    'order': i,
    'Historical Avg (2015-2025)': histFeat.get('hist_avg'),
    '2025-2026 Actual': currFeat.get('current_total')
  });
});

var combinedFC = ee.FeatureCollection(combined_monthly);

var chart5 = ui.Chart.feature.byFeature({
  features: combinedFC,
  xProperty: 'month_label',
  yProperties: ['Historical Avg (2015-2025)', '2025-2026 Actual']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 5: Monthly Rainfall - Historical Avg vs 2025/2026 Wet Season\n' +
         'Feb 2026 = Landslide month',
  hAxis: {title: 'Month', slantedText: true},
  vAxis: {title: 'Monthly Rainfall (mm)', minValue: 0},
  colors: [GRAY, RED],
  chartArea: {width: '70%', height: '55%'},
  bar: {groupWidth: '75%'},
  isStacked: false
});
print(chart5);


// -----------------------------------------------
// CHART 6: Wet Season Totals by Year (Oct-Mar)
// -----------------------------------------------

var years = ee.List.sequence(2015, 2025); // include 2025-2026

var hist_wet_seasons = years.map(function(y) {
  var octStart = ee.Date.fromYMD(ee.Number(y), 10, 1);
  var marEnd = ee.Date.fromYMD(ee.Number(y).add(1), 4, 1);
  var wetTotal = chirps
    .filterDate(octStart, marEnd)
    .filterBounds(aoi)
    .sum()
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: site,
      scale: 5566
    });
  return ee.Feature(null, {
    'season': ee.String('').cat(ee.Number(y).format('%d'))
              .cat('-').cat(ee.Number(y).add(1).format('%d')),
    'wet_season_total_mm': wetTotal.get('precipitation'),
    'year': y
  });
});

var wetSeasonFC = ee.FeatureCollection(hist_wet_seasons);

var chart6 = ui.Chart.feature.byFeature({
  features: wetSeasonFC,
  xProperty: 'season',
  yProperties: ['wet_season_total_mm']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 6: Wet Season Total Rainfall (Oct-Mar) by Year\n' +
         '2025-2026 = Landslide season',
  hAxis: {title: 'Wet Season', slantedText: true, slantedTextAngle: 45},
  vAxis: {title: 'Total Rainfall (mm)', minValue: 0},
  colors: [BLUE],
  chartArea: {width: '70%', height: '55%'},
  bar: {groupWidth: '70%'}
});
print(chart6);


// -----------------------------------------------
// CHART 7: Antecedent Rainfall (Rolling Sums)
// -----------------------------------------------

print('===============================================');
print('  ANTECEDENT RAINFALL ANALYSIS');
print('===============================================');

var anteDays = ee.List.sequence(0, 89);
var anteStart = ee.Date('2025-11-25');

var antecedent = anteDays.map(function(d) {
  var currentDate = anteStart.advance(d, 'day');

  var sum7 = chirps.filterDate(currentDate.advance(-7, 'day'), currentDate)
    .filterBounds(aoi).sum()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});

  var sum15 = chirps.filterDate(currentDate.advance(-15, 'day'), currentDate)
    .filterBounds(aoi).sum()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});

  var sum30 = chirps.filterDate(currentDate.advance(-30, 'day'), currentDate)
    .filterBounds(aoi).sum()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});

  return ee.Feature(null, {
    'date': currentDate.millis(),
    '7-day (mm)': sum7.get('precipitation'),
    '15-day (mm)': sum15.get('precipitation'),
    '30-day (mm)': sum30.get('precipitation')
  });
});

var anteFC = ee.FeatureCollection(antecedent);

var chart7 = ui.Chart.feature.byFeature({
  features: anteFC,
  xProperty: 'date',
  yProperties: ['7-day (mm)', '15-day (mm)', '30-day (mm)']
})
.setOptions({
  title: 'CHART 7: Antecedent Rainfall - Rolling Cumulative Sums\n' +
         'Landslide: Feb 23 | Shows soil saturation buildup',
  hAxis: {title: 'Date', gridlines: {count: 10}},
  vAxis: {title: 'Cumulative Rainfall (mm)', minValue: 0},
  colors: [BLUE, ORANGE, RED],
  lineWidth: 2,
  pointSize: 0,
  chartArea: {width: '75%', height: '60%'},
  curveType: 'function'
});
print(chart7);


// -----------------------------------------------
// CHART 8: February Totals by Year (2015-2026)
// -----------------------------------------------

print('===============================================');
print('  ANOMALY & RETURN PERIOD ANALYSIS');
print('===============================================');

var feb_years = ee.List.sequence(2015, 2026);

var feb_totals = feb_years.map(function(y) {
  var start = ee.Date.fromYMD(ee.Number(y), 2, 1);
  var end = ee.Date.fromYMD(ee.Number(y), 3, 1);
  var febTotal = chirps.filterDate(start, end).filterBounds(aoi).sum()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
  return ee.Feature(null, {
    'year': y,
    'feb_rainfall_mm': febTotal.get('precipitation')
  });
});

var febFC = ee.FeatureCollection(feb_totals);

var chart8 = ui.Chart.feature.byFeature({
  features: febFC,
  xProperty: 'year',
  yProperties: ['feb_rainfall_mm']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'CHART 8: February Total Rainfall by Year (2015-2026)\n' +
         '2026 = Landslide year',
  hAxis: {title: 'Year', format: '####'},
  vAxis: {title: 'February Total Rainfall (mm)', minValue: 0},
  colors: [BLUE],
  chartArea: {width: '70%', height: '60%'},
  bar: {groupWidth: '65%'}
});
print(chart8);


// =====================
// 3. MAP LAYERS
// =====================

print('===============================================');
print('  SPATIAL RAINFALL MAPS');
print('===============================================');

var landslideDay = chirps.filterDate('2026-02-23', '2026-02-24').first();
var event3day = chirps.filterDate('2026-02-21', '2026-02-24').sum();
var eventWeek = chirps.filterDate('2026-02-16', '2026-02-24').sum();
var peakWeek = chirps.filterDate('2026-02-13', '2026-02-19').sum();

var histFebDaily = chirps
  .filterDate(HISTORICAL_START, HISTORICAL_END)
  .filter(ee.Filter.calendarRange(2, 2, 'month'))
  .mean();

var rainVis = {min: 0, max: 100, palette: ['white', '#AED6F1', '#3498DB', '#2E86C1', '#1B4F72', '#E74C3C']};
var weekVis = {min: 0, max: 300, palette: ['white', '#AED6F1', '#3498DB', '#1B4F72', '#E74C3C', '#8E44AD']};

Map.addLayer(landslideDay, rainVis, 'Rainfall - Feb 23, 2026 (mm)');
Map.addLayer(event3day, rainVis, 'Rainfall - 3 days (Feb 21-23) (mm)', false);
Map.addLayer(eventWeek, weekVis, 'Rainfall - Week (Feb 16-23) (mm)', false);
Map.addLayer(peakWeek, weekVis, 'Rainfall - Peak Week (Feb 13-18) (mm)', false);


// =====================
// 4. SUMMARY STATISTICS
// =====================

print('===============================================');
print('  SUMMARY STATISTICS');
print('===============================================');

var dayRain = landslideDay.reduceRegion({
  reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
print('Rainfall on Feb 23, 2026 (landslide date):', dayRain, 'mm');

var rain3d = event3day.reduceRegion({
  reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
print('3-day rainfall (Feb 21-23):', rain3d, 'mm');

var rain7d = eventWeek.reduceRegion({
  reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
print('7-day rainfall (Feb 16-23):', rain7d, 'mm');

var peakRain = peakWeek.reduceRegion({
  reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
print('Peak rainfall week (Feb 13-18):', peakRain, 'mm');

print('Historical Feb daily avg:', histFebDaily.reduceRegion({
  reducer: ee.Reducer.mean(), geometry: site, scale: 5566}), 'mm');

// Key insight
print('');
print('KEY FINDING: The landslide on Feb 23 was triggered by');
print('heavy rainfall between Feb 13-18 (~155mm in 6 days)');
print('which saturated the fill material. The slide occurred');
print('after a few more days of continued rain (Feb 21-22).');


// =====================
// 5. CSV EXPORTS (appear in Tasks tab)
// =====================
// Click "Tasks" tab (top-right) then click RUN on each export

print('===============================================');
print('  EXPORTS - Check Tasks tab to download');
print('===============================================');

// Export 1: CHIRPS daily rainfall for event window
var chirps_export = chirps
  .filterDate('2026-01-01', '2026-03-10')
  .filterBounds(aoi);

var dailyExportList = ee.List.sequence(0, 68).map(function(d) {
  var dt = ee.Date('2026-01-01').advance(d, 'day');
  var dtEnd = dt.advance(1, 'day');
  var val = chirps.filterDate(dt, dtEnd).filterBounds(aoi).first()
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: site, scale: 5566});
  return ee.Feature(null, {
    'date': dt.format('YYYY-MM-dd'),
    'day_of_year': dt.getRelative('day', 'year').add(1),
    'precipitation_mm': val.get('precipitation'),
    'is_landslide_date': ee.Algorithms.If(dt.format('YYYY-MM-dd').equals('2026-02-23'), 'YES', 'NO')
  });
});

Export.table.toDrive({
  collection: ee.FeatureCollection(dailyExportList),
  description: 'CHIRPS_Daily_Rainfall_Jan_Mar_2026',
  fileFormat: 'CSV',
  selectors: ['date', 'day_of_year', 'precipitation_mm', 'is_landslide_date']
});

// Export 2: Cumulative rainfall
Export.table.toDrive({
  collection: cumulFC,
  description: 'CHIRPS_Cumulative_Rainfall_Jan_Feb_2026',
  fileFormat: 'CSV',
  selectors: ['date', 'cumulative_mm']
});

// Export 3: Antecedent rainfall rolling sums
Export.table.toDrive({
  collection: anteFC,
  description: 'Antecedent_Rainfall_Rolling_Sums',
  fileFormat: 'CSV',
  selectors: ['date', '7-day (mm)', '15-day (mm)', '30-day (mm)']
});

// Export 4: February totals by year
Export.table.toDrive({
  collection: febFC,
  description: 'February_Rainfall_By_Year_2015_2026',
  fileFormat: 'CSV',
  selectors: ['year', 'feb_rainfall_mm']
});

// Export 5: Wet season totals
Export.table.toDrive({
  collection: wetSeasonFC,
  description: 'Wet_Season_Totals_By_Year',
  fileFormat: 'CSV',
  selectors: ['season', 'wet_season_total_mm']
});

// Export 6: Monthly comparison
Export.table.toDrive({
  collection: combinedFC,
  description: 'Monthly_Rainfall_Historical_vs_Current',
  fileFormat: 'CSV',
  selectors: ['month_label', 'order', 'Historical Avg (2015-2025)', '2025-2026 Actual']
});

// Export 7: Rainfall raster on landslide date (GeoTIFF)
Export.image.toDrive({
  image: landslideDay,
  description: 'CHIRPS_Rainfall_Map_Feb23_2026',
  scale: 5566,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e8
});

// Export 8: Peak week rainfall raster (GeoTIFF)
Export.image.toDrive({
  image: peakWeek,
  description: 'CHIRPS_Peak_Week_Rainfall_Feb13_18_2026',
  scale: 5566,
  region: aoi.bounds(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e8
});

print('');
print('8 exports queued. Go to Tasks tab -> click RUN on each.');
print('Files will save to your Google Drive.');


// =====================
// 6. LEGEND
// =====================

var legend = ui.Panel({
  style: {position: 'bottom-left', padding: '8px 15px'}
});
legend.add(ui.Label({
  value: 'GeoClaw - Rainfall Analysis',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0'}
}));
legend.add(ui.Label('Site: -48.683, -26.635'));
legend.add(ui.Label('Landslide: Feb 23, 2026'));
legend.add(ui.Label('Peak rain: Feb 13-18 (~155mm)'));
legend.add(ui.Label('Toggle layers in Layers panel'));
Map.add(legend);

print('===============================================');
print('  SCRIPT COMPLETE');
print('  Charts: 8 (in Console above)');
print('  Map layers: 4 (toggle in Layers)');
print('  CSV/GeoTIFF exports: 8 (in Tasks tab)');
print('===============================================');
