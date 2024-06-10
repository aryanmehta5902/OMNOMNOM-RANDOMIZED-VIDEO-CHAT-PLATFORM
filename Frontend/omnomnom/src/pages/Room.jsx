import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from "../service/peer";
import { useNavigate } from 'react-router';


const Room = () => {
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState();
    const navigate = useNavigate()

    const redirwaitingroom = () => {
        // Retrieve user data from localStorage
        const userDataString = localStorage.getItem('userData');
        const mygender =localStorage.getItem('mygender')
// Parse user data from JSON format
const { name, email, valuesAndTraits, hobbies, genderPreference } = JSON.parse(userDataString);

        // Navigate to the '/waiting' route
        navigate('/waiting');

        // Emit the user's data to the server upon joining the waiting room
        socket.emit('waitingroom:join', { name, email, valuesAndTraits, hobbies, genderPreference,mygender });

    }
    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`email ${email} joined`);
        setRemoteSocketId(id)
    }, [])

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });

        setMyStream(stream)
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream)
        console.log(`Incoming call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
    }, [remoteSocketId, socket]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }, [handleNegoNeeded]);

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            console.log("Got Tracks !!");
            setRemoteStream(remoteStream[0]);
        })
    }, []);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incoming:call', handleIncomingCall)
        socket.on('call:accepted', handleCallAccepted)
        socket.on('peer:nego:needed', handleNegoNeedIncoming);
        socket.on('peer:nego:final', handleNegoNeedFinal);
        return () => {
            socket.off("user:joined", handleUserJoined)
            socket.off('incoming:call', handleIncomingCall)
            socket.off('call:accepted', handleCallAccepted)
            socket.off('peer:nego:needed', handleNegoNeedIncoming);
            socket.off('peer:nego:final', handleNegoNeedFinal);
        }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal])

    return (


        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-yellow-700 font-semibold text-8xl mb-8">
                Room Page
            </h1>
            <h4 className="mb-4">
                {remoteSocketId ? 'Connected' : 'No one in room'}
            </h4>
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSocketId && (
                <button onClick={handleCallUser} className="border border-black rounded-md px-4 py-2 mb-4">
                    Call
                </button>
            )}
            {myStream && (
                <div className="w-full max-w-xl">
                    <ReactPlayer playing muted height="300px" width="100%" url={myStream} />
                </div>
            )}
            {remoteStream && (
                <div className="w-full max-w-xl">
                    <ReactPlayer playing muted height="300px" width="100%" url={remoteStream} />
                </div>
            )}
            <button onClick={() => redirwaitingroom()} className="border border-red-400 rounded-md px-4 py-2 bg-orange-300">Next</button>

        </div>

    )
}

export default Room