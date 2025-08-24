import React, { createContext,useState, useContext, useEffect } from 'react'
import { toast } from 'react-toastify';

export const AppContext = createContext()

const AppContextProvider = ({children}) => {
  const [activeSource, setActiveSource] = useState('text');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [file, setFile] = useState(null);

  const [apiKeyVal, setApiKeyVal] = useState(localStorage.getItem('apiKey') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  let[qdrnatUrl,setQdrantUrl] = useState('')
  let[qdrnatUrlVal,setQdrantUrlVal] = useState('')
  let[qdrnatApiKey,setQdrantApiKey] = useState('')
  let [allSet,setAllSet] = useState(false)
  useEffect(() => {
    const handleIndex = () => {
      if((activeSource == 'text' && text.length == 0) || (activeSource == 'website' && website.length == 0) || (activeSource == 'file' && !file)){
        toast.error('data source is empty!')
        setAllSet(false)
        return
      }
      if (!apiKey) {
        toast.error('Enter Valid OpenAI Api Key or Save The Api Key')
        setAllSet(false)
        return
      }
      if (!qdrnatUrl) {
        toast.error('Enter Valid QudrantUrl or Save Configuration')
        setAllSet(false)
        return
      }
      setAllSet(true)
     
  
    }
    handleIndex()
  },[text,website,file])

  let value = {activeSource, setActiveSource,text, setText,website,setWebsite,file,setFile,apiKey,setApiKey,apiKeyVal,setApiKeyVal,visible,setVisible,copied,setCopied,qdrnatUrl,setQdrantUrl,qdrnatUrlVal,setQdrantUrlVal,qdrnatApiKey,setQdrantApiKey,allSet,setAllSet}
  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

export default AppContextProvider