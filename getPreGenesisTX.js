// getPreGenesisTX.js
// ht https://github.com/cashonize/wallet/blob/main/script.js

import { Wallet, TestNetWallet } from "mainnet-js";

// replace with your seedphrase and be sure to protect it
const seedphrase = "gunter glieben glauten globen";

const derivationPathAddress = "m/44'/145'/0'/0/0";

const network = "mainnet";

const walletClass = network == "mainnet" ? Wallet : TestNetWallet;
const wallet = await walletClass.fromSeed(seedphrase, derivationPathAddress);

const balance = await wallet.getBalance();

async function getValidPreGenesis() {
  let walletUtxos = await wallet.getAddressUtxos();
  return walletUtxos.filter((utxo) => !utxo.token && utxo.vout === 0);
}
if (balance.sat) {
  let validPreGenesis = await getValidPreGenesis();
  if (validPreGenesis.length === 0) {
    await wallet.send([
      { cashaddr: wallet.tokenaddr, value: 10000, unit: "sat" },
    ]);
    console.log("Created output with vout zero for token genesis");
    validPreGenesis = await getValidPreGenesis();
  }
  const tokenId = validPreGenesis[0].txid;
  console.log(`Pre-Genesis Transaction: ${tokenId}`);
} else {
  console.log("No BCH");
}

getValidPreGenesis();
