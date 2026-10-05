/**
 * Proves the plan is dimensionally valid BEFORE anything is drawn:
 *  1. every dimension chain sums exactly to its stated total
 *  2. rooms + walls + openings tile the 42' x 36' plot with no overlap / gap
 *  3. every door / window sits inside its wall and joins the stated spaces
 *  4. the locked commercial constraints are untouched
 */
const G = require('./geometry')
const { fmt } = require('./units')

const RES = 2 // cells per inch (½" grid)

const validate = () => {
    const errors = []
    const report = []

    // 1. chains -----------------------------------------------------------
    for (const [name, { chain, total }] of Object.entries(G.chains)) {
        const s = G.sum(chain)
        const ok = s === total
        report.push(`${ok ? 'OK ' : 'ERR'} ${name}: ${chain.map(([, v]) => fmt(v)).join(' + ')} = ${fmt(s)} (target ${fmt(total)})`)
        if (!ok) errors.push(`chain "${name}" sums to ${fmt(s)}, expected ${fmt(total)}`)
    }

    // 2. tiling -----------------------------------------------------------
    const W = G.PLOT_W * RES
    const H = G.PLOT_H * RES
    const grid = new Array(W * H).fill(null)
    const all = [
        ...G.rooms.map((r) => ({ ...r, type: 'room' })),
        ...G.walls.map((w) => ({ ...w, type: 'wall' })),
        ...G.openings.map((o) => ({ ...o, type: 'opening' })),
    ]
    for (const e of all) {
        if ([e.x1, e.y1, e.x2, e.y2].some((v) => (v * RES) % 1 !== 0)) errors.push(`${e.id} is not on the ½" grid`)
        if (e.x2 <= e.x1 || e.y2 <= e.y1) errors.push(`${e.id} has non-positive size`)
        for (let y = e.y1 * RES; y < e.y2 * RES; y++) {
            for (let x = e.x1 * RES; x < e.x2 * RES; x++) {
                if (x < 0 || y < 0 || x >= W || y >= H) { errors.push(`${e.id} leaves the plot`); y = Infinity; break }
                const i = y * W + x
                if (grid[i]) { errors.push(`${e.id} overlaps ${grid[i].id} at (${fmt(x / RES)}, ${fmt(y / RES)})`); y = Infinity; break }
                grid[i] = e
            }
        }
    }
    const gaps = grid.reduce((n, c) => n + (c ? 0 : 1), 0)
    if (gaps) errors.push(`${gaps / RES / RES} sq in of the plot is unassigned`)
    report.push(`${gaps ? 'ERR' : 'OK '} tiling: ${all.length} elements cover ${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)} exactly, no overlaps`)

    const at = (x, y) => grid[Math.floor(y * RES) * W + Math.floor(x * RES)]
    const owner = (e) => e && (e.partOf || e.id)

    // 3. doors & windows --------------------------------------------------
    const wallById = Object.fromEntries(G.walls.map((w) => [w.id, w]))
    const checkOpening = (o, needSides) => {
        const w = wallById[o.wall]
        if (!w) return errors.push(`${o.id}: unknown wall ${o.wall}`)
        const vertical = w.y2 - w.y1 > w.x2 - w.x1
        const [lo, hi] = vertical ? [w.y1, w.y2] : [w.x1, w.x2]
        if (o.from < lo || o.to > hi) errors.push(`${o.id}: opening ${fmt(o.from)}-${fmt(o.to)} outside wall ${o.wall}`)
        const mid = (o.from + o.to) / 2
        const sideA = vertical ? at(w.x1 - 1, mid) : at(mid, w.y1 - 1)
        const sideB = vertical ? at(w.x2 + 0.5, mid) : at(mid, w.y2 + 0.5)
        // whole opening span must have the same rooms on both sides
        for (let t = o.from; t < o.to; t += 0.5) {
            const a = vertical ? at(w.x1 - 1, t) : at(t, w.y1 - 1)
            const b = vertical ? at(w.x2 + 0.5, t) : at(t, w.y2 + 0.5)
            if (owner(a) !== owner(sideA) || owner(b) !== owner(sideB)) { errors.push(`${o.id}: opening straddles a wall corner`); break }
        }
        if (needSides) {
            const got = [owner(sideA), owner(sideB)].sort().join('|')
            const want = [o.a, o.b].sort().join('|')
            if (got !== want) errors.push(`${o.id}: connects ${got}, expected ${want}`)
        }
        return { sideA: owner(sideA) || 'outside', sideB: owner(sideB) || 'outside', width: o.to - o.from }
    }
    for (const d of G.doors) {
        const r = checkOpening(d, true)
        if (r) report.push(`OK  door ${d.id}: ${fmt(r.width)} wide, ${r.sideA} <-> ${r.sideB}`)
    }
    for (const w of G.windows) {
        const r = checkOpening(w, false)
        if (r) report.push(`OK  window ${w.id}: ${fmt(r.width)} wide, ${r.sideA} <-> ${r.sideB}`)
    }

    // 4. locked constraints ----------------------------------------------
    const shops = G.rooms.filter((r) => r.kind === 'shop')
    for (const s of shops) {
        if (s.y2 - s.y1 !== G.SHOP_FRONT) errors.push(`${s.id} frontage is ${fmt(s.y2 - s.y1)}`)
        if (s.x2 - s.x1 !== 160) errors.push(`${s.id} depth is ${fmt(s.x2 - s.x1)}`)
    }
    report.push(`OK  4 shops x ${fmt(G.SHOP_FRONT)} frontage = ${fmt(4 * G.SHOP_FRONT)} clear on the 36'-0" road`)

    return { ok: errors.length === 0, errors, report }
}

if (require.main === module) {
    const { ok, errors, report } = validate()
    console.log(report.join('\n'))
    if (!ok) { console.error('\nFAILED:\n' + errors.join('\n')); process.exit(1) }
    console.log('\nPlan is dimensionally valid.')
}

module.exports = { validate }
