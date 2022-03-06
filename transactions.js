const fs = require('fs')
const csv = require('csv-parser')

const clients = []

const calculateBalances = () => {
  return clients.map(each => {

    const transformedClient = {
      client: each.client,
      available: 0,
      held: 0,
      total: 0,
      locked: false
    }

    const depositsWithrawals = each.transactions.filter(transaction => transaction.type === 'withdrawal' || transaction.type === 'deposit')

    const disputes = each.transactions.filter(transaction => transaction.type === 'dispute')

    each.transactions.forEach(transaction => {

      switch (transaction.type) {
        case 'deposit':
          transformedClient.available += transaction.amount
          transformedClient.total += transaction.amount
          break
        case 'withdrawal':
          if (transaction.amount <= transformedClient.available) {
            transformedClient.available -= transaction.amount
            transformedClient.total -= transaction.amount
          }
          break
        case 'dispute':
          const matchingTransactionDispute = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          if (matchingTransactionDispute) {
            transformedClient.available -= matchingTransactionDispute.amount
            transformedClient.held += matchingTransactionDispute.amount
          }
          break
        case 'resolve':
          const matchingTransactionResolve = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          const matchingDisputeResolve = disputes.find(matchDispute => matchDispute.tx === transaction.tx)

          if (matchingTransactionResolve && matchingDisputeResolve) {
            transformedClient.available += matchingTransactionResolve.amount
            transformedClient.held -= matchingTransactionResolve.amount
          }
          break
        case 'chargeback':
          const matchingTransactionChargeback = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          const matchingDisputeChargeback = disputes.find(matchDispute => matchDispute.tx === transaction.tx)

          if (matchingTransactionChargeback && matchingDisputeChargeback) {
            transformedClient.held -= matchingTransactionChargeback.amount
            transformedClient.total -= matchingTransactionChargeback.amount
            transformedClient.locked = true
          }
          break
        default:
          console.log(`error, no match found for ${transaction.type} with id ${transaction.tx} for client ${each.client}`)
      }
    })

    return transformedClient
  })
}

fs.createReadStream('transactions.csv')
  .pipe(csv())
  .on('data', (row) => {
    const foundClientIndex = clients.findIndex(each => each.client === parseInt(row.client))

    if (foundClientIndex < 0) {
      const user = {
        client: parseInt(row.client),
        transactions: [{
          type: row.type,
          tx: parseInt(row.tx),
          amount: parseFloat(row.amount)
        }]
      }
      clients.push(user)
    } else {
      clients[foundClientIndex].transactions.push({
        type: row.type,
        tx: parseInt(row.tx),
        amount: parseFloat(row.amount)
      })
    }
  })
  .on('end', () => {
    // console.table(clients)
    console.log(clients)
    const updated = calculateBalances()
    // console.table(updated)
    console.log(updated)
  })
