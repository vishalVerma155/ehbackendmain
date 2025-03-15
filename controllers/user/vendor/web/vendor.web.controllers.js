const User = require('../../../../models/user/web/user.model.js');
const Counter = require('../../../../models/user/countModel/affiliateCount.model.js');
const generateJWT = require('../../../../utils/jwt.js');
const { comparePassword, hashPassword } = require('../../../../utils/bcrypt.js');

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
        const isBlank = [firstName, email, password, store].some(fields => fields.trim() === "");

        if (isBlank) {
            return res.status(401).json({ Message: "First Name, Email, Password, store are compulsary" });
        }

        // check if affiliate is already existed
        const isUserExisted = await User.findOne({ email });

        // 
        if (isUserExisted) {
            return res.status(401).json({ Message: "User is already existed. Please login or choose other user name" });
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

        const user = await User.findOne({ email: newUser.email }); // double  check user

        if (!user) {
            return res.status(404).json({ Message: "User not found. There is something problem in user data saving" });
        }

        
        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role
        }

        // generate jwt token
        const accessToken = generateJWT(payload);

        res.cookie("AccessToken", accessToken);

        // return response
        res.status(200).json({ Message: "Vendor has been  sucessfully register.", vendor: user, accessToken });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// register vendor with google
const registerVendorWithGoogle = async (req, res) => {
    try {
        const { firstName, lastName, email, googleId } = req.body; // get affiliate id


        if (googleId) {

            if (googleId.trim() === "") {
                return res.status(401).json({ Message: "Google id not found." });
            }

            const isUserExisted = await User.findOne({ googleId: googleId });

            if (!isUserExisted) {
                // check blank fields
                const isBlank = [firstName, lastName, email].some(fields => fields.trim() === "");

                if (isBlank) {
                    return res.status(401).json({ Message: "All fields are compulsary" });
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


                const payload = {
                    _id: newUser._id,
                    email: newUser.email,
                    role: newUser.role
                }

                // generate jwt token
                const accessToken = generateJWT(payload);

                res.cookie("AccessToken", accessToken);

                return res.status(200).json({ Message: "Vendor has been  sucessfully register.", vendor: newUser, accessToken });
            }


            const payload = {
                _id: isUserExisted._id,
                email: isUserExisted.email,
                role : isUserExisted.role
            }

            // generate jwt token
            const accessToken = generateJWT(payload);

            res.cookie("AccessToken", accessToken);


            return res.status(200).json({ Message: "vendor has been  sucessfully Loged in.", vendor: isUserExisted, token: accessToken });
        }

        return res.status(404).json({ Error: "Google id not found" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// login vendor
const loginVendor = async (req, res) => {
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
        return res.status(200).json({ Message: "Vendor has been sucessfully Loged in.", vendor: user, token: accessToken });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const editVendor = async (req, res) => {

    try {
        const { firstName, lastName, storeName, country } = req.body;
        const user = req.user._id;

        if (user && user.trim() === "") {
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

        const updatedVendor = await User.findByIdAndUpdate(user, payload, { new: true, runValidators: true });

        if (!updatedVendor) {
            return res.status(400).json({ success: false, message: "Vendor is not updated" });
        }

        return res.status(200).json({ success: true, message: "Vendor is updated", updatedVendor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

}

const deleteVendorProfile = async (req, res) => {
    try {
        const userId = req.user._id; // get user id
        const { password } = req.body;
        const user = await User.findById(userId); // find user
        if (!user) {
            return res.status(404).json({ Message: "User not found" });
        }

        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(402).json({ Message: "Wrong password" });
        }

        const deletedVendor = await User.findByIdAndDelete(user._id); // find and delete user

        res.clearCookie("AccessToken"); // clear cookies for logout
        return res.status(200).json({ Message: "Vendor has been sucessfully deleted", deletedVendor }); // return response
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// change Vendor password

const changeVendorPaswword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body; // take details

        if (currentPassword.trim() === "" || newPassword.trim() === "") {
            return res.status(401).json({ Message: "Please enter all fields" });
        }

        const user = await User.findById(req.user._id);


        // compare password
        const isPasswordCorrect = await comparePassword(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ Message: "password is not matched" });
        }

        const newHashedPassword = await hashPassword(newPassword);
        user.password = newHashedPassword;
        await user.save();

        return res.status(200).json({ Message: "Password has been chenged" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { registerVendor, registerVendorWithGoogle, editVendor, loginVendor, deleteVendorProfile, changeVendorPaswword };