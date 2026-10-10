/**
 * Label placements per floor (plot / house inches). Sizes in px at S = 4.
 * Every label is audited by LabelLayer: it may not touch linework or text.
 */
const { fmt } = require('../../floorplan/units')

const sz = (w, d) => `${fmt(w)} x ${fmt(d)}`
const grey = 0x8a8a8aff
const stairBg = 0xf4f0f8ff

const GF = {
    labels: [
        { text: 'CAR PORCH', x: 131, y: 95, size: 30, rotate: 90 },
        { text: sz(153, 156), x: 145, y: 95, size: 20, rotate: 90, dim: true },
        { text: 'driver side', x: 118, y: 95, size: 14, rotate: 90, color: grey },
        { text: 'entry', x: 118, y: 46, size: 14, color: grey },
        { text: 'FRONT ALLEY  2\'-0"', x: 233, y: 21, size: 14 },
        { text: 'DRAWING ROOM', x: 218, y: 153, size: 24 },
        { text: sz(133, 123), x: 224, y: 143, size: 16, dim: true },
        { text: 'STAIR', x: 51, y: 272, size: 22, bg: stairBg, allowOver: true },
        { text: 'UP', x: 29, y: 190, size: 20, bg: stairBg, allowOver: true },
        { text: 'LOUNGE', x: 178, y: 200, size: 24 },
        { text: sz(206.5, 120), x: 178, y: 190, size: 16, dim: true },
        { text: 'BATH', x: 236, y: 224, size: 14 },
        { text: 'OPEN', x: 288, y: 212, size: 14, rotate: 90 },
        { text: 'KITCHEN', x: 80, y: 345, size: 22 },
        { text: sz(121, 124.5), x: 80, y: 355, size: 15, dim: true },
        { text: 'O.T.S.', x: 36, y: 391, size: 12 },
        { text: 'BEDROOM', x: 193, y: 340, size: 22 },
        { text: sz(117, 124.5), x: 240, y: 365, size: 15, rotate: 90, dim: true },
        { text: 'BATH', x: 295, y: 332, size: 14, rotate: 90 },
        { text: 'O.T.S.', x: 288, y: 398, size: 11 },
    ],
    tags: { D1: [150, 62], W8: [65, 85], W3: [258, 244], W4: [280, 230], W7: [268, 388] },
}

const FF = {
    labels: [
        { text: 'BEDROOM 2', x: 100, y: 110, size: 22 },
        { text: sz(141.5, 156), x: 100, y: 100, size: 15, dim: true },
        { text: 'BATH 2', x: 42, y: 128, size: 13 },
        { text: 'TV LOUNGE', x: 280, y: 120, size: 26 },
        { text: sz(198, 165), x: 280, y: 110, size: 16, dim: true },
        { text: 'MASTER BEDROOM', x: 428, y: 120, size: 22 },
        { text: sz(133, 156), x: 428, y: 110, size: 15, dim: true },
        { text: 'BEDROOM 3', x: 112, y: 250, size: 20 },
        { text: sz(141.5, 120), x: 112, y: 240, size: 14, dim: true },
        { text: 'CORRIDOR', x: 173, y: 240, size: 16, rotate: 90 },
        { text: 'STAIR', x: 242, y: 272, size: 22, bg: stairBg, allowOver: true },
        { text: 'UP', x: 220, y: 190, size: 20, bg: stairBg, allowOver: true },
        { text: 'PANTRY', x: 300, y: 235, size: 18, rotate: 90 },
        { text: 'M. BATH', x: 395, y: 240, size: 14 },
        { text: 'DRESSING', x: 458, y: 240, size: 14, rotate: 90 },
        { text: 'BATH 3', x: 36, y: 330, size: 13 },
        { text: 'LAUNDRY', x: 104, y: 318, size: 14, rotate: 90 },
        { text: 'TERRACE', x: 90, y: 392, size: 20 },
        { text: 'open to sky', x: 120, y: 383, size: 12, color: grey },
        { text: 'LOBBY', x: 205, y: 320, size: 16 },
        { text: 'LINEN', x: 184, y: 400, size: 12 },
        { text: 'LIGHT WELL', x: 227, y: 400, size: 12 },
        { text: 'STUDY / PRAYER', x: 330, y: 345, size: 20 },
        { text: sz(132, 124.5), x: 330, y: 335, size: 14, dim: true },
        { text: 'TERRACE', x: 445, y: 350, size: 16 },
        { text: 'open to sky', x: 445, y: 341, size: 11, color: grey },
        { text: 'LIGHT WELL', x: 471, y: 401, size: 12 },
    ],
    tags: { W9: [21, 55], W10: [21, 127], W13: [40, 266], W14: [20, 333], W17: [242, 384], W19: [430, 310], W20: [318, 228] },
}

const SF = {
    labels: [
        { text: 'BEDROOM A', x: 100, y: 110, size: 22 },
        { text: sz(141.5, 156), x: 100, y: 100, size: 15, dim: true },
        { text: 'BATH A', x: 42, y: 128, size: 13 },
        { text: 'LOUNGE', x: 300, y: 112, size: 24 },
        { text: sz(198, 121), x: 310, y: 102, size: 15, dim: true },
        { text: 'DINING', x: 191, y: 76, size: 16, rotate: 90 },
        { text: 'LOBBY', x: 244, y: 150, size: 16 },
        { text: 'BEDROOM B', x: 428, y: 120, size: 22 },
        { text: sz(133, 156), x: 428, y: 110, size: 15, dim: true },
        { text: 'KITCHEN', x: 80, y: 232, size: 22 },
        { text: sz(141.5, 120), x: 80, y: 222, size: 15, dim: true },
        { text: 'CORRIDOR', x: 173, y: 240, size: 16, rotate: 90 },
        { text: 'STAIR', x: 242, y: 272, size: 22, bg: stairBg, allowOver: true },
        { text: 'UP', x: 220, y: 190, size: 20, bg: stairBg, allowOver: true },
        { text: 'GUEST WC', x: 306, y: 226, size: 13 },
        { text: 'STORE', x: 320, y: 266, size: 14 },
        { text: 'BATH B', x: 395, y: 240, size: 14 },
        { text: 'DRESSING', x: 458, y: 240, size: 14, rotate: 90 },
        { text: 'LAUNDRY', x: 22, y: 318, size: 14, rotate: 90 },
        { text: 'TERRACE', x: 95, y: 350, size: 20 },
        { text: 'open to sky', x: 95, y: 341, size: 12, color: grey },
        { text: 'LOBBY', x: 205, y: 320, size: 16 },
        { text: 'LINEN', x: 184, y: 400, size: 12 },
        { text: 'LIGHT WELL', x: 227, y: 400, size: 12 },
        { text: 'FAMILY ROOM', x: 324, y: 352, size: 20 },
        { text: sz(132, 124.5), x: 324, y: 342, size: 14, dim: true },
        { text: 'TERRACE B', x: 445, y: 350, size: 16 },
        { text: 'open to sky', x: 445, y: 341, size: 11, color: grey },
        { text: 'LIGHT WELL', x: 471, y: 401, size: 12 },
    ],
    tags: { W22: [21, 55], W23: [21, 127], W26: [45, 220], W27: [45, 304], W29: [242, 384], W31: [430, 310], W32: [318, 212] },
}

module.exports = { GF, FF, SF }
