const User = require('../model/User.js');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken.js');


// Register a new user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword });
        if (user){
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }else{
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login a user
const loginUser = async (req, res) =>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }else{
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({  message: 'Server error'});
    }
};

// Get user data
const getUsers = async (req, res) =>{
    try{
        const user = await User.find({}).select('-password');
        res.json(user);
    }catch (error){
        res.status(500).json({  message: 'Server error' });
    }
};

module.exports ={
    registerUser,
    loginUser,
    getUsers
};
