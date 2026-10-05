/**
 * Proves the plan is dimensionally valid and usable BEFORE anything is drawn:
 *  1. every dimension chain sums exactly to its stated total
 *  2. rooms + walls + openings tile the 42' x 36' plot with no overlap / gap
 *  3. every door / window sits inside its wall and joins the stated spaces
 *  4. the locked commercial constraints are untouched
 *  5. furniture fits its room, avoids walls, other furniture, door swings
 *     and windows (tall items)
 *  6. every room / fixture is reachable from the gate with a 22" wide body
 */
const G = require('./geometry')
const F = require('./furniture')
const { fmt } = require('./units')

const RES = 2 // cells per inch (½" grid) for the tiling proof

const wallById = Object.fromEntries(G.walls.map((w) => [w.id, w]))
const roomById = Object.fromEntries(G.rooms.map((r) => [r.id, r]))
const isVertical = (w) => w.y2 - w.y1 > w.x2 - w.x1
const owner = (e) => e && (e.partOf || e.id)
const overlaps = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2

/** door leaf sweep (swing side) and 24" approach zone (other side) */
const doorZones = (d) => {
    const w = wallById[d.wall]
    const into = roomById[d.swingInto]
    const width = d.to - d.from
    const APPROACH = 24
    if (isVertical(w)) {
        const east = into.x1 >= w.x2
        const sweep = east ? { x1: w.x2, x2: w.x2 + width } : { x1: w.x1 - width, x2: w.x1 }
        const appr = east ? { x1: w.x1 - APPROACH, x2: w.x1 } : { x1: w.x2, x2: w.x2 + APPROACH }
        return { sweep: { ...sweep, y1: d.from, y2: d.to }, approach: { ...appr, y1: d.from, y2: d.to }, vertical: true, east }
    }
    const north = into.y1 >= w.y2
    const sweep = north ? { y1: w.y2, y2: w.y2 + width } : { y1: w.y1 - width, y2: w.y1 }
    const appr = north ? { y1: w.y1 - APPROACH, y2: w.y1 } : { y1: w.y2, y2: w.y2 + APPROACH }
    return { sweep: { ...sweep, x1: d.from, x2: d.to }, approach: { ...appr, x1: d.from, x2: d.to }, vertical: false, north }
}

const validate = () => {
    const errors = []
    const report = []
    const ok = (s) => report.push(`OK   ${s}`)

    // 1. chains -----------------------------------------------------------
    for (const [name, { chain, total }] of Object.entries(G.chains)) {
        const s = G.sum(chain)
        const good = s === total
        report.push(`${good ? 'OK ' : 'ERR'}  ${name}: ${chain.map(([, v]) => fmt(v)).join(' + ')} = ${fmt(s)}${good ? '' : ` (target ${fmt(total)})`}`)
        if (!good) errors.push(`chain "${name}" sums to ${fmt(s)}, expected ${fmt(total)}`)
    }

    // 2. tiling -----------------------------------------------------------
    const tilingMark = errors.length
    const W = G.PLOT_W * RES
    const H = G.PLOT_H * RES
    const grid = new Array(W * H).fill(null)
    const all = [
        ...G.rooms.map((r) => ({ ...r, type: 'room' })),
        ...G.walls.map((w) => ({ ...w, type: 'wall' })),
        ...G.openings.map((o) => ({ ...o, type: 'opening' })),
    ]
    for (const e of all) {
        if ([e.x1, e.y1, e.x2, e.y2].some((v) => (v * RES) % 1 !== 0)) errors.push(`${e.id} is not on the ½" grid`)
        if (e.x2 <= e.x1 || e.y2 <= e.y1) errors.push(`${e.id} has non-positive size`)
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
    if (gaps) errors.push(`${gaps / RES / RES} sq in of the plot is unassigned`)
    if (errors.length === tilingMark) ok(`tiling: ${all.length} rooms/walls/openings cover ${fmt(G.PLOT_W)} x ${fmt(G.PLOT_H)} exactly, no overlap, no gap`)

    const at = (x, y) => grid[Math.floor(y * RES) * W + Math.floor(x * RES)]

    // 3. doors & windows --------------------------------------------------
    const checkOpening = (o, needSides) => {
        const w = wallById[o.wall]
        if (!w) return errors.push(`${o.id}: unknown wall ${o.wall}`)
        const vertical = isVertical(w)
        const [lo, hi] = vertical ? [w.y1, w.y2] : [w.x1, w.x2]
        if (o.from < lo || o.to > hi) errors.push(`${o.id}: opening ${fmt(o.from)}-${fmt(o.to)} outside wall ${o.wall}`)
        const side = (t) => (vertical ? [at(w.x1 - 1, t), at(w.x2 + 0.5, t)] : [at(t, w.y1 - 1), at(t, w.y2 + 0.5)])
        const [sideA, sideB] = side((o.from + o.to) / 2)
        for (let t = o.from; t < o.to; t += 0.5) {
            const [a, b] = side(t)
            if (owner(a) !== owner(sideA) || owner(b) !== owner(sideB)) { errors.push(`${o.id}: opening straddles a wall corner`); break }
        }
        if (needSides) {
            const got = [owner(sideA), owner(sideB)].sort().join('|')
            const want = [o.a, o.b].sort().join('|')
            if (got !== want) errors.push(`${o.id}: connects ${got}, expected ${want}`)
        }
        return { sideA: owner(sideA) || 'outside', sideB: owner(sideB) || 'outside', width: o.to - o.from }
    }
    let mark = errors.length
    const nErr = () => mark
    const openingsChecked = []
    for (const d of G.doors) {
        const r = checkOpening(d, true)
        if (r) openingsChecked.push(`${d.id} ${fmt(r.width)}`)
        // the leaf must swing through floor of the room it opens into
        const { sweep } = doorZones(d)
        for (let y = sweep.y1; y < sweep.y2; y += 0.5) {
            for (let x = sweep.x1; x < sweep.x2; x += 0.5) {
                if (owner(at(x, y)) !== d.swingInto) { errors.push(`${d.id}: leaf hits ${owner(at(x, y)) || 'outside'} while opening`); y = Infinity; break }
            }
        }
    }
    for (const w of G.windows) {
        const r = checkOpening(w, false)
        if (r) openingsChecked.push(`${w.id} ${fmt(r.width)}`)
    }
    if (errors.length === nErr()) ok(`openings: ${openingsChecked.join(', ')} - each inside its wall, joining the right spaces, leaves swing clear of walls`)

    // 4. locked constraints ----------------------------------------------
    mark = errors.length
    const shops = G.rooms.filter((r) => r.kind === 'shop')
    for (const s of shops) {
        if (s.y2 - s.y1 !== G.SHOP_FRONT) errors.push(`${s.id} frontage is ${fmt(s.y2 - s.y1)}`)
        if (s.x2 - s.x1 !== G.SHOP_DEPTH) errors.push(`${s.id} depth is ${fmt(s.x2 - s.x1)}`)
    }
    if (errors.length === nErr()) ok(`locked: 4 shops x ${fmt(G.SHOP_FRONT)} clear frontage = ${fmt(4 * G.SHOP_FRONT)} on the 36'-0" road, each ${fmt(G.SHOP_DEPTH)} clear deep`)
    const st = G.stair
    if (st.TREADS * st.TREAD > st.STAIR_RUN) errors.push('stair treads do not fit the run')
    else ok(`stair: ${st.RISERS} risers x ${st.RISER}" = ${fmt(st.RISERS * st.RISER)} floor to floor, ${st.TREADS} treads x ${fmt(st.TREAD)} = ${fmt(st.TREADS * st.TREAD)} <= ${fmt(st.STAIR_RUN)} run, ${fmt(st.STAIR_W)} wide`)

    // 5. furniture ----------------------------------------------------------
    const items = F.items
    mark = errors.length
    for (const it of items) {
        for (let y = it.y1; y < it.y2; y += 0.5) {
            for (let x = it.x1; x < it.x2; x += 0.5) {
                if (owner(at(x, y)) !== it.room) { errors.push(`${it.id} is not inside ${it.room} (hits ${owner(at(x, y)) || 'outside'})`); y = Infinity; break }
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const a = items[i]
            const b = items[j]
            if (a.on === b.id || b.on === a.id) {
                const [top, base] = a.on === b.id ? [a, b] : [b, a]
                if (top.x1 < base.x1 || top.x2 > base.x2 || top.y1 < base.y1 || top.y2 > base.y2) errors.push(`${top.id} overhangs ${base.id}`)
                continue
            }
            if (overlaps(a, b)) errors.push(`${a.id} overlaps ${b.id}`)
        }
    }
    for (const d of G.doors) {
        const z = doorZones(d)
        for (const it of items) {
            if (overlaps(z.sweep, it)) errors.push(`${d.id} leaf would hit ${it.id}`)
            if (overlaps(z.approach, it)) errors.push(`${it.id} blocks the approach to ${d.id}`)
        }
    }
    for (const w of G.windows) {
        const wall = wallById[w.wall]
        const v = isVertical(wall)
        const zone = v
            ? { x1: wall.x1 - 6, x2: wall.x2 + 6, y1: w.from, y2: w.to }
            : { x1: w.from, x2: w.to, y1: wall.y1 - 6, y2: wall.y2 + 6 }
        for (const it of items.filter((t) => t.tall)) if (overlaps(zone, it)) errors.push(`${it.id} (tall) blocks window ${w.id}`)
    }
    if (errors.length === nErr()) ok(`furniture: ${items.length} items at real size - all inside their rooms, no overlaps, no door swing or approach blocked, no window blocked`)

    // 6. circulation (BFS with a 22" body on a 1" grid) ----------------------
    const CW = G.PLOT_W
    const CH = G.PLOT_H
    const blocked = new Uint8Array(CW * CH)
    const walkKinds = new Set(['room', 'kitchen', 'drawing', 'bath', 'porch'])
    for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
            const e = at(x + 0.5, y + 0.5)
            const walkable = e && e.type === 'room' && walkKinds.has(e.kind)
            blocked[y * CW + x] = walkable ? 0 : 1
        }
    }
    for (const d of G.doors) {
        const w = wallById[d.wall]
        const r = isVertical(w) ? { x1: w.x1, x2: w.x2, y1: d.from, y2: d.to } : { x1: d.from, x2: d.to, y1: w.y1, y2: w.y2 }
        for (let y = Math.floor(r.y1); y < Math.ceil(r.y2); y++) for (let x = Math.floor(r.x1); x < Math.ceil(r.x2); x++) blocked[y * CW + x] = 0
    }
    for (const it of items) {
        if (it.on) continue
        for (let y = Math.floor(it.y1); y < Math.ceil(it.y2); y++) for (let x = Math.floor(it.x1); x < Math.ceil(it.x2); x++) blocked[y * CW + x] = 1
    }
    // prefix sums -> "is the 22" square centred here free?"
    const P = new Int32Array((CW + 1) * (CH + 1))
    for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
            P[(y + 1) * (CW + 1) + x + 1] = blocked[y * CW + x] + P[y * (CW + 1) + x + 1] + P[(y + 1) * (CW + 1) + x] - P[y * (CW + 1) + x]
        }
    }
    const BODY = 22
    const h = BODY / 2
    const free = (cx, cy) => {
        const x1 = cx - h
        const y1 = cy - h
        const x2 = cx + h
        const y2 = cy + h
        if (x1 < 0 || y1 < 0 || x2 > CW || y2 > CH) return false
        const s = P[y2 * (CW + 1) + x2] - P[y1 * (CW + 1) + x2] - P[y2 * (CW + 1) + x1] + P[y1 * (CW + 1) + x1]
        return s === 0
    }
    const seen = new Uint8Array(CW * CH)
    const start = [Math.round(F.START.x), Math.round(F.START.y)]
    if (!free(...start)) errors.push('circulation start point is blocked')
    const queue = [start]
    seen[start[1] * CW + start[0]] = 1
    while (queue.length) {
        const [x, y] = queue.pop()
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= CW || ny >= CH || seen[ny * CW + nx]) continue
            if (!free(nx, ny)) continue
            seen[ny * CW + nx] = 1
            queue.push([nx, ny])
        }
    }
    const unreachable = F.targets.filter((t) => !seen[Math.round(t.y) * CW + Math.round(t.x)])
    for (const t of unreachable) errors.push(`circulation: cannot reach "${t.name}" with a ${BODY}" body`)
    if (!unreachable.length) ok(`circulation: all ${F.targets.length} use points (every room, bed sides, wardrobe, fridge, hob, sink, WCs, stair foot) reachable from the gate with a ${BODY}" wide body`)

    return { ok: errors.length === 0, errors, report, reach: seen, doorZones }
}

if (require.main === module) {
    const { ok, errors, report } = validate()
    console.log(report.join('\n'))
    if (!ok) { console.error('\nFAILED:\n' + errors.join('\n')); process.exit(1) }
    console.log('\nPlan is dimensionally valid and usable.')
}

module.exports = { validate, doorZones }
