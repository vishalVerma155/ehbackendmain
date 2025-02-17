const User = require('../../../models/user/web/user.model.js')
// const generateJWT = require('../../utils/jwt.js');
// const { comparePassword, hashPassword } = require('../../utils/bcrypt.js');


// const registerAffiliate = async (req, res) => {
//     try {

//         const totalCount = await User.find({ role: "affiliate" }).countDocuments(); // get total count of register affiliate
        //    const affiliateId = `AF${totalCount + 1}`; // create affiliate id
        //    const referrerAffiliateId = req.query.aff_id; // get referrer affiliate id

        //    let referrerAff; // declair referrer affiliate

        //    if (referrerAffiliateId) {
        //       referrerAff = await Affiliate.findOne({ // find referrer affiliate
        //          affiliateId: referrerAffiliateId
        //       });
        //       if (!referrerAff) {
        //          return res.status(404).json({ Error: "  Refferrer Affiliate not found" });
        //       }
        //    }

        //    const {
        //       firstName,
        //       lastName,
        //       email,
        //       phoneNumber,
        //       userName,
        //       country,
        //       password
        //    } = req.body;

        //    // check blank fields
        //    const isBlank = [firstName, email, phoneNumber, userName, password, country].some(fields => fields.trim() === "");

        //    if (isBlank) {
        //       return res.status(401).json({ Message: "All fields are compulsary" });
        //    }

        //    // check if affiliate is already existed
        //    const isUserExisted = await Affiliate.findOne({ $or: [{ userName }, { email }] });

        //    if (isUserExisted) {
        //       return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
        //    }

        //    const hashedPassword = await hashPassword(password);
        //    // create affiliate
        //    const newUser = new Affiliate({
        //       firstName,
        //       lastName,
        //       email,
        //       phoneNumber,
        //       userName,
        //       country,
        //       affiliateId,
        //       referrer: referrerAff ? referrerAff._id : null,
        //       password: hashedPassword
        //    })

        //    if (referrerAff) {
        //       referrerAff.referredUsers.push(newUser._id);
        //       await referrerAff.save();
        //    }

        //    // save affiliate
        //    await newUser.save();

        //    const user = await Affiliate.findOne({ $or: [{ userName }, { email }] }); // double  check user

        //    if (!user) {
        //       return res.status(404).json({ Message: "User not found. There is something problem in user data saving" });
        //    }

        //    // return response
        //    res.status(200).json({ Message: "Affiliate has been  sucessfully register.", affiliate: user });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// };

// product register with google authentication


// register affiliate with google
const registerAffiliateWithGoogle = async (req, res) => {
    try {
        

            const totalCount = await User.find({ role: "affiliate" }).countDocuments(); // get total count of register affiliate
               const affiliateId = `AF${totalCount + 1}`; // create affiliate id
               const {firstName,lastName,email,googleId, aff_id} = req.body; // get affiliate id
               const referrerAffiliateId = aff_id; // get referrer affiliate id
    
               let referrerAff; // declair referrer affiliate
    
               if (referrerAffiliateId) {
                  referrerAff = await User.findOne({ // find referrer affiliate
                     affiliateId: referrerAffiliateId
                  });
                  if (!referrerAff) {
                     return res.status(404).json({ Error: "  Refferrer Affiliate not found" });
                  }
               }
    
    
               // check blank fields
               const isBlank = [firstName,lastName,email,googleId].some(fields => fields.trim() === "");
    
               if (isBlank) {
                  return res.status(401).json({ Message: "All fields are compulsary" });
               }
    
               // check if affiliate is already existed
               const isUserExisted = await User.findOne({ email : email });
    
               if (isUserExisted) {
                  return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
               }
    
               // create affiliate
               const newUser = new User({
                  firstName,
                  lastName,
                  email,
                  affiliateId,
                  referrer: referrerAff ? referrerAff._id : null,
                  googleId
               })
    
               if (referrerAff) {
                  referrerAff.referredUsers.push(newUser._id);
                  await referrerAff.save();
               }
    
               // save affiliate
               await newUser.save();
    
               const user = await User.findOne({ email : newUser.email }); // double  check user
    
               if (!user) {
                  return res.status(404).json({ Message: "User not found. There is something problem in user data saving" });
               }
    
               // return response
               res.status(200).json({ Message: "Affiliate has been  sucessfully register.", affiliate: user });
     } catch (error) {
        res.status(500).json({ success: false, error: error.message });
     }
};

// generate affiliate link
const generateAffiliateLink = (req, res) => {
    try {
       const { productUrl, affiliateId } = req.body;
       const url = new URL(productUrl);
       url.searchParams.append("aff_id", affiliateId);
       return res.status(200).json(url);
    } catch (error) {
       res.status(500).json({ success: false, error: error.message });
    }
 };

module.exports = { generateAffiliateLink, registerAffiliateWithGoogle};