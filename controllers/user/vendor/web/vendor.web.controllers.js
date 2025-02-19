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

        // return response
        res.status(200).json({ Message: "Vendor has been  sucessfully register.", vendor: user });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// register vendor with google
const registerVendorWithGoogle = async (req, res) => {

    try {
        const { firstName, lastName, email, googleId, store } = req.body; // get affiliate id

        // check blank fields
        const isBlank = [firstName, lastName, email, googleId, store].some(fields => fields.trim() === "");

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
            userId: "fa1",
            googleId,
            role: "vendor",
            storeName: store
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

        // return response
        res.status(200).json({ Message: "Vendor has been  sucessfully register.", affiliate: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const editVendor = async (req, res) => {
    try {

        const { firstName, lastName, storeName, country } = req.body;
        const user = req.user._id;

        if (!user) {
            return res.status(500).json({ success: false, message: "Vendor is not loged in" });
        }

        let payload;
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

        const updatedVendor = await User.findByIdAndUpdate(user, ...payload, { new: true, runValidators: true });

        if (!updatedVendor) {
            return res.status(400).json({ success: false, message: "Vendor is not updated" });
        }

        return res.status(200).json({ success: true, message: "Vendor is updated", updatedVendor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { registerVendor, registerVendorWithGoogle, editVendor };