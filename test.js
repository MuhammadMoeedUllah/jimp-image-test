// Fails if the floor plan geometry is not dimensionally valid.
const { validate } = require('./floorplan/validate')

const { ok, errors, report } = validate()
console.log(report.join('\n'))
if (!ok) {
    console.error('\nFAILED:\n' + errors.join('\n'))
    process.exit(1)
}
console.log('\nAll floor plan checks passed.')
