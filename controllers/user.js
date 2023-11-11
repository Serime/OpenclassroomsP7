const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

regexEmail = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function emailValidator(email)
{
	if (!email)
		return false;

	if(email.length>254)
		return false;

	if(!regexEmail.test(email))
		return false;

	var parts = email.split("@");
	if(parts[0].length>64)
		return false;

	var domainParts = parts[1].split(".");
	if(domainParts.some((part) => { return part.length>63; }))
		return false;
	return true;
}

exports.signup = (request, response, next) => {
    if (emailValidator(request.body.email))
    {
        bcrypt.hash(request.body.password, 10)
        .then(hash => {
        const user = new User({
            email: request.body.email,
            password: hash
        });
        user.save()
            .then(() => response.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => response.status(400).json({ error }));
        })
        .catch(error => response.status(500).json({ error }));
    }
    else
    {
        response.status(400).json({ message: 'Email invalide'});
    }    
};

exports.login = (request, response, next) => {
    User.findOne({ email: request.body.email })
       .then(user => {
           if (!user) {
               return response.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
           }
           bcrypt.compare(request.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return response.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                   }
                   response.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN,
                            { expiresIn: '24h' }
                        )
                   });
                   
               })
               .catch(error => response.status(500).json({ error }));
       })
       .catch(error => response.status(500).json({ error }));
};
