/**
 * MODULE 2: residence (x = 15'-7" .. 42'-0", i.e. 26'-5" gross).
 */
const G = require('../geometry')
const F = require('../furniture')
const D = require('../draw')
const { fmt } = require('../units')
const { doorZones } = require('../validate')
const { makeRegion, drawBase, drawWindows, drawDoors, drawFurniture, roomById, wallById, openingRect, isVertical } = require('./planRegion')
const { BAND_X2 } = require('./shops')

const size = (r) => `${fmt(r.x2 - r.x1)} x ${fmt(r.y2 - r.y1)}`

// Tag positions (plot inches). Default: 13" off the wall on the approach
// side for doors, on the room side for windows; overrides where needed.
const TAG_AT = {
    D1: [370, 183], D2: [383, 196], W2: [370, 51], W4: [370, 130],
    W5: [484, 220], W7: [329, 361], V1: [347, 395], D6: [345, 355],
}

const renderResidence = (S) => {
    const R = makeRegion(BAND_X2, G.PLOT_W, S)
    drawBase(R)
    const { img, px, py } = R
    const K = G.keys

    // --- stair treads (17 x 9½") rising from the landing towards the road
    const st = roomById.stair
    for (let k = 1; k <= G.stair.TREADS; k++) {
        const y = st.y2 - k * G.stair.TREAD
        if (y <= st.y1) break
        D.line(img, px(st.x1), py(y), px(st.x2), py(y), D.C.grey, 2)
    }
    const sx = px(st.x1 + 7)
    D.line(img, sx, py(st.y2 - 4), sx, py(st.y1 + 12), D.C.ink, 3)
    D.arrowHead(img, sx, py(st.y1 + 12), Math.PI / 2, D.C.ink, 22, 3)
    D.ellipse(img, sx, py(st.y2 - 4), 7, 7, D.C.ink, 2, D.C.ink)

    // --- shaft: dashed inner outline (open to sky)
    const sh = roomById.shaft
    D.strokeRect(img, px(sh.x1) + 8, py(sh.y2) + 8, px(sh.x2) - 8, py(sh.y1) - 8, D.C.grey, 2, [12, 8])

    drawFurniture(R)
    drawWindows(R)
    drawDoors(R)

    // ----------------------------------------------------------- labels
    const L = new D.LabelLayer(img, 'residence')
    L.freeze()
    const P = (x, y) => [px(x), py(y)]
    const place = (str, x, y, size, color, opts) => L.place(str, ...P(x, y), size, color, opts)

    const k = roomById.kitchen
    place('KITCHEN', 297, 72, 40)
    place(size(k), 297, 59, 28, D.C.dim)

    const lo = roomById.lounge
    const bay = roomById.loungeBay
    place('LOUNGE / DINING', 276, 194, 36)
    place(size(lo), 276, 184, 28, D.C.dim)
    place(`+ bay ${size(bay)}`, 276, 176, 24, D.C.dim)
    place('LANDING', 208, 190, 20, D.C.grey)

    const m = roomById.master
    place('MASTER BED', 300, 349, 40)
    place(`${fmt(m.x2 - m.x1)} x ${fmt(K.YT - m.y1)}`, 300, 337, 28, D.C.dim)

    const dr = roomById.drawing
    place('DRAWING ROOM', 440, 228, 34)
    place(size(dr), 440, 218, 26, D.C.dim)

    place('M. BATH', 396, 376, 24)
    place('G. BATH', 457, 376, 24)

    place('SHAFT', 322, 409, 24)
    place('open sky', 322, 401, 20, D.C.dim)

    // stair text runs along the flight
    place(`STAIR ${size(st)}`, st.x1 + 19, 96, 26, D.C.ink, { rotate: 90, bg: D.C.stair, allowOver: true })
    place(`UP - ${G.stair.RISERS}R x ${G.stair.RISER}"  ${G.stair.TREADS}T x 9½"`, st.x1 + 30, 96, 20, D.C.ink, { rotate: 90, bg: D.C.stair, allowOver: true })

    // car porch text inside the car outline
    const p = roomById.porch
    const car = F.items.find((i) => i.id === 'car')
    const ccx = (car.x1 + car.x2) / 2
    place('CAR PORCH', ccx - 13, 103, 34, D.C.ink, { rotate: 90 })
    place(size(p), ccx, 103, 26, D.C.dim, { rotate: 90 })
    place(`car ${fmt(F.CAR.L)} x ${fmt(F.CAR.W)}`, ccx + 12, 103, 22, D.C.grey, { rotate: 90 })
    place('MAIN ENTRY', 388, 160, 22, D.C.ink, { rotate: 90 })
    place('ROLLING SHUTTER CAR GATE', (K.XE + K.XR) / 2, G.EXT / 2, 20, D.C.ink, { bg: D.C.porch, allowOver: true })

    // appliance marks (the TV label sits on its own dark symbol by design)
    const fr = F.items.find((i) => i.id === 'fridge')
    place('REF', (fr.x1 + fr.x2) / 2, (fr.y1 + fr.y2) / 2 - 2, 22, D.C.ink)
    const tv = F.items.find((i) => i.id === 'tv')
    place('TV', (tv.x1 + tv.x2) / 2, (tv.y1 + tv.y2) / 2, 22, D.C.paper, { rotate: 90, allowOver: true })

    // door / window tags
    const tagPos = (o, isDoor) => {
        if (TAG_AT[o.id]) return TAG_AT[o.id]
        const w = wallById[o.wall]
        const mid = (o.from + o.to) / 2
        if (isDoor) {
            const z = doorZones(o)
            const a = z.approach
            return isVertical(w) ? [(a.x1 + a.x2) / 2, mid] : [mid, (a.y1 + a.y2) / 2]
        }
        // window: room side = side that is not outside / porch
        return isVertical(w) ? [w.x1 - 12, mid] : [mid, w.y2 + 12]
    }
    const tags = []
    for (const d of G.doors) tags.push([d.id, ...tagPos(d, true)])
    for (const w of G.windows) {
        const r = openingRect(w)
        if (!R.inside(r)) continue
        if (w.wall === 'bottom') continue // tagged outside, on the road (render.js)
        tags.push([w.id, ...tagPos(w, false)])
    }
    for (const [id, x, y] of tags) {
        const b = place(id, x, y, 24, D.C.tag, { bg: D.C.paper })
        D.strokeRect(img, b.x1, b.y1, b.x2 - 1, b.y2 - 1, D.C.tag, 2)
    }
    return { img, labels: L }
}

module.exports = { renderResidence }
