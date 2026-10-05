/**
 * Stitches the separately generated modules into one drawing.
 *
 *   node floorplan/render.js
 *
 * Outputs:
 *   output/floor-plan-42x36.png      full stitched sheet
 *   output/parts/*.png               each module on its own
 *
 * Refuses to write anything if the geometry fails validation, and reports
 * every label that overlaps another label or sits on linework.
 */
const fs = require('fs')
const path = require('path')
const G = require('./geometry')
const D = require('./draw')
const { fmt } = require('./units')
const { validate } = require('./validate')
const { renderShops } = require('./modules/shops')
const { renderResidence } = require('./modules/residence')
const { renderDimensions } = require('./modules/dimensions')
const { renderPanel, renderBottom } = require('./modules/titleblock')

const S = 4 // px per inch -> a ½" step is exactly 2 px
const OUT = path.join(__dirname, '..', 'output')

const main = async () => {
    const v = validate()
    if (!v.ok) {
        console.error('Refusing to draw an invalid plan:\n' + v.errors.join('\n'))
        process.exit(1)
    }
    await D.loadFonts()
    fs.mkdirSync(path.join(OUT, 'parts'), { recursive: true })

    // 1-4: modules ---------------------------------------------------------
    const shops = renderShops(S)
    const residence = renderResidence(S)
    const dims = renderDimensions(S)
    const ROAD = 170
    const plotW = G.PLOT_W * S
    const plotH = G.PLOT_H * S

    // stitch the plan itself (shop band | residence) -------------------------
    const plan = D.blank(plotW, plotH)
    plan.composite(shops.img, 0, 0)
    plan.composite(residence.img, shops.img.bitmap.width, 0)
    if (shops.img.bitmap.width + residence.img.bitmap.width !== plotW) throw new Error('module widths do not add up to the plot')

    // sheet layout ---------------------------------------------------------
    const M = 50
    const panelW = 1320
    const xLeftDims = M
    const xRoad = xLeftDims + dims.left.img.bitmap.width
    const xPlot = xRoad + ROAD
    const xRightDims = xPlot + plotW
    const xPanel = xRightDims + dims.right.img.bitmap.width + M
    const W = xPanel + panelW + M

    const yHeader = M
    const yTopDims = yHeader + 100
    const yPlot = yTopDims + dims.top.img.bitmap.height
    const yRoad = yPlot + plotH
    const yBottomDims = yRoad + ROAD
    const yBottom = yBottomDims + dims.bottom.img.bitmap.height + M
    const bottom = renderBottom(W - 2 * M)
    const H = yBottom + bottom.img.bitmap.height + M

    const sheet = D.blank(W, H)
    sheet.composite(dims.top.img, xPlot, yTopDims)
    sheet.composite(dims.left.img, xLeftDims, yPlot)
    sheet.composite(dims.right.img, xRightDims, yPlot)
    sheet.composite(dims.bottom.img, xPlot, yBottomDims)

    // roads
    const roadL = [xRoad, yPlot, xRoad + ROAD - 20, yRoad + ROAD - 20]
    const roadB = [xRoad, yRoad + 20, xPlot + plotW, yRoad + ROAD - 20]
    D.fillRect(sheet, ...roadL, D.C.road)
    D.fillRect(sheet, ...roadB, D.C.road)
    const rlx = (roadL[0] + roadL[2]) / 2
    const rby = (roadB[1] + roadB[3]) / 2
    D.line(sheet, rlx, yPlot + 20, rlx, yRoad - 40, D.C.paper, 4, [40, 30])
    D.line(sheet, xPlot + 20, rby, xPlot + plotW - 20, rby, D.C.paper, 4, [40, 30])

    sheet.composite(plan, xPlot, yPlot)
    D.strokeRect(sheet, xPlot, yPlot, xPlot + plotW - 1, yPlot + plotH - 1, D.C.ink, 2)
    // stitch line between shop band and residence
    const xs = xPlot + G.keys.sx[4] * S
    D.line(sheet, xs, yTopDims + 100, xs, yPlot, D.C.dim, 2, [10, 8])

    const panel = renderPanel(panelW, yBottomDims + dims.bottom.img.bitmap.height - yTopDims, S)
    sheet.composite(panel.img, xPanel, yTopDims)
    sheet.composite(bottom.img, M, yBottom)

    // sheet-level labels (checked against everything composited so far)
    const L = new D.LabelLayer(sheet, 'sheet')
    L.freeze()
    L.place(`GROUND FLOOR PLAN  -  ${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)} PLOT  -  Rev B`, xPlot, yHeader + 34, 48, D.C.ink, { anchor: 'left' })
    L.place(`COMMERCIAL ROAD  -  ${fmt(G.PLOT_H)} FRONTAGE  -  4 SHOP FRONTS`, rlx, yPlot + plotH / 2, 36, D.C.ink, { rotate: 90, bg: D.C.road, allowOver: true })
    L.place(`ROAD  -  ${fmt(G.PLOT_W)}  -  HOUSE ENTRANCE + CAR GATE`, xPlot + plotW / 2 - 200, rby, 36, D.C.ink, { bg: D.C.road, allowOver: true })
    // window tags for openings in the road wall
    for (const w of G.windows.filter((o) => o.wall === 'bottom')) {
        const b = L.place(w.id, xPlot + ((w.from + w.to) / 2) * S, yRoad + 44, 24, D.C.tag, { bg: D.C.paper })
        D.strokeRect(sheet, b.x1, b.y1, b.x2 - 1, b.y2 - 1, D.C.tag, 2)
    }
    // dimension tier captions
    const cap = (s, x, y, rot = 0, anchor = 'center') => L.place(s, x, y, 22, D.C.grey, { rotate: rot, anchor })
    const capR = (s, y) => {
        const t = D.textImage(s, 22)
        const b = D.inkBox(t)
        cap(s, xPlot - 24 - (b.x2 - b.x1), y, 0, 'left')
    }
    const [t0, t1, t2] = dims.top.lines
    capR('REAR ROW', yTopDims + t0)
    capR('SHOPS | HOUSE', yTopDims + t1)
    capR('OVERALL', yTopDims + t2)
    capR('FRONT ROW', yBottomDims + dims.bottom.lines[0])
    const [l0, l1] = dims.left.lines
    cap('SHOP FRONTS', xLeftDims + l0, yPlot - 110, 90)
    cap('OVERALL', xLeftDims + l1, yPlot - 110, 90)
    const [r0, r1, r2] = dims.right.lines
    cap('EAST COLUMN', xRightDims + r0, yPlot - 110, 90)
    cap('WEST COLUMN', xRightDims + r1, yPlot - 110, 90)
    cap('OVERALL', xRightDims + r2, yPlot - 110, 90)
    cap('NEIGHBOUR', xRightDims + 22, yPlot + plotH * 0.62, 90)
    cap('NEIGHBOUR', xPlot + 330 * S, yPlot - 16)

    // label audit ---------------------------------------------------------
    const layers = [shops.labels, residence.labels, dims.top.labels, dims.bottom.labels, dims.left.labels, dims.right.labels, panel.labels, bottom.labels, L]
    const issues = layers.flatMap((l) => l.issues)
    const count = layers.reduce((n, l) => n + l.boxes.length, 0)
    if (issues.length) {
        console.error(`LABEL CHECK FAILED (${issues.length} of ${count} labels):\n` + issues.join('\n'))
        process.exitCode = 2
    } else {
        console.log(`label check: ${count} labels, none overlapping each other or any linework`)
    }

    // write ---------------------------------------------------------------
    await shops.img.writeAsync(path.join(OUT, 'parts', '1-shops.png'))
    await residence.img.writeAsync(path.join(OUT, 'parts', '2-residence.png'))
    await dims.top.img.writeAsync(path.join(OUT, 'parts', '3-dims-top.png'))
    await dims.bottom.img.writeAsync(path.join(OUT, 'parts', '3-dims-bottom.png'))
    await dims.left.img.writeAsync(path.join(OUT, 'parts', '3-dims-left.png'))
    await dims.right.img.writeAsync(path.join(OUT, 'parts', '3-dims-right.png'))
    await panel.img.writeAsync(path.join(OUT, 'parts', '4-title-panel.png'))
    await bottom.img.writeAsync(path.join(OUT, 'parts', '5-proof-legend-notes.png'))
    await plan.writeAsync(path.join(OUT, 'parts', '6-plan-stitched.png'))
    await sheet.writeAsync(path.join(OUT, 'floor-plan-42x36.png'))
    console.log(`wrote output/floor-plan-42x36.png (${W} x ${H}) and output/parts/`)
}

main().catch((e) => { console.error(e); process.exit(1) })
