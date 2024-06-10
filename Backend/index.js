const express=require('express')
// const bodyParser=require('body-parser')
const {Server}=require('socket.io')

const io=new Server(8000,{
    cors:true
});

const emailtoSocketIdMap=new Map();
const socketidtoEmailMap=new Map();
const waitingRoomUsers = {};
const sockettoEmail={};
var alluserlist=[]



io.on("connection",(socket)=>{
    console.log('Socket connected',socket.id);
    socket.on('room:join',data=>{
        const {email,room}=data
        emailtoSocketIdMap.set(email,socket.id);
        socketidtoEmailMap.set(socket.id,email);
        io.to(room).emit("user:joined",{email,id:socket.id})
        socket.join(room)
        io.to(socket.id).emit("room:join",data)
        delete waitingRoomUsers[socket.id];
    
        // Emit the updated list of users to all clients in the waiting room
        io.to(0).emit('waitingroom:users', Object.values(waitingRoomUsers));
        socket.join(room)
    });

    //----------------

    socket.on('room:connect', ({ room, email }) => {
        console.log(`User(s) ${email} are connecting to room ${room} with id ${sockettoEmail[email]}`);

        // Join the room
        // alluserlist.forEach(user => {
        //     // Make sure to emit the room number to each user individually
        //     if(user.email===email){
        //         io.to(room).emit("user:joined",{email,id:socket.id})
        // socket.join(room)
        // io.to(socket.id).emit("room:join",{ room, email })
        //     }
        // });

        io.to(room).emit("user:joined",{email,id:sockettoEmail[email]})
        socket.join(room)
        io.to(sockettoEmail[email]).emit("room:join",{email,room})
        delete waitingRoomUsers[sockettoEmail[email]];
    
        // Emit the updated list of users to all clients in the waiting room
        io.to(0).emit('waitingroom:users', Object.values(waitingRoomUsers));
    });

    //----------------

    socket.on('waitingroom:join',data=>{
        const {name,email,valuesAndTraits,hobbies,genderPreference,mygender}=data
        // emailtoSocketIdMap.set(email,socket.id);
        // socketidtoEmailMap.set(socket.id,email);
        waitingRoomUsers[socket.id] = { name, email, valuesAndTraits, hobbies, genderPreference,mygender };
        sockettoEmail[email]=socket.id;
        alluserlist.push({ name, email, valuesAndTraits, hobbies, genderPreference,mygender })
        io.to(0).emit('waitingroom:users', Object.values(waitingRoomUsers));

        io.to(0).emit("waitingroomuser:joined",{name,email,valuesAndTraits,hobbies,genderPreference,mygender,id:socket.id})
        socket.join(0)
        io.to(socket.id).emit("waitingroom:join",data)
    });

    socket.on('disconnect', () => {
        // Remove user data from the waiting room users object
        delete waitingRoomUsers[socket.id];
    
        // Emit the updated list of users to all clients in the waiting room
        io.to(0).emit('waitingroom:users', Object.values(waitingRoomUsers));
      });


    socket.on("user:call",({to, offer}) => {
        io.to(to).emit("incoming:call",{from: socket.id,offer});
    });

    socket.on("call:accepted",({to, ans}) => {
        io.to(to).emit("call:accepted",{from: socket.id,ans});
    });

    socket.on("peer:nego:needed",({to, offer}) => {
        io.to(to).emit("peer:nego:needed",{from: socket.id,offer});
    });

    socket.on("peer:nego:done",({to, ans}) => {
        io.to(to).emit("peer:nego:final",{from: socket.id,ans});
    });

});

// app.listen(8000,()=>console.log("http server running at port 8000"));
// io.listen(8001);