/**
 * MODULE 2: residence (x = 15'-7" .. 42'-0", i.e. 26'-5" gross).
 */
const G = require('../geometry')
const D = require('../draw')
const { fmt } = require('../units')
const { makeRegion, drawBase, drawWindows, drawDoors, roomById } = require('./planRegion')
const { BAND_X2 } = require('./shops')

const size = (r) => `${fmt(r.x2 - r.x1)} x ${fmt(r.y2 - r.y1)}`

const renderResidence = (S) => {
    const R = makeRegion(BAND_X2, G.PLOT_W, S)
    drawBase(R)
    const { img, px, py } = R
    const K = G.keys

    // --- stair: 17 treads @ 9½" rising from the lounge towards the road
    const st = roomById.stair
    const treads = Math.round((st.y2 - st.y1) / 9.5)
    for (let k = 1; k < treads; k++) {
        const y = st.y1 + k * 9.5
        D.line(img, px(st.x1), py(y), px(st.x2), py(y), D.C.grey, 2)
    }
    const sx = px((st.x1 + st.x2) / 2)
    D.line(img, sx, py(st.y2 - 6), sx, py(st.y1 + 14), D.C.ink, 2)
    D.arrowHead(img, sx, py(st.y1 + 14), Math.PI / 2, D.C.ink, 16)
    D.fillRect(img, sx - 6, py(st.y2 - 6) - 6, sx + 6, py(st.y2 - 6) + 6, D.C.ink)
    D.text(img, `STAIR ${size(st)} - UP (17 x 9½")`, sx, py((st.y1 + st.y2) / 2 + 10), 22, D.C.ink, 90, D.C.stair)

    // --- car in porch (5'-10" x 15'-0")
    const p = roomById.porch
    const carW = 70
    const carL = 180
    const cx1 = (p.x1 + p.x2) / 2 - carW / 2
    D.strokeRect(img, px(cx1), py(p.y1 + 6 + carL), px(cx1 + carW), py(p.y1 + 6), D.C.grey, 2, [12, 8])
    D.text(img, 'CAR', px(cx1 + carW / 2), py(p.y1 + 6 + carL / 2 - 40), 22, D.C.grey)

    // --- shaft: open to sky
    const sh = roomById.shaft
    D.line(img, px(sh.x1), py(sh.y1), px(sh.x2), py(sh.y2), D.C.grey, 2)
    D.line(img, px(sh.x1), py(sh.y2), px(sh.x2), py(sh.y1), D.C.grey, 2)

    drawWindows(R)
    drawDoors(R)

    // --- labels (sizes computed from geometry, never typed by hand)
    const label = (lines, x, y, sizes) => {
        let off = -((lines.length - 1) * 34) / 2
        lines.forEach((t, i) => {
            const s = sizes[i] || 24
            D.text(img, t, px(x), py(y) + off, s, i === 0 ? D.C.ink : D.C.dim, 0, null)
            off += i === 0 ? 40 : 32
        })
    }
    const mid = (r) => [(r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2]
    const L = roomById.lounge
    const bay = roomById.loungeBay
    const k = roomById.kitchen
    const m = roomById.master
    const b2 = roomById.bed2
    const mb = roomById.mbath
    const bt = roomById.bath2

    label(['KITCHEN', size(k)], ...mid(k), [36, 26])
    label(['LOUNGE / DINING', size(L), `+ bay ${size(bay)}`], L.x1 + (L.x2 - L.x1) / 2, L.y1 + 100, [36, 26, 22])
    label(['MASTER BED', `${fmt(m.x2 - m.x1)} x ${fmt(K.YT - m.y1)}`, `(less shaft corner)`], (m.x1 + K.XSHAFT) / 2 - 6, m.y1 + 66, [36, 26, 20])
    label(['CAR PORCH', size(p)], (p.x1 + p.x2) / 2, p.y1 + 150, [34, 26])
    label(['BEDROOM 2', size(b2)], ...mid(b2), [36, 26])
    label(['M. BATH', fmt(mb.x2 - mb.x1), `x ${fmt(mb.y2 - mb.y1)}`], ...mid(mb), [26, 22, 22])
    label(['BATH 2', fmt(bt.x2 - bt.x1), `x ${fmt(bt.y2 - bt.y1)}`], ...mid(bt), [26, 22, 22])
    D.text(img, 'SHAFT', px(sh.x1 + (sh.x2 - sh.x1) / 2), py(sh.y1 + 30), 20, D.C.ink, 0, D.C.shaft)
    D.text(img, 'open sky', px(sh.x1 + (sh.x2 - sh.x1) / 2), py(sh.y1 + 22), 16, D.C.dim, 0, D.C.shaft)
    D.text(img, size(sh), px(sh.x1 + (sh.x2 - sh.x1) / 2), py(sh.y1 + 12), 16, D.C.dim, 0, D.C.shaft)

    // entry markers
    const ent = G.doors.find((d) => d.id === 'main')
    D.text(img, 'ENTRY', px(K.XE + 30), py((ent.from + ent.to) / 2), 22, D.C.ink, 0, D.C.porch)
    D.arrowHead(img, px(K.XE + 2), py((ent.from + ent.to) / 2), Math.PI, D.C.ink, 18)
    D.line(img, px(K.XE + 2), py((ent.from + ent.to) / 2), px(K.XE + 16), py((ent.from + ent.to) / 2), D.C.ink, 3)
    D.text(img, 'exhaust fan to roof', px((bt.x1 + bt.x2) / 2), py(bt.y2 - 8), 15, D.C.grey, 0, D.C.bath)
    return img
}

module.exports = { renderResidence }
