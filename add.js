
var mysql = require("mysql2");

var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,  //안되면 newuser
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})
//process.env.

conn.connect();
//conn.query("요청 쿼리문",콜백 함수)

var router = require('express').Router();

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

//   '/enter'요청에 대한 처리 루틴
router.get('/enter',function(req,res){
    //res.sendFile(__dirname+'/enter.html');
    res.render('enter.ejs')
})
//function에서 rmsid 화살표함수쓰듯이 (req,res)=>{res~~}:(es6기준)

//  '/save'요청에 대한 !!post!!방식의 처리 루틴
router.post('/save',function(req,res){
    console.log(req.body.title); //req하면 온갖 정보=>body만 줘라 이렇게
    console.log(req.body.content);
    console.log(req.body.created) //변수명을 enter.html에서 someDate로 받아옴

    let sql = "insert into post(title, content, created,path) values(?,?,?,?)";//만약에 에러나면 마지막?을 NOW()로
    //전달인자에 처리에 대한 성공과 실패를 처리할 콜백 함수를 작성
    //처리과정에서 오류가 발생하면 오류 메시지가, 성공하면 '데이터 추가 성공'이라는 메세지
    let params = [req.body.title, req.body.content, req.body.created,imagepath ];//
    conn.query(sql, params, function(err, result ){
        if(err) throw err;
        console.log('데이터 추가 성공');
    })
    //res.send("데이터 추가 성공");
    res.redirect("/list");

})


module.exports = router;
//결과값을 반환하겠다(왜냐면 server에 있지 않으니까)
