const n = require('../src/lib/nature.cjs')

console.log('Fire -> Wind', n.effectiveness('Fire','Wind'))
console.log('Fire -> Water', n.effectiveness('Fire','Water'))
console.log('Water -> Fire', n.effectiveness('Water','Fire'))
console.log('Earth env cost (base 10) with env', n.environmentalCost(10,'Earth',true,0))
console.log('Earth self form cost (base 10) with 120 Chakra Control', n.environmentalCost(10,'Earth',false,120))
console.log('YinYang -> Fire', n.effectiveness('YinYang','Fire'))
