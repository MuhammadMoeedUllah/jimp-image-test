/**
 * GROUND FLOOR - arrival, ground-floor bedroom, family living, cooking.
 * Plot coordinates in inches (see site.js). Every rectangle is checked by
 * check.js: the plot must be tiled exactly, doors must join the stated rooms,
 * furniture must fit and leave walking room.
 *
 * Arrival: the small door sits at the left end of the car shutter. Step in
 * and a 2'-0" deep front alley runs away to your left, along the whole front
 * of the house, behind a jaali (perforated brick) boundary wall. The house
 * proper starts behind that alley. The car porch is straight ahead and to
 * the right; the main door is at its far end.
 */
const { X, Y, EXT, PLOT_W, PLOT_H } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const ALLEY_D = 24 //            2'-0" deep front alley
const Y_AL = Y.F + ALLEY_D //    33   alley rear face
const Y_HF = Y_AL + EXT //       42   house front wall rear face: rooms start here
const GATE_X = 212 //            car shutter starts (7'-8" opening); 4" guide post 208-212
const BATH_D = 96 //             bedroom bath 8'-0" deep along the party wall
const Y_BB = Y_HF + BATH_D //    138  bath rear face
const Y_BB2 = Y_BB + 4.5 //      142.5
const BED_Y = 190.5 //           bedroom rear face (bedroom 12'-4½" deep behind the alley)
const LNG_Y = 199.5 //           lounge front face (9" bearing wall 190.5-199.5)

const rooms = [
    { id: 'alley', name: 'FRONT ALLEY', kind: 'alley', ...R(X.L, Y.F, X.COLW, Y_AL) },
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(X.COLW, Y.F, X.R, Y.PORCH) },
    { id: 'bbath', name: 'BATH', kind: 'bath', ...R(X.L, Y_HF, X.BATHF, Y_BB) },
    { id: 'bedroom', name: 'BEDROOM', kind: 'room', ...R(X.BATHF + 4.5, Y_HF, X.COL, Y_BB2) },
    { id: 'bedroomB', partOf: 'bedroom', kind: 'room', ...R(X.L, Y_BB2, X.COL, BED_Y) },
    { id: 'lounge', name: 'LOUNGE + DINING', kind: 'room', ...R(X.L, LNG_Y, X.COL, Y.STAIR) },
    { id: 'loungeB', partOf: 'lounge', kind: 'room', ...R(X.L, Y.STAIR, X.COLW, Y.LC) },
    { id: 'foyer', name: 'FOYER', kind: 'foyer', ...R(X.COLW, Y.STAIR, X.FOY, Y.STAIR_END) },
    { id: 'foyerB', partOf: 'foyer', kind: 'foyer', ...R(X.FOY, Y.STAIR, X.ST, Y.STAIR + 36) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.ST, Y.STAIR, X.R, Y.STAIR_END) },
    { id: 'bath', name: 'FAMILY BATH', kind: 'bath', ...R(X.L, Y.COURT, X.BATHR, Y.T) },
    { id: 'court', name: 'COURT GARDEN', kind: 'court', ...R(X.COURT, Y.COURT, X.COURTR, Y.T) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'kitchen', ...R(X.COLW, Y.KIT, X.R, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, PLOT_H) },
    { id: 'wR', ...R(X.R, 0, PLOT_W, PLOT_H) },
    { id: 'wRear', ...R(EXT, Y.T, X.R, PLOT_H) },
    { id: 'wBound', jaali: true, ...R(X.L, 0, X.COLW, Y.F) }, // street wall of the alley: 3'-0" solid, brick jaali above
    { id: 'wGate', ...R(X.COLW, 0, GATE_X, Y.F) }, // holds the small door and the shutter guide post
    { id: 'wAlley', ...R(X.L, Y_AL, X.COL, Y_HF) }, // house front wall, behind the alley
    { id: 'wAB', ...R(X.COL, Y_AL, X.COLW, Y.STAIR) }, // bedroom + lounge | porch (9" bearing)
    { id: 'wGb1', ...R(X.BATHF, Y_HF, X.BATHF + 4.5, Y_BB2) },
    { id: 'wGb2', ...R(X.L, Y_BB, X.BATHF, Y_BB2) },
    { id: 'wDL', ...R(X.L, BED_Y, X.COL, LNG_Y) }, // bedroom | lounge (9" bearing)
    { id: 'wPR', ...R(X.COLW, Y.PORCH, X.R, Y.STAIR) }, // porch rear wall, holds the main door
    { id: 'wLC', ...R(X.L, Y.LC, X.COLW, Y.COURT) }, // lounge | bath + court
    { id: 'wBC', ...R(X.BATHR, Y.COURT, X.COURT, Y.T) },
    { id: 'wCK', ...R(X.COURTR, Y.COURT, X.COLW, Y.T) },
    { id: 'wKF', ...R(X.COLW, Y.STAIR_END, X.R, Y.KIT) },
]

const openings = [
    { id: 'gate', kind: 'gate', ...R(GATE_X, 0, X.R, Y.F) }, // rolling shutter for the car
    { id: 'rail', kind: 'rail', ...R(X.FOY, Y.STAIR + 36, X.ST, Y.STAIR_END) },
]

const doors = [
    // hinged on the shutter side so the open leaf never covers the alley mouth
    { id: 'D0', label: 'Small door: street to entry landing', wall: 'wGate', a: 'street', b: 'porch', from: 180, to: 208, swingInto: 'porch', hinge: 'end' },
    { id: 'D1', label: 'Main door: porch to foyer', wall: 'wPR', a: 'porch', b: 'foyer', from: 182, to: 218, swingInto: 'foyer', hinge: 'start' },
    { id: 'D2', label: 'Ground-floor bedroom (3\'-0" for a walker)', wall: 'wDL', a: 'lounge', b: 'bedroom', from: 133, to: 169, swingInto: 'bedroom', hinge: 'end' },
    { id: 'D3', label: 'Bedroom bath: 2\'-8" pocket door (no swing)', wall: 'wGb1', a: 'bedroom', b: 'bbath', from: 100, to: 132, slide: true },
    { id: 'D4', label: 'Kitchen (end of foyer)', wall: 'wKF', a: 'foyer', b: 'kitchen', from: 186, to: 216, swingInto: 'kitchen', hinge: 'start' },
    { id: 'D5', label: 'Family bath', wall: 'wLC', a: 'lounge', b: 'bath', from: 12, to: 36, swingInto: 'bath', hinge: 'end' },
    { id: 'S1', label: 'Glass slider: lounge to court (3\'-6")', wall: 'wLC', a: 'lounge', b: 'court', from: 131.5, to: 173.5, slide: true },
]

const windows = [
    { id: 'W1', label: 'Bedroom to front alley (5\'-8", onto the jaali wall)', wall: 'wAlley', from: 96, to: 164 },
    { id: 'W2', label: 'Bedroom bath to front alley (high, frosted)', wall: 'wAlley', from: 18, to: 48 },
    { id: 'W3', label: 'Bedroom ventilator to porch (7\'-0" sill, over bed head)', wall: 'wAB', from: 70, to: 118 },
    { id: 'W4', label: 'Kitchen to court', wall: 'wCK', from: 350, to: 398 },
    { id: 'W5', label: 'Family bath to court', wall: 'wBC', from: 360, to: 384 },
]

const items = [
    // front alley: pots at the dead end, AC condensers high on the jaali wall (they exhaust through it)
    { id: 'aPots', type: 'planter', room: 'alley', ...R(9, 9, 33, 33) },
    { id: 'ac1', type: 'ac', room: 'alley', walkable: true, ...R(52, 9, 84, 21) },
    { id: 'ac2', type: 'ac', room: 'alley', walkable: true, ...R(88, 9, 120, 21) },
    { id: 'car', type: 'car', room: 'porch', ...R(224, 13, 294, 195) }, // reversed in: driver exits onto the 3'-10" walkway
    // ground-floor bedroom: 5'-0" x 6'-3" bed, head on the porch wall under the ventilator,
    // window side 23", foot walkway 26½", inner side open to the rear part of the room
    { id: 'gBed', type: 'bed', room: 'bedroom', head: 'E', ...R(94, 65, 169, 125) },
    { id: 'gSide1', type: 'sidetable', room: 'bedroom', ...R(151, 47, 169, 65) },
    { id: 'gSide2', type: 'sidetable', room: 'bedroom', ...R(151, 125, 169, 143) },
    { id: 'gWard', type: 'wardrobe', room: 'bedroom', tall: true, ...R(9, 166.5, 81, 190.5) }, // 6'-0" wide, 24" clear in front
    // bedroom bath: walk-in shower across the end, WC on the party wall, basin by the door
    { id: 'gbShower', type: 'shower', room: 'bbath', ...R(9, 42, 63, 78) },
    { id: 'gbWc', type: 'wc', room: 'bbath', facing: 'E', ...R(9, 85, 37, 103) },
    { id: 'gbBasin', type: 'basin', room: 'bbath', ...R(9, 112, 25, 132) },
    // lounge: banquette dining for 6 in the front-left corner (the 36" chair pull-out is the
    // walkway); 2-seat sofa on the bedroom wall faces the TV on the court wall beside the slider.
    // The banquette faces the TV too.
    { id: 'dnBench', type: 'banquette', room: 'lounge', facing: 'N', ...R(9, 199.5, 69, 217.5) },
    { id: 'dnTable', type: 'table', room: 'lounge', ...R(9, 217.5, 69, 249.5) },
    { id: 'dnC1', type: 'chair', room: 'lounge', facing: 'S', ...R(11, 249.5, 29, 267.5) },
    { id: 'dnC2', type: 'chair', room: 'lounge', facing: 'S', ...R(32, 249.5, 50, 267.5) },
    { id: 'dnC3', type: 'chair', room: 'lounge', facing: 'S', ...R(53, 249.5, 71, 267.5) },
    { id: 'lgSofa', type: 'sofa', room: 'lounge', facing: 'N', ...R(76, 199.5, 130, 232.5) },
    { id: 'lgTable', type: 'table', room: 'lounge', ...R(85, 248.5, 121, 266.5) },
    { id: 'tv', type: 'tv', room: 'lounge', ...R(79, 309.5, 127, 325.5) },
    { id: 'jaali', type: 'screen', room: 'lounge', ...R(172, 216, 178, 262) },
    // foyer
    { id: 'shoes', type: 'cabinet', room: 'foyer', ...R(207.5, 258, 223.5, 306) },
    // kitchen: U-counter, hob, sink, fridge
    { id: 'kRear', type: 'counter', room: 'kitchen', ...R(178, 399, 304, 423) },
    { id: 'kLeft', type: 'counter', room: 'kitchen', ...R(178, 368, 202, 399) },
    { id: 'kRight', type: 'counter', room: 'kitchen', ...R(280, 366.5, 304, 399) },
    { id: 'fridge', type: 'fridge', room: 'kitchen', tall: true, ...R(274, 336.5, 304, 366.5) },
    { id: 'hob', type: 'hob', room: 'kitchen', on: 'kRear', ...R(214, 401, 238, 421) },
    { id: 'sink', type: 'sink', room: 'kitchen', on: 'kRear', ...R(250, 402, 280, 420) },
    // family bath
    { id: 'bWc', type: 'wc', room: 'bath', facing: 'S', ...R(12, 395, 30, 423) },
    { id: 'bShower', type: 'shower', room: 'bath', ...R(41.5, 387, 77.5, 423) },
    { id: 'bBasin', type: 'basin', room: 'bath', ...R(61.5, 336, 77.5, 356) },
    // court garden
    { id: 'planter', type: 'planter', room: 'court', ...R(82, 405, 173.5, 423) },
    { id: 'tree', type: 'tree', room: 'court', ...R(134, 362, 166, 394) },
    { id: 'bench', type: 'bench', room: 'court', ...R(86, 372, 104, 402) },
]

const START = { name: 'entry landing inside the small door', x: 193, y: 25 }
const targets = [
    { name: 'front alley, far end', x: 58, y: 21 },
    { name: 'front alley at the bedroom window', x: 130, y: 21 },
    { name: 'main door landing', x: 198, y: 195 },
    { name: 'car driver door', x: 205, y: 120 },
    { name: 'bedroom: bed, window side', x: 120, y: 53 },
    { name: 'bedroom: bed, inner side', x: 120, y: 141 },
    { name: 'bedroom: wardrobe', x: 45, y: 154 },
    { name: 'bedroom bath', x: 48, y: 118 },
    { name: 'foyer at stair foot', x: 210, y: 234 },
    { name: 'lounge sofa', x: 150, y: 240 },
    { name: 'dining chair', x: 41, y: 280 },
    { name: 'family bath', x: 50, y: 370 },
    { name: 'court garden', x: 118, y: 350 },
    { name: 'kitchen hob', x: 226, y: 385 },
    { name: 'kitchen sink', x: 265, y: 384 },
    { name: 'kitchen fridge', x: 260, y: 378 },
]

const chains = {
    'GF x through front alley / porch': [[EXT, 'wall'], [169, 'front alley'], [126, 'car porch'], [EXT, 'wall']],
    'GF x through bath / bedroom / porch': [[EXT, 'wall'], [54, 'bedroom bath'], [4.5, 'wall'], [101.5, 'bedroom'], [EXT, 'wall'], [126, 'car porch'], [EXT, 'wall']],
    'GF x through lounge / foyer / stair': [[EXT, 'wall'], [169, 'lounge'], [45.5, 'foyer'], [4.5, 'rail'], [76, 'stair'], [EXT, 'wall']],
    'GF x through bath / court / kitchen': [[EXT, 'wall'], [68.5, 'family bath'], [4.5, 'wall'], [91.5, 'court'], [4.5, 'wall'], [126, 'kitchen'], [EXT, 'wall']],
    'GF y through alley / bath / bedroom / lounge / bath': [[EXT, 'jaali wall'], [ALLEY_D, 'front alley'], [EXT, 'wall'], [BATH_D, 'bedroom bath'], [4.5, 'wall'], [48, 'bedroom'], [EXT, 'wall'], [126, 'lounge'], [4.5, 'wall'], [93, 'family bath'], [EXT, 'wall']],
    'GF y through alley / bedroom / lounge / court': [[EXT, 'jaali wall'], [ALLEY_D, 'front alley'], [EXT, 'wall'], [148.5, 'bedroom'], [EXT, 'wall'], [126, 'lounge'], [4.5, 'wall'], [93, 'court'], [EXT, 'wall']],
    'GF y through porch / stair / kitchen': [[EXT, 'shutter line'], [198, 'car porch'], [EXT, 'wall'], [116, 'stair'], [4.5, 'wall'], [86.5, 'kitchen'], [EXT, 'wall']],
}

module.exports = { id: 'GF', title: 'GROUND FLOOR', rooms, walls, openings, doors, windows, items, START, targets, chains }
