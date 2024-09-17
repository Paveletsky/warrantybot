const mysql = require('mysql');
const CFG   = require('../config')

const connection = mysql.createConnection(CFG.DB);
connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    
    console.log('Успешное подключение к базе данных MySQL');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS warranty_data (
            id VARCHAR(36) NOT NULL,
            manager_id VARCHAR(24) NOT NULL,
            confirmed ENUM('true', 'false') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            
            client_name TEXT,
            PRIMARY KEY (id)
        );
    `;

    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Ошибка при создании таблицы:', err);
            return;
        }
        console.log('Таблица warranty_data готова');
    });
});

function generateUniqueId() {
    const userId = Math.floor(10000 + Math.random() * 90000).toString();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return { userId, createdAt };
}

exports.insert = async (req, res, id, manager_id, client_name) => {
    const { userId, createdAt } = generateUniqueId();

    const insertQuery = 'INSERT INTO warranty_data (id, manager_id, confirmed, created_at, client_name) VALUES (?, ?, ?, ?, ?)';
    connection.query(insertQuery, [id, manager_id, 'false', createdAt, client_name], (error, results) => {
        if (error) {
            console.error('Ошибка при сохранении в базе данных:', error);
            res.status(500).send('Ошибка сервера');
            return;
        }
    });
}

exports.connection = connection;