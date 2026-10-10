/**
 * Renders one floor (ground / first / roof) at S px per inch.
 * Returns { img, labels } - labels is a LabelLayer that has audited every
 * text placement against linework and other text.
 */
const S0 = require('../site')
const D = require('../../floorplan/draw')
const { makeZones, isVertical } = require('../check')
const { drawItem } = require('./symbols')

const { C } = D
const FILL = {
    room: 0xffffffff, drawing: 0xf3f7eeff, kitchen: 0xfff8ecff, bath: 0xe6f2f7ff, porch: 0xeef1f4ff,
    foyer: 0xfbf7f0ff, hall: 0xfbf7f0ff, stair: 0xf4f0f8ff, court: 0xe2f1dcff, void: 0xe8f2e4ff,
    terrace: 0xf5f2ecff, utility: 0xfff8ecff, alley: 0xf1ece2ff,
}

const renderFloor = (floor, S, spec) => {
    const PW = floor.W || S0.PLOT_W
    const PH = floor.H || S0.PLOT_H
    const img = D.blank(PW * S, PH * S)
    const px = (x) => x * S
    const py = (y) => (PH - y) * S // road (y = 0) at the bottom of the drawing
    const R = { img, px, py, S }
    const rect = (r, color) => D.fillRect(img, px(r.x1), py(r.y2), px(r.x2), py(r.y1), color)
    const zones = makeZones(floor)
    const wallById = Object.fromEntries(floor.walls.map((w) => [w.id, w]))
    const roomById = Object.fromEntries(floor.rooms.map((r) => [r.id, r]))

    for (const r of floor.rooms) {
        rect(r, FILL[r.kind] || C.room)
        if (r.kind === 'void') {
            // open to sky: light diagonal hatch + dashed outline (grille on the roof)
            D.hatch(img, px(r.x1), py(r.y2), px(r.x2), py(r.y1), 0xc9dfc0ff, 4 * S)
        }
    }
    for (const o of floor.openings) {
        if (o.kind === 'gate') {
            rect(o, FILL.porch)
            const my = (py(o.y1) + py(o.y2)) / 2
            D.line(img, px(o.x1), my - S, px(o.x2), my - S, C.ink, 2, [16, 8])
            D.line(img, px(o.x1), my + S, px(o.x2), my + S, C.ink, 2, [16, 8])
        } else if (o.kind === 'rail') {
            rect(o, FILL.stair)
            if (o.y2 - o.y1 > o.x2 - o.x1) {
                D.line(img, px(o.x1) + 2, py(o.y2), px(o.x1) + 2, py(o.y1), C.ink, 2)
                D.line(img, px(o.x2) - 3, py(o.y2), px(o.x2) - 3, py(o.y1), C.ink, 2)
            } else {
                D.line(img, px(o.x1), py(o.y2) + 2, px(o.x2), py(o.y2) + 2, C.ink, 2)
                D.line(img, px(o.x1), py(o.y1) - 3, px(o.x2), py(o.y1) - 3, C.ink, 2)
            }
        }
    }
    for (const w of floor.walls) {
        if (!w.low && !w.jaali) { rect(w, C.wall); continue }
        // jaali (perforated brick) wall: light masonry with a row of perforations
        rect(w, w.jaali ? 0xa98a62ff : 0xc9b28cff)
        if (isVertical(w)) {
            const cx = (px(w.x1) + px(w.x2)) / 2
            for (let y = py(w.y2) + 8; y < py(w.y1) - 4; y += 14) D.ellipse(img, cx, y, 3, 3, 0x7a5f3aff, 2, 0xf1ece2ff)
        } else {
            const cy = (py(w.y1) + py(w.y2)) / 2
            for (let x = px(w.x1) + 8; x < px(w.x2) - 4; x += 14) D.ellipse(img, x, cy, 3, 3, 0x5a4328ff, 2, 0xf1ece2ff)
        }
    }

    // stair: dog-leg in the box, flight A on the left rising away from the
    // road, landing at the rear, flight B returning
    const st = roomById.stair
    if (st) {
        const T = floor.STAIR || S0.STAIR
        const ax2 = st.x1 + T.FLIGHT_W
        const bx1 = ax2 + T.GAP
        const land = st.y2 - T.LANDING
        for (let k = 0; k <= T.TREADS_PER_FLIGHT; k++) {
            const y = st.y1 + k * T.TREAD
            D.line(img, px(st.x1), py(y), px(ax2), py(y), C.grey, 2)
            D.line(img, px(bx1), py(y), px(st.x2), py(y), C.grey, 2)
        }
        D.fillRect(img, px(ax2), py(land), px(bx1), py(st.y1), C.ink) // central handrail wall
        D.line(img, px(st.x1), py(land), px(st.x2), py(land), C.grey, 2)
        // UP arrow: up flight A, across the landing, down flight B
        const ax = px((st.x1 + ax2) / 2)
        const bx = px((bx1 + st.x2) / 2)
        const ly = py(land + T.LANDING / 2)
        D.ellipse(img, ax, py(st.y1 + 4), 6, 6, C.ink, 2, C.ink)
        D.line(img, ax, py(st.y1 + 4), ax, ly, C.ink, 3)
        D.line(img, ax, ly, bx, ly, C.ink, 3)
        D.line(img, bx, ly, bx, py(st.y1 + 10), C.ink, 3)
        D.arrowHead(img, bx, py(st.y1 + 10), Math.PI / 2, C.ink, 18, 3)
    }

    for (const it of floor.items) drawItem(R, it)

    // windows
    for (const win of floor.windows) {
        const w = wallById[win.wall]
        const r = isVertical(w) ? { x1: w.x1, x2: w.x2, y1: win.from, y2: win.to } : { x1: win.from, x2: win.to, y1: w.y1, y2: w.y2 }
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

    // doors
    for (const d of floor.doors) {
        const w = wallById[d.wall]
        const v = isVertical(w)
        const r = v ? { x1: w.x1, x2: w.x2, y1: d.from, y2: d.to } : { x1: d.from, x2: d.to, y1: w.y1, y2: w.y2 }
        const into = roomById[d.swingInto] || roomById[d.b]
        rect(r, FILL[into.kind] || C.room)
        if (d.slide) {
            // two overlapping glass leaves inside the wall thickness
            const [X1, X2, Y1, Y2] = [px(r.x1), px(r.x2), py(r.y2), py(r.y1)]
            if (v) {
                D.line(img, X1 + 3, Y1, X1 + 3, (Y1 + Y2) / 2 + 6, C.ink, 3)
                D.line(img, X2 - 4, (Y1 + Y2) / 2 - 6, X2 - 4, Y2, C.ink, 3)
            } else {
                D.line(img, X1, Y1 + 3, (X1 + X2) / 2 + 6, Y1 + 3, C.ink, 3)
                D.line(img, (X1 + X2) / 2 - 6, Y2 - 4, X2, Y2 - 4, C.ink, 3)
            }
            continue
        }
        const z = zones(d)
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
        let da = Math.atan2(jy - hy, jx - hx) - a0
        while (da > Math.PI) da -= 2 * Math.PI
        while (da < -Math.PI) da += 2 * Math.PI
        D.arc(img, hx, hy, width * S, a0, a0 + da, C.grey, 2)
        D.line(img, hx, hy, lx, ly, C.ink, 4)
    }

    // extra linework from the spec (e.g. water tank outline on the roof)
    for (const g of (spec.graphics || [])) {
        if (g.type === 'dashedRect') D.strokeRect(img, px(g.x1), py(g.y2), px(g.x2), py(g.y1), g.color || C.grey, 3, [14, 8])
    }

    // ------------------------------------------------------------- labels
    const L = new D.LabelLayer(img, floor.id)
    L.freeze()
    for (const l of spec.labels) {
        L.place(l.text, px(l.x), py(l.y), l.size || 28, l.color || (l.dim ? C.dim : C.ink), { rotate: l.rotate || 0, bg: l.bg, allowOver: l.allowOver })
    }
    // door / window tags: default on the approach side (doors) or room side (windows)
    const streetTags = [] // openings in the street wall are tagged outside the plan
    for (const o of [...floor.doors, ...floor.windows]) {
        if (spec.noTags && spec.noTags.includes(o.id)) continue
        if (['wFront', 'wGate', 'wBound'].includes(o.wall)) { streetTags.push({ id: o.id, x: (o.from + o.to) / 2 }); continue }
        let pos = spec.tags && spec.tags[o.id]
        if (!pos) {
            const w = wallById[o.wall]
            const mid = (o.from + o.to) / 2
            const v = isVertical(w)
            if (o.swingInto || o.slide) {
                const a = zones(o).approach
                pos = v ? [(o.slide ? w.x1 - 12 : (a.x1 + a.x2) / 2), mid] : [mid, (o.slide ? w.y1 - 12 : (a.y1 + a.y2) / 2)]
            } else {
                pos = v ? [w.x1 - 12, mid] : [mid, w.y2 + 12]
            }
        }
        const b = L.place(o.id, px(pos[0]), py(pos[1]), 22, C.tag, { bg: C.paper })
        D.strokeRect(img, b.x1, b.y1, b.x2 - 1, b.y2 - 1, C.tag, 2)
    }
    return { img, labels: L, streetTags }
}

module.exports = { renderFloor }
