/**
 * Stitches the separately generated modules into one drawing.
 *
 *   node floorplan/render.js
 *
 * Outputs:
 *   output/floor-plan-42x36.png      full stitched sheet
 *   output/parts/*.png               each module on its own
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
const { renderPanel, renderProofs } = require('./modules/titleblock')

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
    const ROAD = 150
    const plotW = G.PLOT_W * S
    const plotH = G.PLOT_H * S

    // stitch the plan itself (shop band | residence) -------------------------
    const plan = D.blank(plotW, plotH)
    plan.composite(shops, 0, 0)
    plan.composite(residence, shops.bitmap.width, 0)
    if (shops.bitmap.width + residence.bitmap.width !== plotW) throw new Error('module widths do not add up to the plot')

    // sheet layout ---------------------------------------------------------
    const M = 40
    const panelW = 1060
    const xLeftDims = M
    const xRoad = xLeftDims + dims.left.bitmap.width
    const xPlot = xRoad + ROAD
    const xRightDims = xPlot + plotW
    const xPanel = xRightDims + dims.right.bitmap.width + M
    const W = xPanel + panelW + M

    const yHeader = M
    const yTopDims = yHeader + 90
    const yPlot = yTopDims + dims.top.bitmap.height
    const yRoad = yPlot + plotH
    const yBottomDims = yRoad + ROAD
    const yProofs = yBottomDims + dims.bottom.bitmap.height + M
    const proofs = renderProofs(W - 2 * M)
    const H = yProofs + proofs.bitmap.height + M

    const sheet = D.blank(W, H)
    D.textLeft(sheet, `GROUND FLOOR  -  ${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)} PLOT  -  scale 4 px = 1 inch`, xPlot, yHeader + 30, 44)
    D.textLeft(sheet, 'NEIGHBOUR', xPlot + plotW - 300, yTopDims + 24, 22, D.C.grey)

    sheet.composite(dims.top, xPlot, yTopDims)
    sheet.composite(dims.left, xLeftDims, yPlot)
    sheet.composite(dims.right, xRightDims, yPlot)
    sheet.composite(dims.bottom, xPlot, yBottomDims)

    // roads
    D.fillRect(sheet, xRoad, yPlot, xRoad + ROAD - 16, yRoad + ROAD - 16, 0xc9ccd1ff)
    D.fillRect(sheet, xRoad, yRoad + 16, xPlot + plotW, yRoad + ROAD - 16, 0xc9ccd1ff)
    D.line(sheet, xRoad + (ROAD - 16) / 2, yPlot + 20, xRoad + (ROAD - 16) / 2, yRoad - 20, D.C.paper, 4, [40, 30])
    D.line(sheet, xPlot + 20, yRoad + ROAD / 2, xPlot + plotW - 20, yRoad + ROAD / 2, D.C.paper, 4, [40, 30])
    D.text(sheet, `COMMERCIAL ROAD  -  ${fmt(G.PLOT_H)} FRONTAGE  -  4 SHOP FRONTS`, xRoad + (ROAD - 16) / 2, yPlot + plotH / 2, 34, D.C.ink, 90, 0xc9ccd1ff)
    D.text(sheet, `ROAD  -  ${fmt(G.PLOT_W)}  -  HOUSE ENTRANCE + CAR GATE`, xPlot + plotW / 2, yRoad + ROAD / 2, 34, D.C.ink, 0, 0xc9ccd1ff)

    sheet.composite(plan, xPlot, yPlot)
    D.strokeRect(sheet, xPlot, yPlot, xPlot + plotW - 1, yPlot + plotH - 1, D.C.ink, 2)

    // boundary between shop band and residence (stitch line)
    const xs = xPlot + G.keys.sx[4] * S
    D.line(sheet, xs, yTopDims + 40, xs, yPlot, D.C.dim, 2, [10, 8])

    const panel = renderPanel(panelW, yRoad + ROAD - yTopDims)
    sheet.composite(panel, xPanel, yTopDims)
    sheet.composite(proofs, M, yProofs)

    // write ---------------------------------------------------------------
    await shops.writeAsync(path.join(OUT, 'parts', '1-shops.png'))
    await residence.writeAsync(path.join(OUT, 'parts', '2-residence.png'))
    await dims.top.writeAsync(path.join(OUT, 'parts', '3-dims-top.png'))
    await dims.bottom.writeAsync(path.join(OUT, 'parts', '3-dims-bottom.png'))
    await dims.left.writeAsync(path.join(OUT, 'parts', '3-dims-left.png'))
    await dims.right.writeAsync(path.join(OUT, 'parts', '3-dims-right.png'))
    await panel.writeAsync(path.join(OUT, 'parts', '4-title-panel.png'))
    await proofs.writeAsync(path.join(OUT, 'parts', '5-dimension-proof.png'))
    await plan.writeAsync(path.join(OUT, 'parts', '6-plan-stitched.png'))
    await sheet.writeAsync(path.join(OUT, 'floor-plan-42x36.png'))
    console.log(`wrote output/floor-plan-42x36.png (${W} x ${H}) and ${OUT}/parts/`)
}

main().catch((e) => { console.error(e); process.exit(1) })
