import React from 'react'
import Analytics from './Analytics/Analytics'
import Home from './Home/Home'
import Dashboard from './Dashboard/Dashboard'
import "./Pages.css"

const Pages = ({curPage}) => {
  return (
    <div className='pages'>
        {curPage === 0 && <Home />}
        {curPage === 1 && <Dashboard />}
        {curPage === 2 && <Analytics />}
    </div>
  )
}

export default Pages