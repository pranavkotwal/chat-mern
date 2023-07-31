import { useContext, useState } from "react";
import axios from "axios";
import {UserContext} from './UserContext'

const RegisterAndLoginForm = () => {
    const [username,setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [isLoginOrRegister,setIsLoginOrRegister] = useState('register')
    const {setUsername:setLoggedInUsername,setId}= useContext(UserContext)

    async function handleSubmit(e){
       e.preventDefault()
       const url = isLoginOrRegister =='register'?'register' : 'login'
       const {data}= await axios.post(url,{username,password})
       setLoggedInUsername(username)
       setId(data.id)
    }
    return (
    <div className="bg-blue-50 flex h-screen items-center"> 
        <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
            <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                type="text" placeholder="username" className="block w-full rounded-sm p-2 mb-2 border" />
            <input 
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password" placeholder="password" className="block w-full rounded-sm p-2 mb-2 border" />
            <button className="bg-blue-500 text-white w-full rounded-sm p-2">
                {isLoginOrRegister=='register'?'Register':'Login'}
            </button>
            <div className="text-center mt-2">
                 {isLoginOrRegister==='register'&&(
                    <div>  Already a member?  
                    <button onClick={()=>setIsLoginOrRegister('login')}>Login Here</button>
                    </div>

                 )}
                 {isLoginOrRegister==='login'&&(
                    <div>  Don't have an Account?
                    <button onClick={()=>setIsLoginOrRegister('register')}>Register</button>
                    </div>

                 )}
            </div>
        </form>
     

    
    </div>
    
    
    )
}



export default RegisterAndLoginForm;