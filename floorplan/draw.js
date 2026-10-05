/**
 * Minimal raster primitives on top of Jimp (Jimp has no vector API).
 * All functions take PIXEL coordinates; modules convert plot inches -> px.
 */
const Jimp = require('jimp')

const C = {
    paper: 0xffffffff,
    ink: 0x1a1a1aff,
    wall: 0x2b2b2bff,
    dim: 0xb3261eff,
    shop: 0xfdf3e1ff,
    room: 0xffffffff,
    porch: 0xeef1f4ff,
    bath: 0xe6f2f7ff,
    stair: 0xf4f0f8ff,
    shaft: 0xe7f3e3ff,
    setback: 0xf2f2f2ff,
    glass: 0x9fd3f0ff,
    grey: 0x8a8a8aff,
    light: 0xd0d0d0ff,
}

const rgba = (c) => [(c >>> 24) & 255, (c >>> 16) & 255, (c >>> 8) & 255, c & 255]

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
    const steps = Math.ceil(Math.abs(a1 - a0) * r * 2)
    for (let s = 0; s <= steps; s++) {
        const a = a0 + ((a1 - a0) * s) / steps
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        if (w <= 1) setPx(img, x, y, color)
        else fillRect(img, x - w / 2, y - w / 2, x + w / 2, y + w / 2, color)
    }
}

/** 45° hatch clipped to a rectangle */
const hatch = (img, x1, y1, x2, y2, color, gap = 10, dir = 1) => {
    const w = x2 - x1
    const h = y2 - y1
    for (let k = -h; k < w; k += gap) {
        for (let t = 0; t < h; t += 0.5) {
            const x = dir > 0 ? x1 + k + t : x2 - k - t
            const y = y1 + t
            if (x >= x1 && x < x2) setPx(img, x, y, color)
        }
    }
}

const arrowHead = (img, x, y, angle, color, size = 14) => {
    for (const da of [Math.PI - 0.4, Math.PI + 0.4]) {
        line(img, x, y, x + size * Math.cos(angle + da), y + size * Math.sin(angle + da), color, 2)
    }
}

// ------------------------------------------------------------------ text
const fonts = {}
const loadFonts = async () => {
    fonts.black = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
}

/**
 * Render text into its own image at `size` px tall (downsampled from the
 * 64px bitmap font for clean anti-aliasing), optionally tinted.
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

/** draw text centred on (cx, cy); rotate = 90 for vertical (reads bottom-up) */
const text = (img, str, cx, cy, size, color = C.ink, rotate = 0, bg = null) => {
    const t = textImage(str, size, color)
    if (rotate) t.rotate(rotate, false)
    const x = Math.round(cx - t.bitmap.width / 2)
    const y = Math.round(cy - t.bitmap.height / 2)
    if (bg !== null) fillRect(img, x + 2, y + 2, x + t.bitmap.width - 2, y + t.bitmap.height - 2, bg)
    img.composite(t, x, y)
    return { w: t.bitmap.width, h: t.bitmap.height }
}

const textLeft = (img, str, x, cy, size, color = C.ink) => {
    const t = textImage(str, size, color)
    img.composite(t, Math.round(x), Math.round(cy - t.bitmap.height / 2))
    return { w: t.bitmap.width, h: t.bitmap.height }
}

module.exports = { C, blank, setPx, fillRect, line, strokeRect, arc, hatch, arrowHead, loadFonts, text, textLeft, textImage }
