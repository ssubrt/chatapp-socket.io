const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { connect } = require('./config/db-config');
const Group = require('./models/group');
const Chat = require('./models/chat');

const io = new Server(server);


app.set('view engine','ejs');


app.use(express.json());

app.use(express.urlencoded({extended:true}))




// app.use('/',express.static(__dirname + '/public'));




io.on('connection',(socket)=>{
    console.log('a user connected',socket.id);

    socket.on('disconnect',()=>{
        console.log('user disconnected',socket.id);
    });

    // socket.on('from_client',()=>{


    //     console.log("Recived event from the client")
    // })

    // setInterval(function f(){
    //     socket.emit('from_server');
    // },3000);


    socket.on('join_room',(data)=>{
        console.log("joining the room",data.roomid);
        socket.join(data.roomid)
    })


    socket.on('new_msg',async(data)=>{
      console.log("recved data is : ",data)
      const chat = await Chat.create({
        roomid:data.roomid,
        sender:data.sender,
        content:data.message
      });
        io.to(data.roomid).emit("msg_revd",data)


        // io.emit('msg_revd',data);
         // socket.emit('msg_revd',data);
         // socket.broadcast.emit('msg_revd',data);
    })
});




app.get('/chat/:roomid/:user', async (req,res)=>{
   const group = await Group.findById(req.params.roomid);
   console.log("group is :" , group);
   const chats = await Chat.find({
    roomid:req.params.roomid
   });
   console.log("chats is : ",chats);
    res.render('index',{        
        roomid:req.params.roomid,
        user: req.params.user,
        groupname: group.name,
        previousmsgs:chats
       
       
    });
});

app.get('/group',(req,res)=>{
    res.render('group');
})

app.post('/group',async(req,res)=>{
    console.log("name is : " , req.body);
    await Group.create({
        name:req.body.name
    });
    res.redirect('/group');
})

server.listen(3000,async()=>{
    console.log("Servr running on *:3000");
    await connect();
    console.log("DB is connected...")

})
