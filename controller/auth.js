const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const auth = require('../models/authModel.js')
const transporter = require('../middleware/mailtransporter') 
const Auth = require('../middleware/auth');

dotenv.config()

//  sign-up
const signUp = async function (req,res) {
    const { email, password, name, contact, permissions} = req.body;
    const encryptedPassword = await bcrypt.hash(password, 5)
    try{
        await new auth({
            email,
            password: encryptedPassword,
            name,
            contact,
            permissions
        }).save() 
        return res.status(201).send('User Created Successfully')
    }catch(error){
        if(error.code === 11000){
            return res.status(409).send("Email Already Exists");
            
        }
        else if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
            return res.status(500).send(error.message);
        }
    }
};

// sign in
const signIn = async function (req,res){
    try{
        const {email, password}= req.body;
        const user = await auth.findOne({email})
        if(!user){
            return res.status(403).send("Invalid Email")
        }
        if(await bcrypt.compare(password, user.password)){
            const token = jwt.sign
            ({
                _id: user._id
            },
            JWT_SECRET,
            {expiresIn: '24h'}
            )
            return res.status(200).header({token}).send("Logged In");
        }else{
            return res.status(403).send("Invalid Password  ")
        }
        }
    catch(error){
        if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
        return res.status(500).send(error.message)
        }       
    }
}

// change password
const changePassword = async function(req,res){
    const {password} = req.body;
    const user = req.user
    try{
        const _id = user._id
        const encryptedPassword = await bcrypt.hash(password, 5);
        await auth.updateOne(
            {_id},
            {
                $set: {password: encryptedPassword}
            }
        )
        return res.status(200).send("Password Changed");
    }catch(error){
        if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
        return res.status(500).send(error.message)
        }
    }
}

// forgot password
const forgotPassword = async function(req, res){
    try{
    const email = req.body.email;
    const user= await auth.findOne({email})
    if(!user){
        return res.status(403).send("Invalid Email ")
    }
    else{
        let token = jwt.sign
        ({
            _id: user._id
        },
        JWT_SECRET,
        {expiresIn: '24h'}
        )  
        const  mailOptions = {
            from: process.env.EMAIL,
            to: `${email}`,
            subject: 'Reset Link',
            text: `Click This Link To Reset The Password http://localhost:3000/reset-password/${token}`
        };
          
        await transporter.sendMail(mailOptions, function(err){
            if (err) {
              console.log(err);
              return res.send(err.message);
            } else {
              return res.status(200).send("Reset Link Sent Via Email");
            }
        });
    
    }
    }
    catch(error){
        if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
        return res.status(500).send(error.message)
        }
    }
}


// reset
const resetPassword = async function(req, res){
    const token = req.params.id;
    const password = req.body.password;
    
    try{
        const user = jwt.verify(token, JWT_SECRET)
        const _id = user._id;
        const encryptedPassword = await bcrypt.hash(password, 5);
        await auth.updateOne(
            {_id},
            {
                $set: {password: encryptedPassword}
            }
        )
        
        return res.status(200).send("Password Changed")
    }catch(error){
        if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
        return res.status(500).send(error.message)
        }
    }
}

// permissions
const permission = async function(req,res){
    try{
        const {email, permissions} = req.body;
        const user= await auth.findOne({email})
        console.log(permissions)
        await auth.updateOne({email},{
            $pull:{permissions:{}}
        })
        if(!user){
            return res.status(404).send(" User Not Found")
        }
        // else if(){

        // }
        else{
            await auth.updateOne(
                {email},
                {
                    $push: {permissions: permissions}
                }
            )
            return res.status(200).send("Updated The Permissions")
        }
    }
    catch(error){
        if(error.responseCode){
            console.log(error.message);
            return res.status(error.responseCode).send(error.message);
        }
        else{
            console.log(error.message);
        return res.status(500).send(error.message)
        }
    }
}

module.exports = {
    signUp,
    signIn,
    changePassword,
    forgotPassword,
    resetPassword,
    permission
}