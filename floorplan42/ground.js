/**
 * GROUND FLOOR - the reference plan (25' x 54') fitted to 26'-1" x 36'-0".
 * House coordinates: x = 0 at the party wall with the shops (plot x 191).
 *
 * Kept in the reference's own places, nothing added: car porch front-left
 * with the 9' gate and small door; drawing room front-right entered from the
 * porch; 7'-wide stair behind the porch; double door from the porch into the
 * lounge beside the stair foot; guest bath + "open" light well behind the
 * drawing room; lounge in the middle with the reference's sofa set; kitchen
 * at the rear LEFT behind the stair; a bedroom with its bath at the rear
 * right. The reference's one O.T.S. is split into two small wells so the
 * kitchen, the bedroom and the bath each get a window.
 *
 * What cannot fit (chosen with the client): the reference's second rear
 * bedroom. Behind a 13' porch and a 9'-8" stair there is one 10'-4½" band
 * left, not three; that bedroom is bedroom 3 on the first floor.
 */
const { HOUSE_W, PLOT_H, EXT, STAIR, Y } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })
const W = HOUSE_W // 313
const H = PLOT_H // 432
const XR = W - EXT // 304

const X = {
    L: 9,
    PORCH_R: 162, //  porch 12'-9" clear
    DRW: 171, //      drawing room left face (9" wall 162-171)
    ST: 93, //        stair box right face (7'-0")
    STW: 97.5, //     lounge left face
    LR: 215.5, //     lounge main part right face (9'-10")
    WC: 220, //       guest WC left face (3'-11½" clear)
    WCR: 267.5, //    guest WC right face
    OPEN: 272, //     open (light well) left face (2'-8" clear)
    KIT_R: 130, //    kitchen right face (10'-1")
    BED: 134.5, //    bedroom left face (9'-9")
    BEDR: 251.5, //   bedroom right face
    BATH: 256, //     bedroom bath left face (4'-0")
    OTS1R: 63, //     rear-left well right face (4'-6")
    GATE1: 13.5, //   9'-0" gate
    GATE2: 121.5,
    DOOR: 130.5, //   small door 2'-6"
}
const Y_WC = 234 //    guest WC + open rear face (5'-0" deep)
const Y_K1 = 366.5 //  kitchen full-width part rear face (5'-8")
const Y_BATH = 375 //  bedroom bath rear face (6'-4½" deep)

const rooms = [
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(X.L, Y.F, X.PORCH_R, Y.FRONT) },
    { id: 'drawing', name: 'DRAWING ROOM', kind: 'drawing', ...R(X.DRW, Y.F, XR, Y.FRONT) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.L, Y.MID, X.ST, Y.STAIR_END) },
    { id: 'stairB', partOf: 'stair', kind: 'stair', ...R(X.ST, Y.MID, X.STW, Y.MID + 40) }, // open side at the foot
    { id: 'lounge', name: 'LOUNGE', kind: 'room', ...R(X.STW, Y.MID, X.LR, Y.STAIR_END) },
    { id: 'loungeB', partOf: 'lounge', kind: 'room', ...R(X.LR, Y_WC + 4.5, XR, Y.STAIR_END) },
    { id: 'wc', name: 'GUEST BATH', kind: 'bath', ...R(X.WC, Y.MID, X.WCR, Y_WC) },
    { id: 'open', name: 'OPEN', kind: 'court', ...R(X.OPEN, Y.MID, XR, Y_WC) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'kitchen', ...R(X.L, Y.REAR, X.KIT_R, Y_K1) },
    { id: 'kitchenB', partOf: 'kitchen', kind: 'kitchen', ...R(X.OTS1R + 4.5, Y_K1, X.KIT_R, Y.T) },
    { id: 'ots1', name: 'O.T.S.', kind: 'court', ...R(X.L, Y.OTS1, X.OTS1R, Y.T) },
    { id: 'bedroom', name: 'BEDROOM', kind: 'room', ...R(X.BED, Y.REAR, X.BEDR, Y.T) },
    { id: 'bath', name: 'BATH', kind: 'bath', ...R(X.BATH, Y.REAR, XR, Y_BATH) },
    { id: 'ots2', name: 'O.T.S.', kind: 'court', ...R(X.BATH, Y.OTS2, XR, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, H) }, // party wall with the shops
    { id: 'wR', ...R(XR, 0, W, H) },
    { id: 'wRear', ...R(EXT, Y.T, XR, H) },
    { id: 'wPier', ...R(X.L, 0, X.GATE1, Y.F) },
    { id: 'wGate', ...R(X.GATE2, 0, X.PORCH_R, Y.F) }, // pier + small door
    { id: 'wFront', ...R(X.PORCH_R, 0, XR, Y.F) }, // drawing room street wall
    { id: 'wPD', ...R(X.PORCH_R, Y.F, X.DRW, Y.MID) }, // porch | drawing (9" bearing)
    { id: 'wPL', ...R(X.L, Y.FRONT, X.PORCH_R, Y.MID) }, // porch rear: double main door
    { id: 'wDL', ...R(X.DRW, Y.FRONT, XR, Y.MID) }, // drawing rear
    { id: 'wSt', ...R(X.ST, Y.MID + 40, X.STW, Y.STAIR_END) }, // stair | lounge
    { id: 'wWc1', ...R(X.LR, Y.MID, X.WC, Y_WC + 4.5) }, // lounge | guest bath
    { id: 'wWcO', ...R(X.WCR, Y.MID, X.OPEN, Y_WC) }, // guest bath | open
    { id: 'wWc2', ...R(X.WC, Y_WC, XR, Y_WC + 4.5) }, // guest bath + open | lounge dining
    { id: 'wMid', ...R(X.L, Y.STAIR_END, XR, Y.REAR) }, // middle | rear band
    { id: 'wKB', ...R(X.KIT_R, Y.REAR, X.BED, Y.T) }, // kitchen | bedroom
    { id: 'wKO1', ...R(X.L, Y_K1, X.OTS1R, Y.OTS1) }, // kitchen | O.T.S.
    { id: 'wKO2', ...R(X.OTS1R, Y_K1, X.OTS1R + 4.5, Y.T) }, // O.T.S. | kitchen rear part
    { id: 'wBB', ...R(X.BEDR, Y.REAR, X.BATH, Y.T) }, // bedroom | bath + O.T.S.
    { id: 'wBO', ...R(X.BATH, Y_BATH, XR, Y.OTS2) }, // bath | O.T.S.
]

const openings = [
    { id: 'gate', kind: 'gate', ...R(X.GATE1, 0, X.GATE2, Y.F) }, // 9'-0" x 7' gate
]

const doors = [
    { id: 'D0', label: 'Small door: street to porch (2\'-6")', wall: 'wGate', a: 'street', b: 'porch', from: X.DOOR, to: X.PORCH_R, swingInto: 'porch', hinge: 'end' },
    { id: 'D1', label: 'Drawing room from the porch', wall: 'wPD', a: 'porch', b: 'drawing', from: 20, to: 50, swingInto: 'drawing', hinge: 'start' },
    { id: 'D2a', label: 'Main door, left leaf (4\'-0" double door)', wall: 'wPL', a: 'porch', b: 'lounge', from: 100, to: 124, swingInto: 'lounge', hinge: 'start' },
    { id: 'D2b', label: 'Main door, right leaf', wall: 'wPL', a: 'porch', b: 'lounge', from: 124, to: 148, swingInto: 'lounge', hinge: 'end' },
    { id: 'D4', label: 'Guest bath', wall: 'wWc1', a: 'lounge', b: 'wc', from: 190, to: 216, swingInto: 'wc', hinge: 'start' },
    { id: 'D5', label: 'Bedroom', wall: 'wMid', a: 'lounge', b: 'bedroom', from: 196, to: 226, swingInto: 'bedroom', hinge: 'start' },
    { id: 'D6', label: 'Bedroom bath', wall: 'wBB', a: 'bedroom', b: 'bath', from: 300, to: 326, swingInto: 'bath', hinge: 'end' },
    { id: 'D7', label: 'Kitchen', wall: 'wMid', a: 'lounge', b: 'kitchen', from: 100, to: 128, swingInto: 'kitchen', hinge: 'end' },
]

const windows = [
    { id: 'W1', label: 'Drawing room to street (5\'-0")', wall: 'wFront', from: 200, to: 260 },
    { id: 'W2', label: 'Drawing room to the open', wall: 'wDL', from: 278, to: 298 },
    { id: 'W3', label: 'Lounge to the open', wall: 'wWc2', from: 278, to: 298 },
    { id: 'W4', label: 'Guest bath to the open (frosted)', wall: 'wWcO', from: 196, to: 226 },
    { id: 'W5', label: 'Kitchen to O.T.S. (over the hob)', wall: 'wKO1', from: 15, to: 57 },
    { id: 'W6', label: 'Bedroom to O.T.S.', wall: 'wBB', from: 383, to: 419 },
    { id: 'W7', label: 'Bath to O.T.S. (high, frosted)', wall: 'wBO', from: 266, to: 294 },
    { id: 'W8', label: 'Stair to porch (high, borrowed light)', wall: 'wPL', from: 20, to: 80 },
]

const items = [
    { id: 'car', type: 'car', room: 'porch', ...R(30, 13, 100, 163) }, // 12'-6" hatchback; a 15' sedan overhangs the gate line
    // drawing room: sofas on three sides, centre table (as the reference)
    { id: 'dSofa3', type: 'sofa', room: 'drawing', facing: 'W', ...R(274, 40, 304, 112) },
    { id: 'dSofa2a', type: 'sofa', room: 'drawing', facing: 'E', ...R(171, 60, 201, 114) },
    { id: 'dSofa2b', type: 'sofa', room: 'drawing', facing: 'S', ...R(250, 132, 304, 165) },
    { id: 'dTable', type: 'table', room: 'drawing', ...R(225, 66, 249, 102) },
    // lounge: the reference's sofa set - a sofa on the rear wall between the two doors,
    // a sofa on the right wall under the open's window, centre table
    { id: 'lSofaA', type: 'sofa', room: 'lounge', facing: 'S', ...R(137, 261, 191, 294) },
    { id: 'lSofaB', type: 'sofa', room: 'lounge', facing: 'W', ...R(271, 240, 304, 294) },
    { id: 'lTable', type: 'table', room: 'lounge', ...R(140, 222, 176, 244) },
    // guest bath
    { id: 'wcBasin', type: 'basin', room: 'wc', ...R(220, 174, 240, 190) },
    { id: 'wcWc', type: 'wc', room: 'wc', facing: 'S', ...R(247, 206, 265, 234) },
    // kitchen: fridge by the door, hob under the O.T.S. window, sink on the rear wall
    { id: 'fridge', type: 'fridge', room: 'kitchen', tall: true, ...R(9, 298.5, 39, 328.5) },
    { id: 'kHob', type: 'counter', room: 'kitchen', ...R(9, 342.5, 63, 366.5) },
    { id: 'hob', type: 'hob', room: 'kitchen', on: 'kHob', ...R(20, 344.5, 44, 364.5) },
    { id: 'kRight', type: 'counter', room: 'kitchen', ...R(106, 328.5, 130, 399) },
    { id: 'kRear', type: 'counter', room: 'kitchen', ...R(67.5, 399, 130, 423) },
    { id: 'sink', type: 'sink', room: 'kitchen', on: 'kRear', ...R(80, 401, 104, 421) },
    // bedroom: 5'-0" x 6'-6" bed, head on the rear wall, wardrobe on the front wall
    { id: 'bed', type: 'bed', room: 'bedroom', head: 'N', ...R(163, 345, 223, 423) },
    { id: 'side1', type: 'sidetable', room: 'bedroom', ...R(145, 405, 163, 423) },
    { id: 'side2', type: 'sidetable', room: 'bedroom', ...R(223, 405, 241, 423) },
    { id: 'ward', type: 'wardrobe', room: 'bedroom', tall: true, ...R(136, 298.5, 190, 322.5) },
    // bedroom bath
    { id: 'bBasin', type: 'basin', room: 'bath', ...R(284, 298.5, 304, 314.5) },
    { id: 'bShower', type: 'shower', room: 'bath', ...R(256, 345, 286, 375) },
    { id: 'bWc', type: 'wc', room: 'bath', facing: 'S', ...R(286, 347, 304, 375) },
    // light wells: a planter each
    { id: 'p1', type: 'planter', room: 'ots1', ...R(9, 411, 63, 423) },
    { id: 'p2', type: 'planter', room: 'ots2', ...R(256, 411, 304, 423) },
]

const START = { name: 'porch, inside the small door', x: 145, y: 25 }
const targets = [
    { name: 'car driver door', x: 131, y: 90 },
    { name: 'main door landing', x: 124, y: 150 },
    { name: 'drawing room, between the sofas', x: 237, y: 120 },
    { name: 'lounge at the stair foot', x: 110, y: 194 },
    { name: 'lounge: rear sofa', x: 195, y: 250 },
    { name: 'lounge: right sofa', x: 250, y: 266 },
    { name: 'guest bath', x: 234, y: 212 },
    { name: 'kitchen fridge', x: 56, y: 312 },
    { name: 'kitchen hob', x: 50, y: 331 },
    { name: 'kitchen sink', x: 88, y: 385 },
    { name: 'bedroom: bed side', x: 150, y: 380 },
    { name: 'bedroom: wardrobe', x: 163, y: 334 },
    { name: 'bedroom bath', x: 272, y: 333 },
]

const chains = {
    'GF x through porch / drawing room': [[EXT, 'wall'], [153, 'car porch'], [EXT, 'wall'], [133, 'drawing room'], [EXT, 'wall']],
    'GF x through stair / lounge / guest bath / open': [[EXT, 'wall'], [84, 'stair'], [4.5, 'wall'], [118, 'lounge'], [4.5, 'wall'], [47.5, 'guest bath'], [4.5, 'wall'], [32, 'open'], [EXT, 'wall']],
    'GF x through kitchen / bedroom / bath': [[EXT, 'wall'], [121, 'kitchen'], [4.5, 'wall'], [117, 'bedroom'], [4.5, 'wall'], [48, 'bath'], [EXT, 'wall']],
    'GF y through porch / stair / kitchen / O.T.S.': [[EXT, 'gate line'], [156, 'car porch'], [EXT, 'wall'], [120, 'stair'], [4.5, 'wall'], [68, 'kitchen'], [4.5, 'wall'], [52, 'O.T.S.'], [EXT, 'wall']],
    'GF y through drawing / lounge / bedroom': [[EXT, 'wall'], [156, 'drawing room'], [EXT, 'wall'], [120, 'lounge'], [4.5, 'wall'], [124.5, 'bedroom'], [EXT, 'wall']],
    'GF y through drawing / open / dining / bath / O.T.S.': [[EXT, 'wall'], [156, 'drawing room'], [EXT, 'wall'], [60, 'open'], [4.5, 'wall'], [55.5, 'lounge dining'], [4.5, 'wall'], [76.5, 'bath'], [4.5, 'wall'], [43.5, 'O.T.S.'], [EXT, 'wall']],
}

module.exports = { id: 'GF', title: 'GROUND FLOOR  26\'-1" x 36\'-0"', W, H, STAIR, rooms, walls, openings, doors, windows, items, START, targets, chains }
