const express = require('express')
const routers = require('./Routes')
const CFG     = require('./config')

const application = express()

const BodyParser  = require('body-parser')
const session     = require('express-session');
const path        = require('path')

application.set('view engine', 'ejs');
application.set('views', path.join(__dirname, '/Client'));
application.use(express.static(path.join(__dirname, '/Client/public')));
application.use('/warranty', express.static(path.join(__dirname, 'Client/public')));
application.use(express.json({ limit: '10mb' })); // лимит json

application.use(
    BodyParser.json()
)

application.use(
    express.json()
)

application.use(session({
    secret: 'rasddazv',
    resave: false,
    saveUninitialized: true
}));

// mysql
require('./Modules/MySQL')
// telegram bot
require('./Modules/Bot')
// sheldue func
require('./Modules/Cron').SetUpSheldue()

routers.RoutesConfig(application)
application.listen(CFG.PORT, () => console.log('Server Running..'))