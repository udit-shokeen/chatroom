import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';

import React from 'react';
import './App.css';
import { useState, useRef } from 'react';

//  import firebase components
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
//  import firebase hooks
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

//  initializing firebase app, i.e copy from firebase dashboard
firebase.initializeApp({
  //  config
  apiKey: "AIzaSyAsG5M4_GHms-0Icfeob1kMCw3miduzhkY",
  authDomain: "chatroom-fb575.firebaseapp.com",
  projectId: "chatroom-fb575",
  storageBucket: "chatroom-fb575.appspot.com",
  messagingSenderId: "103370544300",
  appId: "1:103370544300:web:f1c02008653d9f3c877b09"
})

//  var for auth and firestore
const auth = firebase.auth();
const firestore = firebase.firestore();


//  -----------------------------------------------------------------------


//  react app
function App() {
  const [user] = useAuthState(auth);    //  getting user object

  return (
    <div className="App">
      <header>
        <h1>Chat Room💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
}

//  signin method
function SignIn(){
  const signInWithGoogle = ()=>{    //  popup for google signin
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <div className='sign-in-button'>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  )
}

//  signout method
function SignOut(){
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}><LogoutIcon/></button> 
  )
}

//  --CHATROOM PAGE--
function ChatRoom(){
  const dummy = useRef();   //  creating dummy ref to point to bottom of page

  const messageRef = firestore.collection('messages');  // creating a message reference
  const query = messageRef.orderBy('createdAt').limit(25);  //  querying out messages

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');   //  sending message text

  //  send message method
  const sendMessage = async(e) => {
    e.preventDefault();   //  prevent page from reloading
    const {uid, photoURL} = auth.currentUser;   //  fetch curr user data
    
    if(formValue != ''){    //  save message to DB
      await messageRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
      setFormValue('');
      dummy.current.scrollIntoView({behavior: 'smooth'}); 
    }
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input placeholder='Write your message here...' value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit"><SendIcon/></button>
      </form>
    </>
  )
}

//  --MESSAGE--
function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
