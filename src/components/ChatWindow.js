import React, { useEffect, useState, useRef, createRef } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { URL_BACKEND } from "./api.js";
import axios from 'axios';
import InsertEmoticon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import { SendOutlined, Search, AttachFile, RotateLeft, RotateRight } from '@material-ui/icons'; // Import AttachFile icon
import socket from './socket.js';
import svgImage from '../assets/images/svg.svg';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import './ChatWindow.css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import LazyLoad from 'react-lazyload';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';

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
    const [showEmojis, setShowEmojis] = useState(false);
    const [fileId, setFileId] = useState(null);
    const [zoomed, setZoomed] = useState(false);
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
            <div className="chat-window-placeholder background-div">
                <div style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 50, textAlign: 'center' }}>
                    <Image
                        src={svgImage}
                        roundedCircle
                        className="m-2 image-animation"
                        width="300px"
                        height="300px"
                        alt="SVG"
                    />
                    <p className="text-animation" style={{ textAlign: 'center', fontSize: 35, fontWeight: '700', color: '#000' }}>
                        Voyages sur mesure
                    </p>
                    <p className="text-animation" style={{ textAlign: 'center', fontWeight: '700', fontSize: 18, color: '#000' }}>
                        Select a user to start chatting
                    </p>
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
            <div key={message.id} className={`message ${message?.attributes?.sender?.data?.attributes?.username === 'admin' ? 'user-message' : 'admin-message'}`}>
                <div className="message-text">
                    <div className="message-sender">~{message?.attributes?.sender?.data?.attributes?.username}~</div>
                    <div className="message-content">{message?.attributes?.content}</div>
                    
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
                                    <a href={`${URL_BACKEND}${message.attributes.document?.data.attributes.url}`} target="_blank" rel="noopener noreferrer">
                                        {message.attributes.document?.data.attributes.name}
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : null}
                    <div className="message-timestamp">{formatDateTime(message?.attributes?.createdAt)}</div>
                </div>
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
                <Col>
                    <Image src={`${URL_BACKEND}${user.image.url}`} roundedCircle className="m-2" width="60px" height="60px" />
                    {user.username}
                </Col>
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
                    <img 
                        src={selectedImage} 
                        alt="Selected" 
                        style={{
                            width: 'auto', 
                            maxWidth: '100%', 
                            height: 'auto', 
                            maxHeight: '75vh', 
                            transform: `rotate(${rotationAngles[selectedImage] || 0}deg)`
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.open(selectedImage, '_blank')}>Download</Button>
                    <Button onClick={() => handleRotate(selectedImage, 90)}><RotateLeft /></Button>
                    <Button onClick={() => handleRotate(selectedImage, -90)}><RotateRight /></Button>
                    <Button onClick={handleZoomOut}>Close</Button>
                </DialogActions>
            </Dialog>
            <div className="chat__footer">
                <InsertEmoticon onClick={handleShowEmojis} className="file-emoji-wrapper" />
                {showEmojiPicker && 
                <div style={{ position: 'absolute', top: 160 }}>
                    <Picker data={data} 
                        onEmojiSelect={onEmojiClick} 
                        emojiSize={20}
                    />
                </div>
                }
                <Row>
                    <Col className="send-bar-wrapper">
                        <input
                            value={messagea}
                            onChange={(e) => setMessagea(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message"
                            type="text"
                            className='send-input'
                            style={{ width: '138vh' }}
                            ref={inputRef}
                            onFocus={handleFocus}
                        />
                    </Col>
                    <Col className="file-upload-wrapper">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="file-input"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload">
                            <AttachFile style={{ cursor: 'pointer' }} />
                        </label>
                        
                    </Col>
                    <button onClick={sendMessage} type="submit" className="btnsend">
                        <SendOutlined />
                    </button>
                </Row>
                
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

