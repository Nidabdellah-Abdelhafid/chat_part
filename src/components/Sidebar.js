import React, { useState } from 'react';
import { ListGroup, Image } from 'react-bootstrap';
import { URL_BACKEND } from "./api.js";

const Sidebar = ({ users, onUserClick }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleUserClick = (user) => {
    setSelectedUserId(user.id);
    onUserClick(user);
  };

  const renderUserListItem = (user) => (
    <ListGroup.Item
        key={user.id}
        onClick={() => handleUserClick(user)}
        className={selectedUserId === user.id ? 'selected-user' : ''}
    >
    <div className="flex w-full flex-col">
      <div className="card bg-base-300  rounded-box grid h-20 place-items p-2">
      
            {user.image && user.image.url ? (
                
              <div className='d-flex'>
                    <div className="avatar online">
                    <div className="w-20 rounded-full">
                    <Image src={`${URL_BACKEND}${user.image.url}`} />
                    </div>
                    </div>
                    <div className="flex items-center justify-center h-20">
                        <p className="text-center ml-3 text-xl">{user.username}</p>    
                    </div>
                </div>
            ) : (
                <div className="avatar online">
                <div className="w-20 rounded-full">
                  <Image src='https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg' />
                </div>
              </div>
            )}
            {/* <p>{user?.username}</p> */}
        </div>
      
      {/* <div className="divider"></div> */}
    </div>
        
    </ListGroup.Item>
);

  return (
    <ListGroup className="sidebar" variant="flush">
      <div className='d-flex  mt-2 ml-5'>
                    <div className="avatar">
                    <div className="h-14 w-14 rounded-full mt-2">
                    <Image src="https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg"                    />
                    </div>
                    </div>
                    <div className="flex items-center justify-center h-20">
                        <p className="text-center ml-3 text-2xl">Voyages sur mesure</p>    
                    </div>
                </div>
      {users.map((user) => renderUserListItem(user))}
    </ListGroup>
  );
};

export default Sidebar;
