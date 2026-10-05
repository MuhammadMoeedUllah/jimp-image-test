/**
 * MODULE 4: title panel (locked dimensions, room schedule, door & window
 * schedule, legend, scale) and the bottom band (dimension proof, notes).
 * All text goes through LabelLayer so overlapping rows are reported.
 */
const G = require('../geometry')
const D = require('../draw')
const { fmt } = require('../units')
const { validate } = require('../validate')

const { C } = D

const ROW = 38
const TXT = 25
const INDENT = 34 // px indent for continuation lines

const sqft = (rects) => rects.reduce((a, r) => a + ((r.x2 - r.x1) * (r.y2 - r.y1)) / 144, 0)
const by = Object.fromEntries(G.rooms.map((r) => [r.id, r]))
const sz = (id) => `${fmt(by[id].x2 - by[id].x1)} x ${fmt(by[id].y2 - by[id].y1)}`

const roomSchedule = () => [
    ['Shops 1-4 (each)', `${fmt(G.SHOP_FRONT)} x ${fmt(G.SHOP_DEPTH)}`, `${sqft([by.shop1]).toFixed(0)} sq ft`],
    ['Car porch', sz('porch'), `${sqft([by.porch]).toFixed(0)} sq ft`],
    ['Drawing room', sz('drawing'), `${sqft([by.drawing]).toFixed(0)} sq ft`],
    ['Guest bath', sz('gbath'), `${sqft([by.gbath]).toFixed(0)} sq ft`],
    ['Lounge / dining', `${sz('lounge')} + bay`, `${sqft([by.lounge, by.loungeBay]).toFixed(0)} sq ft`],
    ['Kitchen', sz('kitchen'), `${sqft([by.kitchen]).toFixed(0)} sq ft`],
    ['Master bed (L-shaped)', `${fmt(by.master.x2 - by.master.x1)} x ${fmt(G.keys.YT - by.master.y1)}`, `${sqft([by.master, by.masterRear]).toFixed(0)} sq ft`],
    ['Master bath', sz('mbath'), `${sqft([by.mbath]).toFixed(0)} sq ft`],
    ['Stair', sz('stair'), `${sqft([by.stair]).toFixed(0)} sq ft`],
    ['Open-to-sky shaft', sz('shaft'), `${sqft([by.shaft]).toFixed(0)} sq ft`],
    ['Bedroom 2', 'first floor', '-'],
]

const openingSchedule = () => [
    ...G.doors.map((d) => [d.id, fmt(d.to - d.from), d.label]),
    ...G.windows.map((w) => [w.id, fmt(w.to - w.from), w.label]),
    ['-', fmt(G.SHOP_FRONT), 'Shop fronts: rolling shutters (x4)'],
    ['-', fmt(G.keys.XR - G.keys.XE), 'Car gate: rolling shutter'],
    ['-', '-', 'Guest bath: exhaust fan ducted to roof'],
]

// [text, continuation?]
const NOTES = [
    ['All room sizes are CLEAR (inside walls). Walls: 9" external / boundary, 4½" internal.', false],
    ['Shop band kept at the original 15\'-7" (9" step + 9" piers + 13\'-4" shop + 9" rear wall).', false],
    ['If no front setback is required, that 9" can be given to the house.', true],
    ['Drawing room sits behind the car porch: guest door D2 from the porch,', false],
    ['serving door D3 from the lounge, attached guest bath - guests never cross the lounge.', true],
    ['Bedroom 2 moves to the first floor: a drawing room AND a second bedroom need', false],
    ['about 100 sq ft more than the 25\'-8" x 34\'-6" clear ground floor has.', true],
    ['Car gate is a rolling shutter: a 15\'-2" car leaves 1\'-4" in the 16\'-6" porch,', false],
    ['so a swing gate could not open inwards.', true],
    ['Stair: 18 risers x 7" = 10\'-6" floor to floor, 17 treads x 9½", 3\'-3" wide.', false],
    ['Master bedroom and master bath get light / air from the open-to-sky shaft.', false],
    ['North direction was not given - confirm before finalising window sizes.', false],
]

/** legend swatches + scale bar, drawn into `img` at (x, y); returns label specs */
const drawLegend = (img, x, y, colW, S) => {
    const items = [
        [(a, b, c, d) => D.fillRect(img, a, b + 6, c, d - 6, C.wall), 'Wall 9" / 4½"'],
        [(a, b, c, d) => {
            D.fillRect(img, a, b + 6, c, d - 6, C.paper)
            D.strokeRect(img, a, b + 6, c, d - 6, C.ink, 2)
            D.line(img, a, (b + d) / 2, c, (b + d) / 2, C.glass, 3)
        }, 'Window / vent'],
        [(a, b, c, d) => { D.line(img, a + 4, d, a + 4, b - 18, C.ink, 4); D.arc(img, a + 4, d, 46, -Math.PI / 2, 0, C.grey, 2) }, 'Door + swing'],
        [(a, b, c, d) => { D.line(img, a, (b + d) / 2 - 4, c, (b + d) / 2 - 4, C.ink, 2, [10, 6]); D.line(img, a, (b + d) / 2 + 4, c, (b + d) / 2 + 4, C.ink, 2, [10, 6]) }, 'Rolling shutter'],
        [(a, b, c, d) => { D.fillRect(img, a, b, c, d, C.setback); D.hatch(img, a, b, c, d, C.light, 10) }, '9" setback / step'],
        [(a, b, c, d) => { D.fillRect(img, a, b, c, d, C.shaft); D.strokeRect(img, a + 5, b + 5, c - 5, d - 5, C.grey, 2, [10, 6]) }, 'Open-to-sky shaft'],
        [(a, b, c, d) => { D.fillRect(img, a + 10, b + 2, c - 10, d - 2, C.furnFill); D.strokeRect(img, a + 10, b + 2, c - 10, d - 2, C.furn, 2) }, 'Furniture (real size)'],
        [(a, b, c, d) => D.strokeRect(img, a + 22, b + 2, c - 22, d - 2, C.tag, 2), 'Door / window tag'],
    ]
    const labels = []
    const rows = Math.ceil(items.length / 2)
    items.forEach(([draw, label], i) => {
        const col = Math.floor(i / rows)
        const row = i % rows
        const ax = x + col * colW
        const ay = y + row * 54
        draw(ax, ay - 16, ax + 90, ay + 16)
        labels.push([label, ax + 112, ay])
    })
    // scale bar: 10 ft at S px per inch
    const sy = y + rows * 54 + 46
    const ft10 = 120 * S
    const segW = ft10 / 2
    D.fillRect(img, x, sy, x + segW, sy + 14, C.ink)
    D.strokeRect(img, x, sy, x + ft10, sy + 14, C.ink, 2)
    for (const k of [0, 1, 2]) D.line(img, x + k * segW, sy - 8, x + k * segW, sy + 22, C.ink, 2)
    return { labels, scale: { x, y: sy, segW }, bottom: sy + 70 }
}

const renderPanel = (w, h, S) => {
    const img = D.blank(w, h)
    D.strokeRect(img, 2, 2, w - 3, h - 3, C.ink, 3)
    const L = new D.LabelLayer(img, 'panel')
    L.freeze()
    let y = 60
    const left = 40
    const T = (s, size, color = C.ink, x = left) => L.place(s, x, y, size, color, { anchor: 'left' })
    T('GROUND FLOOR PLAN - Rev B', 50); y += 58
    T(`Plot ${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)}  |  4 shops + house with drawing room`, 28, C.grey); y += 40
    T('Every dimension computed and verified in code', 26, C.dim); y += 64

    const table = (title, rows, cols) => {
        T(title, 32); y += 24
        D.line(img, left, y, w - left, y, C.ink, 2); y += 30
        for (const r of rows) {
            r.forEach((cell, i) => L.place(cell, left + cols[i], y, TXT, i === 0 ? C.ink : C.dim, { anchor: 'left' }))
            y += ROW
        }
        y += 34
    }

    table('LOCKED DIMENSIONS', [
        ['Plot', `${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)}`],
        ['Commercial road (left) / residential road (bottom)', `${fmt(G.PLOT_H)} / ${fmt(G.PLOT_W)}`],
        ['Shops / clear frontage each / total', `4 / ${fmt(G.SHOP_FRONT)} / ${fmt(4 * G.SHOP_FRONT)}`],
        ['Shop clear depth', fmt(G.SHOP_DEPTH)],
        ['Commercial band gross  (41\'-8" - 26\'-1")', fmt(187)],
        ['Residence gross  (42\'-0" - 15\'-7")', fmt(317)],
        ['Residence clear (inside walls)', `${fmt(G.keys.XR - G.keys.X0)} x ${fmt(G.keys.YT - G.keys.Y0)}`],
        ['House entrance / car gate', 'bottom road, gate at right'],
    ], [0, 800])

    table('ROOM SCHEDULE (clear)', roomSchedule(), [0, 500, 960])
    table('DOOR & WINDOW SCHEDULE', openingSchedule(), [0, 90, 260])

    // legend + scale in the remaining space (linework first, then re-freeze)
    T('LEGEND', 32); y += 24
    D.line(img, left, y, w - left, y, C.ink, 2); y += 44
    const lg = drawLegend(img, left, y, (w - 2 * left) / 2, S)
    L.freeze()
    for (const [label, lx, ly] of lg.labels) L.place(label, lx, ly, 24, C.ink, { anchor: 'left' })
    L.place('SCALE', lg.scale.x, lg.scale.y - 30, 24, C.ink, { anchor: 'left' })
    for (const [k, t] of [[0, '0'], [1, "5'"], [2, "10'"]]) L.place(t, lg.scale.x + k * lg.scale.segW, lg.scale.y + 46, 22, C.ink)
    if (lg.bottom > h - 10) L.issues.push(`panel: content (${lg.bottom}px) taller than panel (${h}px)`)
    return { img, labels: L }
}

/** greedy word wrap by measured width */
const wrap = (str, size, maxW) => {
    const words = str.split(' ')
    const out = []
    let cur = ''
    for (const wd of words) {
        const next = cur ? `${cur} ${wd}` : wd
        const b = D.inkBox(D.textImage(next, size))
        if (b.x2 - b.x1 > maxW && cur) { out.push(cur); cur = wd } else cur = next
    }
    if (cur) out.push(cur)
    return out
}

const renderBottom = (w) => {
    const { report, ok } = validate()
    const proofW = Math.round(w * 0.6)
    const notesX = proofW + 24
    const notesW = w - notesX
    const SZ = 23
    const proof = report.flatMap((l) => wrap(l, SZ, proofW - 120).map((t, i) => [t, i > 0]))
    const notes = NOTES.flatMap(([t, cont]) => wrap(t, SZ, notesW - 140).map((s, i) => [s, cont || i > 0]))
    const h = Math.max(130 + proof.length * 34, 130 + notes.length * 38) + 20
    const img = D.blank(w, h)
    D.strokeRect(img, 2, 2, proofW - 3, h - 3, C.ink, 3)
    D.strokeRect(img, notesX, 2, w - 3, h - 3, C.ink, 3)
    const L = new D.LabelLayer(img, 'bottom')
    L.freeze()
    L.place(`DIMENSION PROOF  (validate.js - ${ok ? 'ALL CHECKS PASS' : 'FAILED'})`, 36, 56, 32, ok ? C.ink : C.dim, { anchor: 'left' })
    let y = 112
    for (const [line, cont] of proof) {
        L.place(line, 36 + (cont ? 70 : 0), y, SZ, C.ink, { anchor: 'left' })
        y += 34
    }
    L.place('NOTES', notesX + 30, 56, 32, C.ink, { anchor: 'left' })
    let n = 1
    let ny = 112
    for (const [line, cont] of notes) {
        if (!cont) L.place(`${n++}.`, notesX + 30, ny, SZ, C.ink, { anchor: 'left' })
        L.place(line, notesX + 30 + INDENT + 8, ny, SZ, C.ink, { anchor: 'left' })
        ny += 38
    }
    return { img, labels: L }
}

module.exports = { renderPanel, renderBottom }
