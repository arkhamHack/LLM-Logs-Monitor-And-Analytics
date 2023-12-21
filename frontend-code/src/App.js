import React from 'react'
import './App.css';
import { useState } from 'react';
import Pages from './Components/Pages/Pages';
import Navbar from './Components/Navbar/Navbar';

const App = () => {
  const [curPage, setCurPage] = useState(0)

  return (
    <div className='App'>
      <Navbar curPage={curPage} setCurPage={setCurPage}/>
      <Pages curPage={curPage}/>
    </div>
  )
}

export default App