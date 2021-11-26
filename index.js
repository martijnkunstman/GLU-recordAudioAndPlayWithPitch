//set up express server
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
//serve files in public folder (public/index.html)
app.use(express.static('public'))