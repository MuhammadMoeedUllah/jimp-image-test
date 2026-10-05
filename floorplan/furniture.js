/**
 * Furniture, fixtures and the car, at real sizes (inches, plot coordinates).
 * They are drawn on the plan AND checked by validate.js:
 *   - each item lies fully inside its room (never in a wall)
 *   - items do not overlap (except fixtures sitting `on` a counter)
 *   - door swings and door approaches are clear
 *   - tall items (wardrobe, fridge) do not block windows
 *   - every target below is reachable from the gate with a 22" wide body
 *     (fits a 2'-0" door, which is the narrowest opening in the house)
 */
const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

const CAR = { L: 182, W: 70, name: 'Toyota Corolla 15\'-2" x 5\'-10"' } // 4630 x 1780 mm

const items = [
    // ---- car porch
    { id: 'car', type: 'car', room: 'porch', ...R(395, 15, 395 + CAR.W, 15 + CAR.L) },

    // ---- kitchen (L-counter 2'-0" deep along road wall and porch wall)
    // hob in the road-wall corner (exhaust straight out), sink under W1,
    // fridge in the far corner: a proper fridge - sink - hob triangle
    { id: 'counterRoad', type: 'counter', room: 'kitchen', ...R(230.5, 9, 355, 33) },
    { id: 'counterPorch', type: 'counter', room: 'kitchen', ...R(331, 33, 355, 69) },
    { id: 'fridge', type: 'fridge', room: 'kitchen', tall: true, ...R(325, 69, 355, 99) },
    { id: 'hob', type: 'hob', room: 'kitchen', on: 'counterRoad', ...R(240, 11, 264, 31) },
    { id: 'sink', type: 'sink', room: 'kitchen', on: 'counterRoad', ...R(310, 12, 340, 30) },

    // ---- lounge / dining
    { id: 'diningTable', type: 'table', room: 'lounge', ...R(286, 112, 328, 142) },
    { id: 'chairN1', type: 'chair', room: 'lounge', facing: 'S', ...R(288, 142, 306, 160) },
    { id: 'chairN2', type: 'chair', room: 'lounge', facing: 'S', ...R(308, 142, 326, 160) },
    { id: 'chairW', type: 'chair', room: 'lounge', facing: 'E', ...R(268, 118, 286, 136) },
    { id: 'chairE', type: 'chair', room: 'lounge', facing: 'W', ...R(328, 118, 346, 136) },
    { id: 'loungeSofa', type: 'sofa', room: 'lounge', facing: 'E', ...R(188, 212, 221, 284) },
    { id: 'coffeeTable', type: 'table', room: 'lounge', ...R(245, 218, 266, 254) },
    { id: 'tv', type: 'tv', room: 'lounge', ...R(339, 206, 355, 246) },

    // ---- drawing room
    { id: 'drawingSofa', type: 'sofa', room: 'drawing', facing: 'W', ...R(462, 236, 495, 320) },
    { id: 'armchairA', type: 'armchair', room: 'drawing', facing: 'S', ...R(400, 304, 430, 334) },
    { id: 'armchairB', type: 'armchair', room: 'drawing', facing: 'E', ...R(362, 292, 392, 322) },
    { id: 'centreTable', type: 'table', room: 'drawing', ...R(412, 250, 433, 292) },

    // ---- master bedroom (6'-0" x 6'-6" bed, headboard on the shop wall)
    { id: 'bed', type: 'bed', room: 'master', head: 'W', ...R(187, 324, 265, 396) },
    { id: 'sideTable1', type: 'sidetable', room: 'master', ...R(187, 306, 205, 324) },
    { id: 'sideTable2', type: 'sidetable', room: 'master', ...R(187, 396, 205, 414) },
    { id: 'wardrobe', type: 'wardrobe', room: 'master', tall: true, ...R(287, 291, 355, 315) },

    // ---- master bath
    { id: 'mbWc', type: 'wc', room: 'mbath', facing: 'S', ...R(365, 395, 383, 423) },
    { id: 'mbShower', type: 'shower', room: 'mbath', ...R(389, 387, 425, 423) },
    { id: 'mbBasin', type: 'basin', room: 'mbath', facing: 'W', ...R(409, 345, 425, 365) },

    // ---- guest bath
    { id: 'gbWc', type: 'wc', room: 'gbath', facing: 'S', ...R(435, 395, 453, 423) },
    { id: 'gbShower', type: 'shower', room: 'gbath', ...R(459, 387, 495, 423) },
    { id: 'gbBasin', type: 'basin', room: 'gbath', facing: 'W', ...R(479, 345, 495, 365) },
]

// Points a person must be able to stand at (centre of a 22" square).
const targets = [
    { name: 'lounge (inside main door)', x: 300, y: 185 },
    { name: 'stair foot / landing', x: 208, y: 190 },
    { name: 'kitchen: in front of fridge', x: 308, y: 84 },
    { name: 'kitchen: in front of hob', x: 252, y: 50 },
    { name: 'kitchen: in front of sink', x: 318, y: 50 },
    { name: 'lounge sofa', x: 233, y: 240 },
    { name: 'dining table', x: 274, y: 152 },
    { name: 'drawing room (guest entry)', x: 378, y: 226 },
    { name: 'drawing room sofa', x: 450, y: 278 },
    { name: 'guest bath', x: 447, y: 375 },
    { name: 'master: bed, door side', x: 235, y: 307 },
    { name: 'master: bed, far side', x: 235, y: 410 },
    { name: 'master: wardrobe front', x: 304, y: 330 },
    { name: 'master bath', x: 395, y: 375 },
]

const START = { name: 'car porch walkway (inside gate)', x: 377, y: 100 }

module.exports = { items, targets, START, CAR }
