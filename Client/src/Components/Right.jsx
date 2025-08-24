import React, { useContext, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { AppContext } from '../Context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';



const Right = () => {

   let {activeSource, setActiveSource,text, setText,website,setWebsite,file,setFile,apiKey,setApiKey,apiKeyVal,setApiKeyVal,visible,setVisible,copied,setCopied,qdrnatUrl,setQdrantUrl,qdrnatUrlVal,setQdrantUrlVal,qdrnatApiKey,setQdrantApiKey,allSet,setAllSet,handleIndex} = useContext(AppContext)


  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! Start a conversation by asking a question about your data.' }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend =  async () => {
    console.log('file: ',file);
    
    if (!userInput.trim()) return;

    if(!allSet) {
      toast.error('something is wrong!')
      return
    }

    // Show user message
    const userMsg = { from: 'user', text: userInput };
    setMessages((prev) => [...prev, userMsg]);

    // Clear input
    setUserInput('');

    if(activeSource == 'text'){
      try{

      
        let response = await axios.post('https://embedai-nctq.onrender.com/text',{Text:text,user_query:userInput,api_key:apiKey,qdrant_url:qdrnatUrl,qdrant_api_key:qdrnatApiKey})

        const aiMsg = { from: 'ai', text: response.data.response};
        setMessages((prev) => [...prev,aiMsg])
      }
      catch(error){
        toast.error(error.message || 'Something is wrong')
        return
      }
      
    }
    else if(activeSource == 'website'){
      let response = await axios.post('https://embedai-nctq.onrender.com/website',{Text:website,user_query:userInput,api_key:apiKey,qdrant_url:qdrnatUrl,qdrant_api_key:qdrnatApiKey})

      const aiMsg = { from: 'ai', text: response.data.response};
      setMessages((prev) => [...prev,aiMsg])
    }
    else{
      if (!file) return toast.error("No file selected!");
      const formData = new FormData();
      formData.append("file", file);
      formData.append('user_query',userInput)
      formData.append("api_key", apiKey);
      formData.append("qdrant_url", qdrnatUrl);
      formData.append("qdrant_api_key", qdrnatApiKey);

      let response = await axios.post('https://embedai-nctq.onrender.com/pdf',formData)
      console.log('response',response);
      
      const aiMsg = { from: 'ai', text: response.data.response};
      setMessages((prev) => [...prev,aiMsg])
    }

    

    // Simulate AI response (replace with actual API call)
    // setTimeout(() => {
    //   const aiMsg = { from: 'ai', text: `You asked: "${userMsg.text}" (This is a dummy response)` };
    //   setMessages((prev) => [...prev, aiMsg]);
    // }, 1000);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white border-l w-full mt-6 rounded-lg border-gray-700">
      <div className="p-4 border-b border-gray-700 text-xl font-semibold">💬 Chat with your Data</div>

      <div className=" h-[70vh] overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={` px-4 py-2 rounded-lg text-sm ${
              msg.from === 'user' ? 'bg-blue-600 self-end ml-auto' : 'bg-gray-700 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          disabled={!allSet}
          placeholder="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleEnter}
          className={`flex-1 px-4 py-2 bg-gray-800 text-white rounded-md outline-none ${!allSet ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-600 ' }`}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Right;
