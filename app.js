const express = require("express");
const mysql = require("mysql2/promise");
  
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_password,
  database: 'my_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


async function checkDatabaseConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.ping();
    console.log('Подключение к базе данных успешно');
    return true;
  } catch (err) {
    console.error('Ошибка подключения к базе:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

checkDatabaseConnection();

process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Пул соединений MySQL закрыт');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка при закрытии пула:', err);
    process.exit(1);
  }
});
app.get("/", function(request,response){

    response.send("<h1>Привет, Октагон!</h1>");
});

app.get("/static",(request, response)=>{
    response.json({
        header: "Hello",
        body : "Octagon NodeJS Test"
    });
});

app.get("/dynamic", (request,response)=>{
    const { a, b, c } = request.query;

    if(!a || !b || !c || isNaN(a) || isNaN(b) || isNaN(c)){
        return response.json({header: "Error"})
    }

    const result = (parseFloat(a) * parseFloat(b) * parseFloat(c)) / 3

    response.json({
        header : "Calculated",
        body: result.toString()
    });
});

app.get('/getAllItems', async (request, response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Items');
    response.json(rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addItem', async (request, response) => {
  const { name, desc } = request.body;

  if (!name || !desc) {
    return response.json(null);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Items (name, `desc`) VALUES (?, ?)',
      [name, desc]
    );

    const [newItem] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [result.insertId]
    );

    response.json(newItem[0] || {});
  } catch (error) {
    console.error(error);
    response.json(null);
  }
});

app.post('/deleteItem', async (request, response) => {
  const { id } = request.query;

  if (!id || isNaN(id)) {
    return response.json(null);
  }

  try {

    const [item] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [id]
    );

    if (!item.length) {
      return response.json({});
    }

    await pool.query(
      'DELETE FROM Items WHERE id = ?',
      [id]
    );

    response.json(item[0]);
  } catch (error) {
    console.error(error);
    response.json(null);
  }
});
app.post('/updateItem', async (request, response) => {
  const { id, name, desc } = request.query;

  if (!id || isNaN(id) || !name || !desc) {
    return response.json(null);
  }

  try {

    const [existingItem] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [id]
    );

    if (!existingItem.length) {
      return response.json({});
    }

    await pool.query(
      'UPDATE Items SET name = ?, `desc` = ? WHERE id = ?',
      [name, desc, id]
    );

    const [updatedItem] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [id]
    );

    response.json(updatedItem[0]);
  } catch (error) {
    console.error(error);
    response.json(null);
  }
});

app.listen(3000, () =>{
    console.log('Сервер запущен на 3000 порту')
}); 