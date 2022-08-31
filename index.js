require('dotenv').config()
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware');
const sequelize = require('./db')

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use(cookieParser());
app.use(cors(
    {credentials: true,
    origin: process.env.CLIENT_URL,
    methods: ['GET','POST','DELETE','PUT'],}
));
app.use('/', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await sequelize.authenticate()
        
        //await sequelize.sync({alter:true})
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start()
