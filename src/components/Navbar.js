import React from 'react'
import { Image } from 'react-bootstrap'

function Navbar() {
  return (
    <div className="navbar bg-neutral text-neutral-content">
  <div className="flex-1">
    <a  className="btn btn-ghost text-3xl text-white">Atlas Voyages</a>
  </div>
  <div className="flex-none">
    
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar w-100 rounded-full">
          <Image
            alt="Navbar component"
            src="https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg" />
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
        <li>
          <a className="justify-between" >
            Profile
          </a>
        </li>
        <li><a >Settings</a></li>
        <li><a >Logout</a></li>
      </ul>
    </div>
  </div>
</div>
  )
}

export default Navbar
