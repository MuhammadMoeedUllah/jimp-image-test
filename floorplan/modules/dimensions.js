/**
 * MODULE 3: dimension strings. Each strip is generated straight from the
 * chains in geometry.js, so a drawn dimension can never disagree with the
 * geometry that was validated.
 */
const G = require('../geometry')
const D = require('../draw')
const { fmt } = require('../units')

const TIER = 78 // px between dimension tiers
const TICK = 12

/**
 * Horizontal dimension strip.
 * tiers: [{ chain, start }] drawn from the plot outwards.
 * side: 'top' (tiers stack upward) or 'bottom'.
 */
const hStrip = (S, tiers, side, extraTitles = []) => {
    const h = TIER * tiers.length + 20
    const img = D.blank(G.PLOT_W * S, h)
    tiers.forEach(({ chain, start = 0, title }, t) => {
        const y = side === 'top' ? h - 20 - TIER * t - TIER / 2 + 10 : 20 + TIER * t + TIER / 2 - 10
        let x = start
        D.line(img, x * S, y, (start + G.sum(chain)) * S, y, D.C.dim, 2)
        let small = 0
        const tick = (xx) => D.line(img, xx * S - TICK, y + TICK, xx * S + TICK, y - TICK, D.C.dim, 3)
        tick(x)
        for (const [, v] of chain) {
            const cx = (x + v / 2) * S
            const lbl = fmt(v)
            const fits = v * S > 22 * lbl.length * 0.62 + 12
            if (fits) D.text(img, lbl, cx, y - 20, 24, D.C.dim)
            else {
                // small segment (wall): stagger the label outside the line
                const dy = side === 'top' ? (small % 2 ? -46 : -24) : (small % 2 ? 44 : 22)
                D.text(img, lbl, cx, y + (side === 'top' ? dy : dy), 17, D.C.dim)
                small++
            }
            x += v
            tick(x)
        }
        if (title) extraTitles.push({ title, y })
    })
    return img
}

/** vertical strip = horizontal strip rotated (dimension text reads bottom-up) */
const vStrip = (S, tiers, side) => {
    const H = G.PLOT_H * S
    const w = TIER * tiers.length + 20
    const img = D.blank(w, H)
    tiers.forEach(({ chain, start = 0 }, t) => {
        const x = side === 'left' ? w - 20 - TIER * t - TIER / 2 + 10 : 20 + TIER * t + TIER / 2 - 10
        const py = (yy) => H - yy * S
        let y = start
        D.line(img, x, py(y), x, py(start + G.sum(chain)), D.C.dim, 2)
        const tick = (yy) => D.line(img, x - TICK, py(yy) + TICK, x + TICK, py(yy) - TICK, D.C.dim, 3)
        tick(y)
        let small = 0
        for (const [, v] of chain) {
            const cy = py(y + v / 2)
            const lbl = fmt(v)
            const fits = v * S > 22 * lbl.length * 0.62 + 12
            const dir = side === 'left' ? -1 : 1
            if (fits) D.text(img, lbl, x + dir * 20, cy, 24, D.C.dim, 90)
            else {
                D.text(img, lbl, x + dir * (small % 2 ? 46 : 24) * (side === 'left' ? 1 : 1), cy, 17, D.C.dim, 90)
                small++
            }
            y += v
            tick(y)
        }
    })
    return img
}

const renderDimensions = (S) => {
    const c = G.chains
    const top = hStrip(S, [
        { chain: c['Section x through master / shaft / baths'].chain },
        { chain: [['commercial band', 187], ['residence', 317]] },
        { chain: [['plot', G.PLOT_W]] },
    ], 'top')
    const bottom = hStrip(S, [
        { chain: c['Section x through kitchen / stair / porch'].chain },
    ], 'bottom')
    const left = vStrip(S, [
        { chain: c['Shop frontage along 36-ft road'].chain },
        { chain: [['plot', G.PLOT_H]] },
    ], 'left')
    const right = vStrip(S, [
        { chain: c['Section y through porch / bedroom 2 / baths'].chain },
        { chain: c['Section y through kitchen / lounge / master'].chain },
        { chain: [['plot', G.PLOT_H]] },
    ], 'right')
    return { top, bottom, left, right }
}

module.exports = { renderDimensions }
