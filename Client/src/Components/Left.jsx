import React, { useContext, useState } from 'react';
import { MdTextFields } from 'react-icons/md';
import { FaGlobe, FaKey,FaEdit , FaEye, FaEyeSlash, FaTrashAlt, FaCopy } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import axios from 'axios'
import { toast } from 'react-toastify';
import { AppContext } from '../Context/AppContext';

const Left = () => {
  
  let {activeSource, setActiveSource,text, setText,website,setWebsite,file,setFile,apiKey,setApiKey,apiKeyVal,setApiKeyVal,visible,setVisible,copied,setCopied,qdrnatUrl,setQdrantUrl,qdrnatUrlVal,setQdrantUrlVal,qdrnatApiKey,setQdrantApiKey,setAllSet,handleIndex} = useContext(AppContext)

  const toggleVisibility = () => setVisible(!visible);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    localStorage.removeItem('apiKey')
    setApiKey('');
    setApiKeyVal('')
  };

  const handlesave = async () => {
    try {
      const response = await axios.post('http://localhost:8000/validate-key', {
        apiKey: apiKeyVal
      });
      if (response.data.valid) {
        toast.success('Api key is valid');
        setApiKey(apiKeyVal)
        localStorage.setItem("apiKey",apiKeyVal)
      } else {
        toast.error("❌ Invalid API key");
        
      } 
    }
    catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  }

  const handleQdrantSubmission = async () => {
    try {
      const response = await axios.post('http://localhost:8000/validate-qdrant',{url:qdrnatUrlVal,apikey: qdrnatApiKey})

      if(response.data.valid){
        toast.success('Qdrant Credentials Are Valid')
        setQdrantUrl(qdrnatUrlVal)
      }
      else{
        toast.error('❌ Invalid Credentials!')
      }
    } catch (error) {
      toast.error(error.message || 'Somethin wrong with qdrant Credentials')
    }
  }

  

  return (
    <div className='m-5 h-[100vh] overflow-scroll'>
      <div className="p-8 border-2  border-black bg-gray-900 shadow-md  rounded-lg ">
        <h2 className="text-2xl font-semibold mb-2">Data Sources</h2>
        <p className="text-gray-400 text-sm mb-4">
          Add data to your RAG system by entering text, providing a website URL, or uploading files.
        </p>

        {/* Source Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-md ${activeSource === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-600'
              }`}
            onClick={() => setActiveSource('text')}
          >
            <MdTextFields /> Text
          </button>
          <button
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md ${activeSource === 'website' ? 'bg-blue-600 text-white' : 'bg-gray-600'
              }`}
            onClick={() => setActiveSource('website')}
          >
            <FaGlobe /> Website
          </button>
          <button
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md ${activeSource === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-600'
              }`}
            onClick={() => setActiveSource('file')}
          >
            <FiUpload /> File
          </button>
        </div>

        {/* Conditional Input Sections */}
        <div className="mt-4">
          {activeSource === 'text' && (
            <div>
              <label className="block text-sm font-medium mb-1">Enter Text</label>
              <textarea
                disabled = {!qdrnatUrl || !apiKey}
                className={`w-full p-2 border rounded-md min-h-[100px]  ${!qdrnatUrl || !apiKey ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-white text-black'}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your content here..."
              />
              
            </div>
          )}

          {activeSource === 'website' && (
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                type="url"
                className="w-full p-2 border rounded-md"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
              
            </div>
          )}

          {activeSource === 'file' && (
            <div>
              <label className="block text-sm font-medium mb-1 ">Upload File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-gray-400 py-2 border-2 px-2 rounded-lg cursor-pointer"
              />
              
            </div>
          )}
        </div>
      </div>
      
      {/* openai */}
      <div className="p-5 bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md mt-6 text-white shadow-lg">
        <h2 className="text-xl font-semibold mb-2">🔐 OpenAI API Key</h2>
        <p className="text-gray-400 text-sm mb-4">
          Enter your OpenAI API key to enable AI features. It will be stored locally in your browser.
        </p>

        <div className="flex items-center gap-2 bg-gray-800 px-4 py-3 rounded-md overflow-hidden">
          <FaKey className="text-blue-400" />
          <input
            type={visible ? 'text' : 'password'}
            value={apiKeyVal}
            onChange={(e) => setApiKeyVal(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white"
          />
          <button onClick={toggleVisibility} className="text-gray-300 hover:text-white">
            {visible ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button onClick={handleCopy} className="text-gray-300 hover:text-white">
            <FaCopy />
          </button>
          
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
            <FaTrashAlt />
          </button>

        </div>
        {
          !apiKey && <button onClick={handlesave}  className="mt-3 cursor-pointer w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
          </button>
        }

        {apiKey && (
          <p className="mt-2 text-green-400 text-sm flex items-center gap-1">
            ✅ API key is valid and ready to use
          </p>
        )}

        {copied && (
          <p className="mt-1 text-blue-400 text-sm">Copied to clipboard!</p>
        )}
      </div>

      {/* qdrant */}
      <div className="p-5 bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md mt-6 text-white shadow-lg">
        <h2 className="text-xl font-semibold mb-2">qdrant Configuration</h2>
        <p className="text-gray-400 text-sm mb-4">
          Configure Qdrant Cloud or local instance.
        </p>

          <p className='text-sm'>qdrant Url</p>
        <div className="flex mb-2 items-center gap-2 bg-gray-800 px-4 py-1 rounded-md overflow-hidden">
          <input
            type='url'
            value={qdrnatUrlVal}
            onChange={(e) => setQdrantUrlVal(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white"
          />
         
          
          <button onClick={() => {setQdrantUrlVal(''),setQdrantUrl('')}} className= "cursor-pointer text-red-500 hover:text-red-700">
            <FaTrashAlt />
          </button>
          

        </div>
          <p className='text-sm'>qdrant Api Key (Optional for local)</p>
        <div className="flex  items-center gap-2 bg-gray-800 px-4 py-1 rounded-md overflow-hidden">
          <input
            type='url'
            value={qdrnatApiKey}
            onChange={(e) => setQdrantApiKey(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white"
          />
         
          
          
          <button onClick={() => setQdrantApiKey('')} className="text-red-500 cursor-pointer hover:text-red-700">
            <FaTrashAlt />
          </button>

        </div>
        {
          !qdrnatUrl && <button onClick={handleQdrantSubmission}  className="mt-3 cursor-pointer w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Configuration
          </button>
        }

        {qdrnatUrl && (
          <p className="mt-2 text-green-400 text-sm flex items-center gap-1">
            ✅ qdrant Configuration Saved
          </p>
        )}

      </div>
    </div>
  );
};

export default Left;
