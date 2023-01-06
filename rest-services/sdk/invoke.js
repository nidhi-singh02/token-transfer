'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

var invoke = async function (channelID, chaincode, contractName, functionName, functionArgs) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');

        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelID);

        // Get the contract from the network.
        const contract = network.getContract(chaincode, contractName);

      //  const transactionID = contract.createTransaction(functionName).getTransactionId();
    
       const transaction = contract.createTransaction(functionName);
       const transactionId = transaction.getTransactionId()
       let response;

       console.log("transactionId",transactionId)
    //    response = transaction.submit(functionArgs.userID, functionArgs.amount, transactionId,channelID);

        // Submit the specified transaction.
        if (functionName == "TransferToken") {
            response = await contract.submitTransaction(functionName, functionArgs.receiverID, functionArgs.amount,"SBI");

        } else if (functionName == "ApproveToken") {
            response = await contract.submitTransaction(functionName, functionArgs.receiverID, functionArgs.amount);

        } else if (functionName == "TransferTokenFrom") {
            response = await contract.submitTransaction(functionName, functionArgs.senderID, functionArgs.userID, functionArgs.amount, "SBI",transactionId);

        } else if (functionName == "MintToken") {
            response = await contract.submitTransaction(functionName, functionArgs.userID, functionArgs.amount, transactionId,channelID);

         }else if (functionName == "RegisterUser") {
            response = await contract.submitTransaction(functionName, functionArgs.userID, functionArgs.bankID);

        }
        else {
            response = await contract.submitTransaction(functionName, functionArgs);
        }

        
        console.log('Transaction has been submitted', response.toString());

        // Disconnect from the gateway.
        await gateway.disconnect();

        return response.toString()

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return error
    }
}

module.exports = {
    invoke: invoke

}