/**
 * Minimal raster primitives on top of Jimp (Jimp has no vector API), plus a
 * LabelLayer that refuses to place text on top of linework or other text.
 * All functions take PIXEL coordinates; modules convert plot inches -> px.
 */
const Jimp = require('jimp')

const C = {
    paper: 0xffffffff,
    ink: 0x1a1a1aff,
    wall: 0x2b2b2bff,
    dim: 0xb3261eff,
    tag: 0x1f4e79ff,
    shop: 0xfdf3e1ff,
    room: 0xffffffff,
    kitchen: 0xfff8ecff,
    drawing: 0xf3f7eeff,
    porch: 0xeef1f4ff,
    bath: 0xe6f2f7ff,
    stair: 0xf4f0f8ff,
    shaft: 0xe2f1dcff,
    setback: 0xf2f2f2ff,
    glass: 0x5aa9d6ff,
    grey: 0x8a8a8aff,
    furn: 0x6b6b6bff,
    furnFill: 0xffffffff,
    light: 0xd0d0d0ff,
    road: 0xc9ccd1ff,
}

const rgba = (c) => [(c >>> 24) & 255, (c >>> 16) & 255, (c >>> 8) & 255, c & 255]
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

const blank = (w, h, color = C.paper) => new Jimp(Math.round(w), Math.round(h), color)

const setPx = (img, x, y, color) => {
    x = Math.round(x); y = Math.round(y)
    const { width, height, data } = img.bitmap
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const [r, g, b, a] = rgba(color)
    const i = (y * width + x) * 4
    const t = a / 255
    data[i] = r * t + data[i] * (1 - t)
    data[i + 1] = g * t + data[i + 1] * (1 - t)
    data[i + 2] = b * t + data[i + 2] * (1 - t)
    data[i + 3] = Math.max(data[i + 3], a)
}

const fillRect = (img, x1, y1, x2, y2, color) => {
    const [ax, bx] = [Math.round(Math.min(x1, x2)), Math.round(Math.max(x1, x2))]
    const [ay, by] = [Math.round(Math.min(y1, y2)), Math.round(Math.max(y1, y2))]
    for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) setPx(img, x, y, color)
}

const line = (img, x1, y1, x2, y2, color, w = 1, dash = null) => {
    const len = Math.hypot(x2 - x1, y2 - y1)
    const steps = Math.max(1, Math.ceil(len * 2))
    const r = (w - 1) / 2
    for (let s = 0; s <= steps; s++) {
        const d = (s / steps) * len
        if (dash && d % (dash[0] + dash[1]) > dash[0]) continue
        const x = x1 + ((x2 - x1) * s) / steps
        const y = y1 + ((y2 - y1) * s) / steps
        if (w <= 1) setPx(img, x, y, color)
        else fillRect(img, x - r, y - r, x + r + 1, y + r + 1, color)
    }
}

const strokeRect = (img, x1, y1, x2, y2, color, w = 1, dash = null) => {
    line(img, x1, y1, x2, y1, color, w, dash)
    line(img, x2, y1, x2, y2, color, w, dash)
    line(img, x2, y2, x1, y2, color, w, dash)
    line(img, x1, y2, x1, y1, color, w, dash)
}

/** arc centred at (cx,cy), radius r, from angle a0 to a1 (radians) */
const arc = (img, cx, cy, r, a0, a1, color, w = 1) => {
    const steps = Math.ceil(Math.abs(a1 - a0) * r * 2) + 1
    for (let s = 0; s <= steps; s++) {
        const a = a0 + ((a1 - a0) * s) / steps
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        if (w <= 1) setPx(img, x, y, color)
        else fillRect(img, x - w / 2, y - w / 2, x + w / 2, y + w / 2, color)
    }
}

const ellipse = (img, cx, cy, rx, ry, color, w = 2, fill = null) => {
    if (fill !== null) {
        for (let y = -ry; y <= ry; y++) {
            const half = rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))
            fillRect(img, cx - half, cy + y, cx + half, cy + y + 1, fill)
        }
    }
    const steps = Math.ceil(2 * Math.PI * Math.max(rx, ry) * 2)
    for (let s = 0; s < steps; s++) {
        const a = (2 * Math.PI * s) / steps
        const x = cx + rx * Math.cos(a)
        const y = cy + ry * Math.sin(a)
        fillRect(img, x - w / 2, y - w / 2, x + w / 2, y + w / 2, color)
    }
}

/** 45° hatch clipped to a rectangle */
const hatch = (img, x1, y1, x2, y2, color, gap = 10) => {
    const w = x2 - x1
    const h = y2 - y1
    for (let k = -h; k < w; k += gap) {
        for (let t = 0; t < h; t += 0.5) {
            const x = x1 + k + t
            if (x >= x1 && x < x2) setPx(img, x, y1 + t, color)
        }
    }
}

const arrowHead = (img, x, y, angle, color, size = 14, w = 3) => {
    for (const da of [Math.PI - 0.45, Math.PI + 0.45]) {
        line(img, x, y, x + size * Math.cos(angle + da), y + size * Math.sin(angle + da), color, w)
    }
}

// ------------------------------------------------------------------ text
const fonts = {}
const loadFonts = async () => {
    fonts.black = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
}

/**
 * Render text into its own image at `size` px cap-to-descender height
 * (downsampled from the 64px bitmap font for clean anti-aliasing).
 */
const textImage = (str, size, color = C.ink) => {
    const font = fonts.black
    const w = Jimp.measureText(font, str) + 8
    const h = Jimp.measureTextHeight(font, str, w + 10)
    const img = new Jimp(w, h, 0x00000000)
    img.print(font, 4, 0, str)
    const [r, g, b] = rgba(color)
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, i) {
        this.bitmap.data[i] = r
        this.bitmap.data[i + 1] = g
        this.bitmap.data[i + 2] = b
    })
    img.resize(Math.max(1, Math.round((w * size) / 64)), Math.max(1, Math.round((h * size) / 64)), Jimp.RESIZE_BICUBIC)
    return img
}

/** tight bounding box of the visible glyph pixels */
const inkBox = (t) => {
    const { width, height, data } = t.bitmap
    let x1 = width
    let y1 = height
    let x2 = -1
    let y2 = -1
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 40) {
                if (x < x1) x1 = x
                if (x > x2) x2 = x
                if (y < y1) y1 = y
                if (y > y2) y2 = y
            }
        }
    }
    return x2 < 0 ? { x1: 0, y1: 0, x2: width, y2: height } : { x1, y1, x2: x2 + 1, y2: y2 + 1 }
}

/** draw text centred on (cx, cy); rotate = 90 for vertical (reads bottom-up) */
const text = (img, str, cx, cy, size, color = C.ink, rotate = 0, bg = null) => {
    const t = textImage(str, size, color)
    if (rotate) t.rotate(rotate, false)
    const x = Math.round(cx - t.bitmap.width / 2)
    const y = Math.round(cy - t.bitmap.height / 2)
    if (bg !== null) {
        const b = inkBox(t)
        fillRect(img, x + b.x1 - 4, y + b.y1 - 3, x + b.x2 + 4, y + b.y2 + 3, bg)
    }
    img.composite(t, x, y)
    return { w: t.bitmap.width, h: t.bitmap.height }
}

const textLeft = (img, str, x, cy, size, color = C.ink) => {
    const t = textImage(str, size, color)
    img.composite(t, Math.round(x), Math.round(cy - t.bitmap.height / 2))
    return { w: t.bitmap.width, h: t.bitmap.height }
}

/**
 * Collects every label drawn on one image and reports any label that
 * - leaves the image,
 * - overlaps another label, or
 * - sits on linework (walls, furniture, door swings, dimension lines),
 * judged against a snapshot taken before the first label was placed.
 */
class LabelLayer {
    constructor(img, name) {
        this.img = img
        this.name = name
        this.boxes = []
        this.issues = []
        this.base = null
    }

    freeze() {
        this.base = this.img.clone()
    }

    darkPixels(b) {
        const { width, height, data } = this.base.bitmap
        let n = 0
        for (let y = Math.max(0, b.y1); y < Math.min(height, b.y2); y++) {
            for (let x = Math.max(0, b.x1); x < Math.min(width, b.x2); x++) {
                const i = (y * width + x) * 4
                if (lum(data[i], data[i + 1], data[i + 2]) < 170) n++
            }
        }
        return n
    }

    /**
     * opts: rotate (deg), bg (mask colour), allowOver (may sit on linework),
     *       anchor 'center' | 'left'
     */
    place(str, cx, cy, size, color = C.ink, opts = {}) {
        if (!this.base) this.freeze()
        const t = textImage(str, size, color)
        if (opts.rotate) t.rotate(opts.rotate, false)
        const ib = inkBox(t)
        const x0 = Math.round(opts.anchor === 'left' ? cx - ib.x1 : cx - (ib.x1 + ib.x2) / 2)
        const y0 = Math.round(cy - (ib.y1 + ib.y2) / 2)
        const pad = 3
        const box = { x1: x0 + ib.x1 - pad, y1: y0 + ib.y1 - pad, x2: x0 + ib.x2 + pad, y2: y0 + ib.y2 + pad, str }
        const { width, height } = this.img.bitmap
        if (box.x1 < 0 || box.y1 < 0 || box.x2 > width || box.y2 > height) this.issues.push(`${this.name}: "${str}" runs off the image`)
        for (const b of this.boxes) {
            if (box.x1 < b.x2 && b.x1 < box.x2 && box.y1 < b.y2 && b.y1 < box.y2) this.issues.push(`${this.name}: "${str}" overlaps "${b.str}"`)
        }
        if (!opts.allowOver) {
            const n = this.darkPixels(box)
            if (n > 0) this.issues.push(`${this.name}: "${str}" sits on ${n} px of linework`)
        }
        this.boxes.push(box)
        if (opts.bg !== undefined && opts.bg !== null) fillRect(this.img, box.x1 + 1, box.y1 + 1, box.x2 - 1, box.y2 - 1, opts.bg)
        this.img.composite(t, x0, y0)
        return box
    }

    /** register an area that labels must not overlap (e.g. a drawn tag) */
    reserve(box, str) {
        this.boxes.push({ ...box, str })
    }
}

module.exports = { C, rgba, lum, blank, setPx, fillRect, line, strokeRect, arc, ellipse, hatch, arrowHead, loadFonts, text, textLeft, textImage, inkBox, LabelLayer }
