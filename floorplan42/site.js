/**
 * Site constants for the shop-house: the ground-floor residence is 26'-1" x
 * 36'-0" and every upper floor is 42'-0" x 36'-0" (it also spans the 15'-11"
 * shop band on the left road).
 *
 * Coordinates in inches. Upper floors use plot coordinates: x = 0 at the
 * left (shop-road) boundary. The ground-floor file uses house coordinates:
 * x = 0 at the shop party wall, i.e. plot x = HOUSE_X + x. y = 0 at the
 * front road on every floor.
 */
const { ft } = require('../floorplan/units')

const PLOT_W = ft(42, 0) //  504  upper floors, on the front road
const PLOT_H = ft(36, 0) //  432  depth
const HOUSE_W = ft(26, 1) // 313  ground-floor residence
const HOUSE_X = PLOT_W - HOUSE_W // 191 = 15'-11" shop band on the left
const EXT = 9
const PART = 4.5

// floor to floor 10'-6" = 18 risers x 7"; dog-leg in a 7'-0" x 10'-0" box:
// two 40" flights, 4" gap, 8 treads x 10", 40" landing
const STAIR = { RISERS: 18, RISER: 7, TREADS_PER_FLIGHT: 8, TREAD: 10, FLIGHT_W: 40, GAP: 4, LANDING: 40 }

// shared x-lines in PLOT coordinates (ground-floor house x = plot x - HOUSE_X)
const PX = {
    HL: HOUSE_X + EXT, //   200  house left wall inner face = stair box left face
    STR: HOUSE_X + 93, //   284  stair box right face (7'-0" box)
    STW: HOUSE_X + 97.5, // 288.5
    PD: HOUSE_X + 162, //   353  porch | drawing wall (9") left face
    PDW: HOUSE_X + 171, //  362
    OTS1R: HOUSE_X + 63, // 254  rear-left light well right face
    BED: HOUSE_X + 67.5, // 258.5
    BEDR: HOUSE_X + 199.5, // 390.5
    KIT: HOUSE_X + 204, //  395  upper-floor terrace left face
    OTS2: HOUSE_X + 256, // 447  rear-right O.T.S. left face (ground-floor bath line)
    R: PLOT_W - EXT, //     495
}
const Y = {
    F: EXT, //          9
    FRONT: 165, //      front band rear face (13'-0")
    MID: 174, //        middle band front face (9" wall 165-174)
    STAIR_END: 294, //  stair box rear face (middle band 10'-0")
    REAR: 298.5, //     rear band front face (4½" wall)
    OTS1: 371, //       rear-left light well front face (4'-4" deep)
    OTS2: 379.5, //     rear-right light well front face (3'-7½" deep)
    T: PLOT_H - EXT, // 423
}

module.exports = { PLOT_W, PLOT_H, HOUSE_W, HOUSE_X, EXT, PART, STAIR, PX, Y }
