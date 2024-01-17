
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

router.get('/list', function (req, res) {
    // 쿼리 실행 후 list.html을 보내는 방법
    conn.query("SELECT * FROM post", function (err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return;
        }

        // 'created' 행을 꺼내어 포맷팅
        const formattedRows = rows.map(row => {
            return {
                ...row,
                created: formatDate(row.created)
            };
        });

        console.log(formattedRows);
        res.render('list.ejs', { data: formattedRows });
    });

});

router.post('/delete', (req, res) => {
    const postId = req.body.id;
    
    //추가 처럼 삭제 쿼리문 쓰면됨
     conn.query('DELETE FROM post WHERE id = ?', [postId], (err, result) => {
        if (err) {
            console.error('데이터 삭제 오류:', err);
            res.status(500).send('데이터 삭제 실패');
        } else {
        // 삭제가 성공적으로 이루어졌을 때
            res.sendStatus(200);
            console.log("데이터 삭제 완료")
    }
  });
});

router.get('/content/:id', function (req, res) {
    console.log(req.params.id);
    console.log(req.params.path);

    conn.query("SELECT * FROM post WHERE id = ?", [req.params.id], function (err, rows, fields) {
        if (err) {
            console.error('쿼리 실행 중 오류: ' + err.stack);
            return;
        }

        // 'created' 행을 꺼내어 포맷팅
        const formattedRows = rows.map(row => {
            return {
                ...row,
                created: formatDate(row.created)
            };
        });

        console.log(formattedRows);
        res.render('content.ejs', { data: formattedRows });
    });
});

router.get("/edit/:id", function(req, res) {
    console.log(req.params.id);

    conn.query("SELECT * FROM post WHERE id = ?", [req.params.id], function(err, rows, fields) {
        if (err) {
            console.error('쿼리 실행 중 오류: ' + err.stack);
            return;
        }
        
        // 'created' 행을 꺼내어 포맷팅
        const formattedRows = rows.map(row => {
            return {
                ...row,
                created: formatDate(row.created)
            };
        });

        console.log(formattedRows);
        res.render('edit.ejs', { data: formattedRows });
    });
});

router.post("/edit", function(req, res) {
    const postId = req.body.id;
    const updatedTitle = req.body.title;
    const updatedContent = req.body.content;
    const updatedDate = req.body.created;

    // MySQL 데이터베이스 업데이트
    conn.query(
        "UPDATE post SET title = ?, content = ?, created = ? WHERE id = ?",
        [updatedTitle, updatedContent, updatedDate, postId],
        function(err, result) {
            if (err) {
                console.error('쿼리 실행 중 오류: ' + err.stack);
                return res.status(500).send('내부 서버 오류');
            }

            console.log('수정 완료:', result);

            // 수정이 완료된 후 /list로 리디렉션
            //리디렉션 or massage남기기(client) 둘중 하나만 해야됨.
            //res.redirect('/list');
            res.redirect(`/content/${postId}`);
        }
    );
});

//photo 업로드 라우터
//서버에 실제 이미지를 사용하려면 multer를 사용해야함
//npm install multer

let multer = require('multer');

//원하면 limit으로 파일의 개수나 파일의 사이즈를 제한할 수 잇다.
let storage = multer.diskStorage({
    destination : function(req,file,done){
        done(null, './public/image')
    },
    filename : function(req, file, done){
        done(null, file.originalname)
    }
})

//업로드는 multer(require multer)를 불러오고 스토리지는 위에 설정한 스토리지
let upload = multer({storage: storage});

let imagepath = '';
router.post('/photo', upload.single('picture'),function(req,res){
    console.log("서버에 파일 첨부하기");
    console.log(req.file.path);
    imagepath = '\\'+req.file.path;
})


router.post('/save', (req, res) => {
    // 클라이언트에서 전송된 데이터
    const title = req.body.title;
    const content = req.body.content;
    const created = req.body.created;
    const imagePath = imagepath;
  
    // MySQL에 데이터 삽입 쿼리
    const query = 'INSERT INTO post (title, content, created, path) VALUES (?, ?, ?, ?)';
    conn.query(query, [title, content, created, imagePath], (err, result) => {
      if (err) {
        console.error('쿼리 실행 중 오류:', err.stack);
        return res.status(500).send('Internal Server Error');
      }
  
      console.log('데이터 삽입 성공');
      res.redirect("/list");
    });
});













router.get('/search', function (req, res) {
    console.log(req.query.value);
    const searchValue = req.query.value;

    // account 테이블에서 title에 검색어가 포함된 행을 찾는 쿼리
    const query = "SELECT * FROM post WHERE title LIKE ?";
    const searchPattern = `%${searchValue}%`;

    conn.query(query, [searchPattern], function (err, rows, fields) {
        if (err) {
            console.error('쿼리 실행 중 오류: ' + err.stack);
            return res.status(500).send('Internal Server Error');
        }

        // 검색 결과를 렌더링하여 클라이언트에게 전송
        res.render('sresult.ejs', { data: rows });
    });
});


module.exports = router;
//결과값을 반환하겠다(왜냐면 server에 있지 않으니까)

