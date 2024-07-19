import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Add any custom styles here
import { URL_BACKEND } from "./components/api.js";
import axios from 'axios';
import Navbar from './components/Navbar.js';

const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDC, setUserDC] = useState([]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${URL_BACKEND}/api/users?populate=*&pagination[limit]=-1`);
      const users = response.data;
      const updatedUsers = users.slice(1);

      setUserDC(updatedUsers);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };
  useEffect(()=>{
      fetchUser();
  },[])
  return (
    <div  style={{backgroundColor:'#fff',margin:0}}>
            <Navbar/>
            <div className="d-flex">
              <Sidebar users={userDC} onUserClick={handleUserClick} />
              <ChatWindow user={selectedUser} />
            </div>
    </div>
  );
};

export default App;
