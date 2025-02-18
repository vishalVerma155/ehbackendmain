const User = require('../../../models/user/web/user.model.js');
const Counter = require('../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../utils/bcrypt.js');

// register affiliate with email id and password
const registerAffiliate = async (req, res) => {
   try {
      const {
         firstName,
         lastName,
         email,
         phoneNumber,
         userName,
         country,
         password,
         aff_id
      } = req.body;

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
      const isBlank = [firstName, email, password].some(fields => fields.trim() === "");

      if (isBlank) {
         return res.status(401).json({ Message: "First Name, Email, Password are compulsary" });
      }

      // check if affiliate is already existed
      const isUserExisted = await User.findOne({ email}); 

      // 
      if (isUserExisted) {
         return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
      }

      const hashedPassword = await hashPassword(password);
      // create affiliate
      const newUser = new User({
         firstName,
         lastName,
         email,
         phoneNumber,
         userName,
         country : country ? country : "India",
         affiliateId : "fa1",
         referrer: referrerAff ? referrerAff._id : null,
         password: hashedPassword
      })

      const count = await Counter.increment('affiliate');
      const affiliateId = `AF${count}`; // create affiliate id
      newUser.affiliateId = affiliateId;

      if (referrerAff) {
         referrerAff.referredUsers.push(newUser._id); // push user id into referrer tree
         await referrerAff.save();
      }

      // save affiliate
      await newUser.save();

      const user = await User.findOne({ email : newUser.email}); // double  check user

      if (!user) {
         return res.status(404).json({ Message: "User not found. There is something problem in user data saving" });
      }

      // return response
      res.status(200).json({ Message: "Affiliate has been  sucessfully register.", affiliate: user });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
};


// register affiliate with google
const registerAffiliateWithGoogle = async (req, res) => {
   try {
      const { firstName, lastName, email, googleId, aff_id } = req.body; // get affiliate id
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
      const isBlank = [firstName, lastName, email, googleId].some(fields => fields.trim() === "");

      if (isBlank) {
         return res.status(401).json({ Message: "All fields are compulsary" });
      }

      // check if affiliate is already existed
      const isUserExisted = await User.findOne({ email: email });

      if (isUserExisted) {
         return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
      }

      // create affiliate
      const newUser = new User({
         firstName,
         lastName,
         email,
         affiliateId : "fa1",
         referrer: referrerAff ? referrerAff._id : null, // check reffere is existed or not
         googleId
      })

      const count = await Counter.increment('affiliate');
      const affiliateId = `AF${count}`; // create affiliate id
      newUser.affiliateId = affiliateId;

      if (referrerAff) {
         referrerAff.referredUsers.push(newUser._id); // push refered user id in refferer array 
         await referrerAff.save(); // save referrer user 
      }

      // save affiliate
      await newUser.save();

      const user = await User.findOne({ email: newUser.email }); // double  check user

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
      const { productUrl, affiliateId } = req.body; // get website link
      const url = new URL(productUrl); // make new url
      url.searchParams.append("aff_id", affiliateId); // add affiliate id in url
      return res.status(200).json(url); // return update link
   } catch (error) {
      res.status(500).json({ success: false, error: error.message }); // 
   }
};

module.exports = { generateAffiliateLink, registerAffiliateWithGoogle, registerAffiliate };