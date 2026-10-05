/**
 * Single source of truth for the 42'-0" x 36'-0" plot (Rev B).
 *
 * Coordinate system (inches):
 *   x = 0 at the LEFT (36-ft commercial road), increasing to the right (42 ft)
 *   y = 0 at the BOTTOM (42-ft residential road), increasing upwards (36 ft)
 *
 * Every coordinate below is DERIVED from an explicit dimension chain
 * (plot -> wall-to-wall -> clear), so a room can never "borrow" width that
 * does not exist. validate.js re-checks every chain and rasterises the whole
 * plan at 1/2" resolution to prove there are no overlaps and no gaps.
 *
 * Rev B: drawing room added (behind the car porch, own door from the porch,
 * attached guest bath). Bedroom 2 moves to the first floor: the ground floor
 * cannot hold a drawing room AND a second bedroom (see floorplan/README.md).
 */
const { ft } = require('./units')

// ---------------------------------------------------------------- constants
const PLOT_W = ft(42) // 504"  along the lower (residential) road
const PLOT_H = ft(36) // 432"  along the left (commercial) road

const EXT = 9 //    9"   external / boundary wall
const PART = 4.5 // 4½"  internal partition

// ------------------------------------------------- horizontal (x) chains
// Commercial band: original drawing gives 41'-8" - 26'-1" = 15'-7" gross.
const SHOP_DEPTH = ft(13, 4)
const SHOP_BAND_X = [
    ['front setback / step', 9],
    ['shutter line / front piers', EXT],
    ['shop clear depth', SHOP_DEPTH],
    ['shop rear wall (shop | house)', EXT],
]
// Residence: 42'-0" - 15'-7" = 26'-5" gross.
const W_COL = ft(14, 0) //    stair + kitchen / lounge / master column
const E_COL = ft(11, 3.5) //  car porch / drawing room / baths column
const RES_X = [
    ['west column clear', W_COL],
    ['partition', PART],
    ['east column clear', E_COL],
    ['right boundary wall', EXT],
]

// ---------------------------------------------------- vertical (y) chains
// Four shops along the 36-ft road, 8'-3" clear frontage each (LOCKED).
const SHOP_FRONT = ft(8, 3)
const SHOP_Y = [
    ['bottom wall', EXT],
    ['shop 1', SHOP_FRONT],
    ['partition', PART],
    ['shop 2', SHOP_FRONT],
    ['central pier wall', EXT],
    ['shop 3', SHOP_FRONT],
    ['partition', PART],
    ['shop 4', SHOP_FRONT],
    ['top wall', EXT],
]

// helpers --------------------------------------------------------------
const sum = (chain) => chain.reduce((a, [, v]) => a + v, 0)
/** cumulative edges of a chain starting at `start` */
const edges = (chain, start = 0) => {
    const out = [start]
    for (const [, v] of chain) out.push(out[out.length - 1] + v)
    return out
}

const sx = edges(SHOP_BAND_X) //  [0, 9, 18, 178, 187]
const rx = edges(RES_X, sx[4]) // [187, 355, 359.5, 495, 504]
const sy = edges(SHOP_Y) //       [0, 9, 108, 112.5, 211.5, 220.5, 319.5, 324, 423, 432]

const X0 = rx[0] // 187   first clear inch of the residence
const XW = rx[1] // 355   west column right face
const XE = rx[2] // 359.5 east column left face
const XR = rx[3] // 495   right wall inner face
const Y0 = EXT //   9     bottom wall inner face
const YT = PLOT_H - EXT // 423 top wall inner face

// ---- stair: straight flight, floor-to-floor 10'-6" = 18 risers x 7"
const RISERS = 18
const RISER = 7
const TREADS = RISERS - 1 // 17
const TREAD = 9.5
const STAIR_W = ft(3, 3)
const STAIR_RUN = ft(13, 6) // 162" >= 17 x 9½" = 161½"

// ---- west column (y): kitchen | lounge | master
const KITCHEN_D = ft(7, 6)
const LOUNGE_D = ft(15, 3)
const MASTER_D = ft(11, 0)
const SHAFT_W = ft(4, 6)
const SHAFT_D = ft(4, 0)

const W_KITCHEN_CUT = [
    ['bottom wall', EXT],
    ['kitchen', KITCHEN_D],
    ['partition', PART],
    ['lounge / dining', LOUNGE_D],
    ['partition', PART],
    ['master bedroom', MASTER_D],
    ['top wall', EXT],
]
const wy = edges(W_KITCHEN_CUT) // [0, 9, 99, 103.5, 286.5, 291, 423, 432]

const W_STAIR_CUT = [
    ['bottom wall', EXT],
    ['stair', STAIR_RUN],
    ['stair landing + lounge bay', wy[4] - (EXT + STAIR_RUN)],
    ['partition', PART],
    ['master bedroom', MASTER_D],
    ['top wall', EXT],
]
const W_SHAFT_CUT = [
    ['bottom wall', EXT],
    ['kitchen', KITCHEN_D],
    ['partition', PART],
    ['lounge / dining', LOUNGE_D],
    ['partition', PART],
    ['master bedroom', MASTER_D - PART - SHAFT_D],
    ['partition', PART],
    ['open-to-sky shaft', SHAFT_D],
    ['top wall', EXT],
]

// ---- east column (y): porch | drawing room | baths
const PORCH_D = ft(16, 6)
const DRAWING_D = ft(10, 3)
const BATH_D = ft(7, 0)
const E_CUT = [
    ['car gate (in boundary line)', EXT],
    ['car porch', PORCH_D],
    ['partition', PART],
    ['drawing room', DRAWING_D],
    ['partition', PART],
    ['baths', BATH_D],
    ['top wall', EXT],
]
const ey = edges(E_CUT) // [0, 9, 207, 211.5, 334.5, 339, 423, 432]

// ---- horizontal sections (x) ----
const BATH_W = (E_COL - PART) / 2 // 65.5" = 5'-5½"
const X_FRONT_CUT = [
    ...SHOP_BAND_X,
    ['stair', STAIR_W],
    ['partition', PART],
    ['kitchen', W_COL - STAIR_W - PART],
    ['partition', PART],
    ['car porch', E_COL],
    ['right boundary wall', EXT],
]
const X_MID_CUT = [
    ...SHOP_BAND_X,
    ['lounge incl. bay', W_COL],
    ['partition', PART],
    ['drawing room', E_COL],
    ['right boundary wall', EXT],
]
const X_REAR_CUT = [
    ...SHOP_BAND_X,
    ['master bedroom', W_COL - PART - SHAFT_W],
    ['partition', PART],
    ['open-to-sky shaft', SHAFT_W],
    ['partition', PART],
    ['master bath', BATH_W],
    ['partition', PART],
    ['guest bath', BATH_W],
    ['right boundary wall', EXT],
]

const xf = edges(X_FRONT_CUT) // [.., 187, 226, 230.5, 355, 359.5, 495, 504]
const xr = edges(X_REAR_CUT) //  [.., 187, 296.5, 301, 355, 359.5, 425, 429.5, 495, 504]

const XSTAIR = xf[5] //    226
const XKIT = xf[6] //      230.5
const XSHAFT_W = xr[5] //  296.5
const XSHAFT = xr[6] //    301
const XBATH_MID = xr[9] // 425
const XBATH2 = xr[10] //   429.5
const YSTAIR_TOP = EXT + STAIR_RUN // 171 (stair foot, opens onto the landing)
const YSHAFT_WALL = wy[5] + (MASTER_D - PART - SHAFT_D) // 370.5
const YSHAFT = YSHAFT_WALL + PART // 375

// ------------------------------------------------------------- elements
const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const shops = [1, 2, 3, 4].map((n, i) => ({
    id: `shop${n}`, name: `SHOP ${n}`, kind: 'shop', ...R(sx[2], sy[1 + 2 * i], sx[3], sy[2 + 2 * i]),
}))

const rooms = [
    ...shops,
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X0, Y0, XSTAIR, YSTAIR_TOP) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'kitchen', ...R(XKIT, Y0, XW, wy[2]) },
    { id: 'lounge', name: 'LOUNGE / DINING', kind: 'room', ...R(XKIT, wy[3], XW, wy[4]) },
    { id: 'loungeBay', name: '', kind: 'room', partOf: 'lounge', ...R(X0, YSTAIR_TOP, XKIT, wy[4]) },
    { id: 'master', name: 'MASTER BED', kind: 'room', ...R(X0, wy[5], XW, YSHAFT_WALL) },
    { id: 'masterRear', name: '', kind: 'room', partOf: 'master', ...R(X0, YSHAFT_WALL, XSHAFT_W, YT) },
    { id: 'shaft', name: 'SHAFT', kind: 'shaft', ...R(XSHAFT, YSHAFT, XW, YT) },
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(XE, Y0, XR, ey[2]) },
    { id: 'drawing', name: 'DRAWING ROOM', kind: 'drawing', ...R(XE, ey[3], XR, ey[4]) },
    { id: 'mbath', name: 'M. BATH', kind: 'bath', ...R(XE, ey[5], XBATH_MID, YT) },
    { id: 'gbath', name: 'GUEST BATH', kind: 'bath', ...R(XBATH2, ey[5], XR, YT) },
]

const walls = [
    // boundary / external (9")
    { id: 'bottom', ...R(sx[1], 0, XE, EXT) },
    { id: 'top', ...R(sx[1], YT, PLOT_W, PLOT_H) },
    { id: 'right', ...R(XR, 0, PLOT_W, YT) },
    { id: 'shopRear', ...R(sx[3], Y0, sx[4], YT) },
    // shop partitions + central pier (full depth incl. front pier)
    { id: 'shopP12', ...R(sx[1], sy[2], sx[3], sy[3]) },
    { id: 'shopP23', ...R(sx[1], sy[4], sx[3], sy[5]) },
    { id: 'shopP34', ...R(sx[1], sy[6], sx[3], sy[7]) },
    // residence partitions (4½")
    { id: 'westEast', ...R(XW, Y0, XE, YT) },
    { id: 'stairKitchen', ...R(XSTAIR, Y0, XKIT, wy[3]) },
    { id: 'kitchenLounge', ...R(XKIT, wy[2], XW, wy[3]) },
    { id: 'loungeMaster', ...R(X0, wy[4], XW, wy[5]) },
    { id: 'shaftWest', ...R(XSHAFT_W, YSHAFT_WALL, XSHAFT, YT) },
    { id: 'shaftSouth', ...R(XSHAFT, YSHAFT_WALL, XW, YSHAFT) },
    { id: 'porchDrawing', ...R(XE, ey[2], XR, ey[3]) },
    { id: 'drawingBaths', ...R(XE, ey[4], XR, ey[5]) },
    { id: 'bathSplit', ...R(XBATH_MID, ey[5], XBATH2, YT) },
]

const openings = [
    // not walls, not rooms: still must tile the plot exactly
    { id: 'setback', kind: 'setback', ...R(0, 0, sx[1], PLOT_H) },
    ...shops.map((s, i) => ({ id: `shutter${i + 1}`, kind: 'shutter', ...R(sx[1], s.y1, sx[2], s.y2) })),
    { id: 'gate', kind: 'gate', ...R(XE, 0, XR, EXT) },
    { id: 'stairRail', kind: 'rail', ...R(XSTAIR, wy[3], XKIT, YSTAIR_TOP) },
]

// Doors: cut into `wall`, joining spaces a/b; [from, to] is measured along
// the wall; the leaf swings into `swingInto`, hinged at the `hinge` end.
const doors = [
    { id: 'D1', label: 'Main entrance (porch - lounge)', wall: 'westEast', a: 'porch', b: 'lounge', from: 165, to: 201, swingInto: 'lounge', hinge: 'start' },
    { id: 'D2', label: 'Guest entrance (porch - drawing)', wall: 'porchDrawing', a: 'porch', b: 'drawing', from: 362, to: 395, swingInto: 'drawing', hinge: 'start' },
    { id: 'D3', label: 'Serving door (lounge - drawing)', wall: 'westEast', a: 'lounge', b: 'drawing', from: 252, to: 282, swingInto: 'drawing', hinge: 'end' },
    { id: 'D4', label: 'Kitchen', wall: 'kitchenLounge', a: 'lounge', b: 'kitchen', from: 233, to: 263, swingInto: 'kitchen', hinge: 'start' },
    { id: 'D5', label: 'Master bedroom', wall: 'loungeMaster', a: 'lounge', b: 'master', from: 225, to: 258, swingInto: 'master', hinge: 'start' },
    { id: 'D6', label: 'Master bath', wall: 'westEast', a: 'master', b: 'mbath', from: 343, to: 367, swingInto: 'mbath', hinge: 'end' },
    { id: 'D7', label: 'Guest bath', wall: 'drawingBaths', a: 'drawing', b: 'gbath', from: 436, to: 460, swingInto: 'gbath', hinge: 'end' },
]

const windows = [
    { id: 'W1', label: 'Kitchen to road (over sink)', wall: 'bottom', from: 300, to: 348 },
    { id: 'W2', label: 'Kitchen to porch', wall: 'westEast', from: 36, to: 66 },
    { id: 'W3', label: 'Stair to road (high level)', wall: 'bottom', from: 192, to: 222 },
    { id: 'W4', label: 'Lounge to porch', wall: 'westEast', from: 112, to: 148 },
    { id: 'W5', label: 'Drawing room to porch', wall: 'porchDrawing', from: 405, to: 465 },
    { id: 'W6', label: 'Master to shaft', wall: 'shaftWest', from: 384, to: 414 },
    { id: 'W7', label: 'Master to shaft', wall: 'shaftSouth', from: 310, to: 346 },
    { id: 'V1', label: 'Master bath vent to shaft', wall: 'westEast', from: 385, to: 409 },
]

module.exports = {
    PLOT_W, PLOT_H, EXT, PART, SHOP_FRONT, SHOP_DEPTH,
    stair: { RISERS, RISER, TREADS, TREAD, STAIR_W, STAIR_RUN },
    chains: {
        'Plot width (commercial band + residence)': { chain: [...SHOP_BAND_X, ...RES_X], total: PLOT_W },
        'Commercial band gross (original: 41\'-8" - 26\'-1")': { chain: SHOP_BAND_X, total: ft(15, 7) },
        'Residence gross (42\'-0" - 15\'-7")': { chain: RES_X, total: ft(26, 5) },
        'Shop frontage along 36-ft road': { chain: SHOP_Y, total: PLOT_H },
        'x through stair / kitchen / porch': { chain: X_FRONT_CUT, total: PLOT_W },
        'x through lounge / drawing room': { chain: X_MID_CUT, total: PLOT_W },
        'x through master / shaft / baths': { chain: X_REAR_CUT, total: PLOT_W },
        'y through kitchen / lounge / master': { chain: W_KITCHEN_CUT, total: PLOT_H },
        'y through stair / landing / master': { chain: W_STAIR_CUT, total: PLOT_H },
        'y through shaft': { chain: W_SHAFT_CUT, total: PLOT_H },
        'y through porch / drawing / baths': { chain: E_CUT, total: PLOT_H },
    },
    rooms, walls, openings, doors, windows,
    keys: { sx, rx, sy, wy, ey, xf, xr, X0, XW, XE, XR, Y0, YT, XSTAIR, XKIT, YSTAIR_TOP, XSHAFT_W, XSHAFT, YSHAFT_WALL, YSHAFT, XBATH_MID, XBATH2 },
    sum, edges,
}
