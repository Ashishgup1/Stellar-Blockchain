// Initial requirements
let Stellar  = require('stellar-sdk'); // Stellar JS library
let request  = require('request-promise'); // Request library


// Pointing server object to horizon testnet.
const server = new Stellar.Server('https://horizon-testnet.stellar.org');
Stellar.Network.useTestNetwork();

let utilityObject = {
    
    createAndFundAccount : async function createAndFundAccount(pair) {
     console.log();
        await request.get({
            uri: 'https://horizon-testnet.stellar.org/friendbot',
            qs: { addr: pair.publicKey() },
            json: true
        });

        accountA = await server.loadAccount(pair.publicKey()); // Load newly created account

        console.log( 'Balances for account: ' + pair.publicKey() + " " + pair.secret());
    
        accountA.balances.forEach( (balance) => {
            console.log( 'Type:', balance.asset_type, ', Balance:', balance.balance, ', Code:', balance.asset_code);
            console.log();
        })
    },
   
    changeTrust : async function changeTrust(truster, lim, assZ) {
      console.log();
      accountTruster = await server.loadAccount( Stellar.Keypair.fromPublicKey(truster.publicKey()).publicKey() );
      const transaction = new Stellar.TransactionBuilder(accountTruster)
      .addOperation(Stellar.Operation.changeTrust({
        asset : assZ,
        limit : lim
      }))
      .build();

      transaction.sign(truster);

      console.log( "XDR format of transaction: ", transaction.toEnvelope().toXDR('base64') );

      try {
        
          const transactionResult = await server.submitTransaction(transaction);

          console.log('Success! View the transaction at: ');
          console.log(transactionResult._links.transaction.href);
          // console.log(JSON.stringify(transactionResult, null, 2));
          
      } catch (err) {
            console.log('An error has occured:');
            console.log(err);
        }
        console.log();
    },
    

    createContract : async function createContract(src, dest, randomSigner, assZ, amt) {
      console.log();
        accountSource = await server.loadAccount(src.publicKey());

        accountSource.incrementSequenceNumber(); // a transaction that will take place in the future

        let preAuthTx = new Stellar.TransactionBuilder(accountSource)
            .addOperation(Stellar.Operation.payment({
                destination: dest.publicKey(),
                asset: assZ,
                amount: amt
            }))
          .build();
      
        
        accountSource = await server.loadAccount(src.publicKey()); // called again to set back sequence number

        let transaction = new Stellar.TransactionBuilder(accountSource)
            .addOperation(Stellar.Operation.setOptions({
                signer:{
                    ed25519PublicKey : randomSigner.publicKey(),
                    weight:1
                },
                lowThreshold : 1,
                medThreshold : 1,
                highThreshold: 1,
                masterWeight : 0
            }))
          .build();

        
        
          transaction.sign(src);

        console.log("XDR format of transaction: ", transaction.toEnvelope().toXDR('base64'));

        try {
            const transactionResult = await server.submitTransaction(transaction)
        
            console.log('Success! View the transaction at: ')
            console.log(transactionResult._links.transaction.href)
            // console.log(JSON.stringify(transactionResult, null, 2))
            
        
        } catch (err) {
              console.log('An error has occured:')
              console.log(err)
          }
          console.log();
          return preAuthTx;
    },

    
    sendData: async function sendData(source, dest, asset, hash) {

      console.log();
      accountSource = await server.loadAccount(source.publicKey());

      const transaction = new Stellar.TransactionBuilder(accountSource)
          .addOperation(Stellar.Operation.payment({
              destination: dest.publicKey(),
              asset: asset,
              amount: "1"
        }))
        .addMemo(Stellar.Memo.hash(hash))
        .build();
      
      transaction.sign(source);
      
      try {
        
        const transactionResult = await server.submitTransaction(transaction);

        console.log('Success! View the transaction at: ');
        console.log(transactionResult._links.transaction.href);
        // console.log(JSON.stringify(transactionResult, null, 2));
        
      } catch (err) {
            console.log('An error has occured:');
            console.log(err);
      }
      console.log();
    },

    sendAsset: async function sendAsset(source, dest, amount, asset) {

      console.log();
        accountSrc  = await server.loadAccount(source.publicKey());
        
        const transaction = new Stellar.TransactionBuilder(accountSrc)
            .addOperation(Stellar.Operation.payment({
                destination: dest.publicKey(),
                asset: asset,
                amount: amount
            }))
        .build();

      transaction.sign(source);

      console.log("XDR format of transaction: ", transaction.toEnvelope().toXDR('base64'));

      try {
          const transactionResult = await server.submitTransaction(transaction)

          console.log('Success! View the transaction at: ');
          console.log(transactionResult._links.transaction.href);
          // console.log(JSON.stringify(transactionResult, null, 2));
        
      } catch (err) {
            console.log('An error has occured:')
            console.log(err.response.data.extras)
      };
      console.log();
    },

    
    lockAccount: async function lockAccount(pair) {
      
      console.log();
        accountToBeLocked = await server.loadAccount(pair.publicKey());

        const transaction = new Stellar.TransactionBuilder(accountToBeLocked)
            .addOperation(Stellar.Operation.setOptions({
                masterWeight:0,
                lowThreshold:1,
                mediumThreshold:1,
                highThreshold:1
            }))
        .build();

      transaction.sign(pair);

      console.log("XDR format of transaction: ", transaction.toEnvelope().toXDR('base64'));

      try {
        const transactionResult = await server.submitTransaction(transaction);

        console.log('Success! View the transaction at: ');
        console.log(transactionResult._links.transaction.href);
        // console.log(JSON.stringify(transactionResult, null, 2));
        
      } catch (err) {
        console.log('An error has occured:');
        console.log(err);
      }
      console.log();
    },

    
    showBalance: async function showBalance(pair) {
      console.log();
        account = await server.loadAccount(pair.publicKey());


        console.log('\nBalances for account: ' + pair.publicKey());
        account.balances.forEach((balance) => {
        console.log('Type:', balance.asset_type, ', Balance:', balance.balance, ', Code:', balance.asset_code);
        });
        console.log();
    },

    
    transact : async function transact(pairSeller, pairEscrow, pairBuyer, asset, amount, hash, lim) {

      console.log();
        console.log("Creating a temporary account for storing ZFC");
        
        let pairTemp = Stellar.Keypair.random();
        await this.createAndFundAccount(pairTemp);

        console.log("Establish trust and transfer ZFC from Buyer to Temporary account.");
        
        await this.changeTrust(pairTemp, '10000', asset);
        await this.changeTrust(pairEscrow, '10000', asset);

        await this.sendAsset(pairBuyer, pairTemp, amount, asset);

        console.log("Creating a preAuth transaction");
        let randomSigner = Stellar.Keypair.random();
        let preAuth = await this.createContract(pairTemp, pairSeller, randomSigner, asset, amount);
      
        console.log("preAuth received!");
        
        console.log("Sending data from Seller to Escrow");
        await this.sendData(pairSeller, pairEscrow, asset, hash);
      
        console.log("Signing the preAuth transaction");
        preAuth.sign(randomSigner);

        console.log();

        console.log("Submitting the preAuth transaction");
        console.log();
        
        console.log("XDR format of transaction: ", preAuth.toEnvelope().toXDR('base64'));

        try {
            const transactionResult = await server.submitTransaction(preAuth);

            console.log('Success! View the transaction at: ');
            console.log(transactionResult._links.transaction.href);
            // console.log(JSON.stringify(transactionResult, null, 2));
          
        } catch (err) {
          console.log('An error has occured:');
          console.log(err);
        }

        console.log();

        console.log("Sending data from Escrow to Buyer");
        await this.sendData(pairEscrow, pairBuyer, asset, hash);
      
        console.log("Displaying balances");

        await this.showBalance(pairSeller);
        await this.showBalance(pairEscrow);
        await this.showBalance(pairBuyer);
        await this.showBalance(pairTemp);

    }

  
}


module.exports = utilityObject;
