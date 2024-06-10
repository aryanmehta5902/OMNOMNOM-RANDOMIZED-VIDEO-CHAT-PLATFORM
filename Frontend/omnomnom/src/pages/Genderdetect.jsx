import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './style.css';
import { useNavigate } from 'react-router';

const Genderdetect = () => {
    const videoRef = useRef(null);
    const [gender, setGender] = useState(null);
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.ageGenderNet.loadFromUri('/models')
            ]);
        };

        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
                // Handle the error here (e.g., display message to user)
            }
        };

        const detectFaces = () => {
            const video = videoRef.current;
            if (!video) return;

            let timeoutId; // Variable to store the timeout ID
            const intervalId = setInterval(async () => {
                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withAgeAndGender();

                if (detections) {
                    const { gender } = detections;
                    console.log(gender);
                    setGender(gender);
                }
            }, 100);

            // Set a timeout to stop the interval and video capture after 20 seconds
            timeoutId = setTimeout(() => {
                clearInterval(intervalId); // Stop the interval
                stopVideoCapture(); // Stop video capture and release camera resources
            }, 20000); // 20 seconds

            return () => {
                // Clean up interval and timeout when component unmounts
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        };

        const stopVideoCapture = () => {
            const video = videoRef.current;
            if (!video) return;

            const stream = video.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };

        loadModels().then(() => {
            startVideo();
            detectFaces();
        });

    }, []);

    useEffect(() => {
        if (gender === 'male') {
            setMaleCount(prevCount => prevCount + 1);
            setFemaleCount(0);
        } else if (gender === 'female') {
            setFemaleCount(prevCount => prevCount + 1);
            setMaleCount(0);
        }

        if (maleCount >= 10) {
            localStorage.setItem('mygender', 1);
            navigate('/');
            setMaleCount(0);
        } else if (femaleCount >= 10) {
            localStorage.setItem('mygender', 0);
            navigate('/');
            setFemaleCount(0);
        }
    }, [gender, maleCount, femaleCount, navigate]);

    return (
        <div>
            <video ref={videoRef} width="640" height="480" autoPlay muted></video>
            <p>Detected Gender: {gender}</p>
        </div>
    );
};

export default Genderdetect;
