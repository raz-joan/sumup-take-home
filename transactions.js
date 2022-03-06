const fs = require('fs')
const csv = require('csv-parser')

const args = process.argv.slice(2)

const inputPath = args[0]
const outputPath = args[1]

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

const writeToCSVFile = (clientList) => {
  const filename = outputPath
  fs.writeFile(filename, extractAsCSV(clientList), err => {
    if (err) {
      console.log('Error writing to csv file', err)
    } else {
      console.log(`saved as ${filename}`)
    }
  })
}

const extractAsCSV = (clientList) => {
  const header = ["client,available,held,total,locked"]
  const rows = clientList.map(each => {
    return `${each.client},${each.available.toFixed(4)},${each.held.toFixed(4)},${each.total.toFixed(4)},${each.locked}`
  })
  console.log(header.concat(rows).join('\n'))
  return header.concat(rows).join('\n')
}

fs.createReadStream(inputPath)
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
    const updated = calculateBalances()
    writeToCSVFile(updated)
  })