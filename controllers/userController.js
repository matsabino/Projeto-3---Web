const User = require('../models/User');

exports.listAll = async (req, res) => { 

    if(req.session.login){
        User.find({}).select("-password").then(function (users) {
            res.send(users);
        });
    } else{
        return res.redirect('/');
    }  
}

exports.delete = async (req, res) => {
    const email = req.params.email;
    const user = await User.findOneAndDelete({email: email});

    if(!user){
        return res.status(404).json({msg: 'Usuario nao encontrado'})
    }

    res.status(200).json({
        msg: "Usuário deletado com sucesso"
    })
}