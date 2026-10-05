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
    for (const s of G.rooms.filter((r) => r.kind === 'shop')) {
        const cx = px((s.x1 + s.x2) / 2)
        const cy = py((s.y1 + s.y2) / 2)
        D.text(img, s.name, cx, cy - 34, 40)
        D.text(img, `${fmt(s.y2 - s.y1)} front`, cx, cy + 12, 26, D.C.dim)
        D.text(img, `x ${fmt(s.x2 - s.x1)} deep`, cx, cy + 44, 26, D.C.dim)
    }
    // shutter callout
    D.text(img, 'SHUTTER', px(G.keys.sx[1] + 4.5), py(G.keys.sy[1] + 49.5), 16, D.C.ink, 90, D.C.shop)
    return img
}

module.exports = { renderShops, BAND_X2 }
