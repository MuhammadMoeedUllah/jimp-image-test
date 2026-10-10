/**
 * GROUND FLOOR - the reference plan (25' x 54') adjusted to 26'-1" x 36'-0".
 * House coordinates: x = 0 at the party wall with the shops (plot x 191).
 *
 * What stayed from the reference: car porch front-left with the 9' gate and
 * a small door beside it; drawing room front-right entered from the porch;
 * 7'-wide stair behind the porch; main door from the porch into the lounge;
 * guest WC behind the drawing room; kitchen and a bedroom with its bath at
 * the rear, lit by open-to-sky wells. What went: the 54' plan's second rear
 * bedroom and the 4'-6" bath/open band - 18 ft of depth are gone.
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
    WC: 251.5, //     guest WC wall left face
    WCL: 256, //      guest WC left face (4'-0" clear)
    BATH: 63, //      bedroom bath right face (4'-6")
    BED: 67.5, //     bedroom left face
    BEDR: 199.5, //   bedroom right face (11'-0")
    KIT: 204, //      kitchen left face (8'-4")
    GATE1: 13.5, //   9'-0" gate
    GATE2: 121.5,
    DOOR: 130.5, //   small door 2'-6"
}
const Y_WC = 234 //   guest WC rear face (5'-0" deep)
const Y_BATH = 366.5 // bedroom bath rear face (5'-8" deep)
const Y_KIT = 375 //   kitchen rear face (6'-4½" deep)

const rooms = [
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(X.L, Y.F, X.PORCH_R, Y.FRONT) },
    { id: 'drawing', name: 'DRAWING ROOM', kind: 'drawing', ...R(X.DRW, Y.F, XR, Y.FRONT) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.L, Y.MID, X.ST, Y.STAIR_END) },
    { id: 'stairB', partOf: 'stair', kind: 'stair', ...R(X.ST, Y.MID, X.STW, Y.MID + 40) }, // open side at the foot
    { id: 'lounge', name: 'LOUNGE', kind: 'room', ...R(X.STW, Y.MID, X.WC, Y.STAIR_END) },
    { id: 'loungeB', partOf: 'lounge', kind: 'room', ...R(X.WC, Y_WC + 4.5, XR, Y.STAIR_END) },
    { id: 'wc', name: 'GUEST WC', kind: 'bath', ...R(X.WCL, Y.MID, XR, Y_WC) },
    { id: 'bath', name: 'BATH', kind: 'bath', ...R(X.L, Y.REAR, X.BATH, Y_BATH) },
    { id: 'ots1', name: 'LIGHT WELL', kind: 'court', ...R(X.L, Y.OTS1, X.BATH, Y.T) },
    { id: 'bedroom', name: 'BEDROOM', kind: 'room', ...R(X.BED, Y.REAR, X.BEDR, Y.T) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'kitchen', ...R(X.KIT, Y.REAR, XR, Y_KIT) },
    { id: 'ots2', name: 'LIGHT WELL', kind: 'court', ...R(X.KIT, Y.OTS2, XR, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, H) }, // party wall with the shops
    { id: 'wR', ...R(XR, 0, W, H) },
    { id: 'wRear', ...R(EXT, Y.T, XR, H) },
    { id: 'wPier', ...R(X.L, 0, X.GATE1, Y.F) },
    { id: 'wGate', ...R(X.GATE2, 0, X.PORCH_R, Y.F) }, // pier + small door
    { id: 'wFront', ...R(X.PORCH_R, 0, XR, Y.F) }, // drawing room street wall
    { id: 'wPD', ...R(X.PORCH_R, Y.F, X.DRW, Y.MID) }, // porch | drawing (9" bearing)
    { id: 'wPL', ...R(X.L, Y.FRONT, X.PORCH_R, Y.MID) }, // porch rear: main door
    { id: 'wDL', ...R(X.DRW, Y.FRONT, XR, Y.MID) }, // drawing rear
    { id: 'wSt', ...R(X.ST, Y.MID + 40, X.STW, Y.STAIR_END) }, // stair | lounge
    { id: 'wWc1', ...R(X.WC, Y.MID, X.WCL, Y_WC + 4.5) },
    { id: 'wWc2', ...R(X.WCL, Y_WC, XR, Y_WC + 4.5) },
    { id: 'wMid', ...R(X.L, Y.STAIR_END, XR, Y.REAR) }, // middle | rear band
    { id: 'wBB', ...R(X.BATH, Y.REAR, X.BED, Y.T) }, // bath + well | bedroom
    { id: 'wBO', ...R(X.L, Y_BATH, X.BATH, Y.OTS1) }, // bath | light well
    { id: 'wBK', ...R(X.BEDR, Y.REAR, X.KIT, Y.T) }, // bedroom | kitchen + well
    { id: 'wKO', ...R(X.KIT, Y_KIT, XR, Y.OTS2) }, // kitchen | light well
]

const openings = [
    { id: 'gate', kind: 'gate', ...R(X.GATE1, 0, X.GATE2, Y.F) }, // 9'-0" x 7' gate
]

const doors = [
    { id: 'D0', label: 'Small door: street to porch (2\'-6")', wall: 'wGate', a: 'street', b: 'porch', from: X.DOOR, to: X.PORCH_R, swingInto: 'porch', hinge: 'end' },
    { id: 'D1', label: 'Drawing room from the porch', wall: 'wPD', a: 'porch', b: 'drawing', from: 20, to: 50, swingInto: 'drawing', hinge: 'start' },
    { id: 'D2', label: 'Main door: porch to lounge (3\'-6")', wall: 'wPL', a: 'porch', b: 'lounge', from: 103, to: 145, swingInto: 'lounge', hinge: 'end' },
    { id: 'D3', label: 'Drawing room from the lounge', wall: 'wDL', a: 'lounge', b: 'drawing', from: 215, to: 245, swingInto: 'drawing', hinge: 'start' },
    { id: 'D4', label: 'Guest WC', wall: 'wWc1', a: 'lounge', b: 'wc', from: 190, to: 216, swingInto: 'wc', hinge: 'start' },
    { id: 'D5', label: 'Bedroom', wall: 'wMid', a: 'lounge', b: 'bedroom', from: 104, to: 134, swingInto: 'bedroom', hinge: 'start' },
    { id: 'D6', label: 'Bedroom bath', wall: 'wBB', a: 'bedroom', b: 'bath', from: 300, to: 326, swingInto: 'bath', hinge: 'end' },
    { id: 'D7', label: 'Kitchen', wall: 'wMid', a: 'lounge', b: 'kitchen', from: 204, to: 232, swingInto: 'kitchen', hinge: 'end' },
]

const windows = [
    { id: 'W1', label: 'Drawing room to street (5\'-0")', wall: 'wFront', from: 200, to: 260 },
    { id: 'W2', label: 'Bedroom to rear-left light well', wall: 'wBB', from: 375, to: 419 },
    { id: 'W3', label: 'Bedroom to rear-right light well', wall: 'wBK', from: 383, to: 419 },
    { id: 'W4', label: 'Kitchen to light well (over the counter)', wall: 'wKO', from: 214, to: 294 },
    { id: 'W5', label: 'Bath to light well (high, frosted)', wall: 'wBO', from: 18, to: 48 },
    { id: 'W6', label: 'Sidelight beside the main door (fixed)', wall: 'wPL', from: 148, to: 160 },
    { id: 'W7', label: 'Stair to porch (high, borrowed light)', wall: 'wPL', from: 20, to: 80 },
]

const items = [
    { id: 'car', type: 'car', room: 'porch', ...R(30, 13, 100, 163) }, // 12'-6" hatchback; a 15' sedan overhangs the gate line
    // drawing room: sofas on three sides, centre table
    { id: 'dSofa3', type: 'sofa', room: 'drawing', facing: 'W', ...R(274, 40, 304, 112) },
    { id: 'dSofa2a', type: 'sofa', room: 'drawing', facing: 'E', ...R(171, 60, 201, 114) },
    { id: 'dSofa2b', type: 'sofa', room: 'drawing', facing: 'S', ...R(250, 132, 304, 165) },
    { id: 'dTable', type: 'table', room: 'drawing', ...R(225, 66, 249, 102) }, // 2'-0" x 3'-0": leaves 24" and 25" walkways
    // lounge: TV on the stair wall, sofa facing it, banquette dining for four by the kitchen door
    { id: 'tv', type: 'tv', room: 'lounge', ...R(97.5, 220, 113.5, 268) },
    { id: 'lSofa', type: 'sofa', room: 'lounge', facing: 'W', ...R(160, 212, 193, 284) },
    { id: 'dnBench', type: 'banquette', room: 'lounge', facing: 'W', ...R(286, 240, 304, 294) },
    { id: 'dnTable', type: 'table', room: 'lounge', ...R(252, 246, 286, 288) },
    { id: 'dnC1', type: 'chair', room: 'lounge', facing: 'E', ...R(234, 249, 252, 267) },
    { id: 'dnC2', type: 'chair', room: 'lounge', facing: 'E', ...R(234, 269, 252, 287) },
    // guest WC
    { id: 'wcWc', type: 'wc', room: 'wc', facing: 'S', ...R(283, 206, 301, 234) },
    { id: 'wcBasin', type: 'basin', room: 'wc', ...R(256, 174, 276, 190) },
    // bedroom: 5'-0" x 6'-6" bed, head on the rear wall, wardrobe on the front wall
    { id: 'bed', type: 'bed', room: 'bedroom', head: 'N', ...R(100, 345, 160, 423) },
    { id: 'side1', type: 'sidetable', room: 'bedroom', ...R(82, 405, 100, 423) },
    { id: 'side2', type: 'sidetable', room: 'bedroom', ...R(160, 405, 178, 423) },
    { id: 'ward', type: 'wardrobe', room: 'bedroom', tall: true, ...R(140, 298.5, 199.5, 322.5) },
    // bedroom bath
    { id: 'bBasin', type: 'basin', room: 'bath', ...R(9, 298.5, 29, 314.5) },
    { id: 'bWc', type: 'wc', room: 'bath', facing: 'S', ...R(13, 338.5, 31, 366.5) },
    { id: 'bShower', type: 'shower', room: 'bath', ...R(33, 336.5, 63, 366.5) },
    // kitchen: counter along the rear wall under the window, fridge by the door
    { id: 'kRear', type: 'counter', room: 'kitchen', ...R(204, 351, 304, 375) },
    { id: 'kRight', type: 'counter', room: 'kitchen', ...R(280, 328.5, 304, 351) },
    { id: 'fridge', type: 'fridge', room: 'kitchen', tall: true, ...R(274, 298.5, 304, 328.5) },
    { id: 'hob', type: 'hob', room: 'kitchen', on: 'kRear', ...R(220, 353, 244, 373) },
    { id: 'sink', type: 'sink', room: 'kitchen', on: 'kRear', ...R(256, 354, 280, 372) },
    // light wells: a planter each
    { id: 'p1', type: 'planter', room: 'ots1', ...R(9, 411, 63, 423) },
    { id: 'p2', type: 'planter', room: 'ots2', ...R(204, 411, 304, 423) },
]

const START = { name: 'porch, inside the small door', x: 145, y: 25 }
const targets = [
    { name: 'car driver door', x: 131, y: 90 },
    { name: 'main door landing', x: 124, y: 150 },
    { name: 'drawing room, between the sofas', x: 237, y: 120 },
    { name: 'lounge at the stair foot', x: 110, y: 194 },
    { name: 'lounge sofa', x: 140, y: 250 },
    { name: 'dining chair', x: 214, y: 258 },
    { name: 'guest WC', x: 270, y: 214 },
    { name: 'bedroom: bed side', x: 82, y: 380 },
    { name: 'bedroom: wardrobe', x: 175, y: 338 },
    { name: 'bedroom bath', x: 46, y: 325 },
    { name: 'kitchen hob', x: 232, y: 335 },
    { name: 'kitchen sink', x: 262, y: 338 },
    { name: 'kitchen fridge', x: 255, y: 315 },
]

const chains = {
    'GF x through porch / drawing room': [[EXT, 'wall'], [153, 'car porch'], [EXT, 'wall'], [133, 'drawing room'], [EXT, 'wall']],
    'GF x through stair / lounge / guest WC': [[EXT, 'wall'], [84, 'stair'], [4.5, 'wall'], [154, 'lounge'], [4.5, 'wall'], [48, 'guest WC'], [EXT, 'wall']],
    'GF x through bath / bedroom / kitchen': [[EXT, 'wall'], [54, 'bath'], [4.5, 'wall'], [132, 'bedroom'], [4.5, 'wall'], [100, 'kitchen'], [EXT, 'wall']],
    'GF y through porch / stair / bath / light well': [[EXT, 'gate line'], [156, 'car porch'], [EXT, 'wall'], [120, 'stair'], [4.5, 'wall'], [68, 'bath'], [4.5, 'wall'], [52, 'light well'], [EXT, 'wall']],
    'GF y through drawing / lounge / bedroom': [[EXT, 'wall'], [156, 'drawing room'], [EXT, 'wall'], [120, 'lounge'], [4.5, 'wall'], [124.5, 'bedroom'], [EXT, 'wall']],
    'GF y through drawing / WC / lounge / kitchen / light well': [[EXT, 'wall'], [156, 'drawing room'], [EXT, 'wall'], [60, 'guest WC'], [4.5, 'wall'], [55.5, 'lounge'], [4.5, 'wall'], [76.5, 'kitchen'], [4.5, 'wall'], [43.5, 'light well'], [EXT, 'wall']],
}

module.exports = { id: 'GF', title: 'GROUND FLOOR  26\'-1" x 36\'-0"', W, H, STAIR, rooms, walls, openings, doors, windows, items, START, targets, chains }
