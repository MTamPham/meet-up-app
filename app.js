const express = require('express')
const app = express()

// start serving web
app.listen(3000, () => console.log('Example app listening on port 3000!'))

// making public directory as static diectory  
app.use(express.static('public')); 

// routing
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/hello', (req, res) => res.send('Hello World!'));
app.get('/test', (req, res) => res.send('Hello World!'));