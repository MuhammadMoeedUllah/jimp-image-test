/**
 * Information band under the plans: design concept, room schedule,
 * door & window schedule, legend + scale, and what was verified.
 */
const S0 = require('../site')
const D = require('../../floorplan/draw')
const { fmt } = require('../../floorplan/units')

const { C } = D
const FLOORS = [require('../ground'), require('../first'), require('../roof')]

const CONCEPT = [
    ['PRIVACY', [
        'Two entrances: guests go from the porch straight into the drawing',
        'room (with its own bath); the family uses the main door to the foyer.',
        'A jaali screen at the foyer keeps the lounge out of view from the door.',
        'Bedrooms are upstairs, away from guests and the street.',
        'Terrace and drying yard sit at the rear, hidden from the street.',
    ]],
    ['COMFORT', [
        'An open-to-sky court in the middle brings daylight and air to the',
        'lounge, kitchen, family bath, master bedroom, master bath and study.',
        'Every bathroom has a window to the street or the court.',
        'Easy stair: 7" risers, 10" treads, 3\'-0" flights, 10\'-6" floor to floor.',
        'Master suite in the quiet middle, with a walk-in dressing.',
        'Insulated roof + white terrace tiles keep the bedrooms below cool.',
    ]],
    ['UTILITY', [
        'Kitchen at the end of the foyer: groceries never cross the lounge.',
        'U-counter: fridge, sink, hob; hood ducted into the court.',
        'Laundry next to the drying yard; linen store in the mumty.',
        '8 solar panels on the front roof; water tank on the mumty roof;',
        'underground tank under the porch floor; meters on the gate pier.',
        'Shoe cabinet at the door; wardrobe in every bedroom; study / prayer room.',
    ]],
    ['BEAUTY', [
        'Court garden with a tree, bench and planter, seen from the lounge,',
        'kitchen, master bedroom and study; glass slider from the lounge.',
        'Jaali screens on the street windows filter light and views.',
        'Planted family terrace with a daybed for summer evenings.',
    ]],
]

const area = (floor, id) => floor.rooms.filter((r) => r.id === id || r.partOf === id).reduce((a, r) => a + (r.x2 - r.x1) * (r.y2 - r.y1), 0) / 144
// overall envelope of a room including its L-shaped parts
const size = (floor, id) => {
    const rs = floor.rooms.filter((x) => x.id === id || x.partOf === id)
    const w = Math.max(...rs.map((r) => r.x2)) - Math.min(...rs.map((r) => r.x1))
    const d = Math.max(...rs.map((r) => r.y2)) - Math.min(...rs.map((r) => r.y1))
    return `${fmt(w)} x ${fmt(d)}`
}

const renderInfo = (width, checks) => {
    const colW = Math.floor(width / 4)
    const rows = 26
    const h = 96 + rows * 34 + 30
    const img = D.blank(width, h)
    for (let k = 0; k < 4; k++) D.strokeRect(img, k * colW + 2, 2, (k + 1) * colW - 12, h - 3, C.ink, 3)

    // legend graphics (column 4) before freezing
    const lx = 3 * colW + 30
    const legend = [
        [(a, b, c, d) => D.fillRect(img, a, b + 6, c, d - 6, C.wall), 'Wall 9" external / 4½" partition'],
        [(a, b, c, d) => { D.fillRect(img, a, b + 6, c, d - 6, C.paper); D.strokeRect(img, a, b + 6, c, d - 6, C.ink, 2); D.line(img, a, (b + d) / 2, c, (b + d) / 2, C.glass, 3) }, 'Window'],
        [(a, b, c, d) => { D.line(img, a + 4, d, a + 4, b - 18, C.ink, 4); D.arc(img, a + 4, d, 46, -Math.PI / 2, 0, C.grey, 2) }, 'Door + swing'],
        [(a, b, c, d) => { D.line(img, a, b + 8, (a + c) / 2 + 6, b + 8, C.ink, 3); D.line(img, (a + c) / 2 - 6, d - 8, c, d - 8, C.ink, 3) }, 'Glass slider (lounge to court)'],
        [(a, b, c, d) => { D.fillRect(img, a + 30, b, a + 50, d, 0xe8d9c0ff); for (let y = b + 6; y < d; y += 10) D.ellipse(img, a + 40, y, 3, 3, 0x9a7b4fff, 2) }, 'Jaali (perforated) screen'],
        [(a, b, c, d) => { D.fillRect(img, a, b, c, d, 0xe8f2e4ff); D.hatch(img, a, b, c, d, 0xc9dfc0ff, 16) }, 'Open to sky (court / void)'],
        [(a, b, c, d) => { D.fillRect(img, a + 10, b + 2, c - 10, d - 2, C.furnFill); D.strokeRect(img, a + 10, b + 2, c - 10, d - 2, C.furn, 2) }, 'Furniture at real size'],
        [(a, b, c, d) => D.strokeRect(img, a + 22, b + 2, c - 22, d - 2, C.tag, 2), 'Door / window tag'],
    ]
    let ly = 120
    for (const [draw] of legend) { draw(lx, ly - 16, lx + 90, ly + 16); ly += 50 }
    const sy = ly + 46
    const ft10 = 120 * 4
    D.fillRect(img, lx, sy, lx + ft10 / 2, sy + 14, C.ink)
    D.strokeRect(img, lx, sy, lx + ft10, sy + 14, C.ink, 2)
    for (const k of [0, 1, 2]) D.line(img, lx + (k * ft10) / 2, sy - 8, lx + (k * ft10) / 2, sy + 22, C.ink, 2)

    const L = new D.LabelLayer(img, 'info')
    L.freeze()
    const T = (s, x, y, size = 24, color = C.ink) => L.place(s, x, y, size, color, { anchor: 'left' })

    // column 1: concept
    let y = 52
    T('DESIGN CONCEPT', 30, y, 32)
    y += 50
    for (const [head, lines] of CONCEPT) {
        T(head, 30, y, 25, C.dim)
        y += 36
        for (const l of lines) { T(l, 50, y, 22); y += 31 }
        y += 12
    }

    // column 2: rooms
    const G = FLOORS[0]
    const F = FLOORS[1]
    const Rf = FLOORS[2]
    const x2 = colW + 30
    y = 52
    T('ROOM SCHEDULE (clear sizes)', x2, y, 32)
    y += 50
    const sched = [
        ['GROUND FLOOR', null],
        ['Car porch', size(G, 'porch'), area(G, 'porch')],
        ['Drawing room (+ guest bath)', size(G, 'drawing'), area(G, 'drawing')],
        ['Guest bath', size(G, 'gbath'), area(G, 'gbath')],
        ['TV lounge + dining', '13\'-4" x 12\'-10½"', area(G, 'lounge')],
        ['Foyer', '3\'-9½" x 9\'-8"', area(G, 'foyer')],
        ['Kitchen', size(G, 'kitchen'), area(G, 'kitchen')],
        ['Family bath', size(G, 'bath'), area(G, 'bath')],
        ['Court garden (open to sky)', size(G, 'court'), area(G, 'court')],
        ['FIRST FLOOR', null],
        ['Master bedroom + walk-in dressing', '13\'-8½" x 9\'-10½"', area(F, 'master')],
        ['Master bath', size(F, 'mbath'), area(F, 'mbath')],
        ['Bedroom 2', size(F, 'bed2'), area(F, 'bed2')],
        ['Bedroom 3', size(F, 'bed3'), area(F, 'bed3')],
        ['Bath 2 / Bath 3 (each)', size(F, 'bath2'), area(F, 'bath2')],
        ['Study / prayer', size(F, 'study'), area(F, 'study')],
        ['ROOF', null],
        ['Family terrace (open)', '-', area(Rf, 'terrace')],
        ['Laundry + drying yard', size(Rf, 'drying'), area(Rf, 'drying')],
        ['Mumty + linen store (covered)', '-', area(Rf, 'landing') + area(Rf, 'store') + area(Rf, 'stair')],
    ]
    for (const [name, s, a] of sched) {
        if (s === null) { y += 8; T(name, x2, y, 24, C.dim); y += 34; continue }
        T(name, x2 + 20, y, 22)
        T(s, x2 + 560, y, 22, C.dim)
        T(`${a.toFixed(0)} sq ft`, x2 + 900, y, 22, C.dim)
        y += 31
    }
    const footprint = S0.PLOT_W * S0.PLOT_H / 144
    const court = area(G, 'court')
    const covered = 2 * (footprint - court) + area(Rf, 'landing') + area(Rf, 'store') + area(Rf, 'stair') + (4.5 * 174.5 + 2 * 4.5 * 126) / 144
    y += 10
    T(`Covered area approx. ${covered.toFixed(0)} sq ft on a ${footprint.toFixed(0)} sq ft plot`, x2, y, 22, C.ink)

    // column 3: openings
    const x3 = 2 * colW + 30
    y = 52
    T('DOOR & WINDOW SCHEDULE', x3, y, 32)
    y += 50
    for (const fl of FLOORS) {
        for (const o of [...fl.doors, ...fl.windows]) {
            T(o.id, x3 + 10, y, 21, C.tag)
            T(fmt(o.to - o.from), x3 + 90, y, 21, C.dim)
            T(o.label, x3 + 210, y, 21)
            y += 27
        }
    }
    T('Car gate: 7\'-7½" rolling shutter (no swing space needed)', x3 + 10, y + 6, 21)

    // column 4: legend, scale, verification
    T('LEGEND', lx, 52, 32)
    ly = 120
    for (const [, label] of legend) { T(label, lx + 112, ly, 22); ly += 50 }
    T('SCALE', lx, sy - 30, 22)
    for (const [k, t] of [[0, '0'], [1, "5'"], [2, "10'"]]) L.place(t, lx + (k * ft10) / 2, sy + 44, 20, C.ink)
    let vy = sy + 100
    T('VERIFIED IN CODE (check.js)', lx, vy, 26, C.dim)
    vy += 40
    checks.forEach((c, i) => {
        const fl = FLOORS[i]
        const n = (k) => c.report.filter((r) => r.includes(k)).length
        T(`${fl.title}: ${Object.keys(fl.chains).length} dimension chains, exact tiling,`, lx, vy, 20)
        vy += 27
        T(`${fl.doors.length + fl.windows.length} openings, ${fl.items.length} items, ${fl.targets.length} reachable points - ${c.ok && n('circulation') ? 'PASS' : 'FAIL'}`, lx + 20, vy, 20)
        vy += 34
    })
    if (vy > h - 10 || y > h - 10) L.issues.push(`info: content taller than the band (${Math.max(vy, y)} > ${h})`)
    return { img, labels: L }
}

module.exports = { renderInfo }
