const fs = require('fs')
const csv = require('csv-parser')

const clients = []

fs.createReadStream('transactions.csv')
  .pipe(csv())
  .on('data', (row) => {
    const foundClientIndex = clients.findIndex(each => each.client === Number(row.client))

    if (foundClientIndex < 0) {
      const user = {
        client: Number(row.client),
        transactions: [{
          type: row.type,
          tx: Number(row.tx),
          amount: Number(row.amount).toFixed(4)
        }]
      }
      clients.push(user)
    } else {
      clients[foundClientIndex].transactions.push({
        type: row.type,
        tx: Number(row.tx),
        amount: Number(row.amount).toFixed(4)
      })
    }
  })
  .on('end', () => {
    console.table(clients)
    console.log(clients)
    console.log(clients[0].transactions)
  })
