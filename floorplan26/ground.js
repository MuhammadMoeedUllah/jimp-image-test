/**
 * GROUND FLOOR - arrival, ground-floor bedroom, family living, cooking.
 * Plot coordinates in inches (see site.js). Every rectangle is checked by
 * check.js: the plot must be tiled exactly, doors must join the stated rooms,
 * furniture must fit and leave walking room.
 *
 * Arrival: the small door sits at the left of the car shutter. Step in and a
 * 2'-0" side alley opens on the left (behind a low jaali divider) and runs to
 * the main door; the car porch is ahead and to the right.
 */
const { X, Y, EXT, PLOT_W, PLOT_H } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const XB = 146.5 //     bedroom / lounge right face; 9" bearing wall 146.5-155.5
const XA = 155.5 //     side alley left face
const XAD = 179.5 //    side alley right face (low divider 179.5-184)
const XP = 184 //       car porch left face (porch 10'-0" clear)
const DIV_Y1 = 45 //    divider starts 3'-0" inside the door: entry landing
const DIV_Y2 = 171 //   divider ends 3'-0" before the main door: door landing
const GATE_X = 213.5 // car shutter starts (7'-6½" opening)
const BED_Y = 191.5 //   bedroom rear face (bedroom 15'-2½" deep incl. its bath)
const LNG_Y = 200.5 //   lounge front face (9" bearing wall 191.5-200.5)

const rooms = [
    { id: 'alley', name: 'SIDE ALLEY', kind: 'alley', ...R(XA, Y.F, XAD, Y.PORCH) },
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(XP, Y.F, X.R, Y.PORCH) },
    { id: 'porchF', partOf: 'porch', kind: 'porch', ...R(XAD, Y.F, XP, DIV_Y1) }, // entry landing
    { id: 'porchR', partOf: 'porch', kind: 'porch', ...R(XAD, DIV_Y2, XP, Y.PORCH) }, // landing at the main door
    { id: 'bbath', name: 'BATH', kind: 'bath', ...R(X.L, Y.F, X.BATHF, Y.BATHF) },
    { id: 'bedroom', name: 'BEDROOM', kind: 'room', ...R(X.BATHF + 4.5, Y.F, XB, BED_Y) },
    { id: 'bedroomB', partOf: 'bedroom', kind: 'room', ...R(X.L, Y.BATHF + 4.5, X.BATHF + 4.5, BED_Y) },
    { id: 'lounge', name: 'LOUNGE + DINING', kind: 'room', ...R(X.L, LNG_Y, XB, Y.STAIR) },
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
    { id: 'wFront', ...R(EXT, 0, XB, Y.F) }, // bedroom + bath front wall
    { id: 'wAB', ...R(XB, 0, XA, Y.STAIR) }, // bedroom / lounge | alley (9" bearing)
    { id: 'wGate', ...R(XA, 0, GATE_X, Y.F) }, // closes the alley front, holds the small door
    { id: 'wDiv', low: true, ...R(XAD, DIV_Y1, XP, DIV_Y2) }, // low jaali divider alley | car
    { id: 'wGb1', ...R(X.BATHF, Y.F, X.BATHF + 4.5, Y.BATHF + 4.5) },
    { id: 'wGb2', ...R(X.L, Y.BATHF, X.BATHF, Y.BATHF + 4.5) },
    { id: 'wDL', ...R(X.L, BED_Y, XB, LNG_Y) }, // bedroom | lounge (9" bearing)
    { id: 'wPR', ...R(XA, Y.PORCH, X.R, Y.STAIR) }, // porch + alley rear wall
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
    { id: 'D0', label: 'Small door: street to entry landing', wall: 'wGate', a: 'street', b: 'porch', from: 182, to: 209, swingInto: 'porch', hinge: 'end' },
    { id: 'D1', label: 'Main door: alley landing to foyer', wall: 'wPR', a: 'porch', b: 'foyer', from: 182, to: 218, swingInto: 'foyer', hinge: 'start' },
    { id: 'D2', label: 'Ground-floor bedroom', wall: 'wDL', a: 'lounge', b: 'bedroom', from: 20, to: 50, swingInto: 'bedroom', hinge: 'start' },
    { id: 'D3', label: 'Bedroom bath', wall: 'wGb2', a: 'bedroom', b: 'bbath', from: 35, to: 59, swingInto: 'bbath', hinge: 'end' },
    { id: 'D4', label: 'Kitchen (end of foyer)', wall: 'wKF', a: 'foyer', b: 'kitchen', from: 186, to: 216, swingInto: 'kitchen', hinge: 'start' },
    { id: 'D5', label: 'Family bath', wall: 'wLC', a: 'lounge', b: 'bath', from: 20, to: 44, swingInto: 'bath', hinge: 'start' },
    { id: 'S1', label: 'Glass slider: lounge to court', wall: 'wLC', a: 'lounge', b: 'court', from: 136, to: 170, slide: true },
]

const windows = [
    { id: 'W1', label: 'Bedroom to street (jaali screen)', wall: 'wFront', from: 98, to: 146 },
    { id: 'W2', label: 'Bedroom bath to street (high, frosted)', wall: 'wFront', from: 24, to: 48 },
    { id: 'W3', label: 'Bedroom to side alley (high, over bed head)', wall: 'wAB', from: 116, to: 152 },
    { id: 'W4', label: 'Lounge to court (fixed glass)', wall: 'wLC', from: 96, to: 132 },
    { id: 'W5', label: 'Kitchen to court', wall: 'wCK', from: 350, to: 398 },
    { id: 'W6', label: 'Family bath to court', wall: 'wBC', from: 360, to: 384 },
]

const items = [
    { id: 'car', type: 'car', room: 'porch', ...R(224, 13, 294, 195) }, // reversed in: driver exits onto the 3'-4" side
    // ground-floor bedroom: 5'-6" x 6'-6" bed, head on the alley wall, 23" both sides
    { id: 'gBed', type: 'bed', room: 'bedroom', head: 'E', ...R(68.5, 102.5, 146.5, 168.5) },
    { id: 'gSide1', type: 'sidetable', room: 'bedroom', ...R(128.5, 84.5, 146.5, 102.5) },
    { id: 'gSide2', type: 'sidetable', room: 'bedroom', ...R(128.5, 168.5, 146.5, 186.5) },
    { id: 'gWard', type: 'wardrobe', room: 'bedroom', tall: true, ...R(67.5, 9, 91.5, 72) },
    { id: 'gChair', type: 'armchair', room: 'bedroom', facing: 'N', ...R(108, 20, 138, 50) },
    // bedroom bath
    { id: 'gbWc', type: 'wc', room: 'bbath', facing: 'S', ...R(12, 47, 30, 75) },
    { id: 'gbBasin', type: 'basin', room: 'bbath', ...R(12, 9, 32, 25) },
    { id: 'gbShower', type: 'shower', room: 'bbath', ...R(33, 9, 63, 39) },
    // lounge (family + guests): TV on the bedroom wall, sofa facing it, 3-seat dining by the jaali
    { id: 'tv', type: 'tv', room: 'lounge', ...R(62, 200.5, 110, 216.5) },
    { id: 'lgTable', type: 'table', room: 'lounge', ...R(65, 240, 107, 261) },
    { id: 'lgSofa', type: 'sofa', room: 'lounge', facing: 'S', ...R(50, 285, 122, 318) },
    { id: 'dnTable', type: 'table', room: 'lounge', ...R(142, 220, 172, 262) },
    { id: 'dnW1', type: 'chair', room: 'lounge', facing: 'E', ...R(124, 222, 142, 240) },
    { id: 'dnW2', type: 'chair', room: 'lounge', facing: 'E', ...R(124, 244, 142, 262) },
    { id: 'dnN', type: 'chair', room: 'lounge', facing: 'S', ...R(148, 262, 166, 280) },
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

const START = { name: 'entry landing inside the small door', x: 196, y: 25 }
const targets = [
    { name: 'side alley, half way', x: 167.5, y: 120 },
    { name: 'main door landing', x: 195, y: 190 },
    { name: 'car driver door', x: 205, y: 120 },
    { name: 'bedroom: bed, window side', x: 100, y: 91 },
    { name: 'bedroom: bed, lounge side', x: 100, y: 180 },
    { name: 'bedroom: wardrobe', x: 79, y: 84 },
    { name: 'bedroom: window chair', x: 123, y: 62 },
    { name: 'bedroom bath', x: 47, y: 52 },
    { name: 'foyer at stair foot', x: 210, y: 234 },
    { name: 'lounge sofa', x: 86, y: 273 },
    { name: 'dining chair', x: 133, y: 290 },
    { name: 'family bath', x: 50, y: 370 },
    { name: 'court garden', x: 118, y: 350 },
    { name: 'kitchen hob', x: 226, y: 385 },
    { name: 'kitchen sink', x: 265, y: 384 },
    { name: 'kitchen fridge', x: 260, y: 378 },
]

const chains = {
    'GF x through bedroom / alley / porch': [[EXT, 'wall'], [137.5, 'bedroom + bath'], [EXT, 'wall'], [24, 'side alley'], [4.5, 'low divider'], [120, 'car porch'], [EXT, 'wall']],
    'GF x through lounge / foyer / stair': [[EXT, 'wall'], [169, 'lounge'], [45.5, 'foyer'], [4.5, 'rail'], [76, 'stair'], [EXT, 'wall']],
    'GF x through bath / court / kitchen': [[EXT, 'wall'], [68.5, 'family bath'], [4.5, 'wall'], [91.5, 'court'], [4.5, 'wall'], [126, 'kitchen'], [EXT, 'wall']],
    'GF y through bath / bedroom / lounge / bath': [[EXT, 'wall'], [66, 'bedroom bath'], [4.5, 'wall'], [112, 'bedroom'], [EXT, 'wall'], [125, 'lounge'], [4.5, 'wall'], [93, 'family bath'], [EXT, 'wall']],
    'GF y through alley / lounge / court': [[EXT, 'wall + small door'], [198, 'side alley'], [EXT, 'wall'], [109.5, 'lounge'], [4.5, 'wall'], [93, 'court'], [EXT, 'wall']],
    'GF y through porch / stair / kitchen': [[EXT, 'shutter line'], [198, 'car porch'], [EXT, 'wall'], [116, 'stair'], [4.5, 'wall'], [86.5, 'kitchen'], [EXT, 'wall']],
}

module.exports = { id: 'GF', title: 'GROUND FLOOR', rooms, walls, openings, doors, windows, items, START, targets, chains }
