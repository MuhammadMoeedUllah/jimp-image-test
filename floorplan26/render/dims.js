/**
 * Dimension strips generated straight from the validated chains
 * ([[inches, label], ...]). All of a tier's figures sit on the side of its
 * line away from the plan; wall thicknesses that do not fit are staggered.
 */
const S0 = require('../site')
const D = require('../../floorplan/draw')
const { fmt } = require('../../floorplan/units')

const TIER = 104
const TICK = 11
const MAIN = 28
const SMALL = 22

const textW = (str, size) => {
    const b = D.inkBox(D.textImage(str, size))
    return b.x2 - b.x1
}

/**
 * tiers: [{ chain }] nearest the plan first.
 * opts: vertical (runs along y), outward (+1: tiers stack towards +across),
 *       name, S.
 */
const strip = (tiers, opts) => {
    const { vertical, outward, S, name } = opts
    const depth = TIER * tiers.length + 50
    const len = (vertical ? S0.PLOT_H : S0.PLOT_W) * S
    const img = vertical ? D.blank(depth, len) : D.blank(len, depth)
    const across = (t) => (outward > 0 ? 34 + TIER * t + TIER / 2 : depth - 34 - TIER * t - TIER / 2)
    const along = (inch) => (vertical ? len - inch * S : inch * S)
    const XY = (u, v) => (vertical ? [v, u] : [u, v])
    const lines = []
    tiers.forEach(({ chain }, t) => {
        const v = across(t)
        lines.push(v)
        const total = chain.reduce((a, [x]) => a + x, 0)
        D.line(img, ...XY(along(0), v), ...XY(along(total), v), D.C.dim, 2)
        let pos = 0
        const tick = (p) => {
            const [x, y] = XY(along(p), v)
            D.line(img, x - TICK, y + TICK, x + TICK, y - TICK, D.C.dim, 3)
        }
        tick(0)
        for (const [x] of chain) { pos += x; tick(pos) }
    })
    const L = new D.LabelLayer(img, name)
    L.freeze()
    const away = (k) => outward * k
    tiers.forEach(({ chain }, t) => {
        const v = across(t)
        let pos = 0
        let prev = 0
        for (const [x] of chain) {
            const u = (along(pos) + along(pos + x)) / 2
            const lbl = fmt(x)
            const rot = vertical ? 90 : 0
            if (x * S > textW(lbl, MAIN) + 34) {
                L.place(lbl, ...XY(u, v + away(25)), MAIN, D.C.dim, { rotate: rot })
                prev = 0
            } else {
                const level = prev === 1 ? 2 : 1
                L.place(lbl, ...XY(u, v + away(level === 1 ? 28 : 54)), SMALL, D.C.dim, { rotate: rot })
                prev = level
            }
            pos += x
        }
    })
    return { img, labels: L, lines, depth }
}

module.exports = { strip, TIER }
