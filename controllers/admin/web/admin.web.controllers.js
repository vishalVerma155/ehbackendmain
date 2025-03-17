const Admin = require('../../../models/admin/web/admin.model.js');
const User = require('../../../models/user/web/user.model.js');
const { hashPassword, comparePassword } = require('../../../utils/bcrypt.js');
const generateJWT = require('../../../utils/jwt.js');
const mongoose = require('mongoose');
const axios = require('axios');

const registerAdmin = async (req, res) => {
    try {

        const { fullName, email, password } = req.body;

        const isAdminExisted = await Admin.find();
        console.log(isAdminExisted);
        if (isAdminExisted.length >= 1) {
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
        res.status(200).json({ Message: "Admin has been  sucessfully register.", Admin: newUser });
    } catch (error) {
        return res.status(400).json({ Error: error.message });
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

        // generate jwt token
        const accessToken = generateJWT({
            _id: user._id,
            email: user.email,
            role: user.role
        });

        res.cookie("AccessToken", accessToken); // set jwt token in cookies

        // return response
        res.status(200).json({ Message: "Admin has been  sucessfully Loged in.", Admin: user, token: accessToken });
    } catch (error) {
        return res.status(400).json({ Error: error.message });
    }
};

const editAdmin = async (req, res) => {
    const data = req.body;
    console.log(data);
    res.status(200).json({ Message: "Admin has been  sucessfully Loged in.", Admin: data });
}

const getAllUsersList = async (req, res) => {

    try {

        let all_Users_List;
        const { userType } = req.body;
        if (!userType) {
            all_Users_List = await User.find();
            return res.status(200).json({ Message: `All users has been successfully fetched.`, users: all_Users_List });
        }
        all_Users_List = await User.find({ role: userType });
        return res.status(200).json({ Message: `${userType} has been successfully fetched.`, users: all_Users_List });

    } catch (error) {
        return res.status(400).json({ Error: error.message });
    }
}

const searchUser = async (req, res) => {
    try {
        const body = req.body;
        const user = await User.findOne(body);
        return res.status(200).json({ Message: `User has been successfully fetched.`, user });
    } catch (error) {
        return res.status(400).json({ Error: error.message });
    }
}

const getAffiliateTree = async (req, res) => {
    try {
        const userId = req.params.userId;

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

        console.log(JSON.stringify(affiliateTree));

        if (!affiliateTree.length) {
            return res.status(404).json({ message: "User not found" });
        }

        // Convert the flat array into a hierarchical tree
        const structuredTree = buildAffiliateTree(affiliateTree[0]);

        res.json(structuredTree); // Return structured tree
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
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

// auto login in any user account
const autoLogin = (req, res) => { };

module.exports = { registerAdmin, loginAdmin, getAllUsersList, searchUser, editAdmin, getAffiliateTree };
