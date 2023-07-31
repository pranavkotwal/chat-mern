const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const ws = require('ws')

dotenv.config()

const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

//connect to database
mongoose.connect(process.env.MONGO_URL).catch((err)=>{
    console.log(err)
})




const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.get('/test',(req,res)=>{
    res.json('its working')
})
app.options('*', cors());

// endpoint for profile
app.get('/profile',(req,res)=>{
    const token = req.cookies?.token
    if(token){
        jwt.verify(token,jwtSecret,{},(err,userData)=>{
            if (err) {
                // Handle JWT verification error
                return res.status(498).json({ err: "token not verified." });
            }
    
    
            res.json(userData)
        })
    }else{
        res.status(401).json('no token')
    }

})

app.post('/login',async(req,res) => {
    const {username,password} = req.body
   const foundUser = await User.findOne({username})
   if(foundUser){
    const passOk = bcrypt.compareSync(password,foundUser.password)
    if(passOk){
        jwt.sign({userId:foundUser._id,username},jwtSecret,{},(err,token)=>{
            res.cookie('token',token,{sameSite:'none',secure:true}).json({
                id:foundUser._id
            })
        })
    }
   }


})


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log(username, password);
        // Check if the user with the provided username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }
        const hashedPassword = bcrypt.hashSync(password,bcryptSalt)
        // Create a new user
        const createdUser = await User.create({ 
            username:username, 
            password:hashedPassword
        });

        // Sign the JWT token and send the response
        jwt.sign({ userId: createdUser._id,username }, jwtSecret, {}, (err, token) => {
            if (err) {
                // Handle JWT signing error
                return res.status(500).json({ error: "Failed to create JWT token." });
            }
            // Set the JWT as a cookie in the response and send the user ID
            res.cookie('token', token,{sameSite:'none',secure:true}).status(201).json({ id: createdUser._id });
        });
    } catch (error) {
        // Handle user creation error
        res.status(500).json({ error: "Failed to create user." });
    }
});



const server = app.listen(4000)

// create websocket server


const wss = new ws.WebSocketServer({server})

wss.on('connection',(connection,req)=>{
   const cookies = req.headers.cookie
   if(cookies){
    const tokenCookieString = cookies.split(';').find(str=>str.startsWith('token='))

    if(tokenCookieString){
        const token = tokenCookieString.split("=")[1]

        if(token){
            jwt.verify(token,jwtSecret,{},(err,data)=>{
                if (err) throw err
                const{userId,username} = data

                connection.userId = userId
                connection.username = username


            })
        }
    }
   }

   [...wss.clients].forEach(client =>{
    client.send(JSON.stringify({
        online:[...wss.clients].map(c=>({userId:c.userId,username:c.username}))
    }
        
    ))
   })
})

