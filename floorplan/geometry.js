/**
 * Single source of truth for the 42'-0" x 36'-0" plot.
 *
 * Coordinate system (inches):
 *   x = 0 at the LEFT (36-ft commercial road), increasing to the right (42 ft)
 *   y = 0 at the BOTTOM (42-ft residential road), increasing upwards (36 ft)
 *
 * Every coordinate below is DERIVED from an explicit dimension chain
 * (plot -> wall-to-wall -> clear), so a room can never "borrow" width that
 * does not exist. validate.js re-checks every chain and rasterises the whole
 * plan at 1/2" resolution to prove there are no overlaps and no gaps.
 */
const { ft } = require('./units')

// ---------------------------------------------------------------- constants
const PLOT_W = ft(42) // 504"  along the lower (residential) road
const PLOT_H = ft(36) // 432"  along the left (commercial) road

const EXT = 9 //    9"   external / boundary wall
const PART = 4.5 // 4½"  internal partition

// ------------------------------------------------- horizontal (x) chains
// Commercial band: original drawing gives 41'-8" - 26'-1" = 15'-7" gross.
const SHOP_BAND_X = [
    ['front setback / step', 9],
    ['shutter line / front piers', EXT],
    ['shop clear depth', ft(13, 4)],
    ['shop rear wall (shop | house)', EXT],
]
// Residence: 42'-0" - 15'-7" = 26'-5" gross.
const RES_X = [
    ['west column clear (lounge / master)', ft(14, 0)],
    ['partition', PART],
    ['east column clear (porch / bed 2 / baths)', ft(11, 3.5)],
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

const sx = edges(SHOP_BAND_X) //        [0, 9, 18, 178, 187]
const rx = edges(RES_X, sx[4]) //       [187, 355, 359.5, 495, 504]
const sy = edges(SHOP_Y) //             [0, 9, 108, 112.5, 211.5, 220.5, 319.5, 324, 423, 432]

const X0 = rx[0] // 187   first clear inch of the residence
const XW = rx[1] // 355   west column right face
const XE = rx[2] // 359.5 east column left face
const XR = rx[3] // 495   right wall inner face
const Y0 = EXT //   9     bottom wall inner face
const YT = PLOT_H - EXT // 423 top wall inner face

// ---- west column internal chains (y) ----
const STAIR_W = ft(3, 3) //      39"  clear stair width
const STAIR_RUN = ft(13, 6) //   162" = 17 treads x 9½"
const KITCHEN_D = ft(8, 0)
const LOUNGE_D = ft(14, 3) //    main lounge, measured from kitchen wall
const MASTER_D = ft(11, 6)
const SHAFT_W = ft(3, 5.5)
const SHAFT_D = ft(4, 0)

const W_KITCHEN_CUT = [ // vertical section through kitchen + lounge + master
    ['bottom wall', EXT],
    ['kitchen', KITCHEN_D],
    ['partition', PART],
    ['lounge / dining', LOUNGE_D],
    ['partition', PART],
    ['master bedroom', MASTER_D],
    ['top wall', EXT],
]
const wy = edges(W_KITCHEN_CUT) // [0, 9, 105, 109.5, 280.5, 285, 423, 432]

const W_STAIR_CUT = [ // vertical section through the stair strip
    ['bottom wall', EXT],
    ['stair (17 treads x 9½")', STAIR_RUN],
    ['lounge bay', wy[4] - (EXT + STAIR_RUN)],
    ['partition', PART],
    ['master bedroom', MASTER_D],
    ['top wall', EXT],
]
const W_SHAFT_CUT = [ // vertical section through the open-to-sky shaft
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

// ---- east column internal chain (y) ----
const PORCH_D = ft(16, 0)
const BED2_D = ft(10, 9)
const BATH_D = ft(7, 0)
const E_CUT = [
    ['car gate (in boundary line)', EXT],
    ['car porch', PORCH_D],
    ['partition', PART],
    ['bedroom 2', BED2_D],
    ['partition', PART],
    ['baths', BATH_D],
    ['top wall', EXT],
]
const ey = edges(E_CUT) // [0, 9, 201, 205.5, 334.5, 339, 423, 432]

// ---- horizontal sections (x) ----
const BATH_W = (RES_X[2][1] - PART) / 2 // 65.5" = 5'-5½"
const X_KITCHEN_CUT = [
    ...SHOP_BAND_X,
    ['stair', STAIR_W],
    ['partition', PART],
    ['kitchen', RES_X[0][1] - STAIR_W - PART],
    ['partition', PART],
    ['car porch', RES_X[2][1]],
    ['right boundary wall', EXT],
]
const X_LOUNGE_CUT = [
    ...SHOP_BAND_X,
    ['lounge / dining (full width)', RES_X[0][1]],
    ['partition', PART],
    ['bedroom 2', RES_X[2][1]],
    ['right boundary wall', EXT],
]
const X_REAR_CUT = [
    ...SHOP_BAND_X,
    ['master bedroom', RES_X[0][1] - PART - SHAFT_W],
    ['partition', PART],
    ['open-to-sky shaft', SHAFT_W],
    ['partition', PART],
    ['master bath', BATH_W],
    ['partition', PART],
    ['bath 2', BATH_W],
    ['right boundary wall', EXT],
]

const xs = edges(X_KITCHEN_CUT) // [.., 187, 226, 230.5, 355, 359.5, 495, 504]
const xr = edges(X_REAR_CUT) //    [.., 187, 309, 313.5, 355, 359.5, 425, 429.5, 495, 504]

const XSTAIR = xs[5] //   226
const XKIT = xs[6] //     230.5
const XSHAFT_W = xr[5] // 309
const XSHAFT = xr[6] //   313.5
const XBATH_MID = xr[9] // 425
const XBATH2 = xr[10] //  429.5
const YSTAIR_TOP = EXT + STAIR_RUN // 171
const YSHAFT_WALL = wy[5] + (MASTER_D - PART - SHAFT_D) // 370.5
const YSHAFT = YSHAFT_WALL + PART // 375

// ------------------------------------------------------------- elements
// rect = [x1, y1, x2, y2] in plot inches
const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const shops = [1, 2, 3, 4].map((n, i) => {
    const y1 = [sy[1], sy[3], sy[5], sy[7]][i]
    const y2 = [sy[2], sy[4], sy[6], sy[8]][i]
    return { id: `shop${n}`, name: `SHOP ${n}`, kind: 'shop', ...R(sx[2], y1, sx[3], y2) }
})

const rooms = [
    ...shops,
    { id: 'stair', name: 'STAIR', kind: 'stair', ...R(X0, Y0, XSTAIR, YSTAIR_TOP) },
    { id: 'kitchen', name: 'KITCHEN', kind: 'room', ...R(XKIT, Y0, XW, wy[2]) },
    { id: 'lounge', name: 'LOUNGE / DINING', kind: 'room', ...R(XKIT, wy[3], XW, wy[4]) },
    { id: 'loungeBay', name: '', kind: 'room', partOf: 'lounge', ...R(X0, YSTAIR_TOP, XKIT, wy[4]) },
    { id: 'master', name: 'MASTER BED', kind: 'room', ...R(X0, wy[5], XW, YSHAFT_WALL) },
    { id: 'masterRear', name: '', kind: 'room', partOf: 'master', ...R(X0, YSHAFT_WALL, XSHAFT_W, YT) },
    { id: 'shaft', name: 'SHAFT', kind: 'shaft', ...R(XSHAFT, YSHAFT, XW, YT) },
    { id: 'porch', name: 'CAR PORCH', kind: 'porch', ...R(XE, Y0, XR, ey[2]) },
    { id: 'bed2', name: 'BEDROOM 2', kind: 'room', ...R(XE, ey[3], XR, ey[4]) },
    { id: 'mbath', name: 'M. BATH', kind: 'bath', ...R(XE, ey[5], XBATH_MID, YT) },
    { id: 'bath2', name: 'BATH 2', kind: 'bath', ...R(XBATH2, ey[5], XR, YT) },
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
    { id: 'porchBed2', ...R(XE, ey[2], XR, ey[3]) },
    { id: 'bed2Baths', ...R(XE, ey[4], XR, ey[5]) },
    { id: 'bathSplit', ...R(XBATH_MID, ey[5], XBATH2, YT) },
]

const openings = [
    // not walls, not rooms: still must tile the plot exactly
    { id: 'setback', kind: 'setback', ...R(0, 0, sx[1], PLOT_H) },
    ...shops.map((s, i) => ({ id: `shutter${i + 1}`, kind: 'shutter', ...R(sx[1], s.y1, sx[2], s.y2) })),
    { id: 'gate', kind: 'gate', ...R(XE, 0, XR, EXT) },
    { id: 'stairRail', kind: 'rail', ...R(XSTAIR, wy[3], XKIT, YSTAIR_TOP) },
]

// Doors: `wall` = wall id it is cut into, `a`/`b` = spaces on each side,
// along = [from, to] along the wall, hinge/swing for drawing.
const doors = [
    { id: 'main', label: 'MAIN ENTRY', wall: 'westEast', a: 'porch', b: 'lounge', from: 150, to: 186, swingInto: 'lounge', hinge: 'start' },
    { id: 'kitchen', wall: 'kitchenLounge', a: 'lounge', b: 'kitchen', from: 310, to: 340, swingInto: 'kitchen', hinge: 'end' },
    { id: 'bed2', wall: 'westEast', a: 'lounge', b: 'bed2', from: 238, to: 271, swingInto: 'bed2', hinge: 'start' },
    { id: 'master', wall: 'loungeMaster', a: 'lounge', b: 'master', from: 300, to: 333, swingInto: 'master', hinge: 'end' },
    { id: 'mbath', wall: 'westEast', a: 'master', b: 'mbath', from: 340, to: 364, swingInto: 'mbath', hinge: 'start' },
    { id: 'bath2', wall: 'bed2Baths', a: 'bed2', b: 'bath2', from: 445, to: 469, swingInto: 'bath2', hinge: 'start' },
]

const windows = [
    { id: 'kitchenW', wall: 'bottom', from: 262, to: 322 }, // to lower road
    { id: 'loungeW', wall: 'westEast', from: 112, to: 142 }, // onto car porch
    { id: 'bed2W', wall: 'porchBed2', from: 395, to: 459 }, // onto car porch
    { id: 'masterW', wall: 'shaftSouth', from: 320, to: 350 }, // onto shaft
    { id: 'masterW2', wall: 'shaftWest', from: 384, to: 414 }, // onto shaft
    { id: 'mbathV', wall: 'westEast', from: 385, to: 409 }, // ventilator onto shaft
]

module.exports = {
    PLOT_W, PLOT_H, EXT, PART, SHOP_FRONT,
    chains: {
        'Plot width (commercial band + residence)': { chain: [...SHOP_BAND_X, ...RES_X], total: PLOT_W },
        'Commercial band gross (original: 41\'-8" - 26\'-1")': { chain: SHOP_BAND_X, total: ft(15, 7) },
        'Residence gross (42\'-0" - 15\'-7")': { chain: RES_X, total: ft(26, 5) },
        'Shop frontage along 36-ft road': { chain: SHOP_Y, total: PLOT_H },
        'Section x through kitchen / stair / porch': { chain: X_KITCHEN_CUT, total: PLOT_W },
        'Section x through lounge / bedroom 2': { chain: X_LOUNGE_CUT, total: PLOT_W },
        'Section x through master / shaft / baths': { chain: X_REAR_CUT, total: PLOT_W },
        'Section y through kitchen / lounge / master': { chain: W_KITCHEN_CUT, total: PLOT_H },
        'Section y through stair / lounge bay / master': { chain: W_STAIR_CUT, total: PLOT_H },
        'Section y through shaft': { chain: W_SHAFT_CUT, total: PLOT_H },
        'Section y through porch / bedroom 2 / baths': { chain: E_CUT, total: PLOT_H },
    },
    rooms, walls, openings, doors, windows,
    keys: { sx, rx, sy, wy, ey, xs, xr, X0, XW, XE, XR, Y0, YT, XSTAIR, XKIT, YSTAIR_TOP, XSHAFT, YSHAFT, STAIR_RUN },
    sum, edges,
}
