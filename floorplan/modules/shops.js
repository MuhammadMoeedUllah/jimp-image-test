/**
 * MODULE 1: commercial band (x = 0 .. 15'-7").
 * Four shops, 8'-3" clear frontage each on the 36-ft road, 13'-4" clear deep.
 */
const G = require('../geometry')
const D = require('../draw')
const { fmt } = require('../units')
const { makeRegion, drawBase, drawWindows, drawDoors } = require('./planRegion')

const BAND_X2 = G.keys.sx[4] // 187" = 15'-7"

const renderShops = (S) => {
    const R = makeRegion(0, BAND_X2, S)
    drawBase(R)
    drawWindows(R)
    drawDoors(R)
    const { img, px, py } = R
    const L = new D.LabelLayer(img, 'shops')
    L.freeze()
    for (const s of G.rooms.filter((r) => r.kind === 'shop')) {
        const cx = px((s.x1 + s.x2) / 2)
        const cy = py((s.y1 + s.y2) / 2)
        L.place(s.name, cx, cy - 46, 52)
        L.place(`${fmt(s.y2 - s.y1)} frontage`, cx, cy + 14, 32, D.C.dim)
        L.place(`x ${fmt(s.x2 - s.x1)} clear depth`, cx, cy + 56, 32, D.C.dim)
    }
    const s1 = G.rooms.find((r) => r.id === 'shop1')
    L.place('ROLLING SHUTTER', px((G.keys.sx[1] + G.keys.sx[2]) / 2), py((s1.y1 + s1.y2) / 2), 22, D.C.ink, { rotate: 90, bg: D.C.shop, allowOver: true })
    return { img, labels: L }
}

module.exports = { renderShops, BAND_X2 }
