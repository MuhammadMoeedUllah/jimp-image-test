/**
 * MODULE 3: dimension strings. Each strip is generated straight from the
 * chains in geometry.js, so a drawn dimension can never disagree with the
 * geometry that was validated. Text placement is collision-checked.
 */
const G = require('../geometry')
const D = require('../draw')
const { fmt } = require('../units')

const TIER = 110 // px between dimension tiers
const TICK = 11
const MAIN = 30 // px text for segments that fit
const SMALL = 24 // px text for wall thicknesses (staggered outside the line)

const labelWidth = (str, size) => {
    const t = D.textImage(str, size)
    const b = D.inkBox(t)
    return b.x2 - b.x1
}

/**
 * Generic strip along an axis. `len` = strip length in px along the axis.
 * place(u, v) maps (along, across) to image coords; rotate for vertical.
 */
const strip = (S, tiers, opts) => {
    const { vertical, outward } = opts // outward: +1 tiers stack away from plot towards +across
    const depth = TIER * tiers.length + 60
    const len = (vertical ? G.PLOT_H : G.PLOT_W) * S
    const img = vertical ? D.blank(depth, len) : D.blank(len, depth)
    // across position of tier t (0 = nearest the plot)
    const across = (t) => (outward > 0 ? 40 + TIER * t + TIER / 2 : depth - 40 - TIER * t - TIER / 2)
    // along position: horizontal strips run left->right; vertical strips run bottom->top
    const along = (inches) => (vertical ? len - inches * S : inches * S)
    const XY = (u, v) => (vertical ? [v, u] : [u, v])
    const lines = []
    tiers.forEach(({ chain }, t) => {
        const v = across(t)
        lines.push(v)
        const total = G.sum(chain)
        D.line(img, ...XY(along(0), v), ...XY(along(total), v), D.C.dim, 2)
        let pos = 0
        const tick = (p) => {
            const u = along(p)
            const [x, y] = XY(u, v)
            D.line(img, x - TICK, y + TICK, x + TICK, y - TICK, D.C.dim, 3)
        }
        tick(0)
        for (const [, val] of chain) { pos += val; tick(pos) }
    })
    const L = new D.LabelLayer(img, opts.name)
    L.freeze()
    // every label of a tier sits on the side of its line away from the plot,
    // so the band between two lines only ever holds one tier's text; wall
    // thicknesses that do not fit are staggered when two are adjacent
    const away = (k) => outward * k
    tiers.forEach(({ chain }, t) => {
        const v = across(t)
        let pos = 0
        let prevSmallLevel = 0
        for (const [, val] of chain) {
            const u = (along(pos) + along(pos + val)) / 2
            const lbl = fmt(val)
            const fits = val * S > labelWidth(lbl, MAIN) + 34
            const rot = vertical ? 90 : 0
            if (fits) {
                const [x, y] = XY(u, v + away(25))
                L.place(lbl, x, y, MAIN, D.C.dim, { rotate: rot })
                prevSmallLevel = 0
            } else {
                const level = prevSmallLevel === 1 ? 2 : 1
                const [x, y] = XY(u, v + away(level === 1 ? 28 : 54))
                L.place(lbl, x, y, SMALL, D.C.dim, { rotate: rot })
                prevSmallLevel = level
            }
            pos += val
        }
    })
    return { img, labels: L, lines }
}

const renderDimensions = (S) => {
    const c = G.chains
    const top = strip(S, [
        { chain: c['x through master / shaft / baths'].chain },
        { chain: [['commercial band', 187], ['residence', 317]] },
        { chain: [['plot', G.PLOT_W]] },
    ], { vertical: false, outward: -1, name: 'dims-top' })
    const bottom = strip(S, [
        { chain: c['x through stair / kitchen / porch'].chain },
    ], { vertical: false, outward: 1, name: 'dims-bottom' })
    const left = strip(S, [
        { chain: c['Shop frontage along 36-ft road'].chain },
        { chain: [['plot', G.PLOT_H]] },
    ], { vertical: true, outward: -1, name: 'dims-left' })
    const right = strip(S, [
        { chain: c['y through porch / drawing / baths'].chain },
        { chain: c['y through kitchen / lounge / master'].chain },
        { chain: [['plot', G.PLOT_H]] },
    ], { vertical: true, outward: 1, name: 'dims-right' })
    return { top, bottom, left, right }
}

module.exports = { renderDimensions, TIER }
