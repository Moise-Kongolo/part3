//import mongoose module
const mongoose = require('mongoose')

//check if password is passed as argument
if(process.argv.length < 3) {
    console.log('give a passwrod as argument')
    process.exit(1)
}

//check if password, name, number are passed as arguments
// if(process.argv.length > 3) {
//     console.log('password, name, number expected as arguments')
//     process.exit(1)
// }

const password = process.argv[2] //store the password
const name = process.argv[3] //store the name of the person
const number = process.argv[4] //store the number of the person
console.log(`name ${name}, number ${number}`)

//store the url pointing to the mongo db
const url = `mongodb+srv://moiseknglo:${password}@cluster0.uu9qwg5.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url) //connect to the db


//create the schema for the person
const personSchema = new mongoose.Schema({
    name: string,
    number: String
})

//create the model of the person
const Person = mongoose.model('Person', personSchema)

//create the new person object
const person = new Person({
    name,
    number
})

//save the person to the db
process.argv.length > 3 
    ?  person.save().then(result => {
        //print a message to the console
        console.log(`add ${name} number ${number} to phonebook`) 
        mongoose.connection.close() // close the connection to the db
       })
    : Person.find({}).then((result) => {
        console.log("Phonebook : ")
        result.forEach( p => {
            console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
    })
