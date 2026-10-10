/**
 * SECOND FLOOR - 42'-0" x 36'-0", an independent portion (married son,
 * parents, or rental). Plot coordinates like the first floor.
 *
 * Idea: the shared stair arrives in a small lobby with the portion's own
 * front door, so the family floor below stays private. Inside: a lounge with
 * a banquette dining over the porch, a sunny corner kitchen on both streets,
 * two bedroom suites stacked on the suites below (so every pipe runs
 * straight down), a guest WC by the lounge, a family room lit by the two
 * light wells, a laundry, and two open terraces - one behind a jaali on the
 * shop road, one off bedroom B.
 */
const { PLOT_W, PLOT_H, EXT, STAIR, PX, Y } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })
const W = PLOT_W
const H = PLOT_H

const X = {
    L: 9, AR: 150.5, COR: 155, STL: 191, ST: PX.HL, STR: PX.STR, STW: PX.STW,
    LBL: 195.5, LBR: 293, //  lobby walls
    PD: PX.PD, PDW: PX.PDW, MB: 357.5, MBR: 423.5, DR: 428,
    BATHA: 59.5, LA: 59.5, LAW: 64, STO: 195.5, OTS1R: PX.OTS1R,
    FAM: PX.BED, FAMR: PX.BEDR, KIT: PX.KIT, R: PX.R,
}
const Y_BA = 100.5 //   bath A front wall
const Y_LB = 130 //     lobby front wall (lounge is 10'-1" deep)
const Y_LBF = 134.5
const Y_PF = 178.5 //   guest WC front face
const Y_WC = 234 //     guest WC rear face
const Y_LOBBY = 366.5
const Y_T2 = 375

const rooms = [
    { id: 'bedA', name: 'BEDROOM A', kind: 'room', ...R(X.L, Y.F, X.AR, Y_BA) },
    { id: 'bedAB', partOf: 'bedA', kind: 'room', ...R(X.BATHA + 4.5, Y_BA, X.AR, Y.FRONT) },
    { id: 'bathA', name: 'BATH A', kind: 'bath', ...R(X.L, Y_BA + 4.5, X.BATHA, Y.FRONT) },
    { id: 'lounge', name: 'LOUNGE + DINING', kind: 'room', ...R(X.COR, Y.F, X.PD, Y_LB) },
    { id: 'loungeB', partOf: 'lounge', kind: 'room', ...R(X.COR, Y_LB, X.LBL, Y.MID) },
    { id: 'loungeC', partOf: 'lounge', kind: 'room', ...R(X.LBR, Y_LB, X.PD, Y.MID) },
    { id: 'lobby', name: 'LOBBY', kind: 'hall', ...R(X.ST, Y_LBF, X.STW, Y.MID) },
    { id: 'bedB', name: 'BEDROOM B', kind: 'room', ...R(X.PDW, Y.F, X.R, Y.FRONT) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'kitchen', ...R(X.L, Y.MID, X.AR, Y.STAIR_END) },
    { id: 'corridor', name: 'CORRIDOR', kind: 'hall', ...R(X.COR, Y.MID, X.STL, Y.REAR) },
    { id: 'lobbyR', partOf: 'corridor', kind: 'hall', ...R(X.COR, Y.REAR, X.OTS1R, Y_LOBBY) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.ST, Y.MID, X.STR, Y.STAIR_END) },
    { id: 'wc', name: 'GUEST WC', kind: 'bath', ...R(X.STW, Y_PF, X.PD, Y_WC) },
    { id: 'store', name: 'STORE', kind: 'utility', ...R(X.STW, Y_WC + 4.5, X.PD, Y.STAIR_END) },
    { id: 'bathB', name: 'BATH B', kind: 'bath', ...R(X.MB, Y.MID, X.MBR, Y.STAIR_END) },
    { id: 'dressB', name: 'DRESSING', kind: 'room', ...R(X.DR, Y.MID, X.R, Y.STAIR_END) },
    { id: 'laundry', name: 'LAUNDRY', kind: 'utility', ...R(X.L, Y.REAR, X.LA, Y_LOBBY) },
    { id: 'terrace', name: 'TERRACE', kind: 'terrace', ...R(X.LAW, Y.REAR, X.AR, Y.OTS1) },
    { id: 'terraceB', partOf: 'terrace', kind: 'terrace', ...R(X.L, Y.OTS1, X.AR, Y.T) },
    { id: 'store2', name: 'LINEN', kind: 'utility', ...R(X.COR, Y.OTS1, X.STO, Y.T) },
    { id: 'ots1', name: 'LIGHT WELL', kind: 'void', ...R(X.ST, Y.OTS1, X.OTS1R, Y.T) },
    { id: 'family', name: 'FAMILY ROOM', kind: 'room', ...R(X.FAM, Y.REAR, X.FAMR, Y.T) },
    { id: 'terrace2', name: 'TERRACE B', kind: 'terrace', ...R(X.KIT, Y.REAR, X.R, Y_T2) },
    { id: 'ots2', name: 'LIGHT WELL', kind: 'void', ...R(X.KIT, Y.OTS2, X.R, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, Y.OTS1) },
    { id: 'wLj', jaali: true, ...R(0, Y.OTS1, EXT, Y.T) },
    { id: 'wL2', ...R(0, Y.T, EXT, H) },
    { id: 'wR', ...R(X.R, 0, W, H) },
    { id: 'wRear', ...R(EXT, Y.T, X.R, H) },
    { id: 'wFront', ...R(EXT, 0, X.R, Y.F) },
    { id: 'wA1', ...R(X.BATHA, Y_BA, X.BATHA + 4.5, Y.FRONT) },
    { id: 'wA2', ...R(X.L, Y_BA, X.BATHA, Y_BA + 4.5) },
    { id: 'wAR', ...R(X.AR, Y.F, X.COR, Y.MID) }, // bedroom A | lounge
    { id: 'wFK', ...R(X.L, Y.FRONT, X.AR, Y.MID) }, // bedroom A | kitchen (9")
    { id: 'wLbF', ...R(X.LBL, Y_LB, X.LBR, Y_LBF) }, // lobby front wall: the portion's door
    { id: 'wLbL', ...R(X.LBL, Y_LBF, X.ST, Y.MID) },
    { id: 'wLbR', ...R(X.STW, Y_LBF, X.LBR, Y.MID) },
    { id: 'wBR', ...R(X.PD, Y.F, X.PDW, Y.MID) }, // lounge | bedroom B (9")
    { id: 'wBB', ...R(X.PDW, Y.FRONT, X.R, Y.MID) }, // bedroom B rear wall (9")
    { id: 'wCL', ...R(X.AR, Y.MID, X.COR, Y.T) }, // kitchen + terrace | corridor + linen
    { id: 'wStL', ...R(X.STL, Y.MID, X.ST, Y.STAIR_END) },
    { id: 'wStR', ...R(X.STR, Y.MID, X.STW, Y.STAIR_END) },
    { id: 'wPF', ...R(X.STW, Y.MID, X.PD, Y_PF) }, // guest WC front wall
    { id: 'wWcS', ...R(X.STW, Y_WC, X.PD, Y_WC + 4.5) }, // guest WC | store
    { id: 'wPM', ...R(X.PD, Y.MID, X.MB, Y.STAIR_END) },
    { id: 'wMD', ...R(X.MBR, Y.MID, X.DR, Y.STAIR_END) },
    { id: 'wRB1', ...R(X.L, Y.STAIR_END, X.AR, Y.REAR) }, // kitchen rear wall
    { id: 'wRB', ...R(X.STL, Y.STAIR_END, X.R, Y.REAR) },
    { id: 'wLaR', ...R(X.LA, Y.REAR, X.LAW, Y.OTS1) }, // laundry | terrace
    { id: 'wLaB', ...R(X.L, Y_LOBBY, X.LA, Y.OTS1) },
    { id: 'wCO', ...R(X.COR, Y_LOBBY, X.OTS1R, Y.OTS1) },
    { id: 'wSO1', ...R(X.STO, Y.OTS1, X.ST, Y.T) },
    { id: 'wSB', ...R(X.OTS1R, Y.REAR, X.FAM, Y.T) },
    { id: 'wSO', ...R(X.FAMR, Y.REAR, X.KIT, Y.T) },
]

const openings = [
    { id: 'rail2', kind: 'rail', ...R(X.KIT, Y_T2, X.R, Y.OTS2) },
]

const doors = [
    { id: 'D21', label: 'Portion front door: lobby to lounge (2\'-10")', wall: 'wLbF', a: 'lobby', b: 'lounge', from: 210, to: 244, swingInto: 'lounge', hinge: 'start' },
    { id: 'D22', label: 'Bedroom A', wall: 'wAR', a: 'lounge', b: 'bedA', from: 120, to: 150, swingInto: 'bedA', hinge: 'start' },
    { id: 'D23', label: 'Bath A', wall: 'wA1', a: 'bedA', b: 'bathA', from: 108, to: 134, swingInto: 'bathA', hinge: 'end' },
    { id: 'D24', label: 'Bedroom B', wall: 'wBR', a: 'lounge', b: 'bedB', from: 110, to: 140, swingInto: 'bedB', hinge: 'start' },
    { id: 'D25', label: 'Bath B', wall: 'wBB', a: 'bedB', b: 'bathB', from: 372, to: 398, swingInto: 'bathB', hinge: 'start' },
    { id: 'D26', label: 'Dressing B', wall: 'wBB', a: 'bedB', b: 'dressB', from: 445, to: 475, swingInto: 'dressB', hinge: 'end' },
    { id: 'D27', label: 'Terrace B (from the dressing)', wall: 'wRB', a: 'dressB', b: 'terrace2', from: 440, to: 470, swingInto: 'terrace2', hinge: 'end' },
    { id: 'D28', label: 'Guest WC', wall: 'wPF', a: 'lounge', b: 'wc', from: 300, to: 328, swingInto: 'wc', hinge: 'start' },
    { id: 'D29', label: 'Store (from the family room)', wall: 'wRB', a: 'family', b: 'store', from: 300, to: 324, swingInto: 'store', hinge: 'start' },
    { id: 'D30', label: 'Kitchen', wall: 'wCL', a: 'corridor', b: 'kitchen', from: 190, to: 220, swingInto: 'kitchen', hinge: 'start' },
    { id: 'D31', label: 'Terrace (2\'-2")', wall: 'wCL', a: 'corridor', b: 'terrace', from: 305, to: 331, swingInto: 'terrace', hinge: 'start' },
    { id: 'D32', label: 'Laundry', wall: 'wLaR', a: 'terrace', b: 'laundry', from: 310, to: 336, swingInto: 'laundry', hinge: 'end' },
    { id: 'D33', label: 'Family room', wall: 'wSB', a: 'corridor', b: 'family', from: 305, to: 335, swingInto: 'family', hinge: 'start' },
    { id: 'D34', label: 'Linen store', wall: 'wCO', a: 'corridor', b: 'store2', from: 165, to: 189, swingInto: 'store2', hinge: 'start' },
]

const windows = [
    { id: 'W21', label: 'Bedroom A to street (high, over the bed)', wall: 'wFront', from: 40, to: 100 },
    { id: 'W22', label: 'Bedroom A to shop road', wall: 'wL', from: 30, to: 80 },
    { id: 'W23', label: 'Bath A to shop road (high, frosted)', wall: 'wL', from: 110, to: 130 },
    { id: 'W24', label: 'Lounge to street (8\'-4")', wall: 'wFront', from: 200, to: 300 },
    { id: 'W25', label: 'Bedroom B to street (high, over the bed)', wall: 'wFront', from: 390, to: 470 },
    { id: 'W26', label: 'Kitchen to shop road (over the sink)', wall: 'wL', from: 190, to: 250 },
    { id: 'W27', label: 'Laundry to shop road (high)', wall: 'wL', from: 320, to: 346 },
    { id: 'W28', label: 'Rear lobby to light well (grille)', wall: 'wCO', from: 210, to: 244 },
    { id: 'W29', label: 'Family room to rear-left light well', wall: 'wSB', from: 375, to: 419 },
    { id: 'W30', label: 'Family room to rear-right light well', wall: 'wSO', from: 383, to: 419 },
    { id: 'W31', label: 'Bath B to terrace B (high)', wall: 'wRB', from: 398, to: 420 },
    { id: 'W32', label: 'Guest WC to stairwell (high)', wall: 'wStR', from: 200, to: 230 },
]

const items = [
    // bedroom A (stacked on bedroom 2)
    { id: 'aBed', type: 'bed', room: 'bedA', head: 'S', ...R(40, 9, 100, 87) },
    { id: 'aS1', type: 'sidetable', room: 'bedA', ...R(20, 9, 38, 27) },
    { id: 'aS2', type: 'sidetable', room: 'bedA', ...R(102, 9, 120, 27) },
    { id: 'aWard', type: 'wardrobe', room: 'bedA', tall: true, ...R(64, 141, 118, 165) },
    { id: 'aBasin', type: 'basin', room: 'bathA', ...R(9, 105, 29, 121) },
    { id: 'aWc', type: 'wc', room: 'bathA', facing: 'S', ...R(41.5, 137, 59.5, 165) },
    { id: 'aShower', type: 'shower', room: 'bathA', ...R(9, 135, 39, 165) },
    // lounge: banquette dining on the left wall, sofa and TV on the right
    { id: 'dnBench', type: 'banquette', room: 'lounge', facing: 'E', ...R(155, 40, 173, 112) },
    { id: 'dnTable', type: 'table', room: 'lounge', ...R(173, 46, 209, 106) },
    { id: 'dnC1', type: 'chair', room: 'lounge', facing: 'W', ...R(209, 50, 227, 68) },
    { id: 'dnC2', type: 'chair', room: 'lounge', facing: 'W', ...R(209, 76, 227, 94) },
    { id: 'sofa', type: 'sofa', room: 'lounge', facing: 'E', ...R(255, 30, 288, 102) },
    { id: 'lTable', type: 'table', room: 'lounge', ...R(300, 50, 324, 86) },
    { id: 'tv', type: 'tv', room: 'lounge', ...R(337, 30, 353, 78) },
    // bedroom B (stacked on the master)
    { id: 'bBed', type: 'bed', room: 'bedB', head: 'S', ...R(400, 9, 460, 87) },
    { id: 'bS1', type: 'sidetable', room: 'bedB', ...R(380, 9, 398, 27) },
    { id: 'bS2', type: 'sidetable', room: 'bedB', ...R(462, 9, 480, 27) },
    { id: 'bChair', type: 'armchair', room: 'bedB', facing: 'W', ...R(465, 110, 495, 140) },
    { id: 'bbBasin', type: 'basin', room: 'bathB', ...R(357.5, 210, 373.5, 230) },
    { id: 'bbShower', type: 'shower', room: 'bathB', ...R(357.5, 258, 393.5, 294) },
    { id: 'bbWc', type: 'wc', room: 'bathB', facing: 'S', ...R(405.5, 266, 423.5, 294) },
    { id: 'dWard', type: 'wardrobe', room: 'dressB', tall: true, ...R(471, 206, 495, 290) },
    { id: 'dDresser', type: 'cabinet', room: 'dressB', ...R(428, 210, 446, 258) },
    // guest WC and store
    { id: 'wcWc', type: 'wc', room: 'wc', facing: 'S', ...R(330, 208, 348, 234) },
    { id: 'wcBasin', type: 'basin', room: 'wc', ...R(333, 178.5, 353, 194.5) },
    { id: 'stShelf', type: 'cabinet', room: 'store', tall: true, ...R(337, 238.5, 353, 294) },
    // kitchen: L-counter under the shop-road window, fridge by the door
    { id: 'kLeft', type: 'counter', room: 'kitchen', ...R(9, 174, 33, 294) },
    { id: 'kSink', type: 'sink', room: 'kitchen', on: 'kLeft', ...R(13, 216, 31, 240) },
    { id: 'kRear', type: 'counter', room: 'kitchen', ...R(33, 270, 120, 294) },
    { id: 'kHob', type: 'hob', room: 'kitchen', on: 'kRear', ...R(60, 272, 84, 292) },
    { id: 'kFridge', type: 'fridge', room: 'kitchen', tall: true, ...R(126.5, 264, 150.5, 294) },
    // laundry and terraces
    { id: 'washer', type: 'washer', room: 'laundry', ...R(9, 339.5, 36, 366.5) },
    { id: 'tub', type: 'sink', room: 'laundry', ...R(36.5, 341, 59.5, 366.5) },
    { id: 'tBench', type: 'bench', room: 'terrace', ...R(9, 371, 27, 403) },
    { id: 'tPlanter', type: 'planter', room: 'terrace', ...R(9, 405, 150.5, 423) },
    { id: 't2Bench', type: 'bench', room: 'terrace2', ...R(477, 305, 495, 355) },
    { id: 't2Planter', type: 'planter', room: 'terrace2', ...R(395, 300.5, 413, 375) },
    // family room: TV on the front wall, sofa on the rear wall
    { id: 'fTv', type: 'tv', room: 'family', ...R(330, 298.5, 378, 314.5) },
    { id: 'fSofa', type: 'sofa', room: 'family', facing: 'S', ...R(290, 390, 362, 423) },
    { id: 'linen', type: 'cabinet', room: 'store2', tall: true, ...R(155, 407, 195.5, 423) },
]

const START = { name: 'stair arrival in the lobby', x: 264, y: 158 }
const targets = [
    { name: 'dining chair', x: 240, y: 70 },
    { name: 'lounge sofa', x: 300, y: 110 },
    { name: 'guest WC', x: 310, y: 215 },
    { name: 'bedroom A: bed side', x: 120, y: 60 },
    { name: 'bedroom A: wardrobe', x: 90, y: 120 },
    { name: 'bath A', x: 46, y: 122 },
    { name: 'bedroom B: bed side', x: 380, y: 50 },
    { name: 'bath B', x: 390, y: 235 },
    { name: 'dressing B aisle', x: 458, y: 240 },
    { name: 'terrace B', x: 440, y: 340 },
    { name: 'kitchen sink', x: 50, y: 228 },
    { name: 'kitchen hob', x: 72, y: 250 },
    { name: 'kitchen fridge', x: 112, y: 250 },
    { name: 'laundry washer', x: 48, y: 322 },
    { name: 'terrace', x: 100, y: 390 },
    { name: 'family room sofa', x: 326, y: 370 },
    { name: 'store', x: 325, y: 266 },
    { name: 'rear lobby at the light well', x: 222, y: 350 },
    { name: 'linen store', x: 175, y: 390 },
]

const chains = {
    'SF x through bedroom A / lounge / bedroom B': [[EXT, 'wall'], [141.5, 'bedroom A'], [4.5, 'wall'], [198, 'lounge + dining'], [EXT, 'wall'], [133, 'bedroom B'], [EXT, 'wall']],
    'SF x through kitchen / corridor / stair / WC / bath B / dressing': [[EXT, 'wall'], [141.5, 'kitchen'], [4.5, 'wall'], [36, 'corridor'], [EXT, 'wall'], [84, 'stair'], [4.5, 'wall'], [64.5, 'guest WC'], [4.5, 'wall'], [66, 'bath B'], [4.5, 'wall'], [67, 'dressing'], [EXT, 'wall']],
    'SF x through laundry / terrace / lobby / family room / terrace B': [[EXT, 'wall'], [50.5, 'laundry'], [4.5, 'wall'], [86.5, 'terrace'], [4.5, 'wall'], [99, 'rear lobby'], [4.5, 'wall'], [132, 'family room'], [4.5, 'wall'], [100, 'terrace B'], [EXT, 'wall']],
    'SF y through bedroom A / kitchen / laundry / terrace': [[EXT, 'wall'], [156, 'bedroom A'], [EXT, 'wall'], [120, 'kitchen'], [4.5, 'wall'], [68, 'laundry'], [4.5, 'wall'], [52, 'terrace'], [EXT, 'jaali parapet']],
    'SF y through lounge / lobby / stair / rear lobby / light well': [[EXT, 'wall'], [121, 'lounge'], [4.5, 'wall'], [39.5, 'lobby'], [120, 'stair'], [4.5, 'wall'], [68, 'rear lobby'], [4.5, 'wall'], [52, 'light well'], [EXT, 'wall']],
    'SF y through bedroom B / bath B / terrace B / light well': [[EXT, 'wall'], [156, 'bedroom B'], [EXT, 'wall'], [120, 'bath B'], [4.5, 'wall'], [76.5, 'terrace B'], [4.5, 'railing'], [43.5, 'light well'], [EXT, 'wall']],
}

module.exports = { id: 'SF', title: 'SECOND FLOOR  42\'-0" x 36\'-0"', W, H, STAIR, rooms, walls, openings, doors, windows, items, START, targets, chains }
