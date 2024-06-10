import React, { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router';

const Waiting = () => {

    const socket = useSocket();
    const navigate = useNavigate()
    const [waitingRoomUsers, setWaitingRoomUsers] = useState([]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data
        navigate(`/room/${room}`);
    }, [navigate])

    const handleUserJoined = useCallback(({ name, email, valuesAndTraits, hobbies, genderPreference,mygender, id }) => {
        console.log(`username ${name} joined`);
        // setRemoteSocketId(id)
    }, [])

    const dotProduct = (vector1, vector2) => {
        let result = 0;
        for (let i = 0; i < vector1.length; i++) {
            result += vector1[i] * vector2[i];
        }
        return result;
    }

    var [maxisimilarity, setMaxisimiliarity] = useState(-1)
    var [pairuser, setPairuser] = useState(null)

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');

        const userData = JSON.parse(userDataString);
        const usergen=localStorage.getItem('mygender')
        console.log(userData);
        console.log("hobby", userData.hobbies);
        let sum1 = 0;
        userData.hobbies.forEach(num => {
            sum1 += num;
        })
        let sum3 = 0;
        userData.valuesAndTraits.forEach(num => {
            sum3 += num;
        })
        if (waitingRoomUsers.length > 1) {
            for (var i = 0; i < waitingRoomUsers.length; i++) {
                let sum2 = 0;
                waitingRoomUsers[i].hobbies.forEach(num => {
                    sum2 += num;
                })
                let sum4 = 0;
                waitingRoomUsers[i].valuesAndTraits.forEach(num => {
                    sum4 += num;
                })
                console.log("ini user email", userData.email);
                console.log("sec user email", waitingRoomUsers[i].email);
                console.log('udatagenderpref',userData.genderPreference);
                console.log('wrmygender',parseInt(waitingRoomUsers[i].mygender));
                console.log('usergen',usergen);
                if (userData.genderPreference === parseInt(waitingRoomUsers[i].mygender) && parseInt(waitingRoomUsers[i].genderPreference) === parseInt(usergen) && userData.email !== waitingRoomUsers[i].email) {
                    console.log('absinside1');
                    var temp = parseFloat(((dotProduct(userData.hobbies, waitingRoomUsers[i].hobbies) / (Math.sqrt(sum1) * Math.sqrt(sum2))) + (dotProduct(userData.valuesAndTraits, waitingRoomUsers[i].valuesAndTraits) / (Math.sqrt(sum3) * Math.sqrt(sum4)))) / 2)
                    if (temp >= maxisimilarity) {
                        console.log('absinside2');
                        setMaxisimiliarity(temp)
                        setPairuser(waitingRoomUsers[i])
                    }

                }
            }
        }
        if (pairuser && waitingRoomUsers.length>1) {
            const room = Math.floor(Math.random() * 10000);
        socket.emit('room:join', { email:userData.email, room:room });
        socket.emit('room:connect', { room: room, email: pairuser.email });

        }

    }, [waitingRoomUsers])

    useEffect(() => {
        console.log(maxisimilarity);
        console.log(pairuser);
        console.log(waitingRoomUsers);
    }, [pairuser, maxisimilarity, waitingRoomUsers])

    useEffect(() => {
        // socket.on("waitingroom:join", handleJoinRoom)
        socket.on('waitingroomuser:joined', handleUserJoined)
        socket.on("room:join", handleJoinRoom)
        socket.on('waitingroom:users', (users) => {
            setWaitingRoomUsers(users);
        });
        return () => {
            // socket.off('waitingroom:join', handleJoinRoom)
            socket.off('waitingroomuser:joined', handleUserJoined)
            socket.off('waitingroom:users');
        }
    }, [socket])

    return (
        <>
            {/* <div className='flex h-screen justify-center items-center text-6xl'>Waiting.....!!!</div> */}
            <div className="flex h-screen justify-center items-center text-6xl">
                <div>
                    <p>Users in the waiting room:</p>
                    <ul>
                        {waitingRoomUsers.map((user) => (
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>
                </div>
            </div></>
    )
}

export default Waiting