const Admin = require('../../../models/admin/web/admin.model.js');
const User = require('../../../models/user/web/user.model.js');
const { hashPassword, comparePassword } = require('../../../utils/bcrypt.js');
const generateJWT = require('../../../utils/jwt.js');
const mongoose = require('mongoose');
const axios = require('axios');
const { generateTokenVersion } = require('../../../utils/crypto.js');


const registerAdmin = async (req, res) => {
    try {

        const { fullName, email, password } = req.body;

        const isAdminExisted = await Admin.find();

        if (isAdminExisted.length > 1) {
            return res.status(401).json({ Message: "Admin is already existed. There can be only one admin" })
        }

        // check blank fields
        const isBlank = [fullName, email, password].some(fields => fields.trim() === "");

        if (isBlank) {
            return res.status(401).json({ Message: "All fields are compulsary" });
        }


        const hashedPassword = await hashPassword(password);

        // create admin
        const newUser = new Admin({
            fullName,
            email,
            password: hashedPassword
        })

        // save admin
        await newUser.save();


        if (!newUser) {
            return res.status(404).json({ Message: "Something wen wrong. Admin not saved." });
        }

        // return response
        res.status(200).json({ success: true, Message: "Admin has been  sucessfully register." });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};


// login admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check blank fields
        const isBlank = [email, password].some(fields => fields.trim() === "");

        if (isBlank) {
            return res.status(401).json({ Message: "All fields are compulsary" });
        }

        // check admin is existed
        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(401).json({ Message: "Admin is not existed." });
        }

        // compare password
        const isPasswordCorrect = await comparePassword(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ Message: "Invalid password" });
        }

        const rawToken = generateTokenVersion();
        const hashedTokenVersion = await hashPassword(rawToken);

        // generate jwt token
        const accessToken = generateJWT({
            _id: user._id,
            email: user.email,
            role: user.role,
            tokenVersion: rawToken
        });

        user.tokenVersion = hashedTokenVersion;
        await user.save();

        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }); // set jwt token in cookies

        // return response
        res.status(200).json({ success: true, Message: "Admin has been  sucessfully Loged in." });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};


const deleteAnyUser = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "Only admin can delete profile" });
        }
        const userId = req.params.userId; // get user id

        if (!userId) {
            return res.status(404).json({ success: false, error: "User id not found" });
        }

        const deletedUser = await User.findByIdAndDelete(userId); // find and delete user

        if (!deletedUser) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, Message: "User has been sucessfully deleted", deletedUser }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const changeAdminPassword = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(401).json({ success: false, error: "Only admin can do this" });
        }

        const { currentPassword, newPassword } = req.body; // take details

        if (!currentPassword || currentPassword && currentPassword.trim() === "" || !newPassword || newPassword && newPassword.trim() === "") {
            return res.status(401).json({ success: false, error: "Please enter all fields" });
        }

        const userId = req.user._id;
        const admin = await Admin.findById(userId);

        // compare password
        const isPasswordCorrect = await comparePassword(currentPassword, admin.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, error: "password is not matched" });
        }

        const newHashedPassword = await hashPassword(newPassword); // hash new password
        admin.password = newHashedPassword;

        await admin.save(); // save user password

        return res.status(200).json({ success: true, Message: "Password has been chenged" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllUsersList = async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can do this" });
        }

        let all_Users_List;
        const { userType } = req.body;
        if (!userType) {
            all_Users_List = await User.find();
            return res.status(200).json({ success: true, Message: `All users has been successfully fetched.`, users: all_Users_List });
        }
        all_Users_List = await User.find({ role: userType });
        return res.status(200).json({ success: true, Message: `${userType} has been successfully fetched.`, users: all_Users_List });

    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}

const editAnyUser = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "Only admin can do this" })
        }
        const { firstName, lastName, email, phoneNumber, userName, groups, password, storeName, country, address, soloSale, clubName, vendorStatus } = req.body;
        const user = req.params.userId;
        const img = req.file?.path || undefined; // get image


        if (!user) {
            return res.status(500).json({ success: false, error: "User id not found" });
        }

        let payload = {};

        if (firstName && firstName.trim() !== "") {
            payload.firstName = firstName;
        }

        if (lastName && lastName.trim() !== "") {
            payload.lastName = lastName;
        }

        if (country && country.trim() !== "") {
            payload.country = country;
        }

        if (email && email.trim() !== "") {
            payload.email = email;
        }

        if (userName && userName.trim() !== "") {
            payload.userName = userName;
        }

        if (phoneNumber && phoneNumber.trim() !== "") {
            payload.phoneNumber = phoneNumber;
        }

        if (groups && groups.trim() !== "") {
            payload.groups = groups;
        }

        if (storeName && storeName.trim() !== "") {
            payload.storeName = storeName;
        }


        if (password && password.trim() !== "") {
            const newHashedPassword = await hashPassword(password); // hash new password
            payload.password = newHashedPassword;
        }

        if (address && address.trim() !== "") {
            payload.address = address;
        }

        if (img && img.trim() !== "") {
            payload.image = img;
        }

        if (soloSale && soloSale.trim() !== "") {
            payload.soloSale = soloSale;
        }

        if (clubName && clubName.trim() !== "") {
            payload.clubName = clubName;
        }

        if (vendorStatus && vendorStatus.trim() !== "") {
            payload.vendorStatus = vendorStatus;
        }

        const updatedAffiliate = await User.findByIdAndUpdate(user, payload, { new: true, runValidators: true });

        if (!updatedAffiliate) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        if (vendorStatus) {
            const notification = await axios.post(
                "https://ehbackendmain.onrender.com/notification/createNotification",
                {
                    recipient: updatedAffiliate._id,
                    heading: `Vendor registration request has been ${updatedAffiliate.vendorStatus}`,
                    message: `Your vendor request has been ${updatedAffiliate.vendorStatus} from Earning handle.${updatedAffiliate.vendorStatus === "approved"? "Welcome to Earning handle family" : "Sorry for the inconvenience caused."}`,
                    sender: req.user._id,
                    senderRole: req.user.role,
                    receiverRole: updatedAffiliate.role
                }
            );
        }

        return res.status(200).json({ success: true, message: "User is updated", updatedAffiliate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

const searchUser = async (req, res) => {
    try {
        const body = req.body;
        const user = await User.findOne(body);
        return res.status(200).json({ success: true, Message: `User has been successfully fetched.`, user });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}

// const getAffiliateTree = async (req, res) => {
//     try {
//         const userId = req.params.userId;

//         const affiliateTree = await User.aggregate([
//             {
//                 $match: { _id: new mongoose.Types.ObjectId(userId) } // Find the root user
//             },
//             {
//                 $graphLookup: {
//                     from: "users",           // Collection to search (same collection)
//                     startWith: "$_id",       // Start from the given user ID
//                     connectFromField: "_id", // The field in 'users' that should be matched
//                     connectToField: "referrer", // The field in 'users' referring to another user
//                     as: "referrals",        // Store results in 'referrals' array
//                     depthField: "depth",     // Stores the depth level of each referral

//                 }
//             },
//             {
//                 $project: {
//                     firstName: 1,
//                     lastName: 1,
//                     email: 1,
//                     referrals: {
//                         _id: 1,
//                         firstName: 1,
//                         lastName: 1,
//                         email: 1,
//                         referrer: 1
//                     }
//                 }
//             }
//         ]);

//         console.log(JSON.stringify(affiliateTree));

//         if (!affiliateTree.length) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Convert the flat array into a hierarchical tree
//         const structuredTree = buildAffiliateTree(affiliateTree[0]);

//         res.json(structuredTree); // Return structured tree
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error" });
//     }


// }

// Function to build a nested affiliate tree
// function buildAffiliateTree(user) {
//     const userMap = new Map(); // Map to store users by _id

//     // Add the root user to the map
//     userMap.set(user._id.toString(), { ...user, referrals: [] });

//     // Map all referrals
//     user.referrals.forEach(referral => {
//         userMap.set(referral._id.toString(), { ...referral, referrals: [] });
//     });



//     // Assign each referral to its correct parent
//     user.referrals.forEach(referral => {
//         if (referral.referrer) {
//             const parent = userMap.get(referral.referrer.toString());
//             if (parent) {
//                 parent.referrals.push(userMap.get(referral._id.toString()));
//             }
//         }
//     });

//     // Return the root user with a nested structure
//     return userMap.get(user._id.toString());
// }

// auto login in any user account

const getFullAffiliateTree = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "You are not authrized for this. Only admin can do this." })
        }

        const rootAffiliates = await User.aggregate([
            {
                $match: {
                    role: 'affiliate',
                    referrer: null // Only top-level affiliates (no parent)
                }
            },
            {
                $graphLookup: {
                    from: 'users',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'referrer',
                    as: 'referrals',
                    depthField: 'depth'
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    referrer: 1,
                    referrals: {
                        _id: 1,
                        userId: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        referrer: 1
                    }
                }
            }
        ]);

        if (!rootAffiliates.length) {
            return res.status(404).json({ message: 'No root affiliates found' });
        }

        // Build structured trees for each root affiliate
        const fullTree = rootAffiliates.map(root => buildAffiliateTree(root));

        res.json({ success: true, tree: fullTree });

    } catch (error) {
        console.error('Error building full affiliate tree:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Function to build a nested affiliate tree
function buildAffiliateTree(user) {
    const userMap = new Map();

    // Add the root user to the map
    userMap.set(user._id.toString(), {
        _id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        children: []
    });

    // Map all referrals
    user.referrals.forEach(ref => {
        userMap.set(ref._id.toString(), {
            _id: ref._id,
            userId: ref.userId,
            firstName: ref.firstName,
            lastName: ref.lastName,
            email: ref.email,
            children: []
        });
    });

    // Link referrals to their parents
    user.referrals.forEach(ref => {
        if (ref.referrer) {
            const parent = userMap.get(ref.referrer.toString());
            if (parent) {
                parent.children.push(userMap.get(ref._id.toString()));
            }
        }
    });

    // Return the structured root node
    return userMap.get(user._id.toString());
}

// refresh api
const authenticationApiAdmin = (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(401).json({ success: false, message: "Wrong user role" });
        }

        return res.status(200).json({ success: true, message: "Authentication successfully." });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
}

module.exports = { registerAdmin, loginAdmin, getAllUsersList, searchUser, changeAdminPassword, deleteAnyUser, editAnyUser, authenticationApiAdmin, getFullAffiliateTree };
