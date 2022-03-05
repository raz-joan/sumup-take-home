const fs = require('fs')
const csv = require('csv-parser')

const clients = []

const calculateBalances = () => {
  clients.map(each => {
    console.log(each.client)
    console.log(each.transactions)

    const transformedClient = {
      client: each.client,
      available: 0,
      held: 0,
      total: 0,
      locked: false
    }

    each.transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'deposit':
          console.log(each.client, 'deposit')
          break
        case 'withdrawal':
          console.log(each.client, 'withdrawal')
          break
        case 'dispute':
          console.log(each.client, 'dispute')
          break
        case 'resolve':
          console.log(each.client, 'resolve')
          break
        case 'chargeback':
          console.log(each.client, 'chargeback')
          break
        default:
          console.log(`error, no match found for ${transaction.type}`)
      }
    })
  })
}

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
    // console.table(clients)
    console.log(clients)
    // console.log(clients[0].transactions)
    calculateBalances()
  })
