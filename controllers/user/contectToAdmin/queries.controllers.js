const Query = require('../../../models/user/contectToAdmin/contectToAdmin.model.js');

// create contect to admin register

const registerQueries = async (req, res) => {

    try {
        const queryData = req.body; // get querie data
        const { subject, body } = req.body; // get subject field and body for validation
        const userId =  req.user._id;

        if(!userId){
            return res.status(404).json({ success: false, error: "User id not found" }); // subject and body
        }

        if (!subject || subject && subject.trim() === "" || !body || body && body.trim() === "") {
            return res.status(404).json({ success: false, error: "Subject and body fiels are mandetory." }); // subject and body
        }

        const attachment = req.file ? req.file.path : undefined; // check is there any attachment

        const query = new Query({ ...queryData, attachment, userId }); // register query
        await query.save(); // save query in database

        const registeredQuery = await Query.findById(query._id); // check register query

        if (!registeredQuery) {
            return res.status(500).json({ success: false, error: "Query has not been created" });
        }

        return res.status(200).json({ success: true, Message: "Query has been registered", Query: registeredQuery }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

// view all Queries

const viewQueris = async (req, res) => {
    try {
        if(req.user.role !== "admin"){
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }
        const {status, firstName, phoneNumber} = req.body;

        const payload = {};

        if(status && status.trim() !== ""){
            payload.status = status;
        }

        if(firstName && firstName.trim() !== ""){
            payload.firstName = firstName;
        }

        if(phoneNumber && phoneNumber.trim() !== ""){
            payload.phoneNumber = phoneNumber;
        }


        const queries = await Query.find(payload).populate("userId", "firstName userId email role"); // get all queries
        return res.status(200).json({ success: true, All_Queries: queries });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const viewQuerisOfUser = async (req, res) => {
    try {
        const userId =  req.user._id;

        if(!userId){
            return res.status(404).json({ success: false, error: "User id not found" }); // subject and body
        }

        const {status} = req.body;

        const payload = {};

        payload.userId = userId;

        if(status && status.trim() !== ""){
            payload.status = status;
        }


        const queries = await Query.find(payload).populate("userId", "firstName userId email role");; // get all queries
        return res.status(200).json({ success: true, All_Queries_Of_User: queries });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// view single querie

const viewSingleQuery = async (req, res) => {

    try {
        const queryId = req.params.queryId; // get query id

        if (!queryId) {
            return res.status(404).json({ success: false, error: "Query id not found" });
        }
        const query = await Query.findById(queryId).populate("userId", "firstName userId email role");; // find query
    
        if (!query) {
            return res.status(404).json({ success: false, error: "Query not found. Wrong query id" })
        }
    
        return res.status(200).json({ success: true, Query: query }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// update query

const editQuery = async (req, res) => {

    try {

        if(req.user.role !== "admin"){
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }
        const queryId = req.params.queryId; // get query id
        const { status } = req.body;
    
        if (!queryId) {
            return res.status(400).json({success: false, error: "Query id not found" }); // check query id
        }
    
        if(!status || status && status.trim() === ""){
            return res.status(400).json({success: false, error: "Blank status is not allowed." }); // check query id
        }
    
        const query = await Query.findByIdAndUpdate(queryId, { status }, { new: true }); // find and update query
    
        if (!query) {
            return res.status(400).json({ success: false, error: "Wrong query id" });
        }
    
        return res.status(200).json({success: true, Message: " Query has been updated", updatedQuery: query }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

// delete query

// const deleteQuery = async (req, res) => {

//     try {
//         const queryId = req.params.queryId; // get query id

//         if (!queryId) {
//             return res.status(404).json({success: false, error: "Query Id not found" });
//         }
    
//         const deletedQuery = await Query.findByIdAndDelete(queryId); // find and delete query
//         if (!deletedQuery) {
//             return res.status(400).json({success: false, error: "Wrong query id" });
//         }
    
//         return res.status(200).json({success: true, Message: "Query has been deleted", deletedQuery }); // return response
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// }

module.exports = { registerQueries, viewQueris, viewSingleQuery, editQuery,  viewQuerisOfUser };