/**
 * Shared renderer: draws every geometry element that falls inside a vertical
 * strip [x1, x2] of the plot into its own image. The shop band and the
 * residence are each rendered through this, so the two parts stitch together
 * pixel-perfectly at x = 15'-7" (both are cut from the same geometry).
 */
const G = require('../geometry')
const D = require('../draw')

const { C } = D

const fillFor = {
    shop: C.shop, room: C.room, porch: C.porch, bath: C.bath, stair: C.stair, shaft: C.shaft,
}

const makeRegion = (x1, x2, S) => {
    const img = D.blank((x2 - x1) * S, G.PLOT_H * S)
    const px = (x) => (x - x1) * S
    const py = (y) => (G.PLOT_H - y) * S
    // clip a plot rect to this region, returns pixel rect or null
    const clip = (r) => {
        const a = Math.max(r.x1, x1)
        const b = Math.min(r.x2, x2)
        if (b <= a) return null
        return { X1: px(a), X2: px(b), Y1: py(r.y2), Y2: py(r.y1) }
    }
    return { img, px, py, clip, S, x1, x2 }
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
            D.line(img, c.X1, my, c.X2, my, C.ink, 3, [16, 8])
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

const drawWindows = (R) => {
    const { img, px, py } = R
    for (const win of G.windows) {
        const w = wallById[win.wall]
        if (isVertical(w)) {
            if (w.x1 < R.x1 || w.x2 > R.x2) continue
            const [X1, X2, Y1, Y2] = [px(w.x1), px(w.x2), py(win.to), py(win.from)]
            D.fillRect(img, X1, Y1, X2, Y2, C.paper)
            for (const f of [0, 0.5, 1]) D.line(img, X1 + (X2 - X1) * f, Y1, X1 + (X2 - X1) * f, Y2, f === 0.5 ? C.glass : C.ink, 2)
            D.line(img, X1, Y1, X2, Y1, C.ink, 2); D.line(img, X1, Y2, X2, Y2, C.ink, 2)
        } else {
            if (win.from < R.x1 || win.to > R.x2) continue
            const [X1, X2, Y1, Y2] = [px(win.from), px(win.to), py(w.y2), py(w.y1)]
            D.fillRect(img, X1, Y1, X2, Y2, C.paper)
            for (const f of [0, 0.5, 1]) D.line(img, X1, Y1 + (Y2 - Y1) * f, X2, Y1 + (Y2 - Y1) * f, f === 0.5 ? C.glass : C.ink, 2)
            D.line(img, X1, Y1, X1, Y2, C.ink, 2); D.line(img, X2, Y1, X2, Y2, C.ink, 2)
        }
    }
}

/** door: clear opening in the wall + leaf + 90° swing arc into `swingInto` */
const drawDoors = (R) => {
    const { img, px, py } = R
    for (const d of G.doors) {
        const w = wallById[d.wall]
        const into = roomById[d.swingInto]
        if (w.x1 < R.x1 || w.x2 > R.x2) continue
        const fill = fillFor[into.kind] || C.room
        if (isVertical(w)) {
            const [X1, X2] = [px(w.x1), px(w.x2)]
            const [Ya, Yb] = [py(d.from), py(d.to)] // Ya > Yb in pixels
            D.fillRect(img, X1, Yb, X2, Ya, fill)
            const dir = into.x1 >= w.x2 ? 1 : -1 // swing to the right or left
            const face = dir > 0 ? X2 : X1
            const hy = d.hinge === 'start' ? Ya : Yb
            const oy = d.hinge === 'start' ? Yb : Ya
            const r = Math.abs(Ya - Yb)
            D.line(img, face, hy, face + dir * r, hy, C.ink, 3)
            const a0 = Math.atan2(0, dir)
            const a1 = Math.atan2(oy - hy, 0)
            D.arc(img, face, hy, r, a0, a0 + angleDelta(a0, a1), C.grey, 2)
        } else {
            const [Y1, Y2] = [py(w.y2), py(w.y1)]
            const [Xa, Xb] = [px(d.from), px(d.to)]
            D.fillRect(img, Xa, Y1, Xb, Y2, fill)
            const dir = into.y1 >= w.y2 ? -1 : 1 // pixel direction (up = -1)
            const face = dir < 0 ? Y1 : Y2
            const hx = d.hinge === 'start' ? Xa : Xb
            const ox = d.hinge === 'start' ? Xb : Xa
            const r = Math.abs(Xb - Xa)
            D.line(img, hx, face, hx, face + dir * r, C.ink, 3)
            const a0 = Math.atan2(dir, 0)
            const a1 = Math.atan2(0, ox - hx)
            D.arc(img, hx, face, r, a0, a0 + angleDelta(a0, a1), C.grey, 2)
        }
    }
}
const angleDelta = (a0, a1) => {
    let d = a1 - a0
    while (d > Math.PI) d -= 2 * Math.PI
    while (d < -Math.PI) d += 2 * Math.PI
    return d
}

module.exports = { makeRegion, drawBase, drawWindows, drawDoors, roomById }
