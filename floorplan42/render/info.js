/**
 * Information band under the plans: concept, room schedule (two columns),
 * door & window schedule (two columns), legend + scale + verification.
 */
const D = require('../../floorplan/draw')
const { fmt } = require('../../floorplan/units')

const { C } = D
const FLOORS = [require('../ground'), require('../first'), require('../second')]

const CONCEPT = [
    ['THE REFERENCE, ADJUSTED', [
        'Every reference room keeps its place and nothing is added; only sizes',
        'change. The one thing a 36\' plot cannot hold is the reference\'s second',
        'rear bedroom (behind the 13\' porch and the stair one band is left, not',
        'three): it is bedroom 3 upstairs. The reference O.T.S. is split into',
        'two small wells so the kitchen, bedroom and bath each get a window.',
    ]],
    ['FIRST FLOOR - FAMILY', [
        'TV lounge over the porch is the hub: the stair arrives in it and every',
        'front room opens off it. Corner bedroom 2 and bedroom 3 face the shop',
        'road; the master suite has a walk-in dressing and its own terrace.',
        'Study / prayer room on the two light wells; laundry and a family',
        'terrace behind a jaali at the back.',
    ]],
    ['SECOND FLOOR - PORTION', [
        'The stair lands in a lobby with the portion\'s own front door, so the',
        'family floor stays private. Lounge with banquette dining, corner',
        'kitchen on both streets, two en-suite bedrooms stacked on the suites',
        'below, guest WC, family room on the light wells, two open terraces.',
    ]],
    ['STRUCTURE + SERVICES', [
        'One 7\' x 10\' stair box and the two light wells run through all floors.',
        'Baths stack: bath 2 / A on the ground bath line; master bath / bath B',
        'over the kitchen; laundries over bath 3. Porch and drawing-room walls',
        'carry the lounge and master walls above. Stair skylight on the roof.',
    ]],
]

const area = (floor, id) => floor.rooms.filter((r) => r.id === id || r.partOf === id).reduce((a, r) => a + (r.x2 - r.x1) * (r.y2 - r.y1), 0) / 144
const size = (floor, id) => {
    const rs = floor.rooms.filter((x) => x.id === id || x.partOf === id)
    const w = Math.max(...rs.map((r) => r.x2)) - Math.min(...rs.map((r) => r.x1))
    const d = Math.max(...rs.map((r) => r.y2)) - Math.min(...rs.map((r) => r.y1))
    return `${fmt(w)} x ${fmt(d)}`
}

const renderInfo = (width, checks) => {
    const colW = [0.2, 0.33, 0.3, 0.17].map((f) => Math.floor(width * f))
    const colX = colW.reduce((a, w, i) => [...a, a[i] + w], [0])
    const h = 1080
    const img = D.blank(width, h)
    for (let k = 0; k < 4; k++) D.strokeRect(img, colX[k] + 2, 2, colX[k + 1] - 12, h - 3, C.ink, 3)

    // legend graphics (column 4) before freezing
    const lx = colX[3] + 30
    const legend = [
        [(a, b, c, d) => D.fillRect(img, a, b + 6, c, d - 6, C.wall), 'Wall 9" external / 4½" partition'],
        [(a, b, c, d) => { D.fillRect(img, a, b + 6, c, d - 6, C.paper); D.strokeRect(img, a, b + 6, c, d - 6, C.ink, 2); D.line(img, a, (b + d) / 2, c, (b + d) / 2, C.glass, 3) }, 'Window'],
        [(a, b, c, d) => { D.line(img, a + 4, d, a + 4, b - 18, C.ink, 4); D.arc(img, a + 4, d, 46, -Math.PI / 2, 0, C.grey, 2) }, 'Door + swing'],
        [(a, b, c, d) => { D.fillRect(img, a + 30, b, a + 50, d, 0xa98a62ff); for (let y = b + 6; y < d; y += 10) D.ellipse(img, a + 40, y, 3, 3, 0x5a4328ff, 2, 0xf1ece2ff) }, 'Jaali parapet (perforated brick)'],
        [(a, b, c, d) => { D.fillRect(img, a, b, c, d, 0xe8f2e4ff); D.hatch(img, a, b, c, d, 0xc9dfc0ff, 16) }, 'Open to sky (light well)'],
        [(a, b, c, d) => { D.fillRect(img, a, b, c, d, 0xf5f2ecff); D.strokeRect(img, a, b, c - 1, d - 1, C.grey, 2) }, 'Terrace (open)'],
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
    T('DESIGN NOTES', colX[0] + 30, y, 32)
    y += 48
    for (const [head, lines] of CONCEPT) {
        T(head, colX[0] + 30, y, 23, C.dim)
        y += 33
        for (const l of lines) { T(l, colX[0] + 44, y, 19); y += 27 }
        y += 10
    }

    // column 2: rooms, two sub-columns
    const [G, F, S] = FLOORS
    const sched = [
        ['GROUND FLOOR', null],
        ['Car porch', G, 'porch'], ['Front alley', G, 'alley'], ['Drawing room', G, 'drawing'], ['Lounge (L-shaped)', G, 'lounge'], ['Guest bath', G, 'wc'],
        ['Open (light well)', G, 'open'], ['Kitchen (L-shaped)', G, 'kitchen'], ['Bedroom', G, 'bedroom'], ['Bedroom bath', G, 'bath'],
        ['O.T.S. wells (2)', G, ['ots1', 'ots2']],
        ['FIRST FLOOR', null],
        ['Bedroom 2 (L-shaped)', F, 'bed2'], ['Bath 2', F, 'bath2'], ['TV lounge', F, 'lounge'], ['Master bedroom', F, 'master'],
        ['Master bath', F, 'mbath'], ['Walk-in dressing', F, 'dress'], ['Pantry', F, 'pantry'], ['Bedroom 3', F, 'bed3'],
        ['Bath 3', F, 'bath3'], ['Laundry', F, 'laundry'], ['Family terrace (L)', F, 'terrace'], ['Study / prayer', F, 'study'],
        ['Master terrace', F, 'terrace2'], ['Rear lobby + corridor', F, 'corridor'],
        ['SECOND FLOOR', null],
        ['Bedroom A (L-shaped)', S, 'bedA'], ['Bath A', S, 'bathA'], ['Lounge + dining', S, 'lounge'], ['Lobby', S, 'lobby'],
        ['Bedroom B', S, 'bedB'], ['Bath B', S, 'bathB'], ['Dressing B', S, 'dressB'], ['Guest WC', S, 'wc'],
        ['Store', S, 'store'], ['Kitchen', S, 'kitchen'], ['Laundry', S, 'laundry'], ['Terrace (L)', S, 'terrace'],
        ['Family room', S, 'family'], ['Terrace B', S, 'terrace2'],
    ]
    const x2 = colX[1] + 24
    T('ROOM SCHEDULE (clear sizes)', x2, 52, 32)
    const half = Math.ceil(sched.length / 2)
    sched.forEach((row, i) => {
        const col = i < half ? 0 : 1
        const yy = 104 + (i - col * half) * 25
        const xx = x2 + col * Math.floor(colW[1] / 2)
        const [name, fl, id] = row
        if (fl === null) { T(name, xx, yy, 20, C.dim); return }
        const ids = Array.isArray(id) ? id : [id]
        const a = ids.reduce((s, k) => s + area(fl, k), 0)
        T(name, xx + 12, yy, 17)
        if (ids.length === 1) T(size(fl, id), xx + 215, yy, 16, C.dim)
        T(`${a.toFixed(0)} sf`, xx + 365, yy, 16, C.dim)
    })
    const gf = (313 * 432 - (area(G, 'ots1') + area(G, 'ots2') + area(G, 'open')) * 144) / 144
    const uf = (504 * 432 - area(F, 'ots1') * 144 - area(F, 'ots2') * 144) / 144
    T(`Covered: ground ${gf.toFixed(0)} sq ft (house portion) + first ${(uf - area(F, 'terrace') - area(F, 'terrace2')).toFixed(0)} + second ${(uf - area(S, 'terrace') - area(S, 'terrace2')).toFixed(0)} sq ft`, x2, 104 + half * 25 + 14, 17)

    // column 3: openings, two sub-columns
    const x3 = colX[2] + 24
    T('DOOR & WINDOW SCHEDULE', x3, 52, 32)
    const rows = FLOORS.flatMap((fl) => [...fl.doors, ...fl.windows])
    const half3 = Math.ceil(rows.length / 2)
    rows.forEach((o, i) => {
        const col = i < half3 ? 0 : 1
        const yy = 100 + (i - col * half3) * 23
        const xx = x3 + col * Math.floor(colW[2] / 2)
        T(o.id, xx, yy, 16, C.tag)
        T(fmt(o.to - o.from), xx + 58, yy, 16, C.dim)
        T(o.label.replace(/ \(.*\)$/, ''), xx + 138, yy, 15)
    })
    const gate = G.openings.find((o) => o.kind === 'gate')
    T(`Car gate: ${fmt(gate.x2 - gate.x1)} x 7' (reference: 9' x 7')`, x3, 100 + half3 * 23 + 12, 16)

    // column 4: legend, scale, verification
    T('LEGEND', lx, 52, 32)
    ly = 120
    for (const [, label] of legend) { T(label, lx + 112, ly, 19); ly += 50 }
    T('SCALE', lx, sy - 30, 20)
    for (const [k, t] of [[0, '0'], [1, "5'"], [2, "10'"]]) L.place(t, lx + (k * ft10) / 2, sy + 44, 18, C.ink)
    let vy = sy + 96
    T('VERIFIED IN CODE', lx, vy, 24, C.dim)
    vy += 36
    checks.forEach((c, i) => {
        const fl = FLOORS[i]
        const n = (k) => c.report.filter((r) => r.includes(k)).length
        T(`${fl.title.split('  ')[0]}: ${Object.keys(fl.chains).length} chains, exact tiling,`, lx, vy, 17)
        vy += 24
        T(`${fl.doors.length + fl.windows.length} openings, ${fl.items.length} items, ${fl.targets.length} points - ${c.ok && n('circulation') ? 'PASS' : 'FAIL'}`, lx + 16, vy, 17)
        vy += 32
    })
    if (vy > h - 10) L.issues.push(`info: content taller than the band (${vy} > ${h})`)
    return { img, labels: L }
}

module.exports = { renderInfo }
