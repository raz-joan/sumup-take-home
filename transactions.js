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
      const numAmount = parseFloat(transaction.amount)

      switch (transaction.type) {
        case 'deposit':
          transformedClient.available += numAmount
          transformedClient.total += numAmount
          break
        case 'withdrawal':
          if (numAmount <= transformedClient.available) {
            transformedClient.available -= numAmount
            transformedClient.total -= numAmount
          }
          break
        case 'dispute':
          const matchingTransactionDispute = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          if (matchingTransactionDispute) {
            transformedClient.available -= parseFloat(matchingTransactionDispute.amount)
            transformedClient.held += parseFloat(matchingTransactionDispute.amount)
          }
          break
        case 'resolve':
          const matchingTransactionResolve = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          const matchingDisputeResolve = disputes.find(matchDispute => matchDispute.tx === transaction.tx)

          if (matchingTransactionResolve && matchingDisputeResolve) {
            transformedClient.available += parseFloat(matchingTransactionResolve.amount)
            transformedClient.held -= parseFloat(matchingTransactionResolve.amount)
          }
          break
        case 'chargeback':
          const matchingTransactionChargeback = depositsWithrawals.find(possibleDispute => possibleDispute.tx === transaction.tx)

          const matchingDisputeChargeback = disputes.find(matchDispute => matchDispute.tx === transaction.tx)

          if (matchingTransactionChargeback && matchingDisputeChargeback) {
            transformedClient.held -= parseFloat(matchingTransactionChargeback.amount)
            transformedClient.total -= parseFloat(matchingTransactionChargeback.amount)
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
    const updated = calculateBalances()
    // console.table(updated)
    console.log(updated)
  })
