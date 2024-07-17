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
        <div className="d-flex align-items-center">
            {user.image && user.image.url ? (
                <Image
                    src={`${URL_BACKEND}${user.image.url}`}
                    roundedCircle
                    className="m-2"
                    width="60px"
                    height="60px"
                />
            ) : (
                <Image
                    src="https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg"
                    roundedCircle
                    className="m-2"
                    width="60px"
                    height="60px"
                />
            )}
            <p>{user?.username}</p>
        </div>
    </ListGroup.Item>
);

  return (
    <ListGroup className="sidebar" variant="flush">
      <div style={{ height: '76px', flexDirection: 'column', backgroundColor: '#c6c6c6' ,direction:'inherit'}}>
        <Image
          src="https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg"
          roundedCircle
          className="m-2"
          width="60px"
          height="60px"
        />
        <span>Voyages sur mesure</span>
        <hr />
      </div>
      {users.map((user) => renderUserListItem(user))}
    </ListGroup>
  );
};

export default Sidebar;
