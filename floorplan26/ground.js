/**
 * GROUND FLOOR - arrival, guests, family living, cooking.
 * Plot coordinates in inches (see site.js). Every rectangle is checked by
 * check.js: the plot must be tiled exactly, doors must join the stated rooms,
 * furniture must fit and leave walking room.
 */
const { X, Y, EXT, PLOT_W, PLOT_H } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const rooms = [
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(X.COLW, Y.F, X.R, Y.PORCH) },
    { id: 'gbath', name: 'GUEST BATH', kind: 'bath', ...R(X.L, Y.F, X.BATHF, Y.BATHF) },
    { id: 'drawing', name: 'DRAWING / GUEST ROOM', kind: 'drawing', ...R(X.BATHF + 4.5, Y.F, X.COL, Y.FRONT) },
    { id: 'drawingB', partOf: 'drawing', kind: 'drawing', ...R(X.L, Y.BATHF + 4.5, X.BATHF + 4.5, Y.FRONT) },
    { id: 'lounge', name: 'TV LOUNGE + DINING', kind: 'room', ...R(X.L, Y.FRONT + EXT, X.COL, Y.LC) },
    { id: 'loungeB', partOf: 'lounge', kind: 'room', ...R(X.COL, Y.STAIR, X.COLW, Y.LC) },
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
    { id: 'wFront', ...R(EXT, 0, X.COL, Y.F) },
    { id: 'wPD', ...R(X.COL, 0, X.COLW, Y.STAIR) }, // porch | drawing + lounge (9" bearing)
    { id: 'wGb1', ...R(X.BATHF, Y.F, X.BATHF + 4.5, Y.BATHF + 4.5) },
    { id: 'wGb2', ...R(X.L, Y.BATHF, X.BATHF, Y.BATHF + 4.5) },
    { id: 'wDL', ...R(X.L, Y.FRONT, X.COL, Y.FRONT + EXT) }, // drawing | lounge (9" bearing)
    { id: 'wPR', ...R(X.COLW, Y.PORCH, X.R, Y.STAIR) }, // porch rear wall (9")
    { id: 'wGate', ...R(X.COLW, 0, 212.5, Y.F) }, // gate pier with the pedestrian door
    { id: 'wLC', ...R(X.L, Y.LC, X.COLW, Y.COURT) }, // lounge | bath + court
    { id: 'wBC', ...R(X.BATHR, Y.COURT, X.COURT, Y.T) },
    { id: 'wCK', ...R(X.COURTR, Y.COURT, X.COLW, Y.T) },
    { id: 'wKF', ...R(X.COLW, Y.STAIR_END, X.R, Y.KIT) },
]

const openings = [
    { id: 'gate', kind: 'gate', ...R(212.5, 0, X.R, Y.F) }, // 7'-7½" rolling shutter for the car
    { id: 'rail', kind: 'rail', ...R(X.FOY, Y.STAIR + 36, X.ST, Y.STAIR_END) },
]

const doors = [
    { id: 'D0', label: 'Pedestrian door from the street', wall: 'wGate', a: 'street', b: 'porch', from: 181, to: 208, swingInto: 'porch', hinge: 'start' },
    { id: 'D1', label: 'Main door: porch to foyer', wall: 'wPR', a: 'porch', b: 'foyer', from: 179, to: 215, swingInto: 'foyer', hinge: 'start' },
    { id: 'D2', label: 'Guest door: porch to drawing room', wall: 'wPD', a: 'porch', b: 'drawing', from: 90, to: 126, swingInto: 'drawing', hinge: 'start' },
    { id: 'D3', label: 'Serving door: drawing to lounge', wall: 'wDL', a: 'drawing', b: 'lounge', from: 130, to: 160, swingInto: 'lounge', hinge: 'end' },
    { id: 'D4', label: 'Guest bath', wall: 'wGb1', a: 'drawing', b: 'gbath', from: 40, to: 64, swingInto: 'gbath', hinge: 'end' },
    { id: 'D5', label: 'Kitchen (end of foyer)', wall: 'wKF', a: 'foyer', b: 'kitchen', from: 186, to: 216, swingInto: 'kitchen', hinge: 'start' },
    { id: 'D6', label: 'Family bath', wall: 'wLC', a: 'lounge', b: 'bath', from: 20, to: 44, swingInto: 'bath', hinge: 'start' },
    { id: 'S1', label: 'Glass slider: lounge to court', wall: 'wLC', a: 'lounge', b: 'court', from: 96, to: 132, slide: true },
]

const windows = [
    { id: 'W1', label: 'Drawing room to street (jaali screen)', wall: 'wFront', from: 95, to: 155 },
    { id: 'W2', label: 'Guest bath to street (high, frosted)', wall: 'wFront', from: 24, to: 48 },
    { id: 'W3', label: 'Lounge to porch', wall: 'wPD', from: 176, to: 200 },
    { id: 'W4', label: 'Lounge to court (fixed glass)', wall: 'wLC', from: 136, to: 170 },
    { id: 'W5', label: 'Kitchen to court', wall: 'wCK', from: 350, to: 398 },
    { id: 'W6', label: 'Family bath to court', wall: 'wBC', from: 360, to: 384 },
]

const items = [
    { id: 'car', type: 'car', room: 'porch', ...R(215, 13, 285, 195) }, // reversed in: driver exits onto the 3'-1" walkway
    // drawing / guest room: 3-seater under the street window, 2 armchairs, table
    { id: 'drSofa', type: 'sofa', room: 'drawing', facing: 'N', ...R(95, 9, 169, 42) },
    { id: 'drChairA', type: 'armchair', room: 'drawing', facing: 'E', ...R(18, 92, 48, 122) },
    { id: 'drChairB', type: 'armchair', room: 'drawing', facing: 'E', ...R(18, 126, 48, 156) },
    { id: 'drTable', type: 'table', room: 'drawing', ...R(84, 86, 126, 107) },
    // guest bath
    { id: 'gbWc', type: 'wc', room: 'gbath', facing: 'S', ...R(12, 47, 30, 75) },
    { id: 'gbBasin', type: 'basin', room: 'gbath', ...R(12, 9, 32, 25) },
    { id: 'gbShower', type: 'shower', room: 'gbath', ...R(33, 9, 63, 39) },
    // TV lounge + dining
    { id: 'tv', type: 'tv', room: 'lounge', ...R(48, 171, 96, 187) },
    { id: 'lgSofa', type: 'sofa', room: 'lounge', facing: 'S', ...R(30, 255, 114, 288) },
    { id: 'lgTable', type: 'table', room: 'lounge', ...R(51, 210, 93, 231) },
    { id: 'dnTable', type: 'table', room: 'lounge', ...R(136, 222, 166, 264) },
    { id: 'dnW1', type: 'chair', room: 'lounge', facing: 'E', ...R(118, 224, 136, 242) },
    { id: 'dnW2', type: 'chair', room: 'lounge', facing: 'E', ...R(118, 246, 136, 264) },
    { id: 'dnN', type: 'chair', room: 'lounge', facing: 'S', ...R(142, 264, 160, 282) },
    { id: 'dnS', type: 'chair', room: 'lounge', facing: 'N', ...R(142, 204, 160, 222) },
    { id: 'jaali', type: 'screen', room: 'lounge', ...R(169, 216, 175, 262) },
    // foyer
    { id: 'shoes', type: 'cabinet', room: 'foyer', ...R(207.5, 258, 223.5, 306) },
    // kitchen: U-counter, hob by the court wall (hood ducted to the court)
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

const START = { name: 'porch walkway', x: 191, y: 100 }
const targets = [
    { name: 'drawing room seating', x: 110, y: 70 },
    { name: 'guest bath', x: 51, y: 52 },
    { name: 'foyer at stair foot', x: 210, y: 234 },
    { name: 'lounge sofa', x: 72, y: 243 },
    { name: 'dining chair', x: 106, y: 300 },
    { name: 'family bath', x: 50, y: 370 },
    { name: 'court garden', x: 118, y: 350 },
    { name: 'kitchen hob', x: 226, y: 385 },
    { name: 'kitchen sink', x: 265, y: 384 },
    { name: 'kitchen fridge', x: 260, y: 378 },
]

const chains = {
    'GF x through drawing room / porch': [[EXT, 'wall'], [160, 'drawing + guest bath'], [EXT, 'wall'], [126, 'car porch'], [EXT, 'wall']],
    'GF x through lounge / foyer / stair': [[EXT, 'wall'], [160, 'lounge'], [EXT, 'lounge (jaali line)'], [45.5, 'foyer'], [4.5, 'rail'], [76, 'stair'], [EXT, 'wall']],
    'GF x through bath / court / kitchen': [[EXT, 'wall'], [68.5, 'family bath'], [4.5, 'wall'], [91.5, 'court'], [4.5, 'wall'], [126, 'kitchen'], [EXT, 'wall']],
    'GF y through guest bath / drawing / lounge / bath': [[EXT, 'wall'], [66, 'guest bath'], [4.5, 'wall'], [82.5, 'drawing'], [EXT, 'wall'], [154.5, 'lounge'], [4.5, 'wall'], [93, 'family bath'], [EXT, 'wall']],
    'GF y through porch / stair / kitchen': [[EXT, 'gate line'], [198, 'car porch'], [EXT, 'wall'], [116, 'stair'], [4.5, 'wall'], [86.5, 'kitchen'], [EXT, 'wall']],
}

module.exports = { id: 'GF', title: 'GROUND FLOOR', rooms, walls, openings, doors, windows, items, START, targets, chains }
