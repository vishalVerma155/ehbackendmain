const User = require('../../../../models/user/web/user.model.js');
const Counter = require('../../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../../utils/bcrypt.js');
const Settings = require('../../../../models/admin/settings/settings.model.js');
const axios = require('axios');
const UAParser = require('ua-parser-js');
const mongoose = require('mongoose');
const { generateTokenVersion } = require('../../../../utils/crypto.js');
const Admin = require('../../../../models/admin/web/admin.model.js');
const { getIO } = require('../../../../socket/index.js');
const generateOTP = require('../../../../utils/otpGenerater.js');
const { sendOTPEmail } = require('../../../../utils/emailServices.js');
const { sendSMS } = require('../../../../utils/phoneOtpServices.js');



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


      const admin = await Admin.findOne({ role: "admin" });

      const notification = await axios.post(
         "https://ehbackendmain.onrender.com/notification/createNotification",
         {
            recipient: admin._id,
            heading: `New user registered in Affiliate panel.`,
            message: `${newUser.firstName} has been registered in ${newUser.role}`,
            sender: newUser._id,
            senderRole: newUser.role,
            receiverRole: admin.role
         }
      );

      // return response
      res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully register.", });
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

            const rawToken = generateTokenVersion();
            const hashedTokenVersion = await hashPassword(rawToken);


            const payload = {
               _id: newUser._id,
               email: newUser.email,
               role: newUser.role,
               tokenVersion: rawToken
            }

            newUser.tokenVersion = hashedTokenVersion;
            await newUser.save();

            // generate jwt token
            const accessToken = generateJWT(payload);

            res.cookie("AccessToken", accessToken, {
               httpOnly: true,
               secure: true,
               sameSite: 'None'
            });

            const admin = await Admin.findOne({ role: "admin" });

            const notification = await axios.post(
               "https://ehbackendmain.onrender.com/notification/createNotification",
               {
                  recipient: admin._id,
                  heading: `New user registered in Affiliate panel.`,
                  message: `${newUser.firstName} has been registered in ${newUser.role}`,
                  sender: newUser._id,
                  senderRole: newUser.role,
                  receiverRole: admin.role
               }
            );

            return res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully register." });
         }

         if (isUserExisted.role !== "affiliate") {
            return res.status(404).json({ success: false, error: "Invalid user" });
         }

         const rawToken = generateTokenVersion();
         const hashedTokenVersion = await hashPassword(rawToken);

         const payload = {
            _id: isUserExisted._id,
            email: isUserExisted.email,
            role: isUserExisted.role,
            tokenVersion: rawToken
         }

         isUserExisted.tokenVersion = hashedTokenVersion;
         await isUserExisted.save();

         // generate jwt token
         const accessToken = generateJWT(payload);

         res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
         });



         return res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully Loged in." });
      }

      return res.status(404).json({ success: false, error: "Google id not found" });

   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// login user
const loginAffiliate = async (req, res) => {
   try {

      const { userName, password } = req.body;

      if (!userName || userName && userName.trim() === "" || !password || password && password.trim() === "") {
         return res.status(401).json({ success: false, error: "All fields are compulsary" });
      }

      const user = await User.findOne({ $or: [{ userName }, { email: userName }] });


      if (!user) {
         return res.status(401).json({ success: false, error: "User is not existed." });
      }

      if (user.role !== "affiliate") {
         return res.status(401).json({ success: false, error: "Invalid user" });
      }

      // compare password
      const isPasswordCorrect = await comparePassword(password, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({ success: false, error: "Invalid password" });
      }


      const rawToken = generateTokenVersion();
      const hashedTokenVersion = await hashPassword(rawToken);


      const payload = {
         _id: user._id,
         email: user.email,
         role: user.role,
         tokenVersion: rawToken
      }

      user.tokenVersion = hashedTokenVersion;
      await user.save();

      // generate jwt token
      const accessToken = generateJWT(payload);

      res.cookie("AccessToken", accessToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'None'
      });


      const io = getIO();
      io.to("admin").emit("notification", {
         message: ` New ${user.role} Loged in: ${user.firstName}`,
      });

      // return response
      return res.status(200).json({ success: true, Message: "Affiliate has been  sucessfully Loged in." });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }

}

// generate affiliate link
const generateAffiliateLink = async (req, res) => {
   try {
      const afId = req.user._id;

      if (!afId) {
         return res.status(400).json({ success: false, error: "User is not loged in" })
      }
      const affiliate = await User.findById(afId);

      if (!affiliate) {
         return res.status(400).json({ success: false, error: "User not found" })
      }
      const affiliateId = affiliate.userId;
      const productUrl = "http://localhost:5173/register"; // get website link
      const url = new URL(productUrl); // make new url
      url.searchParams.append("aff_id", affiliateId); // add affiliate id in url
      return res.status(200).json({ success: true, referalLink: url }); // return update link
   } catch (error) {
      res.status(500).json({ success: false, error: error.message }); // 
   }
};

// edit affiliate
const editAffiliate = async (req, res) => {
   try {

      const { firstName, lastName, country, address, soloSale, clubName } = req.body;
      const user = req.user._id;
      const img = req.file?.path || undefined; // get image


      if (!user) {
         return res.status(500).json({ success: false, error: "Affiliate is not loged in" });
      }

      if (req.user.role !== "admin" && clubName) {
         return res.status(500).json({ success: false, error: "Sorry club will be updated according to your performance" });
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

      if (img) {
         payload.image = img;
      }

      if (soloSale && soloSale.trim() !== "") {
         payload.soloSale = soloSale;
      }

      if (clubName && clubName.trim() !== "") {
         payload.clubName = clubName;
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


// Request OTP
const forgotPassword = async (req, res) => {

   try {
      const { email, phoneNumber } = req.body;

      const payload = {};

      if (email && email.trim() !== "") {
         payload.email = email;
      }

      if (phoneNumber) {
         payload.phoneNumber = phoneNumber;
      }

      const user = await User.findOne(payload);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const otp = generateOTP();
      const hashedOTP = await hashPassword(otp);

      user.otp = hashedOTP;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      if (email && email.trim() !== "") {
         await sendOTPEmail(email, otp);
      }

      if (phoneNumber) {
         await sendSMS(otp, phoneNumber, user.firstName);
      }

      res.status(200).json({ success: true, message: `OTP sent to ${email ? email : phoneNumber}` });

   } catch (error) {
      res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
   }
};

const loginViaPhoneAffiliate = async (req, res) => {

   try {
      const { phoneNumber } = req.body;

      const user = await User.findOne({ phoneNumber });
      if (!user || user.role !== 'affiliate') { return res.status(404).json({ success: false, error: 'User not found' }); }

      const otp = generateOTP();
      const hashedOTP = await hashPassword(otp);

      user.otp = hashedOTP;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      const otpResponse = await sendSMS(otp, phoneNumber, user.firstName);
      res.status(200).json({ success: true, message: 'OTP sent to phone number', otpResponse });

   } catch (error) {
      res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
   }
};

// Verify OTP and Reset Password


const matchOTP = async (req, res) => {
   try {
      const { email, otp, type, phoneNumber } = req.body;

      if (type !== 'forget' && type !== 'login') {
         return res.status(404).json({ success: false, error: "Type is compulsary" })
      }

      const credential = {};

      if (email && email.trim() !== "") {
         credential.email = email
      }

      if (phoneNumber) {
         credential.phoneNumber = phoneNumber
      }

      const user = await User.findOne(credential);
      if (!user) {
         return res.status(400).json({ success: false, error: 'User not found' });
      }


      if (user.otpExpires < Date.now()) {
         return res.status(400).json({ message: 'OTP has expired' });
      }

      const isOTPCorrect = await comparePassword(otp, user.otp);

      if (!isOTPCorrect) {
         return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }

      if (type === 'forget') {
         return res.status(200).json({ success: true, message: 'Otp matched' });
      }

      const rawToken = generateTokenVersion();
      const hashedTokenVersion = await hashPassword(rawToken);


      const payload = {
         _id: user._id,
         email: user.email,
         role: user.role,
         tokenVersion: rawToken
      }

      user.otp = undefined;
      user.otpExpires = undefined;
      user.tokenVersion = hashedTokenVersion;
      await user.save();

      // generate jwt token
      const accessToken = generateJWT(payload);

      res.cookie("AccessToken", accessToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'None'
      });

      return res.status(200).json({ success: true, message: 'User has been successfully loged in.' });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// Verify OTP and Reset Password
const resetPassword = async (req, res) => {
   try {
      const { email, otp, newPassword, phoneNumber } = req.body;

      const credential = {};

      if (email && email.trim() !== "") {
         credential.email = email
      }

      if (phoneNumber) {
         credential.phoneNumber = phoneNumber
      }

      const user = await User.findOne(credential);

      if (!user) {
         return res.status(400).json({ success: false, error: 'User not found' });
      }

      if (!user.otp) {
         return res.status(400).json({ success: false, error: 'Otp not found' });
      }
      
      if (!user.otpExpires || user.otpExpires < Date.now()) {
         return res.status(400).json({ message: 'OTP has expired' });
      }
      
      const isOTPCorrect = await comparePassword(otp, user.otp);
      
      if (!isOTPCorrect) {
         return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }
      
      const hashedPassword = await hashPassword(newPassword);
     
      user.password = hashedPassword;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
   
      res.status(200).json({ success: true, message: 'Password reset successful' });
   } catch (error) {
      res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
   }
};



// change affiliate password

const changeAffiliatePaswword = async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body; // take details

      if (!currentPassword || currentPassword && currentPassword.trim() === "" || !newPassword || newPassword && newPassword.trim() === "") {
         return res.status(401).json({ success: false, error: "Please enter all fields" });
      }

      const userId = req.user._id;
      const user = await User.findById(userId);

      // compare password
      const isPasswordCorrect = await comparePassword(currentPassword, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({ success: false, error: "password is not matched" });
      }

      const newHashedPassword = await hashPassword(newPassword); // hash new password
      user.password = newHashedPassword;

      await user.save(); // save user password

      return res.status(200).json({ success: true, Message: "Password has been chenged" });
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

const getCurrUserAffTree = async (req, res) => {
   try {
      const userId = req.user._id;

      if (req.user.role !== "affiliate") {
         return res.status(404).json({ success: false, error: "Invalid user for get affiliate tree" });
      }

      const affiliateTree = await User.aggregate([
         {
            $match: { _id: new mongoose.Types.ObjectId(userId) } // Find the root user
         },
         {
            $graphLookup: {
               from: "users",           // Collection to search (same collection)
               startWith: "$_id",       // Start from the given user ID
               connectFromField: "_id", // The field in 'users' that should be matched
               connectToField: "referrer", // The field in 'users' referring to another user
               as: "referrals",        // Store results in 'referrals' array
               depthField: "depth",     // Stores the depth level of each referral

            }
         },
         {
            $project: {
               firstName: 1,
               lastName: 1,
               email: 1,
               referrals: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  referrer: 1
               }
            }
         }
      ]);


      if (!affiliateTree.length) {
         return res.status(404).json({ success: false, error: "User not found" });
      }

      // Convert the flat array into a hierarchical tree
      const structuredTree = buildAffiliateTree(affiliateTree[0]);

      return res.status(200).json({ success: true, message: "Affiliate tree has been successfully fetched.", structuredTree })
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
}

// Function to build a nested affiliate tree
function buildAffiliateTree(user) {
   const userMap = new Map(); // Map to store users by _id

   // Add the root user to the map
   userMap.set(user._id.toString(), { ...user, referrals: [] });

   // Map all referrals
   user.referrals.forEach(referral => {
      userMap.set(referral._id.toString(), { ...referral, referrals: [] });
   });



   // Assign each referral to its correct parent
   user.referrals.forEach(referral => {
      if (referral.referrer) {
         const parent = userMap.get(referral.referrer.toString());
         if (parent) {
            parent.referrals.push(userMap.get(referral._id.toString()));
         }
      }
   });

   // Return the root user with a nested structure
   return userMap.get(user._id.toString());
}

const logouUser = async (req, res) => {
   try {

      let user = undefined;

      if (req.user.role === 'admin') {
         const userId = req.user._id;
         user = await Admin.findById(userId);
      }

      if (req.user.role !== 'admin') {
         const userId = req.user._id;
         user = await User.findById(userId);
      }

      user.tokenVersion = undefined;
      await user.save();

      res.clearCookie('AccessToken', {
         httpOnly: true,
         secure: true,
         sameSite: 'None'
      });
      return res.status(200).json({ success: true, message: "User has been successfully loged out" })
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

const authenticationApiAffiliate = (req, res) => {
   try {

      if (req.user.role !== "affiliate") {
         return res.status(401).json({ success: false, message: "Wrong user role" });
      }

      return res.status(200).json({ success: true, message: "Authentication successfully." });
   } catch (error) {
      res.status(404).json({ success: false, error: error.message });
   }
}



module.exports = { generateAffiliateLink, registerAffiliateWithGoogle, registerAffiliate, loginAffiliate, editAffiliate, changeAffiliatePaswword, getUserByUserId, getAffiliateProfile, getCurrUserAffTree, logouUser, authenticationApiAffiliate, resetPassword, forgotPassword, matchOTP, loginViaPhoneAffiliate };