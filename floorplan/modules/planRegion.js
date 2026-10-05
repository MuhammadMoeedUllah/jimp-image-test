/**
 * Shared renderer: draws every geometry element that falls inside a vertical
 * strip [x1, x2] of the plot into its own image. The shop band and the
 * residence are each rendered through this, so the two parts stitch together
 * pixel-perfectly at x = 15'-7" (both are cut from the same geometry).
 */
const G = require('../geometry')
const F = require('../furniture')
const D = require('../draw')
const { doorZones } = require('../validate')

const { C } = D

const fillFor = {
    shop: C.shop, room: C.room, kitchen: C.kitchen, drawing: C.drawing, porch: C.porch, bath: C.bath, stair: C.stair, shaft: C.shaft,
}

const makeRegion = (x1, x2, S) => {
    const img = D.blank((x2 - x1) * S, G.PLOT_H * S)
    const px = (x) => (x - x1) * S
    const py = (y) => (G.PLOT_H - y) * S
    const clip = (r) => {
        const a = Math.max(r.x1, x1)
        const b = Math.min(r.x2, x2)
        if (b <= a) return null
        return { X1: px(a), X2: px(b), Y1: py(r.y2), Y2: py(r.y1) }
    }
    const inside = (r) => r.x1 >= x1 && r.x2 <= x2
    return { img, px, py, clip, inside, S, x1, x2 }
}

const drawBase = (R) => {
    const { img, clip, S } = R
    for (const r of G.rooms) {
        const c = clip(r)
        if (c) D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, fillFor[r.kind] || C.room)
    }
    for (const o of G.openings) {
        const c = clip(o)
        if (!c) continue
        if (o.kind === 'setback') {
            D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, C.setback)
            D.hatch(img, c.X1, c.Y1, c.X2, c.Y2, C.light, 3 * S)
        } else if (o.kind === 'shutter') {
            D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, C.shop)
            const mx = (c.X1 + c.X2) / 2
            D.line(img, mx - S, c.Y1, mx - S, c.Y2, C.ink, 2, [10, 6])
            D.line(img, mx + S, c.Y1, mx + S, c.Y2, C.ink, 2, [10, 6])
        } else if (o.kind === 'gate') {
            D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, C.porch)
            const my = (c.Y1 + c.Y2) / 2
            D.line(img, c.X1, my - S, c.X2, my - S, C.ink, 2, [16, 8])
            D.line(img, c.X1, my + S, c.X2, my + S, C.ink, 2, [16, 8])
        } else if (o.kind === 'rail') {
            D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, C.stair)
            D.line(img, c.X1 + 2, c.Y1, c.X1 + 2, c.Y2, C.ink, 2)
            D.line(img, c.X2 - 3, c.Y1, c.X2 - 3, c.Y2, C.ink, 2)
        }
    }
    for (const w of G.walls) {
        const c = clip(w)
        if (c) D.fillRect(img, c.X1, c.Y1, c.X2, c.Y2, C.wall)
    }
}

const wallById = Object.fromEntries(G.walls.map((w) => [w.id, w]))
const roomById = Object.fromEntries(G.rooms.map((r) => [r.id, r]))
const isVertical = (w) => w.y2 - w.y1 > w.x2 - w.x1

/** pixel rectangle of an opening cut in its wall */
const openingRect = (o) => {
    const w = wallById[o.wall]
    return isVertical(w) ? { x1: w.x1, x2: w.x2, y1: o.from, y2: o.to } : { x1: o.from, x2: o.to, y1: w.y1, y2: w.y2 }
}

const drawWindows = (R) => {
    const { img, px, py } = R
    for (const win of G.windows) {
        const w = wallById[win.wall]
        const r = openingRect(win)
        if (!R.inside(r)) continue
        const [X1, X2, Y1, Y2] = [px(r.x1), px(r.x2), py(r.y2), py(r.y1)]
        D.fillRect(img, X1, Y1, X2, Y2, C.paper)
        if (isVertical(w)) {
            D.line(img, X1, Y1, X1, Y2, C.ink, 2); D.line(img, X2 - 1, Y1, X2 - 1, Y2, C.ink, 2)
            D.line(img, (X1 + X2) / 2, Y1, (X1 + X2) / 2, Y2, C.glass, 3)
            D.line(img, X1, Y1, X2, Y1, C.ink, 2); D.line(img, X1, Y2 - 1, X2, Y2 - 1, C.ink, 2)
        } else {
            D.line(img, X1, Y1, X2, Y1, C.ink, 2); D.line(img, X1, Y2 - 1, X2, Y2 - 1, C.ink, 2)
            D.line(img, X1, (Y1 + Y2) / 2, X2, (Y1 + Y2) / 2, C.glass, 3)
            D.line(img, X1, Y1, X1, Y2, C.ink, 2); D.line(img, X2 - 1, Y1, X2 - 1, Y2, C.ink, 2)
        }
    }
}

/** door: clear opening + leaf + 90° swing arc, using the validated sweep */
const drawDoors = (R) => {
    const { img, px, py, S } = R
    for (const d of G.doors) {
        const w = wallById[d.wall]
        const r = openingRect(d)
        if (!R.inside(r)) continue
        const into = roomById[d.swingInto]
        D.fillRect(img, px(r.x1), py(r.y2), px(r.x2), py(r.y1), fillFor[into.kind] || C.room)
        const z = doorZones(d)
        const width = d.to - d.from
        let hinge, leafEnd, jamb
        if (z.vertical) {
            const face = z.east ? w.x2 : w.x1
            const dir = z.east ? 1 : -1
            const hy = d.hinge === 'start' ? d.from : d.to
            const oy = d.hinge === 'start' ? d.to : d.from
            hinge = [face, hy]; leafEnd = [face + dir * width, hy]; jamb = [face, oy]
        } else {
            const face = z.north ? w.y2 : w.y1
            const dir = z.north ? 1 : -1
            const hx = d.hinge === 'start' ? d.from : d.to
            const ox = d.hinge === 'start' ? d.to : d.from
            hinge = [hx, face]; leafEnd = [hx, face + dir * width]; jamb = [ox, face]
        }
        const P = ([x, y]) => [px(x), py(y)]
        const [hx, hy] = P(hinge)
        const [lx, ly] = P(leafEnd)
        const [jx, jy] = P(jamb)
        const a0 = Math.atan2(ly - hy, lx - hx)
        let a1 = Math.atan2(jy - hy, jx - hx)
        let da = a1 - a0
        while (da > Math.PI) da -= 2 * Math.PI
        while (da < -Math.PI) da += 2 * Math.PI
        a1 = a0 + da
        D.arc(img, hx, hy, width * S, a0, a1, C.grey, 2)
        D.line(img, hx, hy, lx, ly, C.ink, 4)
    }
}

// --------------------------------------------------------------- furniture
const drawItem = (R, it) => {
    const { img, px, py, S } = R
    const X1 = px(it.x1)
    const X2 = px(it.x2)
    const Y1 = py(it.y2)
    const Y2 = py(it.y1)
    const W = X2 - X1
    const H = Y2 - Y1
    const cx = (X1 + X2) / 2
    const cy = (Y1 + Y2) / 2
    const box = (fill = C.furnFill, w = 2, color = C.furn, dash = null) => {
        D.fillRect(img, X1, Y1, X2, Y2, fill)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, color, w, dash)
    }
    // back side of a seat is opposite to the direction it faces
    const backStrip = (depthIn) => {
        const d = depthIn * S
        const f = it.facing
        if (f === 'E') return [X1, Y1, X1 + d, Y2]
        if (f === 'W') return [X2 - d, Y1, X2, Y2]
        if (f === 'N') return [X1, Y2 - d, X2, Y2]
        return [X1, Y1, X2, Y1 + d] // facing S: back on the north side
    }
    switch (it.type) {
    case 'car': {
        D.fillRect(img, X1, Y1, X2, Y2, 0xf7f9fbff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, C.grey, 3, [14, 8])
        // windscreens
        D.line(img, X1 + 6 * S, Y1 + 40 * S, X2 - 6 * S, Y1 + 40 * S, C.grey, 2)
        D.line(img, X1 + 6 * S, Y2 - 34 * S, X2 - 6 * S, Y2 - 34 * S, C.grey, 2)
        break
    }
    case 'fridge':
        box(0xf4f4f4ff, 3)
        D.line(img, X1, Y1 + 5 * S, X2, Y1 + 5 * S, C.furn, 2)
        break
    case 'counter':
        box(0xf6f6f6ff, 2)
        break
    case 'hob':
        box(0xffffffff, 2, C.furn)
        for (const fx of [0.28, 0.72]) for (const fy of [0.3, 0.72]) D.ellipse(img, X1 + W * fx, Y1 + H * fy, 4.2 * S / 2 * 1.3, 4.2 * S / 2 * 1.3, C.furn, 2)
        break
    case 'sink':
        box(0xffffffff, 2)
        D.strokeRect(img, X1 + 3 * S, Y1 + 3 * S, X2 - 3 * S, Y2 - 3 * S, C.furn, 2)
        D.ellipse(img, cx, cy, 1.5 * S, 1.5 * S, C.furn, 2)
        break
    case 'table':
        box(0xffffffff, 3)
        break
    case 'chair': {
        box(0xffffffff, 2)
        const [a, b, c, d] = backStrip(4)
        D.fillRect(img, a, b, c, d, C.light)
        break
    }
    case 'sofa':
    case 'armchair': {
        box(0xffffffff, 2)
        const [a, b, c, d] = backStrip(it.type === 'sofa' ? 9 : 8)
        D.fillRect(img, a, b, c, d, C.light)
        D.strokeRect(img, a, b, c - 1, d - 1, C.furn, 2)
        // arms at both ends
        const arm = 6 * S
        if (it.facing === 'E' || it.facing === 'W') {
            D.fillRect(img, X1, Y1, X2, Y1 + arm, C.light); D.strokeRect(img, X1, Y1, X2 - 1, Y1 + arm, C.furn, 2)
            D.fillRect(img, X1, Y2 - arm, X2, Y2, C.light); D.strokeRect(img, X1, Y2 - arm, X2 - 1, Y2 - 1, C.furn, 2)
        } else {
            D.fillRect(img, X1, Y1, X1 + arm, Y2, C.light); D.strokeRect(img, X1, Y1, X1 + arm, Y2 - 1, C.furn, 2)
            D.fillRect(img, X2 - arm, Y1, X2, Y2, C.light); D.strokeRect(img, X2 - arm, Y1, X2 - 1, Y2 - 1, C.furn, 2)
        }
        break
    }
    case 'tv':
        box(0x3a3a3aff, 2, C.ink)
        break
    case 'bed': {
        box(0xffffffff, 3)
        // pillows at the head (west), blanket fold line
        const pw = 14 * S
        const ph = 26 * S
        D.strokeRect(img, X1 + 3 * S, cy - ph - 4, X1 + 3 * S + pw, cy - 6, C.furn, 2)
        D.strokeRect(img, X1 + 3 * S, cy + 6, X1 + 3 * S + pw, cy + ph + 4, C.furn, 2)
        D.line(img, X1 + 26 * S, Y1, X1 + 26 * S, Y2, C.furn, 2)
        D.line(img, X1 + 26 * S, Y1, X1 + 34 * S, Y1 + 10 * S, C.furn, 2)
        break
    }
    case 'sidetable':
        box(0xffffffff, 2)
        D.ellipse(img, cx, cy, 4 * S, 4 * S, C.furn, 2)
        break
    case 'wardrobe':
        box(0xf4f4f4ff, 3)
        D.line(img, X1 + 4 * S, cy, X2 - 4 * S, cy, C.furn, 2, [12, 8])
        for (let k = 1; k < 3; k++) D.line(img, X1 + (W * k) / 3, Y1, X1 + (W * k) / 3, Y2, C.furn, 2)
        break
    case 'wc': {
        // cistern against the wall (north), bowl in front
        D.fillRect(img, X1, Y1, X2, Y1 + 8 * S, 0xffffffff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y1 + 8 * S, C.furn, 2)
        D.ellipse(img, cx, Y1 + 8 * S + 9.5 * S, 7.5 * S, 9.5 * S, C.furn, 2, 0xffffffff)
        break
    }
    case 'basin':
        box(0xffffffff, 2)
        D.ellipse(img, cx, cy, W / 2 - 2.5 * S, H / 2 - 3 * S, C.furn, 2)
        break
    case 'shower':
        box(0xf2f8fbff, 2)
        D.line(img, X1, Y1, X2, Y2, C.light, 2)
        D.line(img, X1, Y2, X2, Y1, C.light, 2)
        D.ellipse(img, cx, cy, 2 * S, 2 * S, C.furn, 2, 0xffffffff)
        break
    default:
        box()
    }
}

const drawFurniture = (R) => {
    for (const it of F.items) if (R.inside(it)) drawItem(R, it)
}

module.exports = { makeRegion, drawBase, drawWindows, drawDoors, drawFurniture, roomById, wallById, openingRect, isVertical }
