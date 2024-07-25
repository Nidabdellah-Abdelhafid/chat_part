import React, { useEffect, useState, useRef, createRef } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { URL_BACKEND } from "./api.js";
import axios from 'axios';
import InsertEmoticon from '@material-ui/icons/InsertEmoticon';
// import MicIcon from '@material-ui/icons/Mic';
import { SendOutlined, Search, AttachFile, RotateLeft, RotateRight } from '@material-ui/icons'; // Import AttachFile icon
import socket from './socket.js';
// import svgImage from '../assets/images/svg.svg';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import './ChatWindow.css';
// import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
// import LazyLoad from 'react-lazyload';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import bgChat from '../assets/images/bgChat.jpg';

const ChatWindow = ({ user }) => {
    const [message, setMessage] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [messagea, setMessagea] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreview, setFilePreview] = useState(null); // State for file preview
    const chatBodyRef = useRef(null);
    const inputRef = createRef();
    // const [showEmojis, setShowEmojis] = useState(false);
    // const [fileId, setFileId] = useState(null);
    // const [zoomed, setZoomed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [rotationAngles, setRotationAngles] = useState({});

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${URL_BACKEND}/api/messages?populate=*&pagination[limit]=-1`);
            const messages = response.data.data;

            const currentUserEmail = user?.email;
            const adminEmail = 'admin@atlasvoyage.com';

            const filteredMessages = messages.filter(message => {
                const senderEmail = message?.attributes.sender?.data?.attributes.email;
                const receiverEmail = message?.attributes.receiver?.data?.attributes.email;

                return (senderEmail === currentUserEmail && receiverEmail === adminEmail) ||
                    (senderEmail === adminEmail && receiverEmail === currentUserEmail);
            });

            setMessage(filteredMessages);
            setFilteredMessages(filteredMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [user]);

    useEffect(() => {
        socket.on('recvMsg', (message) => {
            setMessage((prevMessages) => [...prevMessages, message]);
            fetchMessages();
        });

        return () => {
            socket.off('recvMsg');
        };
    }, [message]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [filteredMessages]);

    useEffect(() => {
        const filtered = message.filter(msg => msg.attributes?.content?.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredMessages(filtered);
    }, [searchTerm, message]);

    if (!user) {
        return (
            <div
            className="hero h-90"
            style={{
                backgroundImage: `url(${bgChat})`, 
            }}
        >
                <div className="hero-overlay bg-opacity-60"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
                    <p className="mb-5">
                        Select user to start chatting.
                    </p>
                    {/* <button className="btn btn-primary">Get Started</button> */}
                    </div>
                </div>
                </div>
        );
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${formattedDate} ~ ${formattedTime}`;
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!user || (!messagea && selectedFiles.length === 0)) {
            alert("🚫 Le message est vide ou aucun fichier sélectionné!");
            return;
        }
        const newMessage = {
            content: messagea,
            sender: 1,
            receiver: user?.id
        };
        if (selectedFiles.length > 0) {
            const formData = new FormData();
            formData.append('files.document', selectedFiles[0]);
            console.log("selectedFiles:  ",selectedFiles[0])
            formData.append('data', JSON.stringify(newMessage));

            try {
                
                const uploadResponse = await axios.post(`${URL_BACKEND}/api/messages`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (uploadResponse.status === 200) {
                    setMessagea('');
                    setSelectedFiles([]);
                    setFilePreview(null); 
                    fetchMessages();
                } else {
                    console.error(`Unexpected status code: ${uploadResponse.status}`);
                    alert(`Unexpected status code: ${uploadResponse.status}`);
                    return;
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error uploading file');
                return;
            }
        } else if(selectedFiles.length === 0) {
            socket.emit('sendMsg', newMessage);
            setMessagea('');
            setSelectedFiles([]);
            fetchMessages();
        }
    };
    
    const handleZoomOut = () => {
        setSelectedImage('');
        setIsOpen(false);
        setRotationAngles({});
    };

    const handleRotate = (url, direction) => {
        setRotationAngles(prevAngles => ({
            ...prevAngles,
            [url]: (prevAngles[url] || 0) + direction
        }));
    };

    const handleImageClick = (url) => {
        setSelectedImage(url);
        setIsOpen(true);
    };

    const renderMessages = () => {
        return filteredMessages.map(message => (
            <div key={message.id} className={`chat mt-4 ${message?.attributes?.sender?.data?.attributes?.username === 'admin' ? 'chat-end' : 'chat-start'}`}>
                
                    <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                    {message?.attributes?.sender?.data?.attributes?.username === 'admin' ? <Image src='https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg'  alt="Tailwind CSS chat bubble component"/> :<Image src={`${URL_BACKEND}${user.image.url}`}  alt="Tailwind CSS chat bubble component"/> }
                     
                    </div>
                    </div>
                    <div className="chat-header bg-white">
                        ~{message?.attributes?.sender?.data?.attributes?.username}~
                        
                    </div>
                    <div className="chat-bubble">
                    {message?.attributes?.content}
                    {message?.attributes?.document?.data ? (
                        <div className="message-file">
                            {message.attributes.document?.data.attributes.mime.includes('image') ? (
                                <div className="message-image">
                                    <Image 
                                        src={`${URL_BACKEND}${message.attributes.document?.data.attributes.url}`} 
                                        alt="Image" 
                                        onClick={() => handleImageClick(`${URL_BACKEND}${message.attributes.document?.data.attributes.url}`)} 
                                        style={{ 
                                            width: 'auto', 
                                            maxWidth: '100%', 
                                            height: 'auto', 
                                            maxHeight: '300px', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            transform: `rotate(${rotationAngles[`${URL_BACKEND}${message.attributes.document?.data.attributes.url}`] || 0}deg)`
                                        }} 
                                    />
                                </div>
                            ) : (
                                <div className="message-document">
                                    <a href={`${URL_BACKEND}${message.attributes.document?.data.attributes.url}`} target="_blank" rel="noopener noreferrer" className='text-color-white'>
                                        {message.attributes.document?.data.attributes.name}
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : null}
                    </div>
                    <div className="chat-footer bg-white">Sent at {formatDateTime(message?.attributes?.createdAt)}</div>
                </div>
            
        ));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage(e);
        }
    };

    const onEmojiClick = (emoji) => {
        const emojiChar = emoji.native;
        setMessagea(prevMessagea => prevMessagea + emojiChar);
    };

    const handleShowEmojis = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleFocus = () => {
        setShowEmojiPicker(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFiles([file]);
        setFilePreview(URL.createObjectURL(file));
    };

    return (
        <Container className="chat-window">
            <Row className="chat-header">
                <div className='d-flex mt-2'>
                    <div className="avatar online">
                    <div className="w-20 rounded-full">
                    <Image src={`${URL_BACKEND}${user.image.url}`} />
                    </div>
                    </div>
                    <div className="flex items-center justify-center h-20">
                        <p className="text-center ml-3 text-xl">{user.username}</p>    
                    </div>
                </div>
                
            </Row>
            <Row className="search-bar">
                <Col className="search-bar-wrapper">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </Col>
            </Row>
            <Row className="chat-body" ref={chatBodyRef}>
                <Col>
                    {renderMessages()}
                </Col>
            </Row>
            <Dialog open={isOpen} onClose={handleZoomOut}>
  <DialogContent>
    <div className="flex justify-center items-center">
      <img
        src={selectedImage}
        alt="Selected"
        className="max-w-full max-h-[75vh] transform transition-transform"
        style={{ transform: `rotate(${rotationAngles[selectedImage] || 0}deg)` }}
      />
    </div>
  </DialogContent>
  <DialogActions className="flex justify-between">
    <Button
      onClick={() => window.open(selectedImage, '_blank')}
      className="bg-blue-500 hover:bg-blue-600 text-black rounded-md py-2 px-4"
    >
      Download
    </Button>
    <Button
      onClick={() => handleRotate(selectedImage, 90)}
      className="bg-gray-500 hover:bg-gray-600 text-black rounded-md py-2 px-4"
    >
      <RotateLeft />
    </Button>
    <Button
      onClick={() => handleRotate(selectedImage, -90)}
      className="bg-gray-500 hover:bg-gray-600 text-black rounded-md py-2 px-4"
    >
      <RotateRight />
    </Button>
    <Button
      onClick={handleZoomOut}
      className="bg-red-500 hover:bg-red-600 text-black rounded-md py-2 px-4"
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

            <div className="chat__footer relative flex items-center p-4 bg-white shadow-md">
                <InsertEmoticon onClick={handleShowEmojis} className="file-emoji-wrapper cursor-pointer" />
                {showEmojiPicker && 
                <div className="absolute bottom-20 left-0">
                    <Picker 
                        data={data} 
                        onEmojiSelect={onEmojiClick} 
                        emojiSize={20} 
                    />
                </div>
                }
                <div className="flex flex-grow items-center">
                    <input
                        value={messagea}
                        onChange={(e) => setMessagea(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message"
                        type="text"
                        className="send-input flex-grow border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        ref={inputRef}
                        onFocus={handleFocus}
                    />
                </div>
                <div className="flex items-center ml-2">
                    <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        className="file-input hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <AttachFile />
                    </label>
                </div>
                <button onClick={sendMessage} type="submit" className="btnsend ml-2 bg-blue-500 text-white p-2 rounded-md focus:outline-none hover:bg-blue-600">
                    <SendOutlined />
                </button>
            </div>


            {filePreview && (
                <div className="file-preview">
                    <Image src={filePreview} alt="Preview" width="60" height="auto" rounded />
                </div>
            )}
        </Container>
    );
};

export default ChatWindow;

