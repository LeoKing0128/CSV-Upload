const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// 配置 multer 文件上传
const upload = multer({ dest: 'uploads/' });

// MySQL 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aaa000021',
    database: 'team_management'
});

// 测试数据库连接
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// 设置静态文件目录
app.use(express.static('public'));

// 处理上传的CSV文件
app.post('/upload-csv', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;

    const results = [];
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            results.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed:', results);

            results.forEach(row => {
                const { name, team, mentor } = row;

                db.query('INSERT INTO members (name, team, mentor) VALUES (?, ?, ?)', 
                    [name, team, mentor], 
                    (err) => {
                        if (err) {
                            console.error('Error inserting into database:', err);
                        }
                    });
            });

            res.json({ message: 'CSV file successfully uploaded and processed' });

            fs.unlink(filePath, err => {
                if (err) console.error('Error deleting file:', err);
            });
        });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
