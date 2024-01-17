const dotenv = require('dotenv').config();

var mysql = require("mysql2");
var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,  //안되면 newuser
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})
//process.env.

conn.connect();
const express = require('express');
const app = express();//앱 객체를 서버의 기능을 하나씩 만들면됨
const sha = require('sha256');
app.listen(process.env.DB_PORT, function(){
    console.log("포트 8080으로 서버 대기중 ... ")//객체에서 리스닝 함수 부여
});

//body-parser라이브러리 추가
const bodyParser = require('body-parser'); //객체 생성
const db = require('node-mysql/lib/db');
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs'); 

//정적파일 라이브러리 추가
app.use(express.static('public'));
app.use('/',require('./routes/post.js'))
app.use('/',require('./routes/auth.js'))
app.use('/',require('./routes/add.js'))

app.get("/", function (req, res) {
    //res.render("index.ejs");
    console.log("여기서 렌더링되면 안됨"+req.session)
    if (req.session) { //req.session.user였음
      console.log("세션 유지");
      res.render("index.ejs", { user: req.session});
    } else {
      console.log("user : null");
      res.render("index.ejs", { user: null });
    }
});
