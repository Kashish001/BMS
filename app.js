const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { engine } = require('express-handlebars');

// Load config
dotenv.config({ path: './config/config.env' })

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const { indexing, get, getRem } = require('./helpers/hbs')

// Handle bars
app.engine('.hbs', engine({ helpers: {indexing, get, getRem}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// Static folder
app.use(express.static(path.join(__dirname, '/public')))

// Routes
app.use('/', require('./routes/index'))
// app.use('/employee', require('./routes/employee'))
// app.use('/data', require('./routes/data'))

const PORT = process.env.PORT || 3000
app.listen(PORT, console.log(`Server running in ${ process.env.NODE_ENV } on port ${ PORT }`))