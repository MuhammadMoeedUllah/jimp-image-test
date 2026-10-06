/**
 * Label placements per floor (plot inches). Sizes in px at S = 4.
 * Every label is audited by LabelLayer: it may not touch linework or text.
 */
const { fmt } = require('../../floorplan/units')

const sz = (w, d) => `${fmt(w)} x ${fmt(d)}`

const GF = {
    labels: [
        { text: 'CAR PORCH', x: 251, y: 101, size: 34, rotate: 90 },
        { text: sz(126, 198), x: 264, y: 101, size: 24, rotate: 90, dim: true },
        { text: 'car reversed in', x: 276, y: 101, size: 18, rotate: 90, color: 0x8a8a8aff },
        { text: 'entry', x: 201, y: 52, size: 18, color: 0x8a8a8aff },
        { text: 'FRONT ALLEY  2\'-0" deep', x: 150, y: 23, size: 17 },
        { text: 'AC units high on the jaali wall', x: 86, y: 27, size: 13, color: 0x8a8a8aff },
        { text: 'BEDROOM', x: 107, y: 172, size: 24 },
        { text: sz(160, 148.5), x: 107, y: 162, size: 16, dim: true },
        { text: 'BATH', x: 50, y: 123, size: 16 },
        { text: 'LOUNGE', x: 150, y: 290, size: 24 },
        { text: sz(169, 126), x: 150, y: 280, size: 16, dim: true },
        { text: 'DINING', x: 39, y: 233, size: 18 },
        { text: 'FOYER', x: 193, y: 285, size: 26, rotate: 90 },
        { text: 'STAIR', x: 266, y: 314, size: 22, bg: 0xf4f0f8ff, allowOver: true },
        { text: 'UP', x: 246, y: 232, size: 20, bg: 0xf4f0f8ff, allowOver: true },
        { text: 'KITCHEN', x: 241, y: 388, size: 30 },
        { text: sz(126, 86.5), x: 241, y: 377, size: 20, dim: true },
        { text: 'BATH', x: 45, y: 372, size: 20 },
        { text: 'COURT', x: 118, y: 352, size: 24 },
        { text: 'open to sky', x: 118, y: 343, size: 16, color: 0x8a8a8aff },
    ],
    tags: { W1: [130, 15], W2: [42, 15], W3: [186, 94], W4: [166, 355], W5: [92, 342] },
}

const FF = {
    labels: [
        { text: 'BEDROOM 2', x: 114, y: 118, size: 26 },
        { text: sz(160, 153), x: 114, y: 108, size: 18, dim: true },
        { text: 'BATH 2', x: 22, y: 36, size: 16 },
        { text: 'BEDROOM 3', x: 213, y: 82, size: 22, rotate: 90 },
        { text: sz(126, 153), x: 223, y: 82, size: 16, rotate: 90, dim: true },
        { text: 'BATH 3', x: 291, y: 36, size: 16 },
        { text: 'MASTER BEDROOM', x: 130, y: 263, size: 28 },
        { text: `${sz(164.5, 118.5)} + dressing`, x: 130, y: 253, size: 18, dim: true },
        { text: 'DRESSING', x: 60, y: 199, size: 18 },
        { text: 'M. BATH', x: 38, y: 372, size: 18 },
        { text: 'STUDY / PRAYER', x: 252, y: 378, size: 24 },
        { text: sz(126, 86.5), x: 252, y: 368, size: 18, dim: true },
        { text: 'HALL', x: 160, y: 184, size: 20 },
        { text: 'COURT BELOW', x: 127, y: 352, size: 18 },
        { text: 'STAIR', x: 266, y: 314, size: 22, bg: 0xf4f0f8ff, allowOver: true },
        { text: 'UP', x: 246, y: 232, size: 20, bg: 0xf4f0f8ff, allowOver: true },
    ],
    tags: {},
}

const RF = {
    labels: [
        { text: 'FAMILY TERRACE', x: 104, y: 292, size: 28 },
        { text: 'daybed', x: 32, y: 229, size: 16, rotate: 90, color: 0x8a8a8aff },
        { text: 'SOLAR 8 x 550 W', x: 240, y: 124, size: 22 },
        { text: 'MUMTY', x: 252, y: 191, size: 24 },
        { text: 'STAIR', x: 266, y: 314, size: 22, bg: 0xf4f0f8ff, allowOver: true },
        { text: 'water tank on mumty roof', x: 266, y: 268, size: 16, bg: 0xf4f0f8ff, allowOver: true },
        { text: 'STORE', x: 205, y: 245, size: 20, rotate: 90 },
        { text: 'LAUNDRY + DRYING', x: 228, y: 402, size: 22 },
        { text: 'COURT GRILLE', x: 127, y: 376, size: 18 },
    ],
    graphics: [{ type: 'dashedRect', x1: 232, y1: 222, x2: 300, y2: 290 }],
    tags: {},
}

module.exports = { GF, FF, RF }
