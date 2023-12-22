// createIdentity.js
// ht https://github.com/mr-zwets/AuthUpdate & https://mainnet.cash/tutorial/ & https://github.com/cashonize/wallet/blob/main/script.js
// Make sure your BCMR is loading at the ipfs.nftstorage.link gateway before starting. Alternatively, adjust bcmrFile.

import {
  Wallet,
  TestNetWallet,
  utf8ToBin,
  sha256,
  OpReturnData,
} from "mainnet-js";

//
// VARIABLES
//
// replace with your seedphrase and be sure to protect it
const seedPhrase = "gunter glieben glauten globen";

const derivationPathAddress = "m/44'/145'/0'/0/0"; // last number is the address index from electron cash, if you are using it.

// If using 2 BCMRs, both files must be identical as this script only hashes the IPFS one.
// the CID if your BCMR file uploaded to IPFS, starts with 'baf'. Recommend nft.storage.
const bcmrCID = "bafxxx";
const dnsBCMR = "example.com"; // FQDN, can be left blank

// test it first on chipnet
// get tBCH from https://tbch.googol.cash/
const network = "mainnet"; // mainnet or chipnet

//
// SCRIPT
//
// establish wallet
const walletClass = network == "mainnet" ? Wallet : TestNetWallet;
const wallet = await walletClass.fromSeed(seedPhrase, derivationPathAddress);

// test wallet for sufficient balance
const walletAddress = wallet.getDepositAddress();
const balance = await wallet.getBalance();

console.log(`wallet address: ${walletAddress}`);
console.log(
  `Bch amount in walletAddress is ${balance.bch}bch or ${balance.sat}sats`
);

if (balance.sat < 1000)
  throw new Error("Not enough BCH to make the transaction!");

// hash the BCMR file
const bcmrFile = `https://${bcmrCID}.ipfs.nftstorage.link/`;
const reponse = await fetch(bcmrFile);
const bcmrContent = await reponse.text();
const bcmrHash = sha256.hash(utf8ToBin(bcmrContent));

// create BCMR opreturn
const ipfsBCMRLink = `ipfs://${bcmrCID}`;
let bcmrChunks = ["BCMR", bcmrHash, ipfsBCMRLink];
if (dnsBCMR) {
  bcmrChunks.push(dnsBCMR);
}
let opreturnData = OpReturnData.fromArray(bcmrChunks);

const authBase = { cashaddr: walletAddress, value: 800, unit: "sats" };
const outputs = [authBase, opreturnData];

// create transaction,identity output and opreturn
// change output is automatic.
let walletUtxos = await wallet.getAddressUtxos();
const preGenesisUTXO = walletUtxos.filter(
  (utxo) => !utxo.token && utxo.vout === 0
)[0];

// output txid
const { txId } = await wallet.send(outputs, { ensureUtxos: [preGenesisUTXO] });

// Log transaction ID
const explorerUrl =
  network === "mainnet"
    ? `https://explorer.bitcoinunlimited.info/tx/${txId}`
    : `https://chipnet.bch.ninja/tx/${txId}`;
console.log(`Transaction ID: ${explorerUrl}`);
