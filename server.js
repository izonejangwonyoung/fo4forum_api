const express = require('express');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
app.use(bodyParser.json())
require('dotenv').config()
require('sys')
const {query, raw} = require("express");
const path = require("path");
const fs = require("fs");
const morgan = require('morgan');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));
app.use(cors());
let db;
port =process.env.SERVERPORT
const mariadb = require('mariadb');
// const {now} = require("mongodb/src/utils");

const pool = mariadb.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE ,
    connectionLimit: process.env.CONNECTIONLIMIT
});

console.log(new Date().toLocaleString('en-US', {timeZone: process.env.TIME_ZONE}))

MongoClient.connect(process.env.MONGO_ADDRESS)
    .then(database => {
        console.log('문제없음');
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
        const db = database.db('fo4forum');
        const collection = db.collection('test');
        // collection.insertOne({name:'test'});
    })
    .catch(err => {
        console.log('에러에러');
        console.log(err);
    })
    .finally(() => {
        console.log('끝');
    });

app.get('/', (req, res) => {
    // API 로직 구현
    res.send("hello test api")
});

app.get('/api/products', (req, res) => {
    MongoClient.connect(process.env.MONGO_ADDRESS)
        .then(database => {
            const db = database.db('fo4forum');
            const collection = db.collection('playerDB');
            collection.find({name: {$regex: '손흥민'}}).toArray()
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                })
                .finally(() => {
                    database.close();
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/search', async (req, res) => {
    // MongoClient.connect(process.env.MONGO_ADDRESS)
    //     .then(database => {
    //         const db = database.db('fo4forum');
    //         const collection = db.collection('playerDB');
    //         console.log(req.body)
    //         collection.find({name: {$regex: req.query.query}}).toArray()
    //             .then(data => {
    //                 res.json(data);
    //                 // console.log(data)
    //             })
    //             .catch(err => {
    //                 console.log(err);
    //                 res.status(500).send(err);
    //             })
    //             .finally(() => {
    //                 database.close();
    //             });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).send(err);
    //     });
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const query = 'SELECT * FROM PLAYERDB WHERE NAME LIKE ?';
        const params = [`%${req.query.query}%`];
        const rows = await conn.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }

});


let i = 0
app.get("/searchs", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "playerImages");
    // 파일 이름에 .png 확장자를 추가
    const imagePath = path.join(IMAGES_DIR, `${filename}.png`);
    console.log(imagePath)
    // 파일이 존재하는지 확인

    if (fs.existsSync(imagePath)) {
        // 파일이 존재하면 파일을 읽어서 클라이언트로 보내줌
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함')
    } else {
        // 파일이 존재하지 않으면 404 에러를 반환
        res.status(404).send("File not found");
    }
});

//
// app.get("/searchTrait", (req, res) => {
//     const { filename } = req.query;
//     const IMAGES_DIR = path.join(__dirname, "traits");
//     // 파일 이름에 .png 확장자를 추가
//     const imagePath = path.join(IMAGES_DIR, `${filename}.png`);
//     console.log(imagePath)
//     // 파일이 존재하는지 확인
//
//     if (fs.existsSync(imagePath)) {
//         // 파일이 존재하면 파일을 읽어서 클라이언트로 보내줌
//         const fileStream = fs.createReadStream(imagePath);
//         res.setHeader("Content-Type", "image/png");
//         fileStream.pipe(res);
//         console.log('클라이언트 요청을 ',i+=1,'번 쨰 실행함')
//     } else {
//         // 파일이 존재하지 않으면 404 에러를 반환
//         res.status(404).send("File not found");
//     }
// });
app.get("/searchTrait", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "traits");
    let matchingFileName = null;

    fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (filename === '아웃사이드 슈팅/크로스.png') {
            console.log('떳다 ㅋㅋ')
        }
        if (file.includes(filename)) {
            matchingFileName = file;
            console.log(matchingFileName)
        }
    });

    if (matchingFileName) {
        const imagePath = path.join(IMAGES_DIR, matchingFileName);
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함');
    } else {
        res.status(404).send("File not found");
    }
});


app.get("/searchTeamLogo", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "crests");
    let matchingFileName = null;

    fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (file.includes(filename)) {
            matchingFileName = file;
            console.log(matchingFileName)
        }
    });

    if (matchingFileName) {
        const imagePath = path.join(IMAGES_DIR, matchingFileName);
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함');
    } else {
        res.status(404).send("File not found");
    }
});


app.get("/etc", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "etc");
    let matchingFileName = null;

    fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (file.includes(filename)) {
            matchingFileName = file;
            console.log(matchingFileName)
        }
    });

    if (matchingFileName) {
        const imagePath = path.join(IMAGES_DIR, matchingFileName);
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함');
    } else {
        res.status(404).send("File not found");

    }
});


app.get("/etc/spGrade", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "etc/spGrade");
    let matchingFileName = null;

    fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (file===filename+`강.png`) {
            matchingFileName = file;
            console.log(matchingFileName)
        }
    });

    if (matchingFileName) {
        const imagePath = path.join(IMAGES_DIR, matchingFileName);
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함');
    } else {
        res.status(404).send("File not found");
    }
});

app.get("/etc/teamlogo", (req, res) => {
    const {filename} = req.query;
    const IMAGES_DIR = path.join(__dirname, "etc/teamlogo");
    let matchingFileName = null;

    fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (file.includes(filename)) {
            matchingFileName = file;
            console.log(matchingFileName)
        }
    });

    if (matchingFileName) {
        const imagePath = path.join(IMAGES_DIR, matchingFileName);
        const fileStream = fs.createReadStream(imagePath);
        res.setHeader("Content-Type", "image/png");
        fileStream.pipe(res);
        console.log('클라이언트 요청을 ', i += 1, '번 쨰 실행함');
    } else {
        res.status(404).send("File not found");
    }
});

//
// app.get('/accordiantest', (req, res) => {
//     MongoClient.connect(process.env.MONGO_ADDRESS)
//         .then(database => {
//             const db = database.db('fo4forum');
//             const collection = db.collection('schedule');
//             console.log(req.body)
//             // collection.find({name: {$regex: req.query.query}}).toArray()
//             collection.find('2023-04-08').toArray()
//                 .then(data => {
//                     res.json(data);
//                     // console.log(data)
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     res.status(500).send(err);
//                 })
//                 .finally(() => {
//                     database.close();
//                 });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).send(err);
//         });
//
//
// });
app.get('/accordiantest', (req, res) => {
    MongoClient.connect(process.env.MONGO_ADDRESS)
        .then(database => {
            const db = database.db('fo4forum');
            const collection = db.collection('schedules');
            console.log(req.query)
            collection.find({date: {$regex: req.query.date}}).sort({_id: -1}).limit(1).toArray()
                // collection.find(query).toArray()
                .then(data => {


                    const a = req.query.date
                    const b = req.query.nextdate

                    function getDayOfWeek(value) { //ex) getDayOfWeek('2022-06-13')

                        const week = ['일', '월', '화', '수', '목', '금', '토'];

                        const dayOfWeek = week[new Date(value).getDay()];

                        return dayOfWeek;

                    }


                    const pattern = /\d{4}-(\d{2})-(\d{2})/;
                    const match = a.match(pattern);
                    const match2 = b.match(pattern);

                    const month = match[1].replace(/^0+/, ''); // 월을 추출하고, 앞에 있는 0을 제거합니다.
                    const nextmonth = match2[1].replace(/^0+/, ''); // 월을 추출하고, 앞에 있는 0을 제거합니다.

                    const day = match[2].replace(/^0+/, ''); // 일을 추출하고, 앞에 있는 0을 제거합니다.
                    const nextday = match2[2].replace(/^0+/, ''); // 일을 추출하고, 앞에 있는 0을 제거합니다.

                    const week = getDayOfWeek(a)
                    const week1 = getDayOfWeek(b)
                    const result = `${month}.${day} (${week})`;
                    const result1 = `${nextmonth}.${nextday} (${week1})`;
                    console.log(result)
                    console.log(result1)


                    // console.log(result)
                    // const index = data.find(element => element.result && element.result.includes(result));
                    // const index = data[0].findIndex(text => text.includes(result));

                    // const index = data[0].find(text => text.includes(result));

                    // console.log(index)
                    // data[0].text && data[0].text.map((it, index) => {
                    //     if (it.includes(result)) {
                    //         // console.log(result)
                    //         // res.json(it)
                    //         var aa = index
                    //         if (it.includes(result1)) {
                    //             var bb = index
                    //             res.json({"1": aa, "2": bb})
                    //
                    //         }
                    //     }
                    //
                    // })

                    let aa = null;
                    let bb = null;

                    data[0].text && data[0].text.forEach((it, index) => {
                        if (it == result) {
                            aa = index;

                        }
                    });
                    data[0].text && data[0].text.forEach((it, index) => {
                        if (it == result1) {
                            bb = index;

                        }
                    });

                    if (aa !== null && bb !== null) {
                        console.log(aa, bb)
                        newData = data[0].text.slice(aa, bb)
                        console.log(newData)
                        res.json(newData);
                    } else {
                        console.log(aa, bb)
                        newData = data[0].text.slice(aa, bb)
                        console.log(newData)

                        res.json(newData);
                        // res.json({"1": aa, "2": bb});
                    }
                    // res.json(data[0].text);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err);
                })
                .finally(() => {
                    database.close();
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


app.get('/mariadb', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM LL_GAME_RESULT where DATE(time)="2023-04-09" ');
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
    } finally {
        if (conn) conn.release();
    }
});
///리그 별 경기 일정 및 결과 호출
app.get('/PL/matchSchedule', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE});
        // const nowDate_original = new Date()
        // console.log(nowDate_original)
        // const rows = await conn.query('SELECT * FROM PL_GAME_RESULT WHERE DATE_FORMAT(time, "%Y-%m-%d") LIKE ?', [nowDate]);
        const now = new Date();
        const yesterday=new Date();
        yesterday.setHours(yesterday.getHours()-6)
        // yesterday.setHours(yesterday.getHours()-240)
        now.setDate(now.getDate() + 1);
        const yesterdayDate = yesterday.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nowDate = new Date().toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nextDate = now.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        console.log(yesterdayDate,'yesterdayDate')
        console.log(nextDate,'nextDate')
        console.log(nowDate,'nowDate')
        // const rows = await conn.query('SELECT p.*,tp1.photourl AS home_photourl, tp2.photourl AS away_photourl FROM pl_game_result p JOIN TEAMLOGO_PL tp1 ON p.homeEng = tp1.ENGLISHSHORTNAME JOIN TEAMLOGO_PL tp2 ON p.awayEng = tp2.ENGLISHSHORTNAME WHERE DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? limit 7', [yesterdayDate,nextDate, nowDate]);
        const rows=await conn.query('SELECT p.*, tp1.photourl AS home_photourl, tp2.photourl AS away_photourl FROM pl_game_result p JOIN TEAMLOGO_PL tp1 ON p.homeEng = tp1.ENGLISHSHORTNAME JOIN TEAMLOGO_PL tp2 ON p.awayEng = tp2.ENGLISHSHORTNAME WHERE CONVERT_TZ(p.time, \'UTC\', \'Asia/Seoul\') >= DATE_SUB(CONVERT_TZ(NOW(), \'UTC\', \'Asia/Seoul\'), INTERVAL 3 DAY) AND CONVERT_TZ(p.time, \'UTC\', \'Asia/Seoul\') <= DATE_ADD(CONVERT_TZ(NOW(), \'UTC\', \'Asia/Seoul\'), INTERVAL 3 DAY);')
        console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
    } finally {
        if (conn) conn.release();
    }
});
app.get('/LL/matchSchedule', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const now = new Date();
        const yesterday=new Date();
        yesterday.setHours(yesterday.getHours()-240 )
        // yesterday.setHours(yesterday.getDay()-7)

        now.setDate(now.getDate() + 1);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        const yesterdayDate = yesterday.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nowDate = new Date().toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nextDate = now.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        // const rows = await conn.query('SELECT p.*,tp1.photourl AS home_photourl, tp2.photourl AS away_photourl FROM ll_game_result p JOIN TEAMLOGO_LL tp1 ON p.homeEng = tp1.ENGLISHSHORTNAME JOIN TEAMLOGO_LL tp2 ON p.awayEng = tp2.ENGLISHSHORTNAME WHERE DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? LIMIT 7', [yesterdayDate,nextDate, nowDate]);
        const rows = await conn.query('SELECT p.*, tp1.photourl AS home_photourl, tp2.photourl AS away_photourl FROM ll_game_result p JOIN TEAMLOGO_LL tp1 ON p.homeEng = tp1.ENGLISHSHORTNAME JOIN TEAMLOGO_LL tp2 ON p.awayEng = tp2.ENGLISHSHORTNAME WHERE CONVERT_TZ(p.time, \'UTC\', \'Asia/Seoul\') >= DATE_SUB(CONVERT_TZ(NOW(), \'UTC\', \'Asia/Seoul\'), INTERVAL 3 DAY) AND CONVERT_TZ(p.time, \'UTC\', \'Asia/Seoul\') <= DATE_ADD(CONVERT_TZ(NOW(), \'UTC\', \'Asia/Seoul\'), INTERVAL 3 DAY)');




        console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
    } finally {
        if (conn) conn.release();
    }
});
app.get('/KL/matchSchedule', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE});
        // const nowDate_original = new Date()
        // console.log('KLMATCHSCEHDULE',nowDate)
        const now = new Date();
        const yesterday=new Date();
        yesterday.setHours(yesterday.getHours()-6)
        // yesterday.setHours(yesterday.getDay()-7)

        now.setDate(now.getDate() + 1);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        const yesterdayDate = yesterday.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nowDate = new Date().toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const nextDate = now.toLocaleDateString('en-US', {timeZone: process.env.TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).split('/').join('-');
        const rows = await conn.query('SELECT p.*,tp1.photourl AS home_photourl, tp2.photourl AS away_photourl FROM kl_game_result p JOIN TEAMLOGO_KL tp1 ON p.home = tp1.HANGULNAME JOIN TEAMLOGO_KL tp2 ON p.away = tp2.HANGULNAME WHERE DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? OR DATE_FORMAT(time, "%m-%d-%Y") LIKE ? LIMIT 10', [yesterdayDate,nextDate, nowDate]);
        console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
    } finally {
        if (conn) conn.release();
    }
});


///리그 별 선수 개인 득점 현황 보드
app.get('/PL/PLAYERRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        const rows = await conn.query("SELECT * FROM STATS_PLAYER_PL AS spp, TEAMLOGO_PL AS TLP WHERE year = 2023 AND `TYPE` = 'Goals' AND TLP.ENGLISHSPECIALNAME=spp.TEAMNAME ORDER BY VALUE DESC")
        // console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});

app.get('/LL/PLAYERRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const rows=await conn.query("select `ssl`.TEAM,`ssl`.PLAYER ,`ssl`.GOAL,tll.PHOTOURL from TEAMLOGO_LL as tll ,STATS_PLAYER_LL as `ssl` where tll.HANGULSHORTNAME=`ssl`.TEAM limit 10")
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});


app.get('/KL/PLAYERRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        const rows=await conn.query("select `ssl`.TEAM,`ssl`.NAME ,`ssl`.GOAL,tll.PHOTOURL from TEAMLOGO_KL as tll ,STATS_PLAYER_KL as `ssl` where tll.HANGULSHORTNAME=`ssl`.TEAM limit 10")
        // console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});

app.get('/news',async (req,res)=>{
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        const rows = await conn.query("SELECT * FROM(SELECT * FROM NEWS_OFFICIAL ORDER BY REG_DATE DESC LIMIT 20) subquery ORDER BY RAND() LIMIT 5")
        // console.log(rows)
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }

})


app.get('/LL/TEAMRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const rows=await conn.query("select RL.*,TL.PHOTOURL from RANK_LL RL , TEAMLOGO_LL TL where RL.ENGNAME=TL.ENGLISHSHORTNAME order by POINTS DESC ,WIN DESC")
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});
app.get('/PL/TEAMRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const rows=await conn.query("select RL.*,TL.PHOTOURL from RANK_PL RL , TEAMLOGO_PL TL where RL.ENGNAME=TL.ENGLISHSHORTNAME order by POINTS DESC ,WIN DESC")
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});

app.get('/KL/TEAMRANK', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        const nowDate_original = new Date()
        console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const rows=await conn.query("select RL.*,TL.PHOTOURL from RANK_KL RL , TEAMLOGO_KL TL where RL.NAME =TL.HANGULNAME  order by POINTS DESC ,WIN DESC")
        res.json(rows);
    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});

app.get('/SearchPlayerInfo', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // const nowDate = new Date().toISOString().slice(0, 10);
        // const nowDate_original = new Date()
        // console.log(nowDate_original)
        // const now_year=nowDate_original.slice(0,4)
        // const rows = await conn.query("SELECT * FROM STATS_PLAYER_LL AS spl WHERE year = 2023 ORDER BY GOAL DESC limit 10");
        const spid = req.query.spid;
        const rows = await conn.query("SELECT * FROM PLAYERDB WHERE Id = ?", [spid]);
        res.json(rows);

    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});



//seasonID 를 받고 DB에서 해당 시즌 이미지 URL을 리턴해줌
app.get('/SearchSeasonImg', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const seasonid = req.query.seasonid;
        const rows = await conn.query("SELECT seasonImg FROM SEASONID_IMG_MATCH WHERE seasonId = ?", [seasonid]);
        res.json(rows[0].seasonImg);

    } catch (err) {
        res.status(500).send('단순 에러입니다.');
        console.log(err)
    } finally {
        if (conn) conn.release();
    }
});