/**
 * ROOF - mumty (stair room) with a linen / store passage, family terrace,
 * private laundry + drying yard, solar array, water tank on the mumty roof,
 * safety grille over the court.
 */
const { X, Y, EXT, PLOT_W, PLOT_H } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })
const MUMTY_Y = Y.FRONT //   162   mumty front wall
const LAND_Y = Y.FRONT + 4.5 // 166.5

const rooms = [
    { id: 'terrace', name: 'FAMILY TERRACE', kind: 'terrace', ...R(X.L, MUMTY_Y, X.COURTR, Y.LC) },
    { id: 'terraceF', partOf: 'terrace', kind: 'terrace', ...R(X.L, Y.F, X.R, MUMTY_Y) },
    { id: 'terraceRL', partOf: 'terrace', kind: 'terrace', ...R(X.L, Y.LC, X.BATHR, Y.T) },
    { id: 'landing', name: 'MUMTY', kind: 'hall', ...R(X.COLW, LAND_Y, X.R, Y.STAIR) },
    { id: 'store', name: 'LINEN / STORE', kind: 'utility', ...R(X.COLW, Y.STAIR, X.FOY, Y.STAIR_END) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.ST, Y.STAIR, X.R, Y.STAIR_END) },
    { id: 'drying', name: 'LAUNDRY + DRYING', kind: 'terrace', ...R(X.COLW, Y.KIT, X.R, Y.T) },
    { id: 'void', name: 'COURT (grille)', kind: 'void', ...R(X.COURT, Y.COURT, X.COURTR, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, PLOT_H) }, // 3'-6" parapets on all edges
    { id: 'wR', ...R(X.R, 0, PLOT_W, PLOT_H) },
    { id: 'wRear', ...R(EXT, Y.T, X.R, PLOT_H) },
    { id: 'wFront', ...R(EXT, 0, X.R, Y.F) },
    { id: 'mL', ...R(X.COURTR, MUMTY_Y, X.COLW, Y.KIT) }, // mumty side wall
    { id: 'mF', ...R(X.COLW, MUMTY_Y, X.R, LAND_Y) }, // mumty front wall
    { id: 'mRr', ...R(X.COLW, Y.STAIR_END, X.R, Y.KIT) }, // mumty rear wall
    { id: 'gF', ...R(X.COURT, Y.LC, X.COURTR, Y.COURT) }, // court guard walls
    { id: 'gL', ...R(X.BATHR, Y.LC, X.COURT, Y.T) },
    { id: 'gR', ...R(X.COURTR, Y.KIT, X.COLW, Y.T) },
]

const openings = [
    { id: 'rail', kind: 'rail', ...R(X.FOY, Y.STAIR, X.ST, Y.STAIR_END) },
]

const doors = [
    { id: 'D13', label: 'Mumty to front terrace', wall: 'mF', a: 'landing', b: 'terrace', from: 186, to: 219, swingInto: 'landing', hinge: 'start' },
    { id: 'D14', label: 'Store passage to family terrace', wall: 'mL', a: 'store', b: 'terrace', from: 270, to: 303, swingInto: 'store', hinge: 'end' },
    { id: 'D15', label: 'Store passage to laundry yard', wall: 'mRr', a: 'store', b: 'drying', from: 186, to: 216, swingInto: 'drying', hinge: 'start' },
]

const windows = [
    { id: 'W13', label: 'Mumty to front terrace', wall: 'mF', from: 240, to: 290 },
]

const items = [
    // solar: 6 panels portrait (3'-3" x 6'-6") + 2 landscape, clear path kept to the mumty door
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ id: `pv${i}`, type: 'solar', room: 'terrace', ...R(14 + i * 44, 16, 14 + i * 44 + 39, 94) })),
    { id: 'pvL1', type: 'solar', room: 'terrace', ...R(14, 100, 92, 139) },
    { id: 'pvL2', type: 'solar', room: 'terrace', ...R(96, 100, 174, 139) },
    // family terrace: daybed (charpai), low table, planter
    { id: 'daybed', type: 'bench', room: 'terrace', ...R(14, 190, 50, 268) },
    { id: 'tableT', type: 'table', room: 'terrace', ...R(70, 214, 100, 244) },
    { id: 'planterT', type: 'planter', room: 'terrace', ...R(150, 170, 170, 250) },
    // linen / store passage: 12" shelves
    { id: 'shelves', type: 'cabinet', room: 'store', ...R(178, 222, 190, 264) },
    // laundry under a canopy in the drying yard, AC condensers on the side
    { id: 'washer', type: 'washer', room: 'drying', ...R(228, 336.5, 254, 362.5) },
    { id: 'lSink', type: 'sink', room: 'drying', ...R(258, 336.5, 276, 354.5) },
    { id: 'ac1', type: 'ac', room: 'drying', ...R(280, 362, 304, 392) },
    { id: 'ac2', type: 'ac', room: 'drying', ...R(280, 393, 304, 423) },
]

const START = { name: 'stair arrival', x: 286, y: 191 }
const targets = [
    { name: 'front terrace / solar maintenance', x: 210, y: 130 },
    { name: 'family terrace seating', x: 120, y: 260 },
    { name: 'rear-left terrace', x: 40, y: 390 },
    { name: 'washer', x: 241, y: 375 },
    { name: 'drying yard', x: 215, y: 400 },
]

const chains = {
    'RF x through terrace / mumty': [[EXT, 'parapet'], [164.5, 'family terrace'], [4.5, 'mumty wall'], [45.5, 'laundry'], [4.5, 'rail'], [76, 'stair'], [EXT, 'parapet']],
    'RF y through terraces / mumty / drying yard': [[EXT, 'parapet'], [153, 'front terrace'], [4.5, 'mumty wall'], [49.5, 'mumty'], [116, 'stair'], [4.5, 'wall'], [86.5, 'drying yard'], [EXT, 'parapet']],
}

module.exports = { id: 'RF', title: 'ROOF / TERRACE', rooms, walls, openings, doors, windows, items, START, targets, chains }
