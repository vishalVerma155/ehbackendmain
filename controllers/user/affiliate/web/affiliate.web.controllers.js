const User = require('../../../../models/user/web/user.model.js');
const Counter = require('../../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../../utils/bcrypt.js');
const Settings = require('../../../../models/admin/settings/settings.model.js');
const axios = require('axios');
const UAParser = require('ua-parser-js');


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
            userId: referrerAffiliateId
         });


         if (!referrerAff) {
            return res.status(404).json({ success: false, error: "  Refferrer Affiliate not found" });
         }
      }

      // check blank fields

      if (!firstName || firstName && firstName.trim() === "" || !email || email && email.trim() === "" || !password || password && password.trim() === "") {
         return res.status(401).json({ success: false, error: "First Name, Email, Password are compulsary" });
      }


      // check if affiliate is already existed
      const isUserExisted = await User.findOne({ email });


      if (isUserExisted) {
         return res.status(401).json({ success: false, error: "User is already existed. Please login or choose other user name" });
      }

      const hashedPassword = await hashPassword(password);
      const settings = await Settings.findOne();
      const defaultGroup = settings ? settings.defaultGroup : "prime";

      // create affiliate
      const newUser = new User({
         firstName,
         lastName,
         email,
         phoneNumber,
         userName,
         country: country ? country : "India",
         userId: "fa1",
         referrer: referrerAff ? referrerAff._id : null,
         password: hashedPassword,
         groups: defaultGroup
      })

      await newUser.save(); // save user

      const count = await Counter.increment('affiliate');
      const affiliateId = `AF${count}`; // create affiliate id
      newUser.userId = affiliateId;

      if (referrerAff) {
         referrerAff.referredUsers.push(newUser._id); // push user id into referrer tree
         await referrerAff.save();
      }

      // save affiliate
      await newUser.save();

      if (!newUser) {
         return res.status(404).json({ success: false, error: "User not found. There is something problem in user data saving" });
      }

      const wallet = await axios.post(`https://ehbackendmain.onrender.com/wallet/createWallet/${newUser._id}`);

      // return response
      res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully register.", affiliate: newUser, walletCreated: wallet.data.success });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
};


// register affiliate with google
const registerAffiliateWithGoogle = async (req, res) => {

   try {
      const { firstName, lastName, email, googleId, aff_id } = req.body; // get affiliate id


      if (googleId && googleId.trim() !== "") {

         const referrerAffiliateId = aff_id; // get referrer affiliate id

         let referrerAff; // declair referrer affiliate

         if (referrerAffiliateId) {
            referrerAff = await User.findOne({ // find referrer affiliate
               userId: referrerAffiliateId
            });
            if (!referrerAff) {
               return res.status(404).json({ success: false, error: "  Refferrer Affiliate not found" });
            }
         }

         const isUserExisted = await User.findOne({ googleId: googleId });

         if (!isUserExisted) {
            // check blank fields

            if (!firstName || firstName && firstName.trim() === "" || !email || email && email.trim() === "") {
               return res.status(401).json({ success: false, error: "First Name, Email, Password are compulsary" });
            }


            const settings = await Settings.findOne();
            const defaultGroup = settings ? settings.defaultGroup : "prime";

            // create affiliate
            const newUser = new User({
               firstName,
               lastName,
               email,
               userId: "fa1",
               referrer: referrerAff ? referrerAff._id : null, // check reffere is existed or not
               googleId,
               groups: defaultGroup
            })

            await newUser.save(); // save user

            const count = await Counter.increment('affiliate');
            const affiliateId = `AF${count}`; // create affiliate id
            newUser.userId = affiliateId;

            if (referrerAff) {
               referrerAff.referredUsers.push(newUser._id); // push refered user id in refferer array 
               await referrerAff.save(); // save referrer user 
            }

            // save affiliate
            await newUser.save();

            const wallet = await axios.post(`https://ehbackendmain.onrender.com/wallet/createWallet/${newUser._id}`);

            const payload = {
               _id: newUser._id,
               email: newUser.email,
               role: newUser.role
            }

            // generate jwt token
            const accessToken = generateJWT(payload);

            res.cookie("AccessToken", accessToken);

            return res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully register.", affiliate: newUser, token: accessToken, walletCreated : wallet.data.success });
         }

         if(isUserExisted.role !== "affiliate"){
            return res.status(404).json({ success: false, error: "Invalid user" });
         }

         const payload = {
            _id: isUserExisted._id,
            email: isUserExisted.email,
            role: isUserExisted.role
         }

         // generate jwt token
         const accessToken = generateJWT(payload);

         res.cookie("AccessToken", accessToken);

         return res.status(200).json({success: true, Message: "Affiliate has been  sucessfully Loged in.", affiliate: isUserExisted, token: accessToken });
      }

      return res.status(404).json({success: false, error: "Google id not found" });

   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// login user
const loginAffiliate = async (req, res) => {
   try {
      const { userName, password } = req.body;

      if (!userName || userName && userName.trim() === "" || !password || password && password.trim() === "") {
         return res.status(401).json({success: false, error: "All fields are compulsary" });
      }

      const user = await User.findOne({ $or: [{ userName }, { email: userName }] });


      if (!user) {
         return res.status(401).json({success: false, error: "User is not existed." });
      }

      if(user.role !== "affiliate"){
         return res.status(401).json({success: false, error: "Invalid user" });
      }

      // compare password
      const isPasswordCorrect = await comparePassword(password, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({success: false, error: "Invalid password" });
      }

      const payload = {
         _id: user._id,
         email: user.email,
         role : user.role
      }

      // generate jwt token
      const accessToken = generateJWT(payload);

      res.cookie("AccessToken", accessToken);

      // return response
      return res.status(200).json({success: true, Message: "Affiliate has been  sucessfully Loged in.", affiliate: user, token: accessToken });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }

}

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

// edit affiliate
const editAffiliate = async (req, res) => {
   try {

      const { firstName, lastName, country, address } = req.body;
      const user = req.user._id;

      if (!user) {
         return res.status(500).json({ success: false, error: "Affiliate is not loged in" });
      }

      let payload = {};
      if (firstName) {
         payload.firstName = firstName;
      }

      if (lastName) {
         payload.lastName = lastName;
      }

      if (country) {
         payload.country = country;
      }

      if (address) {
         payload.address = address;
      }

      const updatedAffiliate = await User.findByIdAndUpdate(user, payload, { new: true, runValidators: true });

      if (!updatedAffiliate) {
         return res.status(400).json({ success: false, error: "Affiliate is not updated" });
      }

      return res.status(200).json({ success: true, message: "Affiliate is updated", updatedAffiliate });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }

}

// get all affiliates
const getAllAffiliates = async(req, res) =>{
   try {
      const role = req.user.role;
      if(!role || role !== "admin"){
         return res.status(401).json({ success: false, error: "Only admin can do this" });
      }

      const aff_list = await User.find({role : "affiliate"});
      return res.status(200).json({ success: true, affiliatesList : aff_list });

   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

// delete affiliate profile
const deleteAffiliateProfile = async (req, res) => {
   try {
      const userId = req.params.userId; // get user id

      if (!userId) {
         return res.status(404).json({success: false, error: "User id not found" });
      }

      const deletedAffiliate = await User.findByIdAndDelete(userId); // find and delete user
      
      if (!deletedAffiliate) {
         return res.status(404).json({success: false, error: "Affiliate not found" });
      }

      return res.status(200).json({success: true, Message: "Affiliate has been sucessfully deleted", deletedAffiliate }); // return response
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

// get affiliate by affiliate id
const getUserByUserId = async (req, res) => {
   try {
      const userId = req.params.userId;
      if (!userId) {
         return res.status(404).json({ success: false, error: "User id  not found." });
      }

      const user = await User.findOne({ userId });

      if (!user) {
         return res.status(404).json({ success: false, error: "User not found." });
      }

      return res.status(200).json({ success: true, user });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

// change affiliate password

const changeAffiliatePaswword = async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body; // take details

      if (!currentPassword || currentPassword && currentPassword.trim() === "" || !newPassword || newPassword && newPassword.trim() === "") {
         return res.status(401).json({success: false, error: "Please enter all fields" });
      }

      const userId = req.user._id;
      const user = await User.findById(userId);

      // compare password
      const isPasswordCorrect = await comparePassword(currentPassword, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({success: false, error: "password is not matched" });
      }

      const newHashedPassword = await hashPassword(newPassword); // hash new password
      user.password = newHashedPassword;

      await user.save(); // save user password

      return res.status(200).json({success: true, Message: "Password has been chenged" });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

const getAffiliateProfile = async (req, res) => {
   try {
       const userId = req.user._id; // get user id
       // console.log(req.headers["user-agent"])
       const ua = req.headers['user-agent'];
       const parser = new UAParser(ua);
       const result = parser.getResult();
       const trackedMob = {
           browser: `${result.browser.name} - ${result.browser.version}`,
           os: `${result.os.name} - Version: ${result.os.version}`,
           mobileModel: result.device.model || '',
       };

       if (!userId) {
           return res.status(404).json({ success: false, error: "User is not loged in" });
       }

       const affiliateProfile = await User.findById(userId).select("-password -referrer -referredUsers "); // find and delete user

       return res.status(200).json({ success: true, Message: "Affiliate has been sucessfully fetched", affiliateProfile, trackedMob }); // return response
   } catch (error) {
       return res.status(500).json({ success: false, error: error.message });
   }
}




module.exports = { generateAffiliateLink, registerAffiliateWithGoogle, registerAffiliate, loginAffiliate, editAffiliate, deleteAffiliateProfile, changeAffiliatePaswword, getUserByUserId, getAllAffiliates, getAffiliateProfile };