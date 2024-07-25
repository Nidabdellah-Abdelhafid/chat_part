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
      className={`cursor-pointer p-2 ${selectedUserId === user.id ? 'itemuser' : 'hover:bg-gray-300'}`}
    >
      <div className="flex items-center space-x-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={user.image && user.image.url ? `${URL_BACKEND}${user.image.url}` : 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg'}
              alt={user.username}
            />
          </div>
        </div>
        <div>
          <p className="text-lg font-medium">{user.username}</p>
        </div>
      </div>
    </ListGroup.Item>
  );

  return (
    <div className="w-full md:w-1/4 bg-gray-100 border-r">
      <div className="flex items-center p-4">
        <div className="avatar">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <Image src="https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg" alt="Logo" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-xl font-semibold">Voyages sur mesure</p>
        </div>
      </div>
      <ListGroup className="overflow-y-auto">
        {users.map((user) => renderUserListItem(user))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
