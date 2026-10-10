/**
 * Validates one floor (ground.js / first.js / roof.js):
 *  1. dimension chains sum exactly to the plot width / depth
 *  2. rooms + walls + openings tile the 26'-1" x 36'-0" plot at ½": no gap, no overlap
 *  3. doors / windows sit inside their wall, join the stated spaces, leaves swing over floor
 *  4. furniture lies inside its room, overlaps nothing, keeps door swings, door
 *     approaches and windows (tall items) clear
 *  5. every target is reachable from the entry with a 22" wide body
 */
const S = require('./site')
const { fmt } = require('../floorplan/units')

const RES = 2
const overlaps = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2
const isVertical = (w) => w.y2 - w.y1 > w.x2 - w.x1
const owner = (e) => e && (e.partOf || e.id)
const WALKABLE = new Set(['room', 'drawing', 'kitchen', 'bath', 'porch', 'alley', 'foyer', 'court', 'hall', 'terrace', 'balcony', 'utility'])

const makeZones = (floor) => {
    const wallById = Object.fromEntries(floor.walls.map((w) => [w.id, w]))
    const roomById = Object.fromEntries(floor.rooms.map((r) => [r.id, r]))
    return (d) => {
        const w = wallById[d.wall]
        const width = d.to - d.from
        const A = 24
        if (d.slide) {
            const r = isVertical(w) ? { x1: w.x1 - A, x2: w.x2 + A, y1: d.from, y2: d.to } : { x1: d.from, x2: d.to, y1: w.y1 - A, y2: w.y2 + A }
            return { sweep: null, approach: r, vertical: isVertical(w) }
        }
        const into = roomById[d.swingInto]
        if (isVertical(w)) {
            const east = into.x1 >= w.x2
            const sweep = east ? { x1: w.x2, x2: w.x2 + width } : { x1: w.x1 - width, x2: w.x1 }
            const appr = east ? { x1: w.x1 - A, x2: w.x1 } : { x1: w.x2, x2: w.x2 + A }
            return { sweep: { ...sweep, y1: d.from, y2: d.to }, approach: { ...appr, y1: d.from, y2: d.to }, vertical: true, east }
        }
        const north = into.y1 >= w.y2
        const sweep = north ? { y1: w.y2, y2: w.y2 + width } : { y1: w.y1 - width, y2: w.y1 }
        const appr = north ? { y1: w.y1 - A, y2: w.y1 } : { y1: w.y2, y2: w.y2 + A }
        return { sweep: { ...sweep, x1: d.from, x2: d.to }, approach: { ...appr, x1: d.from, x2: d.to }, vertical: false, north }
    }
}

const checkFloor = (floor) => {
    const PW = floor.W || S.PLOT_W
    const PH = floor.H || S.PLOT_H
    const errors = []
    const report = []
    const tag = floor.id
    const section = (name, fn) => {
        const before = errors.length
        const msg = fn()
        if (errors.length === before && msg) report.push(`OK   ${tag} ${msg}`)
    }
    const wallById = Object.fromEntries(floor.walls.map((w) => [w.id, w]))
    const zones = makeZones(floor)

    // 1. chains
    for (const [name, chain] of Object.entries(floor.chains || {})) {
        const total = name.includes(' x ') || name.startsWith(`${tag} x`) ? PW : PH
        const s = chain.reduce((a, [v]) => a + v, 0)
        if (s !== total) errors.push(`${name}: sums to ${fmt(s)}, expected ${fmt(total)}`)
        else report.push(`OK   ${name}: ${chain.map(([v]) => fmt(v)).join(' + ')} = ${fmt(s)}`)
    }

    // 2. tiling
    const W = PW * RES
    const H = PH * RES
    const grid = new Array(W * H).fill(null)
    const all = [
        ...floor.rooms.map((r) => ({ ...r, type: 'room' })),
        ...floor.walls.map((w) => ({ ...w, type: 'wall' })),
        ...floor.openings.map((o) => ({ ...o, type: 'opening' })),
    ]
    section('tiling', () => {
        for (const e of all) {
            if ([e.x1, e.y1, e.x2, e.y2].some((v) => (v * RES) % 1 !== 0)) errors.push(`${e.id} is not on the ½" grid`)
            if (e.x2 <= e.x1 || e.y2 <= e.y1) { errors.push(`${e.id} has non-positive size`); continue }
            for (let y = e.y1 * RES; y < e.y2 * RES; y++) {
                for (let x = e.x1 * RES; x < e.x2 * RES; x++) {
                    if (x < 0 || y < 0 || x >= W || y >= H) { errors.push(`${e.id} leaves the plot`); y = Infinity; break }
                    const i = y * W + x
                    if (grid[i]) { errors.push(`${e.id} overlaps ${grid[i].id} at (${fmt(x / RES)}, ${fmt(y / RES)})`); y = Infinity; break }
                    grid[i] = e
                }
            }
        }
        const gaps = grid.reduce((n, c) => n + (c ? 0 : 1), 0)
        if (gaps) {
            const i = grid.findIndex((c) => !c)
            errors.push(`${gaps / RES / RES} sq in unassigned, first at (${fmt((i % W) / RES)}, ${fmt(Math.floor(i / W) / RES)})`)
        }
        return `tiling: ${all.length} rooms/walls/openings cover ${fmt(PW)} x ${fmt(PH)} exactly`
    })
    const at = (x, y) => grid[Math.floor(y * RES) * W + Math.floor(x * RES)]

    // 3. doors & windows
    section('openings', () => {
        const done = []
        const check = (o, needSides) => {
            const w = wallById[o.wall]
            if (!w) return errors.push(`${o.id}: unknown wall ${o.wall}`)
            const v = isVertical(w)
            const [lo, hi] = v ? [w.y1, w.y2] : [w.x1, w.x2]
            if (o.from < lo || o.to > hi) errors.push(`${o.id}: ${fmt(o.from)}-${fmt(o.to)} outside wall ${o.wall}`)
            const side = (t) => (v ? [at(w.x1 - 0.5, t), at(w.x2 + 0.25, t)] : [at(t, w.y1 - 0.5), at(t, w.y2 + 0.25)])
            const [a0, b0] = side((o.from + o.to) / 2)
            for (let t = o.from; t < o.to; t += 0.5) {
                const [a, b] = side(t)
                if (owner(a) !== owner(a0) || owner(b) !== owner(b0)) { errors.push(`${o.id}: straddles a wall corner`); break }
            }
            if (needSides) {
                const got = [owner(a0) || 'street', owner(b0) || 'street'].sort().join('|')
                const want = [o.a, o.b].sort().join('|')
                if (got !== want) errors.push(`${o.id}: joins ${got}, expected ${want}`)
            }
            done.push(`${o.id} ${fmt(o.to - o.from)}`)
        }
        for (const d of floor.doors) {
            check(d, true)
            const z = zones(d)
            if (z.sweep) {
                for (let y = z.sweep.y1; y < z.sweep.y2; y += 0.5) {
                    for (let x = z.sweep.x1; x < z.sweep.x2; x += 0.5) {
                        if (owner(at(x, y)) !== d.swingInto) { errors.push(`${d.id}: leaf hits ${owner(at(x, y)) || 'outside'}`); y = Infinity; break }
                    }
                }
            }
        }
        for (const w of floor.windows) check(w, false)
        return `openings: ${done.join(', ')} - inside their walls, joining the right spaces`
    })

    // 4. furniture
    const items = floor.items
    section('furniture', () => {
        for (const it of items) {
            const roomsOk = Array.isArray(it.room) ? it.room : [it.room]
            for (let y = it.y1; y < it.y2; y += 0.5) {
                for (let x = it.x1; x < it.x2; x += 0.5) {
                    if (!roomsOk.includes(owner(at(x, y)))) { errors.push(`${it.id} not inside ${roomsOk.join('/')} (hits ${owner(at(x, y)) || 'outside'})`); y = Infinity; break }
                }
            }
        }
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i]
                const b = items[j]
                if (a.on === b.id || b.on === a.id) continue
                if (overlaps(a, b)) errors.push(`${a.id} overlaps ${b.id}`)
            }
        }
        for (const d of floor.doors) {
            const z = zones(d)
            for (const it of items) {
                if (it.on) continue
                if (z.sweep && overlaps(z.sweep, it)) errors.push(`${d.id} leaf would hit ${it.id}`)
                if (overlaps(z.approach, it)) errors.push(`${it.id} blocks the approach to ${d.id}`)
            }
        }
        // a tall item anywhere in the 3 ft in front of the glass shades it
        for (const w of floor.windows) {
            const wall = wallById[w.wall]
            const zone = isVertical(wall) ? { x1: wall.x1 - 36, x2: wall.x2 + 36, y1: w.from, y2: w.to } : { x1: w.from, x2: w.to, y1: wall.y1 - 36, y2: wall.y2 + 36 }
            for (const it of items.filter((t) => t.tall)) if (overlaps(zone, it)) errors.push(`${it.id} (tall) blocks ${w.id}`)
        }
        return `furniture: ${items.length} items at real size - inside their rooms, no overlaps, door swings / approaches / windows clear`
    })

    // 5. circulation
    const CW = PW
    const CH = PH
    const blocked = new Uint8Array(CW * CH)
    for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
            const e = at(x + 0.5, y + 0.5)
            blocked[y * CW + x] = e && e.type === 'room' && WALKABLE.has(e.kind) ? 0 : 1
        }
    }
    for (const d of floor.doors) {
        const w = wallById[d.wall]
        const r = isVertical(w) ? { x1: w.x1, x2: w.x2, y1: d.from, y2: d.to } : { x1: d.from, x2: d.to, y1: w.y1, y2: w.y2 }
        for (let y = Math.floor(r.y1); y < Math.ceil(r.y2); y++) for (let x = Math.floor(r.x1); x < Math.ceil(r.x2); x++) blocked[y * CW + x] = 0
    }
    for (const it of items) {
        if (it.on || it.walkable) continue
        for (let y = Math.floor(it.y1); y < Math.ceil(it.y2); y++) for (let x = Math.floor(it.x1); x < Math.ceil(it.x2); x++) blocked[y * CW + x] = 1
    }
    const P = new Int32Array((CW + 1) * (CH + 1))
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) P[(y + 1) * (CW + 1) + x + 1] = blocked[y * CW + x] + P[y * (CW + 1) + x + 1] + P[(y + 1) * (CW + 1) + x] - P[y * (CW + 1) + x]
    const BODY = 22
    const h = BODY / 2
    const free = (cx, cy) => {
        const [x1, y1, x2, y2] = [cx - h, cy - h, cx + h, cy + h]
        if (x1 < 0 || y1 < 0 || x2 > CW || y2 > CH) return false
        return P[y2 * (CW + 1) + x2] - P[y1 * (CW + 1) + x2] - P[y2 * (CW + 1) + x1] + P[y1 * (CW + 1) + x1] === 0
    }
    section('circulation', () => {
        const seen = new Uint8Array(CW * CH)
        const s = [Math.round(floor.START.x), Math.round(floor.START.y)]
        if (!free(...s)) { errors.push(`circulation start "${floor.START.name}" is blocked`); return null }
        const q = [s]
        seen[s[1] * CW + s[0]] = 1
        while (q.length) {
            const [x, y] = q.pop()
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx = x + dx
                const ny = y + dy
                if (nx < 0 || ny < 0 || nx >= CW || ny >= CH || seen[ny * CW + nx] || !free(nx, ny)) continue
                seen[ny * CW + nx] = 1
                q.push([nx, ny])
            }
        }
        for (const t of floor.targets) if (!seen[Math.round(t.y) * CW + Math.round(t.x)]) errors.push(`circulation: cannot reach "${t.name}" from ${floor.START.name} with a ${BODY}" body`)
        return `circulation: all ${floor.targets.length} use points reachable from the ${floor.START.name} with a ${BODY}" wide body`
    })

    return { ok: errors.length === 0, errors, report, zones, at }
}

module.exports = { checkFloor, makeZones, isVertical, owner, overlaps }

if (require.main === module) {
    const floors = process.argv.slice(2).length ? process.argv.slice(2) : ['ground']
    let bad = 0
    for (const f of floors) {
        const r = checkFloor(require(`./${f}`))
        console.log(r.report.join('\n'))
        if (!r.ok) { bad++; console.error(`\n${f} FAILED:\n  ` + r.errors.join('\n  ')) }
    }
    process.exit(bad ? 1 : 0)
}
