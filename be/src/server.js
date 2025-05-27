const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const configViewEngine = require('./config/viewEngine')
const { connectDB }  = require('./config/db')
const initWebRoutes = require('./routes/route')

dotenv.config();

const app = express();

app.use(cors({ 
  origin: 'http://localhost:3000', // Địa chỉ frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

configViewEngine(app)
initWebRoutes(app)
connectDB()

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend Nodejs is running on the port: ${PORT}`);
});
