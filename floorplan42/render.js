/**
 * Builds the shop-house sheet: ground floor (26'-1" x 36'-0", drawn in its
 * place beside the shop band), first and second floors (42'-0" x 36'-0"),
 * each with dimension strings, plus an information band.
 *
 *   node floorplan42/render.js  ->  output/shophouse-42x36.png (+ parts/)
 *
 * Refuses to draw if any floor fails check.js; exits non-zero if any label
 * overlaps another label or sits on linework.
 */
const fs = require('fs')
const path = require('path')
const S0 = require('./site')
const D = require('../floorplan/draw')
const { checkFloor } = require('../floorplan26/check')
const { renderFloor } = require('../floorplan26/render/floor')
const { strip } = require('../floorplan26/render/dims')
const { renderInfo } = require('./render/info')
const specs = require('./render/specs')

const S = 4
const OUT = path.join(__dirname, '..', 'output')
const FLOORS = [
    { mod: require('./ground'), spec: specs.GF, subtitle: 'the reference plan fitted to 26\'-1" x 36\'-0"; shops on the left 15\'-11"', road: 'ROAD  -  26\'-1" HOUSE FRONT  -  9\'-0" GATE + SMALL DOOR' },
    { mod: require('./first'), spec: specs.FF, subtitle: 'family floor over house and shops: three bedrooms, TV lounge, study, terraces', road: 'FRONT ROAD  -  42\'-0"   (shop road along the left side)' },
    { mod: require('./second'), spec: specs.SF, subtitle: 'independent portion: own lobby door, two suites, kitchen, family room', road: 'FRONT ROAD  -  42\'-0"   (shop road along the left side)' },
]
const CH = {
    GF: { top: 'GF x through bath / bedroom / kitchen', bottom: 'GF x through porch / drawing room', left: 'GF y through porch / stair / bath / light well', right: 'GF y through drawing / WC / lounge / kitchen / light well' },
    FF: { top: 'FF x through bath 3 / laundry / terrace / lobby / study / master terrace', bottom: 'FF x through bedroom 2 / TV lounge / master', left: 'FF y through bedroom 2 / bedroom 3 / bath 3 / terrace', right: 'FF y through master / master bath / master terrace / light well' },
    SF: { top: 'SF x through laundry / terrace / lobby / family room / terrace B', bottom: 'SF x through bedroom A / lounge / bedroom B', left: 'SF y through bedroom A / kitchen / laundry / terrace', right: 'SF y through bedroom B / bath B / terrace B / light well' },
}

const main = async () => {
    const checks = FLOORS.map((f) => checkFloor(f.mod))
    const failed = checks.flatMap((c, i) => c.errors.map((e) => `${FLOORS[i].mod.id}: ${e}`))
    if (failed.length) { console.error('Refusing to draw:\n' + failed.join('\n')); process.exit(1) }
    await D.loadFonts()
    fs.mkdirSync(path.join(OUT, 'shophouse-42x36-parts'), { recursive: true })

    const layers = []
    const blocks = FLOORS.map((f) => {
        const fl = f.mod
        const plan = renderFloor(fl, S, f.spec)
        const c = CH[fl.id]
        const chain = (name) => fl.chains[name]
        const overallX = [[fl.W, fl.id === 'GF' ? 'house width' : 'plot width']]
        const overallY = [[fl.H, 'plot depth']]
        const top = strip([{ chain: chain(c.top) }], { vertical: false, outward: -1, S, name: `${fl.id} dims top`, len: fl.W })
        const bottom = strip([{ chain: chain(c.bottom) }, { chain: overallX }], { vertical: false, outward: 1, S, name: `${fl.id} dims bottom`, len: fl.W })
        const left = strip([{ chain: chain(c.left) }, { chain: overallY }], { vertical: true, outward: -1, S, name: `${fl.id} dims left`, len: fl.H })
        const right = strip([{ chain: chain(c.right) }], { vertical: true, outward: 1, S, name: `${fl.id} dims right`, len: fl.H })
        layers.push(plan.labels, top.labels, bottom.labels, left.labels, right.labels)
        return { f, fl, plan, top, bottom, left, right }
    })

    // geometry: every block is laid out on the 42' plot width so the ground
    // floor sits in its true position, to the right of the shop band
    const M = 50
    const GAP = 70
    const TITLE = 120
    const ROAD = 110
    const planW = S0.PLOT_W * S
    const planH = S0.PLOT_H * S
    const leftW = Math.max(...blocks.map((b) => b.left.img.bitmap.width))
    const rightW = Math.max(...blocks.map((b) => b.right.img.bitmap.width))
    const topH = Math.max(...blocks.map((b) => b.top.img.bitmap.height))
    const bottomH = Math.max(...blocks.map((b) => b.bottom.img.bitmap.height))
    const blockW = leftW + planW + rightW
    const blockH = TITLE + topH + planH + ROAD + bottomH
    const W = M * 2 + blocks.length * blockW + (blocks.length - 1) * GAP
    const info = renderInfo(W - 2 * M, checks)
    layers.push(info.labels)
    const H = M + 80 + blockH + 40 + info.img.bitmap.height + M

    const sheet = D.blank(W, H)
    const L = new D.LabelLayer(sheet, 'sheet')
    const placed = []
    blocks.forEach((b, i) => {
        const x0 = M + i * (blockW + GAP)
        const y0 = M + 80
        const off = (S0.PLOT_W - b.fl.W) * S // ground floor: shop band offset
        const xp = x0 + leftW + off
        const yp = y0 + TITLE + topH
        const pw = b.fl.W * S
        sheet.composite(b.top.img, xp, yp - b.top.img.bitmap.height)
        sheet.composite(b.left.img, xp - b.left.img.bitmap.width, yp)
        sheet.composite(b.right.img, xp + pw, yp)
        sheet.composite(b.bottom.img, xp, yp + planH + ROAD)
        D.fillRect(sheet, xp, yp + planH + 14, xp + pw, yp + planH + ROAD - 14, i === 0 ? D.C.road : 0xeceef1ff)
        sheet.composite(b.plan.img, xp, yp)
        D.strokeRect(sheet, xp, yp, xp + pw - 1, yp + planH - 1, D.C.ink, 2)
        if (off) {
            // the shop band beside the ground-floor house: dashed outline, hatched
            const sx1 = x0 + leftW - 10
            const sx2 = xp - b.left.img.bitmap.width - 24
            D.fillRect(sheet, sx1, yp, sx2, yp + planH, 0xf6f4f0ff)
            D.hatch(sheet, sx1, yp, sx2, yp + planH, 0xe3ded6ff, 28)
            D.strokeRect(sheet, sx1, yp, sx2 - 1, yp + planH - 1, D.C.grey, 3, [18, 10])
            placed.push({ b, x0, y0, xp, yp, pw, shops: [sx1, sx2] })
            return
        }
        placed.push({ b, x0, y0, xp, yp, pw })
    })
    sheet.composite(info.img, M, M + 80 + blockH + 40)
    L.freeze()
    L.place('SHOP-HOUSE ON A 42\'-0" x 36\'-0" CORNER PLOT  -  ground floor 26\'-1" x 36\'-0", upper floors 42\'-0" x 36\'-0"', M, M + 30, 46, D.C.ink, { anchor: 'left' })
    for (const { b, x0, y0, xp, yp, pw, shops } of placed) {
        L.place(b.fl.title, x0 + leftW, y0 + 36, 42, D.C.ink, { anchor: 'left' })
        L.place(b.f.subtitle, x0 + leftW, y0 + 84, 24, D.C.grey, { anchor: 'left' })
        const ry = yp + planH + ROAD / 2
        L.place(b.f.road, xp + pw / 2, ry + 10, 22, D.C.ink, { bg: placed.indexOf(placed.find((p) => p.b === b)) === 0 ? D.C.road : 0xeceef1ff })
        for (const t of b.plan.streetTags) {
            const bx = L.place(t.id, xp + t.x * S, yp + planH + 30, 20, D.C.tag, { bg: D.C.paper })
            D.strokeRect(sheet, bx.x1, bx.y1, bx.x2 - 1, bx.y2 - 1, D.C.tag, 2)
        }
        if (shops) {
            const cx = (shops[0] + shops[1]) / 2
            L.place('SHOPS', cx, yp + planH / 2 - 30, 34, D.C.grey, { rotate: 90 })
            L.place('15\'-11" x 36\'-0" on the shop road', cx + 44, yp + planH / 2 - 30, 20, D.C.grey, { rotate: 90 })
            L.place('ground floor only - separate plan', cx + 76, yp + planH / 2 - 30, 20, D.C.grey, { rotate: 90 })
        }
    }
    layers.push(L)

    const issues = layers.flatMap((l) => l.issues)
    const count = layers.reduce((n, l) => n + l.boxes.length, 0)
    if (issues.length) {
        console.error(`LABEL CHECK FAILED (${issues.length} of ${count}):\n` + issues.join('\n'))
        process.exitCode = 2
    } else console.log(`label check: ${count} labels, none overlapping each other or any linework`)

    for (const b of blocks) await b.plan.img.writeAsync(path.join(OUT, 'shophouse-42x36-parts', `${b.fl.id}-plan.png`))
    await info.img.writeAsync(path.join(OUT, 'shophouse-42x36-parts', 'info.png'))
    await sheet.writeAsync(path.join(OUT, 'shophouse-42x36.png'))
    console.log(`wrote output/shophouse-42x36.png (${W} x ${H})`)
}

main().catch((e) => { console.error(e); process.exit(1) })
