"""
Generate PDF and DOCX versions of the GeoClaw-Terreatek Project Assessment Report.
Run: python generate_pdf_docx.py
"""

import os
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent

# ============================================================
# WORD DOCUMENT (.docx)
# ============================================================
def create_docx():
    from docx import Document
    from docx.shared import Inches, Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT

    doc = Document()

    # -- Styles --
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    # -- Title Page --
    for _ in range(4):
        doc.add_paragraph()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('Landslide Assessment\nProject Assessment Report')
    run.bold = True
    run.font.size = Pt(28)
    run.font.color.rgb = RGBColor(26, 82, 118)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run('Alameda Eng. Gentil Forn, Jardim Gloria\nJuiz de Fora, Minas Gerais, Brazil')
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(41, 128, 185)

    doc.add_paragraph()

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = meta.add_run('Prepared by: GeoClaw\nClient: Terreatek / Engesis Tecnologia\nDate: 2026-04-08\nStatus: In Progress')
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    # -- Helper functions --
    def add_heading(text, level=1):
        h = doc.add_heading(text, level=level)
        for run in h.runs:
            run.font.color.rgb = RGBColor(26, 82, 118)
        return h

    def add_table(headers, rows):
        table = doc.add_table(rows=1 + len(rows), cols=len(headers))
        table.style = 'Medium Shading 1 Accent 1'
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, h in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = h
            for p in cell.paragraphs:
                for r in p.runs:
                    r.bold = True
                    r.font.size = Pt(10)
        for ri, row in enumerate(rows):
            for ci, val in enumerate(row):
                cell = table.rows[ri + 1].cells[ci]
                cell.text = str(val)
                for p in cell.paragraphs:
                    for r in p.runs:
                        r.font.size = Pt(10)
        doc.add_paragraph()
        return table

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        if bold_prefix:
            run = p.add_run(bold_prefix)
            run.bold = True
            p.add_run(text)
        else:
            p.add_run(text)

    # -- Executive Summary --
    add_heading('Executive Summary', 1)
    doc.add_paragraph(
        'GeoClaw has been engaged by Terreatek (Engesis group) to deliver a geospatial product '
        'supporting their geotechnical expertise for a landslide event at Alameda Engenheiro Gentil Forn, '
        'Jardim Gloria neighborhood, Juiz de Fora, Minas Gerais, Brazil.'
    )
    doc.add_paragraph(
        'This is a single-scene analysis. ML-based InSAR/rainfall modeling is NOT feasible with this dataset. '
        'The approach is analytical/descriptive, building a causal understanding of the failure mechanism '
        'through integration of InSAR displacement data, rainfall analysis, post-event satellite imagery, '
        'and geotechnical investigation results.'
    )

    # Key Findings
    add_heading('Key Findings', 2)
    add_bullet('14 SPT boreholes reveal a 3-layer profile: soft fill (N=2-5) over residual soil over rock decomposition')
    add_bullet('Fill layer (2-5m thick) is the CRITICAL weak layer for slope stability')
    add_bullet('Variable bedrock depth (1-20m) with SP13 at 20.08m indicating a buried valley')
    add_bullet('Water detected in 4/14 boreholes - seasonal perched water in fill is the likely trigger')
    add_bullet('Existing InSAR products are for Sikkim, India (examples only) - Juiz de Fora InSAR NOT yet processed')
    add_bullet('Failure mechanism: translational slide along fill-residual soil interface, triggered by intense rainfall')

    doc.add_page_break()

    # -- Section 1: Dataset Inventory --
    add_heading('1. Dataset Inventory', 1)

    add_heading('1.1 Datasets In-Hand', 2)
    add_table(
        ['Dataset', 'Format', 'Size', 'Description'],
        [
            ['SPT Boring Report #004/26', 'PDF', '~3 MB', '14 boreholes, 102.24m total'],
            ['AutoCAD Road Surface Design', 'DWG', '279 MB', 'Eng. Gentil Forn engineering design'],
            ['Digital Orthophoto Mosaic', 'ECW', '44.5 MB', 'Area 06 high-res raster'],
            ['Borehole Survey Points', 'KML', '1.5 KB', 'FUROS GENTIL FORN - 2nd Phase (coords empty)'],
            ['Landslide Point Locations', 'KMZ', '793 B', 'Landslide event locations'],
            ['Site Video', 'MP4', '30.5 MB', 'Morro do Cristo footage'],
            ['Reference InSAR Products', 'PNG', '652 MB', '6 sites from Sikkim, India (examples)'],
        ]
    )

    add_heading('1.2 Datasets Needed', 2)
    add_table(
        ['Dataset', 'Source', 'Priority', 'Status'],
        [
            ['InSAR for Juiz de Fora AOI', 'Sentinel-1 processing', 'CRITICAL', 'NOT PROCESSED'],
            ['Hourly Rainfall', 'ERA5/CHIRPS via GEE', 'HIGH', 'NOT COLLECTED'],
            ['Post-Event Planet Imagery', 'Planet Explorer API', 'HIGH', 'NOT COLLECTED'],
        ]
    )

    p = doc.add_paragraph()
    run = p.add_run('CRITICAL GAP: ')
    run.bold = True
    run.font.color.rgb = RGBColor(192, 57, 43)
    p.add_run(
        'The 6 existing InSAR folders (Gonpatang, Jhepi, Kerang, Mamring, Yumesodong, Chakung) '
        'contain results for Sikkim, India (~28.0N, 88.6E), NOT for Juiz de Fora, Brazil. '
        'New InSAR processing is required for the actual project site.'
    )

    doc.add_page_break()

    # -- Section 2: Geotechnical Analysis --
    add_heading('2. Geotechnical Analysis (SPT Report)', 1)

    add_heading('2.1 Investigation Summary', 2)
    add_table(
        ['Parameter', 'Value'],
        [
            ['Client', 'ENGEDRAIN CONSTRUCOES LTDA'],
            ['Contractor', 'GFM2 Empreendimentos Imobiliarios LTDA'],
            ['Location', 'Alameda Eng. Gentil Forn, Jardim Gloria, Juiz de Fora, MG'],
            ['Date', 'March 2026 (Phase 1)'],
            ['Standards', 'NBR-6484 (SPT) and NBR-6502 (Soil Classification)'],
            ['Total Boreholes', '14 (SP01-SP14)'],
            ['Total Drilled Length', '102.24 meters'],
        ]
    )

    add_heading('2.2 Subsurface Stratigraphy', 2)

    add_heading('Layer 1: FILL MATERIAL (0 to 2-5m depth)', 3)
    add_bullet('Heterogeneous silty clay to sandy clay, yellow-brown with occasional gravel/rubble', 'Composition: ')
    add_bullet('Very soft to soft', 'Consistency: ')
    add_bullet('2-12 (mostly 2-5)', 'N(SPT): ')
    p = doc.add_paragraph()
    run = p.add_run('>> CRITICAL: This is the primary weak layer driving landslide susceptibility')
    run.bold = True
    run.font.color.rgb = RGBColor(192, 57, 43)

    add_heading('Layer 2: RESIDUAL SOIL / SAPROLITE (variable depth)', 3)
    add_bullet('Clayey silt to silty clay, yellow to vermilion (lateritic weathering)', 'Composition: ')
    add_bullet('Medium to hard', 'Consistency: ')
    add_bullet('4-32', 'N(SPT): ')

    add_heading('Layer 3: ROCK DECOMPOSITION SOIL (base of all boreholes)', 3)
    add_bullet('Very sandy silt, dark gray with yellow/white veins (weathered gneiss/granite)', 'Composition: ')
    add_bullet('>30, impenetrable to wash boring', 'N(SPT): ')
    add_bullet('1.05m (SP04) to 20.08m (SP13)', 'Depth range: ')

    add_heading('2.3 Borehole Summary', 2)
    add_table(
        ['BH ID', 'Depth (m)', 'Termination', 'Water', 'Key Observation'],
        [
            ['SP01', '6.15', 'Impenetrable', 'Yes', 'Seepage 0.02-0.03m'],
            ['SP02', '2.06', 'Impenetrable', 'No', 'Shallow rock'],
            ['SP03', '5.80', 'Impenetrable', 'No', 'Very soft fill (N=2-3)'],
            ['SP04', '1.05', 'Impenetrable', 'No', 'Road pavement only'],
            ['SP05', '7.70', 'Impenetrable', 'No', 'Hard layer at 3.9-5m'],
            ['SP06', '2.65', 'Impenetrable', 'No', 'Very shallow profile'],
            ['SP07', '9.90', 'Impenetrable', 'No', 'Good transition'],
            ['SP08', '5.60', 'Impenetrable', 'No', 'Soft fill dominant'],
            ['SP09', '8.80', 'Impenetrable', 'Yes', 'Seepage 0.01m'],
            ['SP10', '4.60', 'Impenetrable', 'Yes', 'Seepage 0.01m'],
            ['SP11', '11.10', 'Impenetrable', 'No', '6m casing used'],
            ['SP12', '5.25', 'Impenetrable', 'No', 'Typical road corridor'],
            ['SP13', '20.08', 'Penetration', 'No', 'DEEPEST - buried valley'],
            ['SP14', '11.50', 'Impenetrable', 'Yes', 'Natural ground'],
        ]
    )

    add_heading('2.4 Groundwater Conditions', 2)
    add_bullet('Water detected in only 4 of 14 boreholes (SP01, SP09, SP10, SP14)')
    add_bullet('Very minor seepage levels (0.01-0.07m)')
    add_bullet('Generally dry conditions - water table below investigated depths')
    add_bullet('Perched water in fill material during wet seasons is highly probable')

    add_heading('2.5 Slope Stability Risk Factors', 2)
    add_bullet('Significant fill deposits (up to 5m) on hillside = prior earthworks on slopes')
    add_bullet('Very soft fill (N=2-5) over competent residual soil = potential slip surfaces')
    add_bullet('Variable depth to rock (1-20m) = irregular drainage, differential settlement')
    add_bullet('SP13 at 20.08m = buried valley acting as groundwater collector')
    add_bullet('Low current water table but seasonal variation in tropical climate expected')

    doc.add_page_break()

    # -- Section 3: Failure Mechanism --
    add_heading('3. Failure Mechanism Hypothesis', 1)

    add_heading('3.1 Causal Chain', 2)
    doc.add_paragraph('PREDISPOSING FACTORS:').runs[0].bold = True
    add_bullet('Steep hillside terrain (Morro do Cristo area)')
    add_bullet('Thick fill deposits (2-5m) placed on natural slopes')
    add_bullet('Very soft fill material (N=2-5) over competent residual soil')
    add_bullet('Irregular bedrock topography creating preferential drainage paths')
    add_bullet('Buried valley at SP13 concentrating subsurface flow')
    add_bullet('Road loading adding surcharge to slope')

    doc.add_paragraph()
    doc.add_paragraph('TRIGGERING FACTOR:').runs[0].bold = True
    add_bullet('Intense and/or prolonged rainfall event (quantification pending ERA5/CHIRPS)')

    doc.add_paragraph()
    doc.add_paragraph('FAILURE SEQUENCE:').runs[0].bold = True
    doc.add_paragraph('1. Heavy rainfall infiltrates porous fill material rapidly')
    doc.add_paragraph('2. Low-permeability residual soil beneath acts as aquitard')
    doc.add_paragraph('3. Perched water table develops at fill-residual soil interface')
    doc.add_paragraph('4. Pore water pressure increases, reducing effective stress')
    doc.add_paragraph('5. Shear strength at fill-residual soil contact drops below driving forces')
    doc.add_paragraph('6. Translational slide initiates along the fill-residual interface')
    doc.add_paragraph('7. Possible retrogressive failure expanding upslope')

    add_heading('3.2 Evidence', 2)
    add_bullet('SPT: Very soft fill (N=2-5) over competent base = classic translational slide', 'From SPT: ')
    add_bullet('Water detected in 4 boreholes during March investigation', 'From SPT: ')
    add_bullet('News articles reference 533mm in 6 hours rainfall in Brazil', 'From Context: ')
    add_bullet('Gneissic/granitic terrain produces lateritic soils prone to landslides', 'From Geology: ')
    add_bullet('Mamring (Sikkim) shows displacement-rainfall correlation pattern', 'From InSAR: ')

    doc.add_page_break()

    # -- Section 4: Risk Assessment --
    add_heading('4. Risk Assessment', 1)

    add_table(
        ['Factor', 'Rating', 'Justification'],
        [
            ['Soil Susceptibility', 'HIGH', 'Very soft fill on steep slopes'],
            ['Rainfall Exposure', 'HIGH', 'Tropical climate, intense wet season'],
            ['Infrastructure Exposure', 'HIGH', 'Road and buildings on/adjacent to slope'],
            ['Groundwater Risk', 'MODERATE-HIGH', 'Low now but seasonal variation expected'],
            ['Retrogressive Potential', 'MODERATE', 'Depends on slope geometry and fill extent'],
        ]
    )

    p = doc.add_paragraph()
    run = p.add_run('OVERALL RISK: HIGH')
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(192, 57, 43)

    # -- Section 5: Action Items --
    add_heading('5. Action Items', 1)
    add_table(
        ['#', 'Task', 'Tool', 'Priority', 'Status'],
        [
            ['1', 'Process InSAR for Juiz de Fora AOI', 'ISCE2/StaMPS/MintPy', 'CRITICAL', 'Not started'],
            ['2', 'GEE script for ERA5/CHIRPS rainfall', 'Google Earth Engine', 'HIGH', 'Not started'],
            ['3', 'Planet post-event imagery query', 'Planet Explorer API', 'HIGH', 'Not started'],
            ['4', 'SPT data visualization (Python)', 'matplotlib/plotly', 'MEDIUM', 'Not started'],
            ['5', 'Report skeleton document', 'Word/LaTeX', 'MEDIUM', 'Not started'],
            ['6', 'Fix KML borehole coordinates', 'Manual/GIS', 'LOW', 'Not started'],
        ]
    )

    # -- Section 6: Report Structure --
    add_heading('6. Proposed Client Report Structure', 1)
    chapters = [
        'Chapter 1: Introduction & Site Description',
        'Chapter 2: Data Sources and Methods',
        'Chapter 3: Geotechnical Investigation Results',
        'Chapter 4: InSAR Displacement Analysis',
        'Chapter 5: Rainfall Analysis',
        'Chapter 6: Post-Event Satellite Analysis',
        'Chapter 7: Integrated Failure Analysis',
        'Chapter 8: Conclusions and Recommendations',
        'Appendices: SPT Logs, InSAR Parameters, Rainfall Data, Imagery Metadata, GEE Scripts',
    ]
    for ch in chapters:
        add_bullet(ch)

    doc.add_paragraph()
    doc.add_paragraph('Estimated report length: 30-40 pages + appendices')

    # -- Footer --
    doc.add_page_break()
    add_heading('Notes', 1)
    add_heading('Why Not ML-Based Analysis', 2)
    add_bullet('Single scene / single event = insufficient training data')
    add_bullet('ML models require multiple events across space/time to learn patterns')
    add_bullet('Appropriate approach: analytical/descriptive with expert interpretation')

    add_heading('InSAR Considerations for Juiz de Fora', 2)
    add_bullet('Tropical vegetation may limit PS point density - SBAS preferred for hillslopes')
    add_bullet('C-band (Sentinel-1) decorrelation expected in vegetated areas')
    add_bullet('Consider L-band (ALOS-2) if C-band coverage is poor')
    add_bullet('Minimum 2-year time series needed for baseline trend')

    add_heading('Coordinate Reference', 2)
    add_bullet('Juiz de Fora approximate center: -21.76S, -43.35W')
    add_bullet('UTM Zone: 23S (EPSG:31983 - SIRGAS 2000)')

    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Generated: 2026-04-08 | GeoClaw Research Assistant - Session 01')
    run.font.color.rgb = RGBColor(100, 100, 100)
    run.font.size = Pt(10)

    # Save
    docx_path = OUTPUT_DIR / 'GeoClaw_Terreatek_Assessment_Report.docx'
    doc.save(str(docx_path))
    print(f"DOCX saved: {docx_path}")
    return docx_path


# ============================================================
# PDF DOCUMENT
# ============================================================
def create_pdf():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor
    from reportlab.lib.units import cm, mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, ListFlowable, ListItem
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    pdf_path = OUTPUT_DIR / 'GeoClaw_Terreatek_Assessment_Report.pdf'

    doc = SimpleDocTemplate(
        str(pdf_path), pagesize=A4,
        topMargin=2*cm, bottomMargin=2*cm,
        leftMargin=2.5*cm, rightMargin=2.5*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        'MainTitle', parent=styles['Title'],
        fontSize=26, textColor=HexColor('#1a5276'),
        spaceAfter=10, alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'SubTitle', parent=styles['Normal'],
        fontSize=14, textColor=HexColor('#2980b9'),
        spaceAfter=20, alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'H1', parent=styles['Heading1'],
        fontSize=18, textColor=HexColor('#1a5276'),
        spaceBefore=20, spaceAfter=10,
        borderWidth=1, borderColor=HexColor('#3498db'),
        borderPadding=5
    ))
    styles.add(ParagraphStyle(
        'H2', parent=styles['Heading2'],
        fontSize=14, textColor=HexColor('#2980b9'),
        spaceBefore=15, spaceAfter=8
    ))
    styles.add(ParagraphStyle(
        'H3', parent=styles['Heading3'],
        fontSize=12, textColor=HexColor('#1a6e8e'),
        spaceBefore=10, spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        'BodyText2', parent=styles['BodyText'],
        fontSize=10, leading=14, spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        'Critical', parent=styles['BodyText'],
        fontSize=10, textColor=HexColor('#c0392b'),
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'CenterGray', parent=styles['Normal'],
        fontSize=10, textColor=HexColor('#666666'),
        alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'BulletText', parent=styles['BodyText'],
        fontSize=10, leading=13, leftIndent=20,
        bulletIndent=10, spaceAfter=3
    ))

    story = []
    S = Spacer
    BT = 'BodyText2'
    BLUE = HexColor('#1a5276')
    WHITE = HexColor('#ffffff')
    LIGHT = HexColor('#f2f8fc')
    GRAY = HexColor('#dddddd')

    def make_table(headers, rows, col_widths=None):
        data = [headers] + rows
        t = Table(data, colWidths=col_widths, repeatRows=1)
        style_cmds = [
            ('BACKGROUND', (0, 0), (-1, 0), BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ]
        for i in range(1, len(data)):
            if i % 2 == 0:
                style_cmds.append(('BACKGROUND', (0, i), (-1, i), LIGHT))
        t.setStyle(TableStyle(style_cmds))
        return t

    def bullet(text):
        return Paragraph(f"&#8226; {text}", styles[BT])

    # -- Title Page --
    story.append(S(1, 150))
    story.append(Paragraph('Landslide Assessment', styles['MainTitle']))
    story.append(Paragraph('Project Assessment Report', styles['MainTitle']))
    story.append(S(1, 20))
    story.append(Paragraph(
        'Alameda Eng. Gentil Forn, Jardim Gloria<br/>Juiz de Fora, Minas Gerais, Brazil',
        styles['SubTitle']
    ))
    story.append(S(1, 40))
    story.append(Paragraph(
        '<b>Prepared by:</b> GeoClaw | <b>Client:</b> Terreatek / Engesis Tecnologia',
        styles['CenterGray']
    ))
    story.append(Paragraph('<b>Date:</b> 2026-04-08 | <b>Status:</b> In Progress', styles['CenterGray']))
    story.append(PageBreak())

    # -- Executive Summary --
    story.append(Paragraph('Executive Summary', styles['H1']))
    story.append(Paragraph(
        'GeoClaw has been engaged by Terreatek (Engesis group) to deliver a geospatial product '
        'supporting their geotechnical expertise for a landslide event at Alameda Engenheiro Gentil Forn, '
        'Jardim Gloria neighborhood, Juiz de Fora, Minas Gerais, Brazil.',
        styles[BT]
    ))
    story.append(Paragraph(
        '<b>Approach:</b> Single-scene analytical/descriptive analysis (NOT ML-based). '
        'Integrating InSAR displacement, rainfall, post-event imagery, and geotechnical data.',
        styles[BT]
    ))
    story.append(S(1, 10))
    story.append(Paragraph('Key Findings', styles['H2']))
    findings = [
        '14 SPT boreholes reveal 3-layer profile: soft fill (N=2-5) over residual soil over rock decomposition',
        'Fill layer (2-5m thick) is the CRITICAL weak layer for slope stability',
        'Variable bedrock depth (1-20m) with SP13 at 20.08m indicating a buried valley',
        'Water detected in 4/14 boreholes - seasonal perched water in fill is the likely trigger',
        'Existing InSAR products are for Sikkim, India (examples only) - Juiz de Fora InSAR NOT yet processed',
        'Failure mechanism: translational slide along fill-residual soil interface, triggered by intense rainfall',
    ]
    for f in findings:
        story.append(bullet(f))
    story.append(PageBreak())

    # -- Datasets --
    story.append(Paragraph('1. Dataset Inventory', styles['H1']))
    story.append(Paragraph('1.1 Datasets In-Hand', styles['H2']))
    story.append(make_table(
        ['Dataset', 'Format', 'Size', 'Description'],
        [
            ['SPT Boring Report #004/26', 'PDF', '~3 MB', '14 boreholes, 102.24m total'],
            ['AutoCAD Road Surface', 'DWG', '279 MB', 'Engineering design'],
            ['Orthophoto Mosaic', 'ECW', '44.5 MB', 'Area 06 raster'],
            ['Borehole Points', 'KML', '1.5 KB', '2nd Phase (coords empty)'],
            ['Landslide Points', 'KMZ', '793 B', 'Event locations'],
            ['Site Video', 'MP4', '30.5 MB', 'Morro do Cristo'],
            ['Ref. InSAR Products', 'PNG', '652 MB', '6 Sikkim sites (examples)'],
        ],
        col_widths=[150, 45, 50, 200]
    ))
    story.append(S(1, 10))
    story.append(Paragraph('1.2 Datasets Needed', styles['H2']))
    story.append(make_table(
        ['Dataset', 'Source', 'Priority', 'Status'],
        [
            ['InSAR for JdF AOI', 'Sentinel-1', 'CRITICAL', 'NOT PROCESSED'],
            ['Hourly Rainfall', 'ERA5/CHIRPS via GEE', 'HIGH', 'NOT COLLECTED'],
            ['Planet Post-Event', 'Planet API', 'HIGH', 'NOT COLLECTED'],
        ],
        col_widths=[130, 130, 80, 110]
    ))
    story.append(Paragraph(
        '<font color="#c0392b"><b>CRITICAL GAP:</b></font> Existing InSAR is for Sikkim, India - '
        'new processing required for Juiz de Fora.',
        styles[BT]
    ))
    story.append(PageBreak())

    # -- Geotechnical --
    story.append(Paragraph('2. Geotechnical Analysis', styles['H1']))
    story.append(Paragraph('2.1 Investigation Summary', styles['H2']))
    story.append(make_table(
        ['Parameter', 'Value'],
        [
            ['Client', 'ENGEDRAIN CONSTRUCOES LTDA'],
            ['Location', 'Alameda Eng. Gentil Forn, Jardim Gloria, JdF, MG'],
            ['Date', 'March 2026 (Phase 1)'],
            ['Standards', 'NBR-6484 (SPT), NBR-6502'],
            ['Total Boreholes', '14 (SP01-SP14), 102.24m combined'],
        ],
        col_widths=[120, 330]
    ))

    story.append(Paragraph('2.2 Subsurface Stratigraphy', styles['H2']))
    story.append(Paragraph('<b>Layer 1: FILL MATERIAL</b> (0 to 2-5m)', styles['H3']))
    story.append(bullet('Silty clay to sandy clay, yellow-brown, N(SPT) = 2-5, Very soft'))
    story.append(Paragraph(
        '<font color="#c0392b"><b>CRITICAL: Primary weak layer for slope stability</b></font>',
        styles[BT]
    ))
    story.append(Paragraph('<b>Layer 2: RESIDUAL SOIL</b> (variable depth)', styles['H3']))
    story.append(bullet('Clayey silt, yellow to vermilion (lateritic), N(SPT) = 4-32, Medium to hard'))
    story.append(Paragraph('<b>Layer 3: ROCK DECOMPOSITION</b> (base)', styles['H3']))
    story.append(bullet('Very sandy silt, dark gray, N(SPT) > 30, depth 1.05-20.08m'))

    story.append(S(1, 10))
    story.append(Paragraph('2.3 Borehole Summary', styles['H2']))
    story.append(make_table(
        ['BH', 'Depth', 'Water', 'Key Observation'],
        [
            ['SP01', '6.15m', 'Yes', 'Seepage 0.02m'],
            ['SP02', '2.06m', 'No', 'Shallow rock'],
            ['SP03', '5.80m', 'No', 'Very soft fill'],
            ['SP04', '1.05m', 'No', 'Road only'],
            ['SP05', '7.70m', 'No', 'Hard layer 3.9-5m'],
            ['SP06', '2.65m', 'No', 'Very shallow'],
            ['SP07', '9.90m', 'No', 'Good transition'],
            ['SP08', '5.60m', 'No', 'Soft fill'],
            ['SP09', '8.80m', 'Yes', 'Seepage 0.01m'],
            ['SP10', '4.60m', 'Yes', 'Seepage 0.01m'],
            ['SP11', '11.10m', 'No', '6m casing'],
            ['SP12', '5.25m', 'No', 'Road corridor'],
            ['SP13', '20.08m', 'No', 'DEEPEST - buried valley'],
            ['SP14', '11.50m', 'Yes', 'Natural ground'],
        ],
        col_widths=[40, 55, 40, 315]
    ))
    story.append(PageBreak())

    # -- Failure Mechanism --
    story.append(Paragraph('3. Failure Mechanism Hypothesis', styles['H1']))
    story.append(Paragraph('3.1 Predisposing Factors', styles['H2']))
    for f in [
        'Steep hillside terrain (Morro do Cristo area)',
        'Thick fill deposits (2-5m) placed on natural slopes',
        'Very soft fill material (N=2-5) over competent residual soil',
        'Irregular bedrock creating preferential drainage paths',
        'Buried valley at SP13 concentrating subsurface flow',
        'Road loading adding surcharge to slope',
    ]:
        story.append(bullet(f))

    story.append(Paragraph('3.2 Triggering Factor', styles['H2']))
    story.append(bullet('Intense and/or prolonged rainfall event (quantification pending)'))

    story.append(Paragraph('3.3 Failure Sequence', styles['H2']))
    steps = [
        '1. Heavy rainfall infiltrates porous fill material rapidly',
        '2. Low-permeability residual soil acts as aquitard',
        '3. Perched water table develops at fill-residual soil interface',
        '4. Pore water pressure increases, reducing effective stress',
        '5. Shear strength at contact drops below driving forces',
        '6. Translational slide along fill-residual soil interface',
        '7. Possible retrogressive failure expanding upslope',
    ]
    for s in steps:
        story.append(Paragraph(s, styles[BT]))

    story.append(S(1, 10))
    story.append(Paragraph('<b>Failure Type:</b> Translational slide along fill-residual soil interface', styles[BT]))
    story.append(Paragraph('<b>Estimated Depth:</b> 2-5m (fill layer thickness)', styles[BT]))
    story.append(Paragraph(
        '<font color="#c0392b"><b>Overall Risk: HIGH</b></font>',
        styles[BT]
    ))
    story.append(PageBreak())

    # -- Risk & Actions --
    story.append(Paragraph('4. Risk Assessment', styles['H1']))
    story.append(make_table(
        ['Factor', 'Rating', 'Justification'],
        [
            ['Soil Susceptibility', 'HIGH', 'Very soft fill on steep slopes'],
            ['Rainfall Exposure', 'HIGH', 'Tropical climate, intense wet season'],
            ['Infrastructure', 'HIGH', 'Road and buildings adjacent'],
            ['Groundwater', 'MOD-HIGH', 'Seasonal variation expected'],
            ['Retrogressive', 'MODERATE', 'Depends on geometry'],
        ],
        col_widths=[120, 80, 250]
    ))

    story.append(Paragraph('5. Action Items', styles['H1']))
    story.append(make_table(
        ['#', 'Task', 'Priority', 'Status'],
        [
            ['1', 'Process InSAR for Juiz de Fora AOI', 'CRITICAL', 'Not started'],
            ['2', 'GEE rainfall script (ERA5/CHIRPS)', 'HIGH', 'Not started'],
            ['3', 'Planet post-event imagery', 'HIGH', 'Not started'],
            ['4', 'SPT visualization (Python)', 'MEDIUM', 'Not started'],
            ['5', 'Client report document', 'MEDIUM', 'Not started'],
            ['6', 'Fix borehole KML coords', 'LOW', 'Not started'],
        ],
        col_widths=[25, 250, 80, 95]
    ))

    story.append(S(1, 30))
    story.append(Paragraph(
        'Generated: 2026-04-08 | GeoClaw Research Assistant - Session 01',
        styles['CenterGray']
    ))

    doc.build(story)
    print(f"PDF saved: {pdf_path}")
    return pdf_path


# ============================================================
if __name__ == '__main__':
    print("Generating DOCX...")
    create_docx()
    print()
    print("Generating PDF...")
    create_pdf()
    print()
    print("Done! Both files saved to:", OUTPUT_DIR)
