import React, { useCallback, useState, useEffect } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom'


const Home = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const [name, setName] = useState("")
    const [valuesAndTraits, setValuesAndTraits] = useState([0, 0, 0, 0, 0, 0]);
    const [genderPreference, setGenderPreference] = useState(1);
    const navigate = useNavigate()
    const socket = useSocket();

    const handleGenderPreferenceChange = (event) => {
        setGenderPreference(parseInt(event.target.value));
    };

    const [hobbies, setHobbies] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // Initial array with all hobbies unchecked

    const handleCheckboxChange = (index) => {
        const newHobbies = [...hobbies];
        newHobbies[index] = newHobbies[index] ? 0 : 1; // Toggle the value
        setHobbies(newHobbies);
    };

    const handleCheckboxChange2 = (index) => {
        const newValuesAndTraits = [...valuesAndTraits];
        newValuesAndTraits[index] = newValuesAndTraits[index] ? 0 : 1; // Toggle the value
        setValuesAndTraits(newValuesAndTraits);
    };

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data
        navigate(`/room/${room}`);
    }, [navigate])

    useEffect(() => {
        socket.on("room:join", handleJoinRoom)

        return () => {
            socket.off('room:join', handleJoinRoom)
        }
    }, [socket])

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        localStorage.setItem('userData', JSON.stringify({ 'name': name, 'email': email, 'valuesAndTraits': valuesAndTraits, 'hobbies': hobbies, 'genderPreference': genderPreference }));
        navigate('/waiting');
        const mygender=localStorage.getItem('mygender')
        socket.emit('waitingroom:join', { name, email, valuesAndTraits, hobbies, genderPreference,mygender });
        // socket.emit('room:join', { email, room });
    }, [name, email, valuesAndTraits, hobbies, genderPreference, socket])

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-yellow-700 font-semibold text-8xl mb-8">
                Welcome to <span className="text-yellow-500 font-bold">Omnomnom</span>
            </h1>
            <form onSubmit={handleSubmitForm} className="flex flex-col items-center">
                 {/* ----------------- */}

                 <label className="mb-2 mt-4">Verify your gender</label>
                <Link to="/genderverify"><button className="border border-red-400 rounded-md px-4 py-2 bg-orange-300">Verify</button></Link>
{/* -------------- */}
                <label htmlFor="email" className="mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Enter email"
                    className="border border-red-600 rounded-md px-2 py-1 mb-4 bg-white"
                />

                <label htmlFor="text1" className="mb-2">Name</label>
                <input
                    type="text"
                    id="text1"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    placeholder="Enter name"
                    className="border border-red-600 rounded-md px-2 py-1 mb-4 bg-white"
                />

               

                {/* ----------------- */}


                <label className="mb-2 mt-4">Gender Preference</label>
                <div className='flex mb-5 border border-red-600 rounded-md px-2 py-1 bg-white'>
                    <div className='mr-3'>
                        <input
                            type="radio"
                            id="male"
                            value="1"
                            onChange={handleGenderPreferenceChange}
                            checked={genderPreference === 1}
                        />
                        <label htmlFor="male">Male</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="female"
                            value="0"
                            onChange={handleGenderPreferenceChange}
                            checked={genderPreference === 0}
                        />
                        <label htmlFor="female">Female</label>
                    </div>
                </div>

                {/* ------------------ */}


                <label className="mb-2">Hobbies</label>
<div className='border border-red-600 rounded-md px-2 py-1 mb-4 bg-white flex'>
    {['Sports', 'Dancing', 'Clubbing', 'Music', 'Travelling', 'Cooking', 'Gaming', 'Movies', 'Anime', 'Pet'].map((hobby, index) => (
        <div key={index} className="mr-4">
            <input
                type="checkbox"
                id={hobby.toLowerCase()}
                onChange={() => handleCheckboxChange(index)}
                checked={hobbies[index]}
            />
            <label htmlFor={hobby.toLowerCase()}>{hobby}</label>
        </div>
    ))}
</div>





                {/* ------------------------- */}


                <label className="mb-2">Values and Traits</label>
<div className='border border-red-600 rounded-md px-2 py-1 mb-4 bg-white flex'>
    {['Family Oriented', 'Open-minded', 'Romantic', 'Confident', 'Ambitious', 'Creative'].map((trait, index) => (
        <div key={index} className="mr-4">
            <input
                type="checkbox"
                id={trait.toLowerCase().replace(/\s+/g, '-')} // Replace spaces with dashes
                onChange={() => handleCheckboxChange2(index)}
                checked={valuesAndTraits[index]}
            />
            <label htmlFor={trait.toLowerCase().replace(/\s+/g, '-')}>{trait}</label>
        </div>
    ))}
</div>


                {/* -------------------------- */}
                {/* <label htmlFor="room" className="mb-1">Room code</label>
                    <input
                        type="text"
                        id="room"
                        onChange={(e) => setRoom(e.target.value)}
                        value={room}
                        placeholder="Enter code"
                        className="border border-red-600 rounded-md px-2 py-1 mb-2"
                    /> */}
                <button type="submit" className="border border-red-400 rounded-md px-4 py-2 bg-orange-300">Join</button>
            </form>
        </div>

    )
}

export default Home