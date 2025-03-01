const MarketingProgram = require('../../../../../models/user/vendor/marketTools/programs/program.model.js');

const createMarketingProgram = async (req, res) =>{

    try {
        const data = req.body;
        const {programName} = req.body;
        const userId = req.user._id;
    
        
        if(!userId){
            return res.status(404).json({ success: false, error: "user id not found" });
        }
    
        if(!programName || !data){
            return res.status(404).json({ success: false, error: "data not found" });
        }
    
        const makertingProgram = new MarketingProgram({
            userId,
            ...data});
    
        await makertingProgram.save();
    
        if(!makertingProgram){
            return res.status(500).json({ success: false, error: "error in creating marketing program" });
        }
    
        return res.status(200).json({ success: true, makertingProgram });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getMarketingProgram = async (req, res) =>{

    try {
        const programId = req.params.programId;
    
        if(!programId){
            return res.status(404).json({ success: false, error: "program id not found" });
        }
    
        const program = await MarketingProgram.findById(programId);
    
        if(!program){
            return res.status(500).json({ success: false, error: "program not found" });
        }
    
        return res.status(200).json({ success: true, program });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getAllMarketingProgramForAdmin = async (req, res) =>{

    try {
        const programs = await MarketingProgram.find();
        return res.status(200).json({ success: true, programs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getAllMarketingProgramForVendor = async (req, res) =>{

    try {
        const userId = req.user._id;
        const programs = await MarketingProgram.find({userId});
        return res.status(200).json({ success: true, programs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const editMarketingProgram =async (req, res) =>{

    try {
        const programId = req.params.programId;
        const data = req.body;
      
        
            if(!programId){
                return res.status(404).json({ success: false, error: "program id not found" });
            }
    
            const updatedProgram = await MarketingProgram.findByIdAndUpdate(programId, data,{new : true});
        
            if(!updatedProgram){
                return res.status(500).json({ success: false, error: "program not found" });
            }
    
            return res.status(200).json({ success: true, updatedProgram });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const deleteMarketingProgram =async (req, res) =>{

    try {
        const programId = req.params.programId;
        
            if(!programId){
                return res.status(404).json({ success: false, error: "program id not found" });
            }
    
            const deletedProgram = await MarketingProgram.findByIdAndDelete(programId);
        
            if(!deletedProgram){
                return res.status(500).json({ success: false, error: "program not found" });
            }
    
            return res.status(200).json({ success: true, deletedProgram });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = {createMarketingProgram, editMarketingProgram, getAllMarketingProgramForAdmin, getMarketingProgram, deleteMarketingProgram, getAllMarketingProgramForVendor}