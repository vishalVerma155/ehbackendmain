const User = require('../../../../models/user/web/user.model.js');
const Counter = require('../../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../../utils/bcrypt.js');
const Settings = require('../../../../models/admin/settings/settings.model.js')

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
            return res.status(404).json({ Error: "  Refferrer Affiliate not found" });
         }
      }

      // check blank fields
      const isBlank = [firstName, email, password].some(fields => fields.trim() === "");

      if (isBlank) {
         return res.status(401).json({ Message: "First Name, Email, Password are compulsary" });
      }

      // check if affiliate is already existed
      const isUserExisted = await User.findOne({ email });

      // 
      if (isUserExisted) {
         return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
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
         groups : defaultGroup
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

      const user = await User.findOne({ email: newUser.email }); // double  check user

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


      if (googleId) {

         if (googleId.trim() === "") {
            return res.status(401).json({ Message: "Google id not found." });
         }

         const referrerAffiliateId = aff_id; // get referrer affiliate id

         let referrerAff; // declair referrer affiliate

         if (referrerAffiliateId) {
            referrerAff = await User.findOne({ // find referrer affiliate
               userId: referrerAffiliateId
            });
            if (!referrerAff) {
               return res.status(404).json({ Error: "  Refferrer Affiliate not found" });
            }
         }

         const isUserExisted = await User.findOne({ googleId: googleId });

         if (!isUserExisted) {
            // check blank fields
            const isBlank = [firstName, lastName, email].some(fields => fields.trim() === "");

            if (isBlank) {
               return res.status(401).json({ Message: "All fields are compulsary" });
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
               groups : defaultGroup
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

            return res.status(200).json({ Message: "Affiliate has been  sucessfully register.", affiliate: newUser });
         }


         const payload = {
            _id: isUserExisted._id,
            email: isUserExisted.email
         }

         // generate jwt token
         const accessToken = generateJWT(payload);

         res.cookie("AccessToken", accessToken);

         return res.status(200).json({ Message: "Affiliate has been  sucessfully Loged in.", affiliate: isUserExisted, token: accessToken });
      }

      return res.status(404).json({ Error: "Google id not found" });

   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// login user
const loginAffiliate = async (req, res) => {
   try {
      const { userName, password } = req.body;

      if (userName.trim() === "" || password.trim() === "") {
         return res.status(401).json({ Message: "All fields are compulsary" });
      }

      const user = await User.findOne({ $or: [{ userName }, { email: userName }] });


      if (!user) {
         return res.status(401).json({ Message: "User is not existed." });
      }

      // compare password
      const isPasswordCorrect = await comparePassword(password, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({ Message: "Invalid password" });
      }

      const payload = {
         _id: user._id,
         email: user.email
      }

      // generate jwt token
      const accessToken = generateJWT(payload);

      res.cookie("AccessToken", accessToken);

      // return response
      return res.status(200).json({ Message: "Affiliate has been  sucessfully Loged in.", affiliate: user, token: accessToken });
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

      const { firstName, lastName, country } = req.body;
      const user = req.user._id;

      if (!user) {
         return res.status(500).json({ success: false, message: "Affiliate is not loged in" });
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

      const updatedAffiliate = await User.findByIdAndUpdate(user, payload, { new: true, runValidators: true });

      if (!updatedAffiliate) {
         return res.status(400).json({ success: false, message: "Affiliate is not updated" });
      }

      return res.status(200).json({ success: true, message: "Affiliate is updated", updatedAffiliate });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }

}

// delete affiliate profile

const deleteAffiliateProfile = async (req, res) => {
   try {
      const userId = req.user._id; // get user id

      const { password } = req.body;

      const user = await User.findById(userId); // find and delete user
      if (!user) {
         return res.status(404).json({ Message: "User not found" });
      }

      const isPasswordCorrect = await comparePassword(password, user.password);
      if (!isPasswordCorrect) {
         return res.status(402).json({ Message: "Wrong password" });
      }

      const deletedAffiliate = await User.findByIdAndDelete(user._id); // find and delete user
      res.clearCookie("AccessToken"); // clear cookies for logout
      return res.status(200).json({ Message: "Affiliate has been sucessfully deleted", deletedAffiliate }); // return response
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

// change affiliate password

const changeAffiliatePaswword = async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body; // take details

      if (currentPassword.trim() === "" || newPassword.trim() === "") {
         return res.status(401).json({ Message: "Please enter all fields" });
      }

      const user = await User.findById(req.user._id);
      console.log(user);

      // compare password
      const isPasswordCorrect = await comparePassword(currentPassword, user.password);

      if (!isPasswordCorrect) {
         return res.status(401).json({ Message: "password is not matched" });
      }

      const newHashedPassword = await hashPassword(newPassword); // hash new password
      user.password = newHashedPassword;

      await user.save(); // save user password

      return res.status(200).json({ Message: "Password has been chenged" });
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}




module.exports = { generateAffiliateLink, registerAffiliateWithGoogle, registerAffiliate, loginAffiliate, editAffiliate, deleteAffiliateProfile, changeAffiliatePaswword };