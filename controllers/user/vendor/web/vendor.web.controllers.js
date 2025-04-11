const User = require('../../../../models/user/web/user.model.js');
const Counter = require('../../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../../utils/bcrypt.js');
const axios = require("axios");

// register vendor with email id and password
const registerVendor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            userName,
            country,
            password,
            store
        } = req.body;


        // check blank fields
        if (!firstName || firstName && firstName.trim() === "" || !email || email && email.trim() === "" || !password || password && password.trim() === "" || !store || store && store.trim() === "") {
            return res.status(401).json({ success: false, error: "First Name, Email, Password and store name are compulsary" });
        }

        // check if affiliate is already existed
        const isUserExisted = await User.findOne({ email });

        // 
        if (isUserExisted) {
            return res.status(401).json({success: false, error: "User is already existed. Please login or choose other user name" });
        }

        const hashedPassword = await hashPassword(password);
        // create Vendor
        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            userName,
            country: country ? country : "India",
            password: hashedPassword,
            storeName: store,
            role: "vendor",
            userId: "NV1"
        })

        // save affiliate
        await newUser.save();

        const count = await Counter.increment('vendor');
        const vendorId = `VN${count}`; // create affiliate id
        newUser.userId = vendorId;

        // save affiliate
        await newUser.save();

        // create wallet
        const wallet = await axios.post(`https://ehbackendmain.onrender.com/wallet/createWallet/${newUser._id}`);

        // return response
        res.status(200).json({success: true, Message: "Vendor has been  sucessfully register.", vendor: newUser, walletCreated: wallet.data.success });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// register vendor with google
const registerVendorWithGoogle = async (req, res) => {
    try {
        const { firstName, lastName, email, googleId } = req.body; // get affiliate id


        if (googleId && googleId.trim() !== "") {

            const isUserExisted = await User.findOne({ googleId: googleId });

            if (!isUserExisted) {
                // check blank fields

                if (!firstName || firstName && firstName.trim() === "" || !email || email && email.trim() === "") {
                    return res.status(401).json({ success: false, error: "First Name, Email, Password are compulsary" });
                 }
                


                // create affiliate
                const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    userId: "fa1",
                    googleId,
                    role: "vendor"
                })

                await newUser.save(); // save user

                const count = await Counter.increment('vendor');
                const vendorId = `VN${count}`; // create affiliate id
                newUser.userId = vendorId;

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

                return res.status(200).json({ success: true, Message: "Vendor has been sucessfully register.", vendor: newUser, token : accessToken, walletCreated: wallet.data.success });
            }


            const payload = {
                _id: isUserExisted._id,
                email: isUserExisted.email,
                role: isUserExisted.role
            }

            // generate jwt token
            const accessToken = generateJWT(payload);

            res.cookie("AccessToken", accessToken);


            return res.status(200).json({ success: true, Message: "vendor has been  sucessfully Loged in.", vendor: isUserExisted, token: accessToken });
        }

        return res.status(404).json({ success: false, error: "Google id not found" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// login vendor
const loginVendor = async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || userName && userName.trim() === "" || !password || password && password.trim() === "") {
            return res.status(401).json({success: false, error: "All fields are compulsary" });
        }

        const user = await User.findOne({ $or: [{ userName }, { email: userName }] });


        if (!user) {
            return res.status(401).json({success: false, error: "User is not existed." });
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
        return res.status(200).json({success: true, Message: "Vendor has been sucessfully Loged in.", vendor: user, token: accessToken });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getVendorProfile = async(req, res) =>{
    try {
        const userId = req.user._id; // get user id

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const vendorProfile = await User.findById(userId).select("-password -referrer -referredUsers "); // find and delete user

        return res.status(200).json({ success: true, Message: "Vendor has been sucessfully fetched", vendorProfile }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editVendor = async (req, res) => {

    try {
        const { firstName, lastName, storeName, country, address } = req.body;
        const user = req.user._id;

        if (!user || user && user.trim() === "") {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        let payload = {};

        if (firstName) {
            payload.firstName = firstName;
        }

        if (lastName) {
            payload.lastName = lastName;
        }

        if (storeName) {
            payload.storeName = storeName;
        }

        if (country) {
            payload.country = country;
        }

        if (address) {
            payload.address = address;
         }

        const updatedVendor = await User.findByIdAndUpdate(user, payload, { new: true, runValidators: true });

        if (!updatedVendor) {
            return res.status(400).json({ success: false, error: "Vendor is not updated" });
        }

        return res.status(200).json({ success: true, message: "Vendor is updated", updatedVendor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

}

const deleteVendorProfile = async (req, res) => {
    try {

        if(req.user.role !== "admin"){
            return res.status(404).json({ success: false, error: "Only admin can delete profile" });
        }
        const userId = req.params.userId; // get user id

        if (!userId) {
            return res.status(404).json({ success: false, error: "User id not found" });
        }

        const deletedVendor = await User.findByIdAndDelete(userId); // find and delete user

        return res.status(200).json({ success: true, Message: "Vendor has been sucessfully deleted", deletedVendor }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// change Vendor password

const changeVendorPassword = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId || userId && userId.trim() === "") {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        const { currentPassword, newPassword } = req.body; // take details

        if (!currentPassword || currentPassword && currentPassword.trim() === "" || !newPassword || newPassword && newPassword.trim() === "") {
            return res.status(401).json({ success: false, error: "Please enter all fields" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        // compare password
        const isPasswordCorrect = await comparePassword(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, error: "password is not matched" });
        }

        const newHashedPassword = await hashPassword(newPassword);
        user.password = newHashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password has been chenged" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// get all affiliates
const getAllVendors = async (req, res) => {
    try {
        const role = req.user.role;
        if (!role || role !== "admin") {
            return res.status(401).json({ success: false, error: "Only admin can do this" });
        }

        const ven_list = await User.find({ role: "vendor" });
        return res.status(200).json({ success: true, vendorsList: ven_list });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { registerVendor, registerVendorWithGoogle, editVendor, loginVendor, deleteVendorProfile, changeVendorPassword, getAllVendors, getVendorProfile };