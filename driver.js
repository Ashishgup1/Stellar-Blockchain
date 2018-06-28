// Initial requirements
let Stellar        = require('stellar-sdk'); // Stellar JS library
let request        = require('request-promise'); // Request library
let stellarUtility = require("./stellarUtilities.js"); // File containing Stellar utility functions for managing API

// Pointing server object to horizon testnet.
const server = new Stellar.Server('https://horizon-testnet.stellar.org');
Stellar.Network.useTestNetwork();

//Generating four account keypairs
let pairSeller  = Stellar.Keypair.random();
let pairEscrow  = Stellar.Keypair.random();
let pairBuyer   = Stellar.Keypair.random();
let pairIssuer  = Stellar.Keypair.random();


const driver = async () => {

    console.log("Creating 3 accounts");

    await stellarUtility.createAndFundAccount(pairSeller);
    await stellarUtility.createAndFundAccount(pairEscrow);
    await stellarUtility.createAndFundAccount(pairBuyer);

    console.log("\nCreating an Issuer account\n");
    await stellarUtility.createAndFundAccount(pairIssuer);

    let ZFCasset = new Stellar.Asset('ZFC', pairIssuer.publicKey()); // Generating our custom ZFC Asset

    console.log("Issuing ZFC to Seller");
    await stellarUtility.changeTrust(pairSeller,"10000",ZFCasset);
    await stellarUtility.sendAsset(pairIssuer,pairSeller,'1000',ZFCasset);

    console.log("Issuing ZFC to Buyer")
    await stellarUtility.changeTrust(pairBuyer,"10000",ZFCasset);
    await stellarUtility.sendAsset(pairIssuer,pairBuyer,'1000',ZFCasset);

    console.log("Locking the Issuer account");
    await stellarUtility.lockAccount(pairIssuer);

    await stellarUtility.transact(pairSeller, pairEscrow, pairBuyer, ZFCasset, "60", "10000");

}

let drive = driver();