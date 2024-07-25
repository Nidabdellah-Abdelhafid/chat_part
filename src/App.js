import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Add any custom styles here
import { URL_BACKEND } from "./components/api.js";
import axios from 'axios';
import Navbar from './components/Navbar';
import Resirvation from './components/Resirvation';
// import Profile from './components/Profile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      <div className="bg-white m-0 min-h-screen flex flex-col">
        <Navbar />
        
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col md:flex-row flex-grow">
              <div className="flex flex-col md:flex-row flex-grow">
              <Sidebar users={userDC} onUserClick={handleUserClick} className="flex-none md:w-1/4" />
              <ChatWindow user={selectedUser} className="flex-grow" />
            </div></div>} 

            />
            <Route path="/resirvation" element={<Resirvation />} />
            {/* <Route path="/profile" element={<Profile />} /> */}
          </Routes>
        </div>
      </Router>
  );
};

export default App;
