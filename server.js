//설치한 express 라이브러리 열기
const express = require('express');
//app 변수에 담기
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})) 


const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

app.use('/public',express.static('public'))
//html에서 put을 사용하려면 해야됨
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
var db;
MongoClient.connect('mongodb+srv://admin:woalsrr1@cluster0.zl0aure.mongodb.net/web?retryWrites=true&w=majority',
function(err,client){
    //서버를 실행하는 함수(포트번호, 실행할 함수)
    if(err){
        return console.log(err);
    }
    db = client.db('web');

    app.listen(8080, function(){
        console.log('listening on 8080');
    });
    
})


//.get(경로, 함수(요청, 응답)))
app.get('/',function(req,res){
    res.render('index.ejs');
});
//.get(경로, 함수(요청, 응답)))
app.get('/write',function(req,res){
    res.render('write.ejs');
});
//받은 파일은 req에 저장이 되어 있다. 
// 사용하려면 body-parser를 설치해야된다.

app.post('/add',function(req,res){
    res.send("전송완료");
    //req.body를 하면 전송받은 데이터들을 볼 수 있다. 
    db.collection('counter').findOne({name:'게시물갯수'}, function(에러,결과){
        
        var totalcount = 결과.totalPost;
        db.collection('post').insertOne({_id :totalcount+1 ,제목 : req.body.title, 날짜 : req.body.date, 내용:req.body.data}, function(err,결과){
            console.log("저장완료");
            //counter에 있는 totalPost 숫자 증가시키기
            //$set(변경), {$set:{컬럼 이름 : 바꿀값}}
            //$inc(증가),{$inc:{컬럼 이름 : 증가 값}}
            db.collection('counter').updateOne({name:'게시물갯수'},{$inc : {totalPost:1}},function(에러, 결과){
                if(에러){
                    return console.log(에러);
                }
            });
        });
    });
});

app.delete('/delete',function(요청,응답){
    console.log(요청.body)
    //요청.body 가 String 넘어오므로  int로 변환해야된다.
    요청.body._id = parseInt(요청.body._id);
    console.log(요청.body._id);
    db.collection('post').deleteOne({_id:요청.body._id},function(에러, 결과){
        console.log('삭제완료');
        응답.status(200).send({message:'성공했습니다.'});
    });
});
app.get('/detail/:id', function(요청,응답){
    요청.params.id = parseInt(요청.params.id);
    db.collection('post').findOne({_id:요청.params.id},function(에러,결과){
        console.log(결과)
        응답.render('detail.ejs',{data:결과});
    })
    
})

//list에 get 요청시 ejs로 파일 보내기
//ejs파일은 views폴더에 있어야됨.
app.get('/list', function(req,res){
    //디비에서 모든 데이터 꺼내기
    db.collection('post').find().toArray(function(err,결과){
        if(err){
            console.log(err);
        }
        console.log(결과);
        res.render('list.ejs',{posts:결과});  
    });
});

app.get('/edit/:id',function(요청, 응답){
    요청.params.id = parseInt(요청.params.id);
    db.collection('post').findOne({_id:요청.params.id},function(에러,결과){
        console.log(결과);
    응답.render('edit.ejs',{post:결과});
    })
})

app.put('/edit', function(요청, 응답){ 
    db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date, 내용 : 요청.body.data}}, 
      function(){ 
      
      console.log('수정완료') 
      응답.redirect('/list') 
    }); 
  }); 

  const passport=require('passport');
  const LocalStrategy=require('passport-local').Strategy;
  const session=require('express-session');

  app.use(session({secret:'비밀코드', resave : true, saveUninitialized:false}));
  app.use(passport.initialize());
  app.use(passport.session());
