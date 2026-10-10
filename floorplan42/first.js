/**
 * FIRST FLOOR - 42'-0" x 36'-0", the family's private floor. Plot
 * coordinates: x = 0 at the shop-road boundary (left), so the floor spans the
 * shop band (x 0-191) and the house (x 191-504). Two street sides: the front
 * road (y = 0) and the shop road (x = 0).
 *
 * Idea: a 16'-6" TV lounge sits over the car porch and is the hub - the stair
 * arrives into it and every front room opens off it. Corner bedroom 2 and
 * bedroom 3 take the shop-road frontage; the master suite sits over the
 * drawing room with its bath and walk-in dressing behind it and a private
 * terrace over the kitchen. The rear is quiet: a study / prayer room lit by
 * the two light wells, a laundry and a family terrace behind a jaali on the
 * shop road. Wet rooms stack on the ground-floor wet rooms.
 */
const { PLOT_W, PLOT_H, EXT, STAIR, PX, Y } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })
const W = PLOT_W // 504
const H = PLOT_H // 432

const X = {
    L: 9,
    B2R: 150.5, //    bedroom 2 / bedroom 3 right face (11'-9½")
    COR: 155, //      corridor left face (3'-0" wide to the stair wall at 191)
    STL: 191, //      stair box left wall (9", on the ground-floor party wall)
    ST: PX.HL, //     200 stair box left face
    STR: PX.STR, //   284
    STW: PX.STW, //   288.5 pantry left face
    PD: PX.PD, //     353 lounge | master wall (9")
    PDW: PX.PDW, //   362 master left face
    MB: 357.5, //     master bath left face (4½" wall 353-357.5)
    MBR: 423.5, //    master bath right face (5'-6")
    DR: 428, //       dressing left face (5'-7")
    BATH2: 59.5, //   bath 2 right face (4'-2½")
    B3: 59.5, //      bath 3 right face
    LA: 64, //        laundry left face
    LAR: 118.5, //    laundry right face (4'-6½")
    TER: 123, //      terrace strip left face
    STO: 195.5, //    linen store right face
    OTS1R: PX.OTS1R, // 254
    STUDY: PX.BED, // 258.5 study left face (11'-0")
    STUDYR: PX.BEDR, // 390.5
    KIT: PX.KIT, //   395 rear terrace left face
    R: PX.R, //       495
}
const Y_B2 = 100.5 //  bath 2 front wall (bath 2 is 5'-0" deep)
const Y_PF = 178.5 //  pantry front face
const Y_LOBBY = 366.5 // rear lobby rear face
const Y_T2 = 375 //    rear terrace rear face (railing to the light well)

const rooms = [
    { id: 'bed2', name: 'BEDROOM 2', kind: 'room', ...R(X.L, Y.F, X.B2R, Y_B2) },
    { id: 'bed2B', partOf: 'bed2', kind: 'room', ...R(X.BATH2 + 4.5, Y_B2, X.B2R, Y.FRONT) },
    { id: 'bath2', name: 'BATH 2', kind: 'bath', ...R(X.L, Y_B2 + 4.5, X.BATH2, Y.FRONT) },
    { id: 'lounge', name: 'TV LOUNGE', kind: 'room', ...R(X.COR, Y.F, X.PD, Y.MID) },
    { id: 'master', name: 'MASTER BEDROOM', kind: 'room', ...R(X.PDW, Y.F, X.R, Y.FRONT) },
    { id: 'bed3', name: 'BEDROOM 3', kind: 'room', ...R(X.L, Y.MID, X.B2R, Y.STAIR_END) },
    { id: 'corridor', name: 'CORRIDOR', kind: 'hall', ...R(X.COR, Y.MID, X.STL, Y.REAR) },
    { id: 'lobby', partOf: 'corridor', kind: 'hall', ...R(X.COR, Y.REAR, X.OTS1R, Y_LOBBY) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.ST, Y.MID, X.STR, Y.STAIR_END) },
    { id: 'pantry', name: 'PANTRY', kind: 'kitchen', ...R(X.STW, Y_PF, X.PD, Y.STAIR_END) },
    { id: 'mbath', name: 'MASTER BATH', kind: 'bath', ...R(X.MB, Y.MID, X.MBR, Y.STAIR_END) },
    { id: 'dress', name: 'DRESSING', kind: 'room', ...R(X.DR, Y.MID, X.R, Y.STAIR_END) },
    { id: 'bath3', name: 'BATH 3', kind: 'bath', ...R(X.L, Y.REAR, X.B3, Y_LOBBY) },
    { id: 'laundry', name: 'LAUNDRY', kind: 'utility', ...R(X.LA, Y.REAR, X.LAR, Y_LOBBY) },
    { id: 'terrace', name: 'FAMILY TERRACE', kind: 'terrace', ...R(X.TER, Y.REAR, X.B2R, Y.OTS1) },
    { id: 'terraceB', partOf: 'terrace', kind: 'terrace', ...R(X.L, Y.OTS1, X.B2R, Y.T) },
    { id: 'store', name: 'LINEN', kind: 'utility', ...R(X.COR, Y.OTS1, X.STO, Y.T) },
    { id: 'ots1', name: 'LIGHT WELL', kind: 'void', ...R(X.ST, Y.OTS1, X.OTS1R, Y.T) },
    { id: 'study', name: 'STUDY / PRAYER', kind: 'utility', ...R(X.STUDY, Y.REAR, X.STUDYR, Y.T) },
    { id: 'terrace2', name: 'MASTER TERRACE', kind: 'terrace', ...R(X.KIT, Y.REAR, X.R, Y_T2) },
    { id: 'ots2', name: 'LIGHT WELL', kind: 'void', ...R(X.KIT, Y.OTS2, X.R, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, Y.OTS1) }, // shop-road wall
    { id: 'wLj', jaali: true, ...R(0, Y.OTS1, EXT, Y.T) }, // terrace parapet: jaali to the shop road
    { id: 'wL2', ...R(0, Y.T, EXT, H) },
    { id: 'wR', ...R(X.R, 0, W, H) },
    { id: 'wRear', ...R(EXT, Y.T, X.R, H) },
    { id: 'wFront', ...R(EXT, 0, X.R, Y.F) },
    { id: 'wB2a', ...R(X.BATH2, Y_B2, X.BATH2 + 4.5, Y.FRONT) },
    { id: 'wB2b', ...R(X.L, Y_B2, X.BATH2, Y_B2 + 4.5) },
    { id: 'wB2R', ...R(X.B2R, Y.F, X.COR, Y.MID) }, // bedroom 2 | lounge
    { id: 'wFB', ...R(X.L, Y.FRONT, X.B2R, Y.MID) }, // bedroom 2 | bedroom 3 (9")
    { id: 'wMR', ...R(X.PD, Y.F, X.PDW, Y.MID) }, // lounge | master (9", on the porch wall)
    { id: 'wMB', ...R(X.PDW, Y.FRONT, X.R, Y.MID) }, // master rear wall (9")
    { id: 'wCL', ...R(X.B2R, Y.MID, X.COR, Y.T) }, // bedroom 3 + terrace | corridor + store
    { id: 'wStL', ...R(X.STL, Y.MID, X.ST, Y.STAIR_END) },
    { id: 'wStR', ...R(X.STR, Y.MID, X.STW, Y.STAIR_END) },
    { id: 'wPF', ...R(X.STW, Y.MID, X.PD, Y_PF) }, // pantry front wall
    { id: 'wPM', ...R(X.PD, Y.MID, X.MB, Y.STAIR_END) }, // pantry | master bath
    { id: 'wMD', ...R(X.MBR, Y.MID, X.DR, Y.STAIR_END) }, // master bath | dressing
    { id: 'wRB1', ...R(X.L, Y.STAIR_END, X.B2R, Y.REAR) }, // bedroom 3 rear wall
    { id: 'wRB', ...R(X.STL, Y.STAIR_END, X.R, Y.REAR) }, // middle | rear band
    { id: 'wB3L', ...R(X.B3, Y.REAR, X.LA, Y.OTS1) },
    { id: 'wLa', ...R(X.LAR, Y.REAR, X.TER, Y.OTS1) },
    { id: 'wB3R', ...R(X.L, Y_LOBBY, X.B3, Y.OTS1) },
    { id: 'wLaR', ...R(X.LA, Y_LOBBY, X.LAR, Y.OTS1) },
    { id: 'wCO', ...R(X.COR, Y_LOBBY, X.OTS1R, Y.OTS1) }, // lobby | store + light well
    { id: 'wSO1', ...R(X.STO, Y.OTS1, X.ST, Y.T) }, // store | light well
    { id: 'wSB', ...R(X.OTS1R, Y.REAR, X.STUDY, Y.T) }, // lobby + well | study
    { id: 'wSO', ...R(X.STUDYR, Y.REAR, X.KIT, Y.T) }, // study | terrace + well
]

const openings = [
    { id: 'rail2', kind: 'rail', ...R(X.KIT, Y_T2, X.R, Y.OTS2) }, // railing: terrace edge over the light well
]

const doors = [
    { id: 'D8', label: 'Bedroom 2', wall: 'wB2R', a: 'lounge', b: 'bed2', from: 120, to: 150, swingInto: 'bed2', hinge: 'start' },
    { id: 'D9', label: 'Bath 2', wall: 'wB2a', a: 'bed2', b: 'bath2', from: 108, to: 134, swingInto: 'bath2', hinge: 'end' },
    { id: 'D10', label: 'Master bedroom', wall: 'wMR', a: 'lounge', b: 'master', from: 110, to: 140, swingInto: 'master', hinge: 'start' },
    { id: 'D11', label: 'Master bath', wall: 'wMB', a: 'master', b: 'mbath', from: 372, to: 398, swingInto: 'mbath', hinge: 'start' },
    { id: 'D12', label: 'Walk-in dressing', wall: 'wMB', a: 'master', b: 'dress', from: 445, to: 475, swingInto: 'dress', hinge: 'end' },
    { id: 'D13', label: 'Master terrace (from the dressing)', wall: 'wRB', a: 'dress', b: 'terrace2', from: 440, to: 470, swingInto: 'terrace2', hinge: 'end' },
    { id: 'D14', label: 'Pantry', wall: 'wPF', a: 'lounge', b: 'pantry', from: 300, to: 328, swingInto: 'pantry', hinge: 'start' },
    { id: 'D15', label: 'Bedroom 3', wall: 'wCL', a: 'corridor', b: 'bed3', from: 200, to: 230, swingInto: 'bed3', hinge: 'start' },
    { id: 'D16', label: 'Bath 3', wall: 'wRB1', a: 'bed3', b: 'bath3', from: 14, to: 40, swingInto: 'bath3', hinge: 'start' },
    { id: 'D17', label: 'Family terrace (2\'-2")', wall: 'wCL', a: 'corridor', b: 'terrace', from: 305, to: 331, swingInto: 'terrace', hinge: 'start' },
    { id: 'D18', label: 'Laundry', wall: 'wLa', a: 'terrace', b: 'laundry', from: 340, to: 366, swingInto: 'laundry', hinge: 'end' },
    { id: 'D19', label: 'Study / prayer', wall: 'wSB', a: 'corridor', b: 'study', from: 305, to: 335, swingInto: 'study', hinge: 'start' },
    { id: 'D20', label: 'Linen store', wall: 'wCO', a: 'corridor', b: 'store', from: 165, to: 189, swingInto: 'store', hinge: 'start' },
]

const windows = [
    { id: 'W8', label: 'Bedroom 2 to street (high, over the bed)', wall: 'wFront', from: 40, to: 100 },
    { id: 'W9', label: 'Bedroom 2 to shop road', wall: 'wL', from: 30, to: 80 },
    { id: 'W10', label: 'Bath 2 to shop road (high, frosted)', wall: 'wL', from: 110, to: 130 },
    { id: 'W11', label: 'TV lounge to street (8\'-4")', wall: 'wFront', from: 200, to: 300 },
    { id: 'W12', label: 'Master to street (high, over the bed)', wall: 'wFront', from: 390, to: 470 },
    { id: 'W13', label: 'Bedroom 3 to shop road (high, over the bed)', wall: 'wL', from: 200, to: 260 },
    { id: 'W14', label: 'Bath 3 to shop road (high, frosted)', wall: 'wL', from: 320, to: 346 },
    { id: 'W15', label: 'Laundry to terrace', wall: 'wLaR', from: 76, to: 106 },
    { id: 'W16', label: 'Rear lobby to light well (grille)', wall: 'wCO', from: 210, to: 244 },
    { id: 'W17', label: 'Study to rear-left light well', wall: 'wSB', from: 375, to: 419 },
    { id: 'W18', label: 'Study to rear-right light well', wall: 'wSO', from: 383, to: 419 },
    { id: 'W19', label: 'Master bath to master terrace (high)', wall: 'wRB', from: 398, to: 420 },
    { id: 'W20', label: 'Pantry to stairwell (high, skylight light)', wall: 'wStR', from: 200, to: 240 },
]

const items = [
    // bedroom 2: bed head under the street window, wardrobe in the rear alcove
    { id: 'b2Bed', type: 'bed', room: 'bed2', head: 'S', ...R(40, 9, 100, 87) },
    { id: 'b2S1', type: 'sidetable', room: 'bed2', ...R(20, 9, 38, 27) },
    { id: 'b2S2', type: 'sidetable', room: 'bed2', ...R(102, 9, 120, 27) },
    { id: 'b2Ward', type: 'wardrobe', room: 'bed2', tall: true, ...R(64, 141, 118, 165) },
    // bath 2
    { id: 'b2Basin', type: 'basin', room: 'bath2', ...R(9, 105, 29, 121) },
    { id: 'b2Wc', type: 'wc', room: 'bath2', facing: 'S', ...R(41.5, 137, 59.5, 165) },
    { id: 'b2Shower', type: 'shower', room: 'bath2', ...R(9, 135, 39, 165) },
    // TV lounge: TV on the master wall, 3-seat sofa facing it, 2-seat under the window
    { id: 'tv', type: 'tv', room: 'lounge', ...R(337, 30, 353, 78) },
    { id: 'sofaA', type: 'sofa', room: 'lounge', facing: 'E', ...R(195, 36, 228, 108) },
    { id: 'sofaB', type: 'sofa', room: 'lounge', facing: 'N', ...R(240, 9, 294, 42) },
    { id: 'lTable', type: 'table', room: 'lounge', ...R(250, 56, 286, 80) },
    // master: bed head under the street window, armchair by the dressing door
    { id: 'mBed', type: 'bed', room: 'master', head: 'S', ...R(400, 9, 460, 87) },
    { id: 'mS1', type: 'sidetable', room: 'master', ...R(380, 9, 398, 27) },
    { id: 'mS2', type: 'sidetable', room: 'master', ...R(462, 9, 480, 27) },
    { id: 'mChair', type: 'armchair', room: 'master', facing: 'W', ...R(465, 110, 495, 140) },
    // master bath: shower and WC on the rear wall, basin on the left
    { id: 'mbBasin', type: 'basin', room: 'mbath', ...R(357.5, 210, 373.5, 230) },
    { id: 'mbShower', type: 'shower', room: 'mbath', ...R(357.5, 258, 393.5, 294) },
    { id: 'mbWc', type: 'wc', room: 'mbath', facing: 'S', ...R(405.5, 266, 423.5, 294) },
    // dressing: wardrobe wall on the right, dresser on the left, 25" aisle
    { id: 'dWard', type: 'wardrobe', room: 'dress', tall: true, ...R(471, 206, 495, 290) },
    { id: 'dDresser', type: 'cabinet', room: 'dress', ...R(428, 210, 446, 258) },
    // pantry: counter with a sink, small fridge
    { id: 'pCounter', type: 'counter', room: 'pantry', ...R(329, 178.5, 353, 294) },
    { id: 'pSink', type: 'sink', room: 'pantry', on: 'pCounter', ...R(333, 220, 351, 244) },
    { id: 'pFridge', type: 'fridge', room: 'pantry', tall: true, ...R(288.5, 264, 318.5, 294) },
    // bedroom 3: bed head under the shop-road window, desk on the front wall, wardrobe at the rear
    { id: 'b3Bed', type: 'bed', room: 'bed3', head: 'W', ...R(9, 197, 87, 257) },
    { id: 'b3S1', type: 'sidetable', room: 'bed3', ...R(9, 179, 27, 197) },
    { id: 'b3Ward', type: 'wardrobe', room: 'bed3', tall: true, ...R(100, 174, 150.5, 198) },
    { id: 'b3Desk', type: 'desk', room: 'bed3', ...R(110, 274, 150.5, 294) }, // 22" turn kept at the bed foot
    // bath 3
    { id: 'b3Basin', type: 'basin', room: 'bath3', ...R(43.5, 298.5, 59.5, 318.5) },
    { id: 'b3Wc', type: 'wc', room: 'bath3', facing: 'S', ...R(9, 338.5, 27, 366.5) },
    { id: 'b3Shower', type: 'shower', room: 'bath3', ...R(29.5, 336.5, 59.5, 366.5) },
    // laundry
    { id: 'washer', type: 'washer', room: 'laundry', ...R(64, 339.5, 91, 366.5) },
    { id: 'tub', type: 'sink', room: 'laundry', ...R(64, 298.5, 88.5, 323) },
    // family terrace: bench on the jaali side, planter along the rear
    { id: 'tBench', type: 'bench', room: 'terrace', ...R(9, 371, 27, 403) },
    { id: 'tPlanter', type: 'planter', room: 'terrace', ...R(9, 405, 150.5, 423) },
    // study / prayer: desk on the rear wall, bookshelf, prayer mat
    { id: 'sDesk', type: 'desk', room: 'study', ...R(300, 399, 360, 423) },
    { id: 'sShelf', type: 'cabinet', room: 'study', tall: true, ...R(374.5, 300, 390.5, 360) },
    { id: 'sMat', type: 'rug', room: 'study', walkable: true, ...R(270, 360, 300, 406) },
    // master terrace
    { id: 't2Bench', type: 'bench', room: 'terrace2', ...R(477, 305, 495, 355) },
    { id: 't2Planter', type: 'planter', room: 'terrace2', ...R(395, 300.5, 413, 375) },
]

const START = { name: 'stair arrival in the TV lounge', x: 264, y: 160 }
const targets = [
    { name: 'bedroom 2: bed side', x: 120, y: 60 },
    { name: 'bedroom 2: wardrobe', x: 90, y: 120 },
    { name: 'bath 2', x: 46, y: 122 },
    { name: 'TV lounge sofa', x: 240, y: 110 },
    { name: 'master: bed side', x: 380, y: 50 },
    { name: 'master bath', x: 390, y: 235 },
    { name: 'dressing aisle', x: 458, y: 240 },
    { name: 'master terrace', x: 440, y: 340 },
    { name: 'pantry sink', x: 310, y: 232 },
    { name: 'bedroom 3: bed side', x: 100, y: 227 },
    { name: 'bedroom 3: wardrobe', x: 125, y: 212 },
    { name: 'bedroom 3: desk', x: 130, y: 262 },
    { name: 'bath 3', x: 26, y: 322 },
    { name: 'laundry washer', x: 104, y: 352 },
    { name: 'family terrace', x: 80, y: 390 },
    { name: 'study desk', x: 330, y: 385 },
    { name: 'rear lobby at the light well', x: 222, y: 350 },
    { name: 'linen store', x: 175, y: 395 },
]

const chains = {
    'FF x through bedroom 2 / TV lounge / master': [[EXT, 'wall'], [141.5, 'bedroom 2'], [4.5, 'wall'], [198, 'TV lounge'], [EXT, 'wall'], [133, 'master'], [EXT, 'wall']],
    'FF x through bedroom 3 / corridor / stair / pantry / master bath / dressing': [[EXT, 'wall'], [141.5, 'bedroom 3'], [4.5, 'wall'], [36, 'corridor'], [EXT, 'wall'], [84, 'stair'], [4.5, 'wall'], [64.5, 'pantry'], [4.5, 'wall'], [66, 'master bath'], [4.5, 'wall'], [67, 'dressing'], [EXT, 'wall']],
    'FF x through bath 3 / laundry / terrace / lobby / study / master terrace': [[EXT, 'wall'], [50.5, 'bath 3'], [4.5, 'wall'], [54.5, 'laundry'], [4.5, 'wall'], [27.5, 'terrace'], [4.5, 'wall'], [99, 'rear lobby'], [4.5, 'wall'], [132, 'study'], [4.5, 'wall'], [100, 'master terrace'], [EXT, 'wall']],
    'FF y through bedroom 2 / bedroom 3 / bath 3 / terrace': [[EXT, 'wall'], [156, 'bedroom 2'], [EXT, 'wall'], [120, 'bedroom 3'], [4.5, 'wall'], [68, 'bath 3'], [4.5, 'wall'], [52, 'terrace'], [EXT, 'jaali parapet']],
    'FF y through TV lounge / stair / lobby / light well': [[EXT, 'wall'], [165, 'TV lounge'], [120, 'stair'], [4.5, 'wall'], [68, 'rear lobby'], [4.5, 'wall'], [52, 'light well'], [EXT, 'wall']],
    'FF y through master / master bath / master terrace / light well': [[EXT, 'wall'], [156, 'master'], [EXT, 'wall'], [120, 'master bath'], [4.5, 'wall'], [76.5, 'master terrace'], [4.5, 'railing'], [43.5, 'light well'], [EXT, 'wall']],
}

module.exports = { id: 'FF', title: 'FIRST FLOOR  42\'-0" x 36\'-0"', W, H, STAIR, rooms, walls, openings, doors, windows, items, START, targets, chains }
