/**
 * FIRST FLOOR - private family floor: three bedrooms with their own baths,
 * a study / prayer room over the kitchen, all around the light court.
 */
const { X, Y, EXT, PLOT_W, PLOT_H } = require('./site')

const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })
const HALL_Y = Y.FRONT + 4.5 //   166.5 corridor starts behind the front rooms
const MASTER_Y = 207 //           master bedroom front face
const DRESS_X = 90.5 //           walk-in dressing right face
const BATH3_X = 250 //            bed 3 bath left face
const XM = X.COL //               bed 2 | bed 3 wall (on the GF bearing wall 169-178)

const rooms = [
    { id: 'bath2', name: 'BATH 2', kind: 'bath', ...R(X.L, Y.F, X.BATHF, Y.BATHF) },
    { id: 'bed2', name: 'BEDROOM 2', kind: 'room', ...R(X.BATHF + 4.5, Y.F, XM, Y.FRONT) },
    { id: 'bed2B', partOf: 'bed2', kind: 'room', ...R(X.L, Y.BATHF + 4.5, X.BATHF + 4.5, Y.FRONT) },
    { id: 'bed3', name: 'BEDROOM 3', kind: 'room', ...R(X.COLW, Y.F, BATH3_X - 4.5, Y.FRONT) },
    { id: 'bed3B', partOf: 'bed3', kind: 'room', ...R(BATH3_X - 4.5, Y.BATHF + 4.5, X.R, Y.FRONT) },
    { id: 'bath3', name: 'BATH 3', kind: 'bath', ...R(BATH3_X, Y.F, X.R, Y.BATHF) },
    { id: 'hall', name: 'HALL', kind: 'hall', ...R(DRESS_X + 4.5, HALL_Y, X.R, MASTER_Y - 4.5) },
    { id: 'hallB', partOf: 'hall', kind: 'hall', ...R(X.COLW, MASTER_Y - 4.5, X.R, Y.STAIR) },
    { id: 'hallC', partOf: 'hall', kind: 'hall', ...R(X.COLW, Y.STAIR, X.FOY, Y.STAIR_END) },
    { id: 'master', name: 'MASTER BEDROOM', kind: 'room', ...R(X.L, MASTER_Y, X.COURTR, Y.LC) },
    { id: 'dress', partOf: 'master', kind: 'room', ...R(X.L, HALL_Y, DRESS_X, MASTER_Y) },
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X.ST, Y.STAIR, X.R, Y.STAIR_END) },
    { id: 'mbath', name: 'MASTER BATH', kind: 'bath', ...R(X.L, Y.COURT, X.BATHR, Y.T) },
    { id: 'void', name: 'COURT (open below)', kind: 'void', ...R(X.COURT, Y.COURT, X.COURTR, Y.T) },
    { id: 'study', name: 'STUDY / PRAYER', kind: 'utility', ...R(X.COLW, Y.KIT, X.R, Y.T) },
]

const walls = [
    { id: 'wL', ...R(0, 0, EXT, PLOT_H) },
    { id: 'wR', ...R(X.R, 0, PLOT_W, PLOT_H) },
    { id: 'wRear', ...R(EXT, Y.T, X.R, PLOT_H) },
    { id: 'wFront', ...R(EXT, 0, X.R, Y.F) }, // over the porch on a beam
    { id: 'wB2a', ...R(X.BATHF, Y.F, X.BATHF + 4.5, Y.BATHF + 4.5) },
    { id: 'wB2b', ...R(X.L, Y.BATHF, X.BATHF, Y.BATHF + 4.5) },
    { id: 'wMid', ...R(XM, Y.F, X.COLW, Y.FRONT) }, // bed 2 | bed 3 (over the 9" GF wall)
    { id: 'wB3a', ...R(BATH3_X - 4.5, Y.F, BATH3_X, Y.BATHF + 4.5) },
    { id: 'wB3b', ...R(BATH3_X, Y.BATHF, X.R, Y.BATHF + 4.5) },
    { id: 'wFR', ...R(X.L, Y.FRONT, X.R, HALL_Y) }, // front rooms | hall
    { id: 'wDress', ...R(DRESS_X, HALL_Y, DRESS_X + 4.5, MASTER_Y) },
    { id: 'wMF', ...R(DRESS_X + 4.5, MASTER_Y - 4.5, X.COURTR, MASTER_Y) }, // master front wall
    { id: 'wMH', ...R(X.COURTR, MASTER_Y - 4.5, X.COLW, Y.LC) }, // master | hall
    { id: 'wMC', ...R(X.L, Y.LC, X.COLW, Y.COURT) }, // master | bath + court
    { id: 'wBC', ...R(X.BATHR, Y.COURT, X.COURT, Y.T) },
    { id: 'wCS', ...R(X.COURTR, Y.COURT, X.COLW, Y.T) },
    { id: 'wSF', ...R(X.COLW, Y.STAIR_END, X.R, Y.KIT) },
]

const openings = [
    { id: 'rail', kind: 'rail', ...R(X.FOY, Y.STAIR, X.ST, Y.STAIR_END) },
]

const doors = [
    { id: 'D6', label: 'Bedroom 2', wall: 'wFR', a: 'hall', b: 'bed2', from: 96, to: 126, swingInto: 'bed2', hinge: 'start' },
    { id: 'D7', label: 'Bath 2', wall: 'wB2a', a: 'bed2', b: 'bath2', from: 40, to: 64, swingInto: 'bath2', hinge: 'end' },
    { id: 'D8', label: 'Bedroom 3', wall: 'wFR', a: 'hall', b: 'bed3', from: 182, to: 212, swingInto: 'bed3', hinge: 'start' },
    { id: 'D9', label: 'Bath 3', wall: 'wB3a', a: 'bed3', b: 'bath3', from: 40, to: 64, swingInto: 'bath3', hinge: 'end' },
    { id: 'D10', label: 'Master bedroom', wall: 'wMF', a: 'hall', b: 'master', from: 120, to: 150, swingInto: 'master', hinge: 'start' },
    { id: 'D11', label: 'Master bath', wall: 'wMC', a: 'master', b: 'mbath', from: 48, to: 72, swingInto: 'mbath', hinge: 'end' },
    { id: 'D12', label: 'Study / prayer', wall: 'wSF', a: 'hall', b: 'study', from: 186, to: 216, swingInto: 'study', hinge: 'start' },
]

const windows = [
    { id: 'W6', label: 'Bedroom 2 to street (jaali)', wall: 'wFront', from: 80, to: 140 },
    { id: 'W7', label: 'Bath 2 to street (high, frosted)', wall: 'wFront', from: 24, to: 48 },
    { id: 'W8', label: 'Bedroom 3 to street (jaali)', wall: 'wFront', from: 185, to: 235 },
    { id: 'W9', label: 'Bath 3 to street (high, frosted)', wall: 'wFront', from: 266, to: 290 },
    { id: 'W10', label: 'Master to court', wall: 'wMC', from: 100, to: 160 },
    { id: 'W11', label: 'Master bath to court', wall: 'wBC', from: 360, to: 384 },
    { id: 'W12', label: 'Study to court', wall: 'wCS', from: 350, to: 398 },
]

const items = [
    // bedroom 2: 5'-0" x 6'-6" bed against the party wall, desk under the window, wardrobe 3 ft back from it
    { id: 'b2Bed', type: 'bed', room: 'bed2', head: 'S', ...R(9, 84, 69, 162) },
    { id: 'b2Side1', type: 'sidetable', room: 'bed2', ...R(69, 144, 87, 162) },
    { id: 'b2Desk', type: 'desk', room: 'bed2', ...R(100, 9, 140, 29) },
    { id: 'b2Ward', type: 'wardrobe', room: 'bed2', tall: true, ...R(145, 45, 169, 117) },
    // bath 2 (stacked over the ground-floor bedroom bath)
    { id: 'b2Wc', type: 'wc', room: 'bath2', facing: 'S', ...R(12, 47, 30, 75) },
    { id: 'b2Basin', type: 'basin', room: 'bath2', ...R(12, 9, 32, 25) },
    { id: 'b2Shower', type: 'shower', room: 'bath2', ...R(33, 9, 63, 39) },
    // bedroom 3: 5'-0" x 6'-6" bed on the right wall, wardrobe on the middle wall, desk under the window
    { id: 'b3Bed', type: 'bed', room: 'bed3', head: 'S', ...R(244, 84, 304, 162) },
    { id: 'b3Side', type: 'sidetable', room: 'bed3', ...R(226, 144, 244, 162) },
    { id: 'b3Ward', type: 'wardrobe', room: 'bed3', tall: true, ...R(178, 45, 202, 117) },
    { id: 'b3Desk', type: 'desk', room: 'bed3', ...R(208, 9, 244, 29) },
    // bath 3
    { id: 'b3Wc', type: 'wc', room: 'bath3', facing: 'S', ...R(283, 47, 301, 75) },
    { id: 'b3Basin', type: 'basin', room: 'bath3', ...R(282, 9, 302, 25) },
    { id: 'b3Shower', type: 'shower', room: 'bath3', ...R(250, 9, 280, 39) },
    // master: bed head on the hall wall, walk-in dressing, reading chair
    { id: 'mBed', type: 'bed', room: 'master', head: 'W', ...R(9, 232, 87, 298) }, // 5'-6" x 6'-6"
    { id: 'mSide1', type: 'sidetable', room: 'master', ...R(9, 214, 27, 232) },
    { id: 'mSide2', type: 'sidetable', room: 'master', ...R(9, 298, 27, 316) },
    { id: 'mWard', type: 'wardrobe', room: 'master', tall: true, ...R(9, 166.5, 90.5, 190.5) },
    { id: 'mChair', type: 'armchair', room: 'master', facing: 'W', ...R(140, 285, 170, 315) },
    // master bath (stacked over the family bath)
    { id: 'mbWc', type: 'wc', room: 'mbath', facing: 'S', ...R(12, 395, 30, 423) },
    { id: 'mbShower', type: 'shower', room: 'mbath', ...R(41.5, 387, 77.5, 423) },
    { id: 'mbBasin', type: 'basin', room: 'mbath', ...R(9, 336, 25, 356) },
    // study / prayer room over the kitchen
    { id: 'stDesk', type: 'desk', room: 'study', ...R(230, 399, 290, 423) },
    { id: 'stShelf', type: 'cabinet', room: 'study', tall: true, ...R(288, 340, 304, 395) },
    { id: 'stMat', type: 'rug', room: 'study', walkable: true, ...R(184, 372, 214, 418) },
]

const START = { name: 'stair arrival', x: 286, y: 205 }
const targets = [
    { name: 'bedroom 2: bed side', x: 90, y: 120 },
    { name: 'bedroom 2: desk and window', x: 110, y: 40 },
    { name: 'bedroom 2: wardrobe', x: 121, y: 81 },
    { name: 'bath 2', x: 51, y: 52 },
    { name: 'bedroom 3: bed side', x: 230, y: 120 },
    { name: 'bedroom 3: desk', x: 226, y: 45 },
    { name: 'bath 3', x: 262, y: 52 },
    { name: 'master: bed, door side', x: 100, y: 219 },
    { name: 'master: bed, court side', x: 60, y: 313 },
    { name: 'master: dressing', x: 50, y: 202 },
    { name: 'master bath', x: 50, y: 370 },
    { name: 'study desk', x: 260, y: 385 },
]

const chains = {
    'FF x through bedroom 2 / bedroom 3': [[EXT, 'wall'], [160, 'bed 2 + bath'], [EXT, 'wall'], [126, 'bed 3 + bath'], [EXT, 'wall']],
    'FF x through master / hall / stair': [[EXT, 'wall'], [164.5, 'master'], [4.5, 'wall'], [45.5, 'hall'], [4.5, 'rail'], [76, 'stair'], [EXT, 'wall']],
    'FF x through master bath / court / study': [[EXT, 'wall'], [68.5, 'master bath'], [4.5, 'wall'], [91.5, 'court'], [4.5, 'wall'], [126, 'study'], [EXT, 'wall']],
    'FF y through bath 2 / bed 2 / dressing / master / bath': [[EXT, 'wall'], [66, 'bath 2'], [4.5, 'wall'], [82.5, 'bed 2'], [4.5, 'wall'], [40.5, 'dressing'], [118.5, 'master'], [4.5, 'wall'], [93, 'master bath'], [EXT, 'wall']],
    'FF y through bed 3 / hall / stair / study': [[EXT, 'wall'], [153, 'bed 3'], [4.5, 'wall'], [49.5, 'hall'], [116, 'stair'], [4.5, 'wall'], [86.5, 'study'], [EXT, 'wall']],
}

module.exports = { id: 'FF', title: 'FIRST FLOOR', rooms, walls, openings, doors, windows, items, START, targets, chains }
