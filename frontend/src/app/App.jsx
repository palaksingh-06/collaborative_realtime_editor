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
const [output, setOutput] = useState("");
const [language, setLanguage] = useState("javascript");
  
const handlemount = (editor) => {
  editorRef.current = editor;

  setTimeout(() => {
    if (!providerRef.current) return;

    new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    );
  }, 200);
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
      {autoConnect:true}
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


const runCode = () => {
  if (!editorRef.current) return;

  const code = editorRef.current.getValue();

  try {
    const logs = [];
    
    const originalLog = console.log;

    console.log = (...args) => {
      logs.push(args.join(" "));
    };

    // Execute user code
    const result = new Function(code)();
    
    console.log = originalLog;

    setOutput(logs.join("\n") || "No output");
  } catch (err) {
    setOutput(err.message);
  }
};
 
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-500 p-2 rounded-lg">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            className="p-2 rounded-lg bg-gray-700 text-white"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-black font-bold">
            Join
          </button>
        </form>
        </div>
      </main>
    );
  }

 return (
  <main className="h-screen flex bg-gray-900 text-white">

  {/* LEFT SIDEBAR */}
  <aside className="w-64 bg-amber-50/10 backdrop-blur-md border-r border-amber-200/20 flex flex-col text-white">
    
    <div className="p-4 border-b border-gray-700">
    <h2 className="text-lg font-bold text-amber-50 bg-gray-900 px-3 py-2 rounded-md border border-amber-200/30">
 Users ({users.length})
</h2>
    </div>

    <ul className="flex-1 overflow-y-auto p-3 space-y-2">
      {users.map((user, i) => (
        <li
          key={i}
          className="flex items-center gap-2 bg-gray-900/40 p-2 rounded border border-amber-200/10 hover:bg-amber-50/10 transition">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {user.username}
        </li>
      ))}
    </ul>
  </aside>

  {/* RIGHT SIDE */}
  <section className="flex-1 flex flex-col">

    {/* TOP BAR */}
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">

      <div className="flex items-center gap-3">
        <span>Logged in as <b>{username}</b></span>

      <select
  disabled
  className="bg-gray-700 p-1 rounded opacity-50 cursor-not-allowed"
>
  <option>JavaScript (only supported)</option>
</select>
      </div>

      <button
        onClick={runCode}
        className="bg-green-500 px-4 py-1 rounded hover:bg-green-400"
      >
        Run Code
      </button>
    </div>

    {/* EDITOR + OUTPUT */}
    <div className="flex flex-1">

      {/* EDITOR */}
      <div className="w-2/3">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handlemount}
        />
      </div>

      {/* OUTPUT PANEL */}
      <div className="w-1/3 bg-black p-3 border-l border-gray-700 overflow-auto">
        <h2 className="font-semibold mb-2">Output</h2>
        <pre className="text-green-400 whitespace-pre-wrap">
          {output || "Run code to see output..."}
        </pre>
      </div>

    </div>
  </section>
</main>
  );
}

export default App;