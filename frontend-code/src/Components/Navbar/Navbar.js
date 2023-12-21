import React from 'react'
import "./Navbar.css";

const Navbar = ({curPage, setCurPage}) => {
  return (
    <div className='navbar'>
        <div className='left-nav'>
            <h2>OpenAI Usage Analytics</h2>
        </div>
        <div className='right-nav'>
            <div className='nav-buttons'>
                <button onClick={() => setCurPage(0)} className='bt-home'>Home</button>
                <button onClick={() => setCurPage(1)} className='bt-dashboard'>Dashboard</button>
                <button onClick={() => setCurPage(2)} className='bt-analytics'>Analytics</button>
            </div>
        </div>
    </div>
  )
}

export default Navbar