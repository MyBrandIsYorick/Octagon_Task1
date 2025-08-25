const express = require("express");
const mysql = require("mysql2/promise");
const TelegramBot = require('node-telegram-bot-api');  
require('dotenv').config();

//Создание бота
const bot = new TelegramBot(process.env.token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; 

  bot.sendMessage(chatId, resp);
});


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
    const welcomeText = `Привет, октагон! 👋

Я бот с полезными командами. Вот что я умею:

/help - показать список команд
/site - получить ссылку на сайт Октагона
/creator - узнать создателя бота

Выбери команду или напиши /help для подробностей!`;

  bot.sendMessage(chatId, welcomeText);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `📋 Список доступных команд:

/help - Показать этот список команд с описанием
/site - Получить ссылку на официальный сайт Октагона
/creator - Узнать ФИО создателя этого бота
/start - Начать диалог с ботом заново`;

  bot.sendMessage(chatId, helpText);
});

bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  const siteText = `🌐 Официальный сайт Октагона:

https://octagon-students.ru/`;

  bot.sendMessage(chatId, siteText);
});

bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  const creatorText = `👨💻 Создатель этого бота:

Еприцкий Денис Александрович`;

  bot.sendMessage(chatId, creatorText);
});

bot.onText(/\/randomItem/, async (msg) => {  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Items ORDER BY RAND() LIMIT 1'
    );
    
    if (rows.length === 0) {
      return bot.sendMessage(msg.chat.id, "В базе данных нет предметов 😢");
    }
    
    const randomItem = rows[0];
    const message = `(${randomItem.id}) - ${randomItem.name}: ${randomItem.desc}`;
    
    bot.sendMessage(msg.chat.id, message);
    
  } catch (error) {
    console.error('Ошибка при получении случайного предмета:', error);
    bot.sendMessage(chatId, "Произошла ошибка при получении случайного предмета 😢");
  }
});

bot.onText(/\/deleteItem (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const itemId = match[1];
  
  if (!itemId || isNaN(itemId)) {
    return bot.sendMessage(chatId, "❌ Ошибка: Укажите корректный ID предмета\nПример: /deleteItem 5");
  }
  
  try {
    const [existingItem] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [itemId]
    );
    
    if (existingItem.length === 0) {
      return bot.sendMessage(chatId, "❌ Ошибка: Предмет с таким ID не существует");
    }
    
    await pool.query(
      'DELETE FROM Items WHERE id = ?',
      [itemId]
    );
    
    bot.sendMessage(chatId, "✅ Успешно: Предмет удален из базы данных");
    
  } catch (error) {
    console.error('Ошибка при удалении предмета:', error);
    bot.sendMessage(chatId, "❌ Ошибка: Произошла ошибка при удалении предмета");
  }
});

bot.onText(/\/deleteItem$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "ℹ️ Использование: /deleteItem <ID>\nПример: /deleteItem 5");
});

bot.onText(/\/getItemByID (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const itemId = match[1];
  
  if (!itemId || isNaN(itemId)) {
    return bot.sendMessage(chatId, "❌ Ошибка: Укажите корректный ID предмета\nПример: /getItemByID 5");
  }
  
  try {

    const [rows] = await pool.query(
      'SELECT * FROM Items WHERE id = ?',
      [itemId]
    );
    
    if (rows.length === 0) {
      return bot.sendMessage(chatId, "❌ Ошибка: Предмет с таким ID не найден");
    }
    
    const item = rows[0];
    const message = `(${item.id}) - ${item.name}: ${item.desc}`;
    
    bot.sendMessage(chatId, message);
    
  } catch (error) {
    console.error('Ошибка при поиске предмета:', error);
    bot.sendMessage(chatId, "❌ Ошибка: Произошла ошибка при поиске предмета");
  }
});

bot.onText(/\/getItemByID$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "ℹ️ Использование: /getItemByID <ID>\nПример: /getItemByID 5");
});

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

app.get('/randomItem', async (request, response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Items ORDER BY RAND() LIMIT 1'
    );
    
    if (rows.length === 0) {
      return response.status(404).json({ error: 'No items found' });
    }
    
    const randomItem = rows[0];
    response.json(randomItem);
    
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