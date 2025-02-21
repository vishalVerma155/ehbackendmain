

const registerBankDetails = async(req, res) =>{
    const {accountName, accountNumber, IFSCCode, bankName, bankAddress, city, state} = req.body;

   const isBlank = [accountName, accountNumber, IFSCCode, bankName, bankAddress, city, state].some(field => field.trim() === "");


}