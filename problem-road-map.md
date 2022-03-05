[Problem Repo](https://github.com/sumup-challenges/payment-engine)

# Problem

Given a CSV representing a series of transactions implement a simple transactions engine that processes the payments crediting and debiting accounts. After processing the complete set of payments output the client account balances.

Running the payments engine:
 `node transactions.js transactions.csv > accounts.csv`  

The input file is the first and only argument to the program. Output should be written to stdout.

*// need to learn: how to input a csv file, how to read/parse the file, how to alter the data, how to output the manipulated data to stdout*

# Details

## Input

The input will be a CSV file with the columns type , client , tx , and amount . You can assume the type is a string, the client column is a number, the tx is a number, and the amount is a decimal value with a precision of up to four places past the decimal.

``` csv
type, client, tx, amount
deposit, 1, 1, 1.0
deposit, 2, 2, 2.0
deposit, 1, 3, 2.0
withdrawal, 1, 4, 1.5
withdrawal, 2, 5, 3.0
```

## Output

The output should be a list of client IDs ( client ), available amounts ( available ), held amounts ( held ), total amounts ( total ), and whether the account is locked ( locked ). Precision to four decimal places past the decimal.

``` csv
client, available, held, total, locked
1, 1.5, 0.0, 1.5, false
2, 2.0, 0.0, 2.0, false
```
*// the `locked` key is initialized as `false` for all clients*

## Transaction Types

### Deposit

A deposit is a credit to the client’s asset account, meaning it should increase the available and total funds of the client account.

``` javascript
available += deposit
total += deposit
```

### Withdrawal

A withdraw is a debit to the client’s asset account, meaning it should decrease the available and total funds of the client account.

``` javascript
if (withdrawal.amount <= available) {
  available -= withdrawal
  total -= withdrawal
} else {
  // amounts do not change if there is not sufficient available funds
}
```

### Dispute

A dispute represents a client’s claim that a transaction was erroneous and should be reversed. The transaction shouldn’t be reversed yet but the associated funds should be held. This means that the clients available funds should decrease by the amount disputed, their held funds should increase by the amount disputed, while their total funds should remain the same.

``` javascript
// find referenced transaction by id
this.transactions.find(each => each.tx === dispute.tx)
// found object should have type deposit or withdrawal
// if found, do the following, otherwise ignore this transaction
available -= found.amount
held += found.amount
// total = total (no change)
```

### Resolve

A resolve represents a resolution to a dispute, releasing the associated held funds. Funds that were previously disputed are no longer disputed. This means that the clients held funds should decrease by the amount no longer disputed, their available funds should increase by the amount no longer disputed, and their total funds should remain the same.

``` javascript
// if the resolve.tx doesn't exist or match a dispute.tx, then ignore the resolve
// similar to dispute, find the match transaction by id
available += found.amount
held -= found.amount
// total = total (no change)
```

### Chargeback

A chargeback is the final state of a dispute and represents the client reversing a transaction. Funds that were held have now been withdrawn. This means that the clients held funds and total funds should decrease by the amount previously disputed. If a chargeback occurs the client’s account should be immediately locked.

``` javascript
// again, find the transaction and matching dispute by id
// similar to resolve, if it doesn't exist or match a dispute, then ignore the chargeback
held -= found.amount
total -= found.amount
// available = available (no change)
locked = true
```