/**
 * Furniture / fixture symbols, drawn at real size from plot-inch rectangles.
 * R = region { img, px, py, S }.
 */
const D = require('../../floorplan/draw')

const { C } = D

const drawItem = (R, it) => {
    const { img, px, py, S } = R
    const X1 = px(it.x1)
    const X2 = px(it.x2)
    const Y1 = py(it.y2)
    const Y2 = py(it.y1)
    const W = X2 - X1
    const H = Y2 - Y1
    const cx = (X1 + X2) / 2
    const cy = (Y1 + Y2) / 2
    const box = (fill = C.furnFill, w = 2, color = C.furn, dash = null) => {
        D.fillRect(img, X1, Y1, X2, Y2, fill)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, color, w, dash)
    }
    // strip on the side opposite to where a seat faces (plot +y is "N", drawn upwards)
    const backStrip = (d) => {
        const k = d * S
        if (it.facing === 'E') return [X1, Y1, X1 + k, Y2]
        if (it.facing === 'W') return [X2 - k, Y1, X2, Y2]
        if (it.facing === 'N') return [X1, Y2 - k, X2, Y2]
        return [X1, Y1, X2, Y1 + k]
    }
    switch (it.type) {
    case 'car':
        D.fillRect(img, X1, Y1, X2, Y2, 0xf7f9fbff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, C.grey, 3, [14, 8])
        D.line(img, X1 + 6 * S, Y1 + 40 * S, X2 - 6 * S, Y1 + 40 * S, C.grey, 2)
        D.line(img, X1 + 6 * S, Y2 - 34 * S, X2 - 6 * S, Y2 - 34 * S, C.grey, 2)
        break
    case 'fridge':
        box(0xf4f4f4ff, 3)
        D.line(img, X1 + 4 * S, Y1, X1 + 4 * S, Y2, C.furn, 2)
        break
    case 'counter':
        box(0xf6f6f6ff, 2)
        break
    case 'hob':
        box(0xffffffff, 2)
        for (const fx of [0.28, 0.72]) for (const fy of [0.3, 0.72]) D.ellipse(img, X1 + W * fx, Y1 + H * fy, 2.7 * S, 2.7 * S, C.furn, 2)
        break
    case 'sink':
        box(0xffffffff, 2)
        D.strokeRect(img, X1 + 3 * S, Y1 + 3 * S, X2 - 3 * S, Y2 - 3 * S, C.furn, 2)
        D.ellipse(img, cx, cy, 1.5 * S, 1.5 * S, C.furn, 2)
        break
    case 'table':
    case 'desk':
        box(0xffffffff, 3)
        break
    case 'chair': {
        box(0xffffffff, 2)
        const [a, b, c, d] = backStrip(4)
        D.fillRect(img, a, b, c, d, C.light)
        break
    }
    case 'sofa':
    case 'armchair': {
        box(0xffffffff, 2)
        const [a, b, c, d] = backStrip(it.type === 'sofa' ? 9 : 8)
        D.fillRect(img, a, b, c, d, C.light)
        D.strokeRect(img, a, b, c - 1, d - 1, C.furn, 2)
        const arm = 6 * S
        if (it.facing === 'E' || it.facing === 'W') {
            D.fillRect(img, X1, Y1, X2, Y1 + arm, C.light); D.strokeRect(img, X1, Y1, X2 - 1, Y1 + arm, C.furn, 2)
            D.fillRect(img, X1, Y2 - arm, X2, Y2, C.light); D.strokeRect(img, X1, Y2 - arm, X2 - 1, Y2 - 1, C.furn, 2)
        } else {
            D.fillRect(img, X1, Y1, X1 + arm, Y2, C.light); D.strokeRect(img, X1, Y1, X1 + arm, Y2 - 1, C.furn, 2)
            D.fillRect(img, X2 - arm, Y1, X2, Y2, C.light); D.strokeRect(img, X2 - arm, Y1, X2 - 1, Y2 - 1, C.furn, 2)
        }
        break
    }
    case 'tv':
        box(0x3a3a3aff, 2, C.ink)
        break
    case 'bed': {
        box(0xffffffff, 3)
        // pillows across the head end, blanket fold 26" from the head
        const head = it.head || 'W'
        const p = 3 * S
        const pd = 14 * S
        const fold = 26 * S
        if (head === 'W' || head === 'E') {
            const hx = head === 'W' ? X1 + p : X2 - p - pd
            const n = H > 50 * S ? 2 : 1
            for (let k = 0; k < n; k++) {
                const y0 = Y1 + p + (k * (H - 2 * p)) / n
                D.strokeRect(img, hx, y0 + 4, hx + pd, y0 + (H - 2 * p) / n - 4, C.furn, 2)
            }
            const fx = head === 'W' ? X1 + fold : X2 - fold
            D.line(img, fx, Y1, fx, Y2, C.furn, 2)
        } else {
            // plot 'S' = head towards larger y (drawn at the top of the image)
            const hy = head === 'S' ? Y1 + p : Y2 - p - pd
            const n = W > 50 * S ? 2 : 1
            for (let k = 0; k < n; k++) {
                const x0 = X1 + p + (k * (W - 2 * p)) / n
                D.strokeRect(img, x0 + 4, hy, x0 + (W - 2 * p) / n - 4, hy + pd, C.furn, 2)
            }
            const fy = head === 'S' ? Y1 + fold : Y2 - fold
            D.line(img, X1, fy, X2, fy, C.furn, 2)
        }
        break
    }
    case 'sidetable':
        box(0xffffffff, 2)
        D.ellipse(img, cx, cy, 4 * S, 4 * S, C.furn, 2)
        break
    case 'wardrobe':
    case 'cabinet': {
        box(0xf4f4f4ff, 3)
        const horiz = W >= H
        if (horiz) D.line(img, X1 + 4 * S, cy, X2 - 4 * S, cy, C.furn, 2, [12, 8])
        else D.line(img, cx, Y1 + 4 * S, cx, Y2 - 4 * S, C.furn, 2, [12, 8])
        break
    }
    case 'wc':
        // cistern against the wall on the plot +y side (drawn on top)
        D.fillRect(img, X1, Y1, X2, Y1 + 8 * S, 0xffffffff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y1 + 8 * S, C.furn, 2)
        D.ellipse(img, cx, Y1 + 8 * S + 9.5 * S, 7.5 * S, 9.5 * S, C.furn, 2, 0xffffffff)
        break
    case 'basin':
        box(0xffffffff, 2)
        D.ellipse(img, cx, cy, Math.max(4, W / 2 - 2.5 * S), Math.max(4, H / 2 - 3 * S), C.furn, 2)
        break
    case 'shower':
        box(0xf2f8fbff, 2)
        D.line(img, X1, Y1, X2, Y2, C.light, 2)
        D.line(img, X1, Y2, X2, Y1, C.light, 2)
        D.ellipse(img, cx, cy, 2 * S, 2 * S, C.furn, 2, 0xffffffff)
        break
    case 'rug':
        D.fillRect(img, X1, Y1, X2, Y2, 0xe9e3f3ff)
        D.strokeRect(img, X1 + 4, Y1 + 4, X2 - 5, Y2 - 5, 0xb9aed6ff, 2)
        break
    case 'planter':
        D.fillRect(img, X1, Y1, X2, Y2, 0xcfe6c2ff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, 0x6f9a5cff, 2)
        for (let k = X1 + 10; k < X2 - 6; k += 22) D.ellipse(img, k, cy, 6, 6, 0x6f9a5cff, 2, 0xb5d9a2ff)
        break
    case 'tree':
        D.ellipse(img, cx, cy, W / 2, H / 2, 0x5f8f4eff, 3, 0xbfe0aeff)
        D.ellipse(img, cx, cy, W / 4, H / 4, 0x5f8f4eff, 2)
        D.ellipse(img, cx, cy, 5, 5, 0x5f8f4eff, 2, 0x8a6a4aff)
        break
    case 'bench':
        box(0xf3ead9ff, 2, 0x9a7b4fff)
        for (let k = 1; k < 4; k++) {
            if (W > H) D.line(img, X1 + (W * k) / 4, Y1, X1 + (W * k) / 4, Y2, 0xc8b089ff, 2)
            else D.line(img, X1, Y1 + (H * k) / 4, X2, Y1 + (H * k) / 4, 0xc8b089ff, 2)
        }
        break
    case 'screen':
        // jaali: perforated screen
        D.fillRect(img, X1, Y1, X2, Y2, 0xe8d9c0ff)
        for (let y = Y1 + 6; y < Y2 - 3; y += 10) D.ellipse(img, cx, y, 3, 3, 0x9a7b4fff, 2)
        break
    case 'solar':
        D.fillRect(img, X1, Y1, X2, Y2, 0xdde8f5ff)
        D.strokeRect(img, X1, Y1, X2 - 1, Y2 - 1, 0x4a6f99ff, 2)
        for (let k = 1; k < 3; k++) D.line(img, X1 + (W * k) / 3, Y1, X1 + (W * k) / 3, Y2, 0x9db5d3ff, 1)
        for (let k = 1; k < 6; k++) D.line(img, X1, Y1 + (H * k) / 6, X2, Y1 + (H * k) / 6, 0x9db5d3ff, 1)
        break
    case 'washer':
        box(0xffffffff, 2)
        D.ellipse(img, cx, cy, W / 2 - 3 * S, H / 2 - 3 * S, C.furn, 2)
        break
    case 'ac':
        box(0xf0f0f0ff, 2)
        D.ellipse(img, cx, cy, W / 2 - 3 * S, W / 2 - 3 * S, C.furn, 2)
        break
    default:
        box()
    }
}

module.exports = { drawItem }
