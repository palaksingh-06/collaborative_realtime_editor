// import "./App.css"
// import {Editor} from '@monaco-editor/react'
// import { MonacoBinding } from "y-monaco"
// import { useRef ,useMemo,useState,useEffect} from "react"
// import * as Y from 'yjs'
// import {SocketIOProvider} from "y-socket.io"

// function App() {

//   const editorRef=useRef(null);


//   const [username,setUsername]=useState(()=>
//   {
//     return new URLSearchParams(window.location.search).get("username") || ""
//   });

//  const [users,setUsers]=useState ([])

//   const ydoc=useMemo(()=> new Y.Doc(),[]);
//   const yText=useMemo(()=>ydoc.getText("monaco"),[ydoc])


// const handlemount = (editor) => {
//   editorRef.current = editor;
  
//   const monacoBinding = new MonacoBinding(
//     yText,
//     editor.getModel(),   
//     new Set([editor]),
//   provider.awareness
//    )

// };


// const handleJoin = (e) => {
//   e.preventDefault();

//   const name = e.target.username.value;  

//   if (!name) return; // optional safety

//   setUsername(name);

//   window.history.pushState({}, "", "?username=" + name);
// };


// useEffect(() => {
//   if (username)

//   const provider = new SocketIOProvider(
//     "http://localhost:3000",
//     "monaco",
//     ydoc,
//     { autoConnect: true }
//   );

//   provider.awareness.setLocalStateField("user", { username });

//   const updateUsers = () => {
//     const states = Array.from(provider.awareness.getStates().values());

//     const activeUsers = states
//       .filter(state => state.user && state.user.username)
//       .map(state => state.user);

//     setUsers(activeUsers);
//   };

//   updateUsers(); // initial call

//   provider.awareness.on("change", updateUsers);

//   function handleBeforeUnload() {
//     provider.awareness.setLocalStateField("user", null);
//   }

//   window.addEventListener("beforeunload", handleBeforeUnload);

//   return () => {
//     provider.disconnect();
//     window.removeEventListener("beforeunload", handleBeforeUnload);
//   };

// }, [username]);

// if(!username){
//   return ( <main className="h-screen w-full bg-gray-900 flex gap-4 p-4 items-center justify-center">
//     <form
//     onSubmit={handleJoin}
//      className="flex flex-col gap-4">
//       <input type="text" 
//       placeholder="enter your username"
//       className="p-2 rounded-lg bg-gray-800 text-white"
//       name="username"/>
//       <button
//       className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
//     >Join</button>
//     </form>
//   </main>

//   )
// }
//   return (
//   <main className="h-screen w-full bg-gray-900 flex gap-4 p-4">
// <aside className="h-screen w-1/4 bg-amber-50 rounded-lg">
//     <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
//     <ul className="p-4">
//       {
//         users.map((user,index)=>(
//                 <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
//                   {user.username}
//                 </li>
//         ))
//       }

//     </ul>

// </aside>
// <section className="w-3/4  bg-neutral-800 rounded-lg">
// <Editor
//   height="100%"
//   defaultLanguage="javascript"
//   defaultValue="// some comment"
//   theme="vs-dark"
//   onMount={handlemount}
// />
// </section>
//   </main>
//   )
// }

// export default App
import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);


  const handlemount = (editor) => {
    editorRef.current = editor;

   
    if (!providerRef.current) return;

    new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    );
  };


  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    if (!name) return;

    setUsername(name);
    window.history.pushState({}, "", "?username=" + name);
  };

 
  useEffect(() => {
    if (!username) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
       {autoConnect:true } 
    );

    providerRef.current = provider;

   
    provider.awareness.setLocalStateField("user", { username });

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());

      const activeUsers = states
        .map((s) => s.user)
        .filter(Boolean);

      setUsers(activeUsers);
    };

    updateUsers();
    provider.awareness.on("change", updateUsers);

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      provider.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username]);

    if (!username) {
    return (
      <main className="h-screen flex items-center justify-center bg-gray-900">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            name="username"
            placeholder="Enter username"
            className="p-2 bg-gray-800 text-white rounded"
          />
          <button className="bg-amber-50 p-2 rounded font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen flex gap-4 p-4 bg-gray-900">
      <aside className="w-1/4 bg-amber-50 rounded-lg">
        <h2 className="p-4 font-bold text-xl border-b">Users</h2>
        <ul className="p-4">
          {users.map((user, i) => (
            <li key={i} className="bg-gray-800 text-white p-2 mb-2 rounded">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="w-3/4 bg-neutral-800 rounded-lg">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding..."
          theme="vs-dark"
          onMount={handlemount}
        />
      </section>
    </main>
  );
}

export default App;