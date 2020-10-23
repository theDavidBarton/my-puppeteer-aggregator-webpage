const aggregate = require('./index')
const fs = require('fs')

!(async () => {
  console.time('time')
  const html = await aggregate()
  fs.writeFileSync('test.html', html)
  console.timeEnd('time')
})()
