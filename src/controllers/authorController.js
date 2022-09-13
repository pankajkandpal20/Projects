const authorModel = require('../models/authorModel');
const jwt = require("jsonwebtoken");
const validator = require('../validator/validator');



//***********************************************CREATE AUTHOR****************************************************** */

const createAuthor = async function (req, res) {
    try {
        let data = req.body;
        let { fname, lname, title, email, password } = data 

        //edge case-1 
        let isEmptyBody = validator.isValidBody(data);
        if(!isEmptyBody){
            return res.status(400).send({status: false, msg: "request body cannot be empty"})
        }
        //edge case-2
        if (!fname) { return res.status(400).send({ status: false, msg: "fname is required" }) }
        if(fname) {
            let verifyName = validator.isValidName(fname);
            if(!verifyName) return res.status(400).send({status: false, msg: "first name is not valid"})
        }

       //edge case 3
       if (!lname) { return res.status(400).send({ status: false, msg: "lname is required" }) }
       if(lname) {
           let verifyName = validator.isValidName(lname);
           if(!verifyName) return res.status(400).send({status: false, msg: "last name is not valid"})
       }

       //edge case 4
       if (!title) { return res.status(400).send({ status: false, msg: "title is required" }) }
       if (title != "Mr" && title != "Mrs" && title != "Miss")
       return res.status(400).send({
         status: false,
         msg: `Title can contain only "Mr","Mrs" or "Miss`,
       });

       //edge case-5 
        if (!email) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if (email) {
            let verifyEmail = validator.isValidEmail(email);
            if (!verifyEmail)
              return res.status(400).send({
                status: false,
                msg: "This is not a valid syntax for email id, please try again",
              });
          }
      
        //edge case-6
        if (!password) { return res.status(400).send({ status: false, msg: "password is required" }) }
            if(!validator.isValidPassword(password)) {
                return res.status(400).send({status: false, msg: "password is not valid"})
        }

        //edge case-7 
        let inputEmail = await authorModel.findOne({ email });
        if (inputEmail != null)
        if (email == inputEmail.email){
            return res.status(400).send({status: false, msg: "Email already register"})
        }
        
        let savedData = await authorModel.create(data)
        res.status(201).send({ msg: savedData })
    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}

//*********************************************************LOGIN USER*******************************************************


const loginUser = async function (req, res) {
    try {
        let authorName = req.body.email;
        let password = req.body.password;
    
       //edge case-1
        if (!authorName) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if(!validator.isValidEmail(authorName)) {
            return res.status(400).send({status: false, msg: "Email is not valid"})
    }
        //edge case-2
        if (!password) { return res.status(400).send({ status: false, msg: "password is required" }) }
            if(!validator.isValidPassword(password)) {
                return res.status(400).send({status: false, msg: "password is not valid"})
        }

        //edge case-3
        let checkData = await authorModel.findOne({ email: authorName })
        if (!checkData) {
            return res.status(400).send({ status: false, msg: "You are not registered" })
        }
        if (password != checkData.password)
        return res.status(404).send({status: false, msg: "Incorrect password"});

        //token generate
        let token = jwt.sign(
            {
                authorId: checkData._id.toString(),  // PAYLOAD
                batch: "PLUTONIUM",
                organization: "FunctionUp",
            },
            "functionUp-plutonium-project-key"  //SECRET KEY
        );
        res.setHeader("x-api-key", token);
        res.status(201).send({ status: true, token: token });
    }

    catch (error) {
        res.status(500).send({ error: error.message })
    }
};
module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginUser



