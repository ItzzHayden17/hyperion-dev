import express from "express"
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()
const port = 8080
mongoose.connect("mongodb+srv://anray:anrayhayden@cluster0.0q26d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})
const User = new mongoose.model("User",userSchema)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      optionsSuccessStatus: 200,
    })
  );
function checkWords(req,res,next){
    const inappropriateWords = ['badword1', 'badword2', 'badword3', 'badword4', 'badword5', 'badword6', 'badword7', 'badword8', 'badword9', 'badword10'];
    const username = req.body.username
    if (inappropriateWords.some(word => username.includes(word))) {
        res.send("Innaproprioate word detected,please enter a different username")
    }else{
        next()
    }
}
function authenticateToken(req,res,next){
    const token = req.cookies.token
    if (token == undefined) {
        req.user = "No token"
        next()
    } else {
        jwt.verify(token,"cookies",(err,result)=>{
            if (err) {
                res.send("Invalid token")
            } else {
                req.user = "auth"
                next()
            }
        })
    }
}

app
.get("/auth",authenticateToken,(req,res)=>{
    res.send(req.user)
})
.post("/signup",checkWords, (req,res)=>{


    const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
        })

    user.save()
    

    const token = jwt.sign({user:user},"cookies")
     res.cookie("token",token,{
        httpOnly:true,
        maxAge:3000000000
    })
   res.redirect("/")
})
.post("/login",async (req,res)=>{
    
     const user = await User.find({username:req.body.username})
     console.log();
     
     if (user[0].password == req.body.password) {
        const token = jwt.sign({user:user},"cookies")
        res.cookie("token",token)
        res.send("Cookie sent")
     } else {
        res.send("Password incorrect")
     }
     
})
.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})