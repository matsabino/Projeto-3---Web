require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000;
const ejs = require('ejs');
var session = require('express-session')
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require ('jsonwebtoken');

//controllers

const loginController = require('./controllers/loginController');
const userController = require('./controllers/userController')

//config JSON response
app.use(express.json())

// set the view engine to ejs
app.set('view engine', 'ejs');

// setup express session
app.use(session({
    secret: 'teste',
    resave: true,
    saveUninitialized: false,
  }))

//Models
const User = require('./models/User')

// Users Routes
app.get("/users/list/all", userController.listAll);
app.delete("/users/delete/:email", userController.delete);

//Login User
app.post("/", loginController.login);

// Open Route - Public Route
app.get('/', loginController.index);

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id

    //checar se o usuario existe
    const user = await User.findById(id,'-password')

    if(!user){
        return res.status(404).json({msg: 'Usuario nao encontrado'})
    }
    res.status(200).json({ user })
})

function checkToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token){
        return res.status(401).json({msg: 'Acesso negado!'})
    }
    
    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()
    } catch (error) {
        res.status(400).json ({msg: "Token invalido."})
    }
}

//Registrar usuario

app.post('/auth/register', async (req,res) => {

    const{name, email, password} = req.body

    //validações
    if(!name){
        return res.status(422).json({msg: 'O nome é obrigatório!'})
    }
    if(!email){
        return res.status(422).json({msg: 'O email é obrigatório!'})
    }
    if(!password){
        return res.status(422).json({msg: 'A senha é obrigatória!'})
    }

    // Checar se o user existe
    const userExists = await User.findOne({email: email})

    if (userExists){
        return res.status(422).json({msg: 'Por favor, utilize outro email!'})
    }

    //Criar senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Criar usuario
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({msg: 'Usuário criado com sucesso!'})
    } catch (error) {
        res.status(500).json({msg: 'Aconteceu um erro no servidor, tente mais tarde!'})
    }
})


//Credencials
const DB_USER = process.env.DB_USER
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD)

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@apicluster.50fsbvr.mongodb.net/?retryWrites=true&w=majority`)
.then(() => {
    app.listen(port)
    console.log("Conexão feita com o MongoDB!!")
})
.catch((err) => console.log(err))