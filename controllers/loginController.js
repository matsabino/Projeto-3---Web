const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require ('jsonwebtoken')

exports.index = (req, res) => { 

    if(req.session.login){
        res.render('pages/home')
    } else{
        res.render('pages/login');
    }
    
}

exports.login = async (req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        return res.json({msg: "erro encontrado"})
    }

    // Checar se o User existe 
    const user = await User.findOne({email: email});

    if (!user){
        return res.status(422).json({msg: "Usuário não encontrado"})
    }

    //Checar se a senha bate
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(422).json({msg: 'Senha inválida'})
    }

    try {
        const secret = process.env.SECRET

        const token = jwt.sign(
        {
            id: user._id
        },
            secret,
        );
        
        req.session.login = {
            'token': token,
            'login': 'ativo'
        };

        res.status(200).json({msg: 'Autenticação realizada com sucesso', token});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Aconteceu um erro no servidor, tente novamente mais tarde.'});
    }
}