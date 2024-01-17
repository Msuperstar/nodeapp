
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
const sha = require('sha256');

let session = require('express-session');
router.use(
    session({
    secret : 'sldkjfslkfjdlkjsfl', 
    resave : false,
    saveUninitialized :true
    })
);


//passport사용
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;//나의 로컬
const FacebookStrategy = require("passport-facebook").Strategy;//페이스북을 위한 러용(링크)

router.use(passport.initialize());
//req.session이 있는지 확ㅇ니하고 만약 존재하면 req.session.passport.user를 추가
router.use(passport.session());
//넘겨받은 pas~.user는 인증된 사용자를 의미 
//passport.session을 하면 deserializeUser가 실행됨

//req에 담겨진 post방식의 요청 데이터는 body-parser라는 라이브러리로읽음
//html내의 body로 받아오니까 데이터를 일그려면 별도 라이브러리 필요

let cookieParser = require('cookie-parser');
const { route } = require("./post");
//미들웨어 이므로 use를 이용
//쿠키 보안

router.use(cookieParser('sdfsferwfdx'));
router.get("/session",function(req,res){
    //.session:require~:요청을 하는 과정이 이곳
    if(isNaN(req.session.milk)){
        req.session.milk =0;
    }
    req.session.milk += 1000; 
    res.send("session:" + req.session.milk + "원")
})

//페이지 띄워줄떄 
router.get("/login",function(req,res){
    console.log("req.session");
    //console.log("로그인 페이지");
    if(req.session.user){ //user라는 쿠키를 요청
        console.log('세션 유지');
        //res.send('로그인 되었습니다')
        res.render('index.ejs',{user:req.session.user});
    }else{
        res.render("login.ejs");
    }
})

//아이디,비밀번호 확인
router.post("/login", passport.authenticate("local",{
    succeessRedirect : '/',
    failureRedirect: "/fail",
    }),
    function(req,res){
    console.log(req.session);
    console.log("passport:::"+req.session.passport.user.userid);
    res.render("index.ejs", { user: req.session.passport.user.userid});
    //~.~.passport
    }   
);

passport.use(
    new LocalStrategy(
        {
            usernameField: "userid",
            passwordField: "userpw",
            session: true,
            passReqToCallback: false,
        },
        function (inputid, inputpw, done) {
            conn.query("SELECT * FROM account WHERE userid = ?", [inputid], function (err, results) {
              if (err) {
                console.error(err);
                return done(err);
              }
      
              if (results.length > 0) {
                if (sha(inputpw) == results[0].userpw) {
                  return done(null, results[0]); // 로그인 성공
                } else {
                  return done(null, false, { message: "비밀번호 불일치" });
                }
              } else {
                return done(null, false, { message: "아이디 틀림" });
              }
            });
        }
    )

)

/*passport.serializeUser(function (user, done) {
    console.log(passport.serializeUser)
    console.log(user.userid)
    done(null, user.userid);
  }
);*/

passport.serializeUser(function(user,done){
    console.log("serializeUser");
    console.log(user)
    
    //facebook이 넘겨주는 user는 유저키와 유저 아이디를 포함
    done(null,user)//done(서버에러 객체, 결과데이터, 에러 메세지)
})

/*passport.deserializeUser(function (id, done) {
    conn.query("SELECT * FROM account WHERE userid = ?", [id], function (
      err,
      rows
    ) {
      done(err, rows[0]);
    });
});
//deserializeuser,serializeuser에서는 conn등의 객체이름을 유지해야한다.*/

passport.deserializeUser(function(user, done) {
    console.log("deserializeUser");
    console.log("des~~"+user.userid)
    // user에는 serializeUser에서 저장한 값이 들어있습니다.
    // 여기서는 예시로 사용자 키를 기반으로 사용자 정보를 조회하는 것을 가정합니다.

    // 사용자 정보 조회 (가정: 데이터베이스 조회 메서드는 프로젝트에 맞게 수정 필요)
    conn.execute('SELECT * FROM account WHERE userkey = ?', [user.userkey], function(err, rows, fields) {
        if (err) {
            console.error(err);
            return done(err, null);
        }

        if (rows.length > 0) {
            // 조회된 사용자 정보를 done을 통해 Passport에게 전달
            done(null, rows[0]);
            console.log("사용자 찾음")
        } else {
            // 사용자 정보가 없을 경우
            done(null, false, { message: 'User not found' });
        }
    });
});

//done(null,user)//done(서버에러 객체, 결과데이터, 에러 메세지)

router.get("/logout",function(req,res){
    console.log("로그 아웃");
    req.session.destroy();
    res.render('index.ejs',{user:null})
})//세션은 항상 생김, 이를 저장하냐 안하냐 차이가 로그인의 차이
//그냥 logout들어가도 session을 끊으니까 당연히 render로 가지요

router.get("/signup",function(req,res){
    res.render("signup.ejs");
})

router.post("/signup", function(req, res) {

    console.log(req.body.userid);
    console.log(sha(req.body.userpw)); // sha로  

    conn.query( "INSERT INTO account (userid, userpw, usergroup, useremail) VALUES (?, ?, ?, ?)", 
    [req.body.userid, sha(req.body.userpw),req.body.usergroup,req.body.useremail],
    function(error,results,fields){
        if (error) throw error;
        console.log('회원가입 성공');
    }); 
    res.redirect("/");

})

router.get('/facebook',
    passport.authenticate( 
        'facebook'
    )
);

router.get('/facebook/callback',
    passport.authenticate(
        'facebook',
        {
        successRedirect:'/',
        failureRedirect:"/fail"
        }
    ),

    function(req,res){
        console("이게 나와야함")
        console.log(req.session)
        console.log(req.session.passport);
        res.render("index.ejs", { user: req.session.passport });
           // res.render("index.js",{user: req.session.passport});
            //렌더링시의 파라미터 명을 다 기억해두자(아카이빙시)
        }
);

passport.use(new FacebookStrategy({
    clientID: '1553968188688518',
    clientSecret: '9058da55cfadd9ad2a3905218e585bf6',
    callbackURL: "/facebook/callback"
},
function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authkey = 'facebook' + profile.id //위에서 받아온거의 세부정보
    var authName = profile.displayName;

    // MySQL에서 userkey를 이용해 계정을 찾음
    conn.query('SELECT * FROM account WHERE userkey = ?', [authkey], function (error, rows, fields) {
        if (error) {
            console.error(error);
            return done(null, false, error);
        }

        if (rows.length > 0) {
            console.log("-----------------------");
            console.log(rows[0]);
            console.log("find 페이스북 로그인 성공");
            done(null, rows[0]);
        } else {
            // 계정이 없을 경우 MySQL에 새로운 계정 추가
            conn.execute('INSERT INTO account (userkey, userid) VALUES (?, ?)', [authkey, authName], function (error, insertResult, fields) {
                if (error) {
                    console.error(error);
                    return done(null, false, error);
                }

                console.log("-----------------------");
                console.log(insertResult);
                console.log("insert 페이스북 로그인 성공");

                // 추가한 계정을 한 번 더 조회
                conn.execute('SELECT * FROM account WHERE userkey = ?', [authkey], function (error, newRows, newFields) {
                    if (error) {
                        console.error(error);
                        return done(null, false, error);
                    }

                    if (newRows.length > 0) {
                        console.log("-----------------------");
                        console.log(newRows[0]);
                        console.log("새로 추가한 계정 조회 성공");
                        done(null, newRows[0]);
                    } else {
                        console.log("새로 추가한 계정 조회 실패");
                        done(null, false, { message: "새로 추가한 계정 조회 실패" });
                    }
                });
            });
        }
    });
}));

module.exports = router;
//결과값을 반환하겠다(왜냐면 server에 있지 않으니까)