/**
 * Site constants for the 26'-1" x 36'-0" house (front = 26'-1" on the road).
 *
 * Coordinates (inches): x = 0 at the left boundary, y = 0 at the road
 * (front plot line), increasing towards the rear boundary.
 *
 * Brief: no regulatory limits - design purely for comfort, privacy, daylight
 * and family lifestyle. The whole plot is used; a central open-to-sky court
 * is kept because it brings light, air and a garden into the middle of the
 * house.
 */
const { ft } = require('../floorplan/units')

const PLOT_W = ft(26, 1) // 313"  front, on the road ("26.1" read as 26'-1")
const PLOT_H = ft(36, 0) // 432"  depth
const EXT = 9 //  9" external / boundary wall
const PART = 4.5 // 4½" partition

// floor to floor 10'-6" = 18 risers x 7"; dog-leg of 2 x 9 risers, 8 treads x 10"
const STAIR = { RISERS: 18, RISER: 7, TREADS_PER_FLIGHT: 8, TREAD: 10, FLIGHT_W: 36, GAP: 4, LANDING: 36 }

// one grid for every floor, so bearing walls and wet areas stack
const X = {
    L: EXT, //          9     inside face of left wall
    BATHF: 63, //       front-left wet stack (bedroom bath / bed 2 bath) right face
    COL: 169, //        left column right face (13'-4" clear)
    COLW: 178, //       right column starts (9" bearing wall 169-178)
    FOY: 223.5, //      foyer / hall right face
    ST: 228, //         stair box left face (box 76" = 2 x 36" + 4")
    R: 304, //          inside face of right wall (right column 10'-6" clear)
    BATHR: 77.5, //     rear-left wet stack right face
    COURT: 82, //       light court left face
    COURTR: 173.5, //   light court right face
}
const Y = {
    F: EXT, //          9     inside face of front wall (on the plot line)
    BATHF: 75, //       front wet stack rear face (5'-6" deep)
    FRONT: 162, //      front rooms rear face (12'-9" clear)
    PORCH: 207, //      car porch rear wall (16'-6" clear from the gate)
    STAIR: 216, //      foyer / stair box start
    LC: 325.5, //       lounge (GF) / master (FF) rear face
    COURT: 330, //      light court front face
    STAIR_END: 332, //  stair box rear face (36" landing + 80" flight)
    KIT: 336.5, //      kitchen / study front face
    T: PLOT_H - EXT, // 423   inside face of rear wall
}

module.exports = { PLOT_W, PLOT_H, EXT, PART, STAIR, X, Y }
