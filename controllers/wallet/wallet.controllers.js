const Wallet = require('../../models/wallet/wallet.model.js');

const createOrGetWallet = async (req, res) => {

    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const isWalletExisted = await Wallet.findOne({ userId });


        if (isWalletExisted) {
            return res.status(200).json({ success: true, wallet: isWalletExisted });
        }

        const wallet = new Wallet({
            userId,
            balance: 0,
            transactions: []
        });

        await wallet.save();

        if (!wallet) {
            return res.status(404).json({ success: false, error: "Wallet not created" });
        }

        return res.status(200).json({ success: true, wallet : {balance : wallet.balance} });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getWallterCurrUser = async(req, res) =>{
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const isWalletExisted = await Wallet.findOne({ userId });

        const paidBalance = isWalletExisted.transactions
        .filter((field) => field.drCr === "DR")
        .reduce((total, field) => total + field.amount, 0);

        if(!isWalletExisted){
            return res.status(404).json({ success: false, error: "Wallet not found" });
        }

        return res.status(200).json({ success: true, wallet :{balance : isWalletExisted.balance, paidBalance } });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
 
const addTranstionData = async (req, res) => {
    try {
        const { transactionId, amount, status, commissionReceipt, giverId, getterId } = req.body;
        
        const isBlank = [transactionId, String(amount) , status, commissionReceipt].some((field) => field.trim() === "");

        if (isBlank) {
            return res.status(404).json({ success: false, error: "transactionId, type, amount, status, commission receipt are compulsary " });
        }
        
        const getterWallet = await Wallet.findOne({ userId: getterId });

        if (!getterWallet) {
            return res.status(404).json({ success: false, error: "Getter wallet not found" });
        }

        const giverWallet = await Wallet.findOne({ userId: giverId });

        if (!giverWallet) {
            return res.status(404).json({ success: false, error: "Giver wallet not found" });
        }

        const giverPayload = {
            transactionId,
            type: "commission_payment",
            amount,
            drCr: "DR",
            status: status,
            details: {
                bankDeposit: {
                    bankName: "pnb",
                    accountNumber: "123",
                    referenceId: "1234",
                    IFSC: "PUNB0094800"
                },
                commissionReceipt
            },
            createdAt : new Date()
        }

        giverWallet.balance -= Number(amount);
        giverWallet.transactions.push(giverPayload);
        await giverWallet.save();

        const getterPayload = {
            transactionId,
            type: "commission_received",
            amount,
            drCr: "CR",
            status: status,
            details: {
                bankDeposit: {
                    bankName: "pnb",
                    accountNumber: "123",
                    referenceId: "1234",
                    IFSC: "PUNB0094800"
                },
                commissionReceipt
            },
            createdAt : new Date()
        }
        
      
        getterWallet.balance +=  Number(amount);
        getterWallet.transactions.push(getterPayload);
        await getterWallet.save();

        return res.status(200).json({ success: true, message: "Commission has been updated in giver and getter walletes" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getLedger = async(req, res) =>{
    try {

        const userId = req.user._id;
        const {startDate, endDate, type} = req.body;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const wallet = await Wallet.findOne({userId});

        if(!wallet){
            return res.status(404).json({ success: false, error: "User wallet not found." });
        }

        let transactions = wallet.transactions;

        let balance = 0;
    
        // Apply Filters (Optional)
        transactions = transactions
            .filter(txn => {
                let txnDate = new Date(txn.createdAt
                );
                let inDateRange = true, inType = true;
                
                if (startDate && endDate) {
                    inDateRange = txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
                }
                if (type) {
                    inType = txn.type === type;
                }
    
                return inDateRange && inType;
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by date
            .map(txn => {
                let amount = txn.amount;
                if (txn.drCr === "DR") balance -= amount;
                else balance += amount;
    
                return {
                    date: new Date(txn.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    transactionId: txn.transactionId,
                    type: txn.type.replace("_", " "),
                    debit: txn.drCr === "DR" ? amount : "-",
                    credit: txn.drCr === "CR" ? amount : "-",
                    balance: balance
                };
            });
    
            return res.status(200).json({ success: true, message: "Ledger has been made", ledger : transactions });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const getLedgerByUserId = async(req, res) =>{
    try {

        const userId = req.params.userId;
        const {startDate, endDate, type} = req.body;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const wallet = await Wallet.findOne({userId});

        if(!wallet){
            return res.status(404).json({ success: false, error: "User wallet not found." });
        }

        let transactions = wallet.transactions;

        let balance = 0;
    
        // Apply Filters (Optional)
        transactions = transactions
            .filter(txn => {
                let txnDate = new Date(txn.createdAt
                );
                let inDateRange = true, inType = true;
                
                if (startDate && endDate) {
                    inDateRange = txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
                }
                if (type) {
                    inType = txn.type === type;
                }
    
                return inDateRange && inType;
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by date
            .map(txn => {
                let amount = txn.amount;
                if (txn.drCr === "DR") balance -= amount;
                else balance += amount;
    
                return {
                    date: new Date(txn.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    transactionId: txn.transactionId,
                    type: txn.type.replace("_", " "),
                    debit: txn.drCr === "DR" ? amount : "-",
                    credit: txn.drCr === "CR" ? amount : "-",
                    balance: balance
                };
            });
    
            return res.status(200).json({ success: true, message: "Ledger has been made", ledger : transactions });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
    
}

module.exports = { createOrGetWallet, addTranstionData, getLedger, getLedgerByUserId, getWallterCurrUser };