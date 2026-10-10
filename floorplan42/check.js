/**
 * Runs the generic floor validator (floorplan26/check.js) on the shop-house
 * floors: node floorplan42/check.js ground first second
 */
const { checkFloor } = require('../floorplan26/check')

const floors = process.argv.slice(2).length ? process.argv.slice(2) : ['ground', 'first', 'second']
let bad = 0
for (const f of floors) {
    const r = checkFloor(require(`./${f}`))
    console.log(r.report.join('\n'))
    if (!r.ok) { bad++; console.error(`\n${f} FAILED:\n  ` + r.errors.join('\n  ')) }
}
process.exit(bad ? 1 : 0)
