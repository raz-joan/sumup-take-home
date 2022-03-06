# SumUp Challenge

Joan Rasmussen, March 6, 2022

## Set Up Instructions  
1. `clone` this repo to your local machine
2. navigate to the root directory using `cd` 
3. run `npm install` to install the dependency (csv-parser)
4. if you have a csv file with column headers: client, type, tx, amount, then...
  - use the command: `node transactions.js <your csv file name> <desired output file name with extension csv>`
5. if you do not have a csv file with the above headers, then you can use the mock data in this repo:
 - use the command: `node transactions.js transactions.csv <accounts.csv or whatever name you choose>`

*Note: I was unable to get this program to run when I nested '>' into this command. I did not find a good answer in the alotted time, so I hope to discuss this when we review the code.*  

## Refelections  

I gave my self 8 hours total from reading the repo to finishing the README.  

Please see the `./problem-road-map.md` file to see my thoughts concerning 'need to learn' topics and logic planning for this problem.  

To learn about how to go about solving this problem, I read documentation on nodejs.org, [this tutorial](https://heynode.com/blog/2020-02/reading-and-writing-csv-files-nodejs/), and watched a couple youtube videos.

As for the output, I read on [nodejs.org](https://nodejs.org/api/console.html) that creating a Console instance with the argument process.stdout was the same as using the global console.log. Hence, the output is both written to a new csv file with the name designated in the command line and is also console.logged.  

I ran out of time to refactor the calculateBalances method - it does not currently follow SRP.

Looking forward to asking some questions and having a discussion on the simple transaction engine that I wrote.