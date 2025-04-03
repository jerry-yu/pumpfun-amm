const { PumpAmmSdk, Direction, Pool, transactionFromInstructions } = require("@pump-fun/pump-swap-sdk");
const { PublicKey } = require("@solana/web3.js");
const { Transaction } = require("@solana/web3.js");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
const { Keypair } = require("@solana/web3.js");
const { Wallet } = require("@solana/web3.js");
const { TransactionInstruction } = require("@solana/web3.js");
const { SystemProgram } = require("@solana/web3.js");
const BN = require('bn.js');
const bs58 = require("bs58");
const { Connection, } = require('@solana/web3.js');

async function swap() {
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=??");
    const pumpAmmSdk = new PumpAmmSdk(connection);

    const user =
        Keypair.fromSecretKey(bs58.decode("private-key"));

    console.log("User Public Key: ", user.publicKey.toString());
    const poolAddress = new PublicKey("3eJUvWdm3HkhvpUV5W5x16rn2oe8mB7a2mvjfKt8dpBG");
    const slippage = 10;
    const quoteAmount = new BN(100);
    const baseAmount = await pumpAmmSdk.swapAutocompleteBaseFromQuote(
        poolAddress,
        quoteAmount,
        slippage,
        "QuoteToBase",
    );

    console.log("Quote Amount: ", baseAmount.toString());

    const poolInfo = await pumpAmmSdk.fetchPool(poolAddress);
    console.log("Pool Info: ", poolInfo);

    // buy from sol -> meme
    const buyInstructions = await pumpAmmSdk.swapQuoteInstructions(
        poolAddress,
        quoteAmount,
        slippage,
        "quoteToBase",
        user.publicKey,
    );
    const blockhash = await connection.getLatestBlockhash();
    const buyTx = transactionFromInstructions(user.publicKey, buyInstructions, blockhash.blockhash, [user]);
    //console.log("Transaction: ", buyTx.message.compiledInstructions);
    

    const buyRes = await connection.simulateTransaction(buyTx, { sigVerify: true });
    console.log(" simulate  ", buyRes)


    const sellInstructions = await pumpAmmSdk.swapBaseInstructions(
        poolAddress,
        quoteAmount,
        slippage,
        "baseToQuote",
        user.publicKey,
    );
    const sellTx = transactionFromInstructions(user.publicKey, sellInstructions, blockhash.blockhash, [user]);
    //console.log("Transaction: ", sellTx.message.compiledInstructions);
    

    const res = await connection.simulateTransaction(sellTx, { sigVerify: true });
    console.log(" simulate  ", res)
    //const signature = await sendAndConfirmTransaction(transaction);
}

swap();