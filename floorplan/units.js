/**
 * Unit helpers. All geometry in this project is stored in INCHES so that
 * every dimension chain is exact (half-inch precision, no float drift).
 */

/** feet + inches -> inches */
const ft = (feet, inches = 0) => feet * 12 + inches

/**
 * Format inches as an architectural string, e.g. 125.5 -> 10'-5½"
 * @param {number} inches
 */
const fmt = (inches) => {
    const sign = inches < 0 ? '-' : ''
    const abs = Math.abs(inches)
    let feet = Math.floor(abs / 12)
    let rem = Math.round((abs - feet * 12) * 2) / 2
    if (rem === 12) { feet += 1; rem = 0 }
    const whole = Math.floor(rem)
    const half = rem - whole === 0.5 ? '½' : ''
    if (feet === 0) return `${sign}${whole}${half}"`
    return `${sign}${feet}'-${whole}${half}"`
}

module.exports = { ft, fmt }
