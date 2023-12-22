//import some modules using commonJs syntax
require('dotenv').config()
const express = require('express') //import express library
const morgan = require('morgan') //import morgan for logs
const cors = require('cors') //import cors for cors policy
const app = express() //create express app
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())

morgan.token('data', (request) => {
	return JSON.stringify(request.body)
})
//midlewares
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())



//data
// let  persons = [
//     {
//       "id": 1,
//       "name": "Arto Hellas",
//       "number": "040-123456"
//     },
//     {
//       "id": 2,
//       "name": "Ada Lovelace",
//       "number": "39-44-5323523"
//     },
//     {
//       "id": 3,
//       "name": "Dan Abramov",
//       "number": "12-43-234345"
//     },
//     {
//       "id": 4,
//       "name": "Mary Poppendieck",
//       "number": "39-23-6423122"
//     }
// ]

//routes
//get all resources
app.get('/api/persons', (request, response) => {
	// res.json(persons)
	Person.find({}).then(persons => {
		response.json(persons)
		// mongoose.connection.close()
	})
})

// get a resource
app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then( person => {
			if(person) {
				response.json(person)
			}else{
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

//get info
app.get('/info', (request, response) => {
	Person.countDocuments({}).then(count => {
		const time = new Date(Date.now())
		response.send(`<p>Phonebook has info for ${count} people<br/>${time}</p>`)
	})
})

// delete a resource
app.delete('/api/persons/:id', (request, response) => {
	Person.findByIdAndDelete(request.params.id)
		.then(() =>  response.status(204).end())
		.catch(error => next(error))
})


// add a resource
app.post('/api/persons', (request, response, next) => {

	const body = request.body

	if(!body.name || !body.number) {
		return response
			.status(400)
			.json({ error: 'Content missing' })
			.send('<h1>Content missing</h1>')
	}

	const person = new Person({
		name: body.name || '',
		number: body.number || ''
	})

	person.save()
		.then(personSaved => {
			response.json(personSaved)
		})
		.catch(error => next(error))
})

// update a ressource
app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		number: body.number,
	}

	// console.log(mongoose.Types.ObjectId.isValid(id))

	const id = request.params.id
	Person.findByIdAndUpdate(
		id,
		person,
		{ new: true, runValidators: true, context: 'query' }
	)
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})


// handler of requests with unknown endpoints
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with result to errors
const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if(error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response
			.status(400)
			.json({ error: error.message })
			.send(`<h1>${error.message}</h1>`)

	}

	next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
