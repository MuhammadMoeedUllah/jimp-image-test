/**
 * Builds the 26'-1" x 36'-0" house sheet: ground floor, first floor and roof
 * side by side, each with dimension strings, plus an information band.
 *
 *   node floorplan26/render.js     ->  output/house-26x36.png  (+ output/house-26x36-parts/)
 *
 * Refuses to draw if any floor fails check.js; exits non-zero if any label
 * overlaps another label or sits on linework.
 */
const fs = require('fs')
const path = require('path')
const S0 = require('./site')
const D = require('../floorplan/draw')
const { fmt } = require('../floorplan/units')
const { checkFloor } = require('./check')
const { renderFloor } = require('./render/floor')
const { strip } = require('./render/dims')
const { renderInfo } = require('./render/info')
const specs = require('./render/specs')

const S = 4
const OUT = path.join(__dirname, '..', 'output')
const FLOORS = [
    { mod: require('./ground'), spec: specs.GF, subtitle: 'arrival, guests, family living, cooking', road: 'ROAD  -  26\'-1" FRONT  -  CAR GATE + ENTRY' },
    { mod: require('./first'), spec: specs.FF, subtitle: 'three bedrooms, each with its own bath', road: 'street side' },
    { mod: require('./roof'), spec: specs.RF, subtitle: 'terrace, laundry, solar, water tank', road: 'street side' },
]
const CH = {
    GF: { top: 'GF x through bath / court / kitchen', bottom: 'GF x through drawing room / porch', left: 'GF y through guest bath / drawing / lounge / bath', right: 'GF y through porch / stair / kitchen' },
    FF: { top: 'FF x through master bath / court / study', bottom: 'FF x through bedroom 2 / bedroom 3', left: 'FF y through bath 2 / bed 2 / dressing / master / bath', right: 'FF y through bed 3 / hall / stair / study' },
    RF: { top: 'RF x through terrace / mumty', bottom: null, left: null, right: 'RF y through terraces / mumty / drying yard' },
}

const main = async () => {
    const checks = FLOORS.map((f) => checkFloor(f.mod))
    const failed = checks.flatMap((c, i) => c.errors.map((e) => `${FLOORS[i].mod.id}: ${e}`))
    if (failed.length) { console.error('Refusing to draw:\n' + failed.join('\n')); process.exit(1) }
    await D.loadFonts()
    fs.mkdirSync(path.join(OUT, 'house-26x36-parts'), { recursive: true })

    const overallX = [[S0.PLOT_W, 'plot width']]
    const overallY = [[S0.PLOT_H, 'plot depth']]
    const layers = []
    const blocks = FLOORS.map((f) => {
        const fl = f.mod
        const plan = renderFloor(fl, S, f.spec)
        const c = CH[fl.id]
        const chain = (name) => fl.chains[name]
        const top = strip([{ chain: chain(c.top) }], { vertical: false, outward: -1, S, name: `${fl.id} dims top` })
        const bottom = strip([{ chain: c.bottom ? chain(c.bottom) : overallX }, { chain: overallX }].slice(0, c.bottom ? 2 : 1), { vertical: false, outward: 1, S, name: `${fl.id} dims bottom` })
        const left = strip([{ chain: c.left ? chain(c.left) : overallY }, { chain: overallY }].slice(0, c.left ? 2 : 1), { vertical: true, outward: -1, S, name: `${fl.id} dims left` })
        const right = strip([{ chain: chain(c.right) }], { vertical: true, outward: 1, S, name: `${fl.id} dims right` })
        layers.push(plan.labels, top.labels, bottom.labels, left.labels, right.labels)
        return { f, fl, plan, top, bottom, left, right }
    })

    // geometry of one block
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
        const xp = x0 + leftW
        const yp = y0 + TITLE + topH
        sheet.composite(b.top.img, xp, yp - b.top.img.bitmap.height)
        sheet.composite(b.left.img, xp - b.left.img.bitmap.width, yp)
        sheet.composite(b.right.img, xp + planW, yp)
        sheet.composite(b.bottom.img, xp, yp + planH + ROAD)
        D.fillRect(sheet, xp, yp + planH + 14, xp + planW, yp + planH + ROAD - 14, i === 0 ? D.C.road : 0xeceef1ff)
        sheet.composite(b.plan.img, xp, yp)
        D.strokeRect(sheet, xp, yp, xp + planW - 1, yp + planH - 1, D.C.ink, 2)
        placed.push({ b, x0, y0, xp, yp })
    })
    sheet.composite(info.img, M, M + 80 + blockH + 40)
    L.freeze()
    L.place('HOUSE ON A 26\'-1" x 36\'-0" PLOT  -  ground floor, first floor and roof', M, M + 30, 50, D.C.ink, { anchor: 'left' })
    for (const { b, x0, y0, xp, yp } of placed) {
        L.place(b.fl.title, x0 + leftW, y0 + 36, 44, D.C.ink, { anchor: 'left' })
        L.place(b.f.subtitle, x0 + leftW, y0 + 84, 26, D.C.grey, { anchor: 'left' })
        const ry = yp + planH + ROAD / 2
        L.place(b.f.road, xp + planW / 2, ry + 10, 24, D.C.ink, { bg: blocks.indexOf(b) === 0 ? D.C.road : 0xeceef1ff })
        for (const t of b.plan.streetTags) {
            const bx = L.place(t.id, xp + t.x * S, yp + planH + 30, 20, D.C.tag, { bg: D.C.paper })
            D.strokeRect(sheet, bx.x1, bx.y1, bx.x2 - 1, bx.y2 - 1, D.C.tag, 2)
        }
    }
    layers.push(L)

    const issues = layers.flatMap((l) => l.issues)
    const count = layers.reduce((n, l) => n + l.boxes.length, 0)
    if (issues.length) {
        console.error(`LABEL CHECK FAILED (${issues.length} of ${count}):\n` + issues.join('\n'))
        process.exitCode = 2
    } else console.log(`label check: ${count} labels, none overlapping each other or any linework`)

    for (const b of blocks) await b.plan.img.writeAsync(path.join(OUT, 'house-26x36-parts', `${b.fl.id}-plan.png`))
    await info.img.writeAsync(path.join(OUT, 'house-26x36-parts', 'info.png'))
    await sheet.writeAsync(path.join(OUT, 'house-26x36.png'))
    console.log(`wrote output/house-26x36.png (${W} x ${H})`)
}

main().catch((e) => { console.error(e); process.exit(1) })
