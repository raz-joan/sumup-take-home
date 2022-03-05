const fs = require('fs')
const csv = require('csv-parser')

const clients = []

fs.createReadStream('transactions.csv')
  .pipe(csv({}))
  .on('data', (data) => {
    clients.push(data)
  })
  .on('end', () => {
    console.table(clients)
    console.log(clients)
  })
