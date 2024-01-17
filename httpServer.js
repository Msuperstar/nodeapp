const http = require('http'); //import

const hostname = '127.0.0.1';  //ip지정
const port = 3000; //port지정

const server = http.createServer((req, res) => { //클라이어트가 접속시 시행할 부분을 함수로
res.statusCode = 200;
res.setHeader('Content-Type', 'text/plain');
res.end('Hello World');
});

server.listen(port, hostname, () => { //대기하는 리스닝 함수 만들기
console.log(`Server running at http://${hostname}:${port}/`);
});

//결과해석
//http://127.0.0.1:3000/   =>ip주소는 127.0.0.1, 포트는 3000번에서 리스닝하며 대기중

//콜백 리뷰:
//이벤트가 발생하고 그에따라 이벤트 리스너를 만들면 번거로움=>이벤트 리스너를 유형화하여 콜백 함수를 만들고 이를 구현하는 형태

//nonblocking I/O를 하용
//여러명의 사용자가 들어와도 이걸 순서대로가 아니라 다 받고 제일 빨리 완성되는 응답부터 먼저 보내줌:효율성 개선


//블로킹과 논블로킹의 차이는 검색 또는 책의 305p를 참고
//요약: 제어권을 양도하지 않아 다수의 함수가 별령로 수행됨
