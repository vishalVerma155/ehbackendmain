const Wallet = require('../../models/wallet/wallet.model.js');
const User = require("../../models/user/web/user.model.js");
const WalletTransaction = require("../../models/wallet/walletTranstions.model.js");
const mongoose = require('mongoose');

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
            balance: 0
        });

        await wallet.save();

        if (!wallet) {
            return res.status(404).json({ success: false, error: "Wallet not created" });
        }

        return res.status(200).json({ success: true, wallet: { balance: wallet.balance } });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getWallterCurrUser = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const isWalletExisted = await Wallet.findOne({ userId });

        if (!isWalletExisted) {
            return res.status(404).json({ success: false, error: "Wallet not found" });
        }

        const paidBalance = isWalletExisted.transactions
            .filter((field) => field.drCr === "DR")
            .reduce((total, field) => total + field.amount, 0);

        return res.status(200).json({ success: true, wallet: { balance: isWalletExisted.balance, paidBalance } });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const addTranstionData = async (req, res) => {
    console.log("1");
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("2");

    try {
        console.log("3");

        const { transactionId, amount, status, commissionReceipt, giverId, getterId } = req.body;
        console.log("4");

        // Validation
        const isBlank = [transactionId, String(amount), status, commissionReceipt].some((field) => field.trim() === "");
        console.log("5");

        if (isBlank) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: "transactionId, amount, status, commissionReceipt are required.",
            });
        }
        console.log("6");

        // Fetch wallets
        const getterWallet = await Wallet.findOne({ userId: getterId }).session(session);
        console.log("7");

        if (!getterWallet) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Getter wallet not found" });
        }
        console.log("8");

        const giverWallet = await Wallet.findOne({ userId: giverId }).session(session);
        console.log("9");

        if (!giverWallet) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Giver wallet not found" });
        }
        console.log("10");

        if (giverWallet.balance < Number(amount)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "Insufficient balance in giver wallet" });
        }
        console.log("11");

        // Update giver's wallet balance
        giverWallet.balance -= Number(amount);
        await giverWallet.save({ session });
        console.log("12");

        // Create giver's wallet transaction
        const giverTransaction = new WalletTransaction({
            userId: giverId,
            transactionId: transactionId + "-DR",
            type: "commission_payment",
            amount,
            drCr: "DR",
            status,
            details: {
                commissionReceipt
            }
        });
        console.log("13");

        await giverTransaction.save({ session });
        console.log("14");

        // Update getter's wallet balance
        getterWallet.balance += Number(amount);
        await getterWallet.save({ session });
        console.log("15");

        // Create getter's wallet transaction
        const getterTransaction = new WalletTransaction({
            userId: getterId,
            transactionId: transactionId + "-CR",
            type: "commission_received",
            amount,
            drCr: "CR",
            status,
            details: {
                commissionReceipt
            }
        });
        await getterTransaction.save({ session });
        console.log("16");

        await session.commitTransaction();
        session.endSession();
        console.log("17");

        return res.status(200).json({
            success: true,
            message: "Transaction completed successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, error: error.message });
    }
};


// const addTranstionData = async (req, res) => {

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { transactionId, amount, status, commissionReceipt, giverId, getterId } = req.body;

//         const isBlank = [transactionId, String(amount) , status, commissionReceipt].some((field) => field.trim() === "");

//         if (isBlank) {
//             return res.status(404).json({ success: false, error: "transactionId, type, amount, status, commission receipt are compulsary " });
//         }

//         const getterWallet = await Wallet.findOne({ userId: getterId }).session(session);

//         if (!getterWallet) {
//             return res.status(404).json({ success: false, error: "Getter wallet not found" });
//         }

//         const giverWallet = await Wallet.findOne({ userId: giverId }).session(session);

//         if (!giverWallet) {
//             return res.status(404).json({ success: false, error: "Giver wallet not found" });
//         }

//         if (giverWallet.balance < Number(amount)) {
//             return res.status(400).json({ success: false, error: "Insufficient balance in giver wallet" });
//         }

//         const giverPayload = {
//             transactionId,
//             type: "commission_payment",
//             amount,
//             drCr: "DR",
//             status: status,
//             details: {
//                 bankDeposit: {
//                     bankName: "pnb",
//                     accountNumber: "123",
//                     referenceId: "1234",
//                     IFSC: "PUNB0094800"
//                 },
//                 commissionReceipt
//             }
//         }

//         giverWallet.balance -= Number(amount);
//         giverWallet.transactions.push(giverPayload);
//         await giverWallet.save();

//         const getterPayload = {
//             transactionId,
//             type: "commission_received",
//             amount,
//             drCr: "CR",
//             status: status,
//             details: {
//                 bankDeposit: {
//                     bankName: "pnb",
//                     accountNumber: "123",
//                     referenceId: "1234",
//                     IFSC: "PUNB0094800"
//                 },
//                 commissionReceipt
//             }
//         }


//         getterWallet.balance +=  Number(amount);
//         getterWallet.transactions.push(getterPayload);
//         await getterWallet.save();

//         return res.status(200).json({ success: true, message: "Commission has been updated in giver and getter walletes" });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }

// }

const getLedger = async (req, res) => {
    try {

        const userId = req.user._id;
        const { startDate, endDate, type } = req.body;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ success: false, error: "User wallet not found." });
        }

        let transactions = await WalletTransaction.find({ userId }).sort({ createdAt: 1 });

        let balance = 0;
        let openingBalance = 0;

        // Apply Filters (Optional)
        transactions = transactions
            .filter(txn => {
                let txnDate = new Date(txn.createdAt
                );
                let inDateRange = true, inType = true;

                if (startDate && endDate) {
                    inDateRange = txnDate >= new Date(`${startDate}T00:00:00.000Z`) && txnDate <= new Date(`${endDate}T23:59:59.999Z`);
                }
                if (type) {
                    inType = txn.type === type;
                }

                if (txnDate < new Date(startDate)) {

                    if (txn.drCr === "DR") {
                        openingBalance -= txn.amount;
                    } else {
                        openingBalance += txn.amount;
                    }
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
                    balance: balance + openingBalance
                };
            });

        return res.status(200).json({ success: true, message: "Ledger has been made", ledger: transactions, openingBalance });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const getLedgerByUserId = async (req, res) => {
    try {

        const userId = req.params.userId;
        const { startDate, endDate, type } = req.body;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
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

        return res.status(200).json({ success: true, message: "Ledger has been made", ledger: transactions });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { createOrGetWallet, addTranstionData, getLedger, getLedgerByUserId, getWallterCurrUser };