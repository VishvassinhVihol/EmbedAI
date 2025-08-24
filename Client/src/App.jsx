import React from 'react'
import Header from './Components/Header'
import Left from './Components/Left'
  import { ToastContainer, toast } from 'react-toastify';
import Right from './Components/Right';

const App = () => {
  return (
    <div className='bg-[#0a0a0a] h[100vh]  text-white'>
      <ToastContainer/>
      <div>
        <Header/>
      </div>
      <div className='flex flex-row'>
        <Left/>
        <Right/>
      </div>
     
   </div>
  )
}

export default App