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

  // =========================
  // YJS DOC
  // =========================
  const ydoc = useMemo(() => new Y.Doc(), []);

  const yFiles = useMemo(() => ydoc.getMap("files"), [ydoc]);
  const yActiveFile = useMemo(() => ydoc.getText("activeFile"), [ydoc]);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState("");

  const [output, setOutput] = useState("");

  // =========================
  // SYNC FILES FROM YJS
  // =========================
  useEffect(() => {
    const update = () => {
      setFiles(Array.from(yFiles.values()));
    };

    update();
    yFiles.observe(update);

    return () => yFiles.unobserve(update);
  }, [yFiles]);

  // =========================
  // SYNC ACTIVE FILE
  // =========================
  useEffect(() => {
    const update = () => {
      setActiveFile(yActiveFile.toString());
    };

    update();
    yActiveFile.observe(update);

    return () => yActiveFile.unobserve(update);
  }, [yActiveFile]);

  // =========================
  // INIT FIRST FILE
  // =========================
  useEffect(() => {
    if (yFiles.size === 0) {
      const id = "1";

      yFiles.set(id, {
        id,
        name: "main.js",
        language: "javascript",
        content: "console.log('Hello World');",
      });

      yActiveFile.insert(0, id);
    }
  }, []);

  const activeFileData = files.find((f) => f.id === activeFile);

  // =========================
  // CREATE FILE (SYNCED)
  // =========================
  const createFile = () => {
    const id = Date.now().toString();

    yFiles.set(id, {
      id,
      name: `file${yFiles.size + 1}.js`,
      language: "javascript",
      content: "// new file",
    });

    yActiveFile.delete(0, yActiveFile.length);
    yActiveFile.insert(0, id);
  };

  // =========================
  // DELETE FILE (SYNCED)
  // =========================
  const deleteFile = (id) => {
    yFiles.delete(id);

    if (yActiveFile.toString() === id) {
      const remaining = Array.from(yFiles.keys());

      if (remaining.length > 0) {
        yActiveFile.delete(0, yActiveFile.length);
        yActiveFile.insert(0, remaining[0]);
      }
    }
  };

  // =========================
  // RENAME FILE (SYNCED)
  // =========================
  const renameFile = (id, newName) => {
    const file = yFiles.get(id);
    if (!file) return;

    yFiles.set(id, {
      ...file,
      name: newName,
    });
  };

  // =========================
  // MONACO
  // =========================
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

  // =========================
  // JOIN USER
  // =========================
  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    if (!name) return;

    setUsername(name);
    window.history.pushState({}, "", "?username=" + name);
  };

  // =========================
  // SOCKET + YJS
  // =========================
  useEffect(() => {
    if (!username) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true }
    );

    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", { username });

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const activeUsers = states.map((s) => s.user).filter(Boolean);
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

  // =========================
  // RUN CODE
  // =========================
  const runCode = () => {
    const code = activeFileData?.content || "";

    try {
      const logs = [];
      const originalLog = console.log;

      console.log = (...args) => {
        logs.push(args.join(" "));
      };

      new Function(code)();

      console.log = originalLog;

      setOutput(logs.join("\n") || "No output");
    } catch (err) {
      setOutput(err.message);
    }
  };

  // =========================
  // LOGIN SCREEN
  // =========================
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

  // =========================
  // UI (UNCHANGED)
  // =========================
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
            <li key={i} className="flex items-center gap-2 bg-gray-900/40 p-2 rounded">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {user.username}
            </li>
          ))}
        </ul>

        <div className="p-2 border-t border-gray-700">
          <button
            onClick={createFile}
            className="w-full bg-gray-700 hover:bg-gray-600 text-sm py-1 rounded"
          >
            + New File
          </button>
        </div>

        <div className="p-2 space-y-2 overflow-y-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className={`p-2 rounded text-sm flex items-center justify-between ${
                activeFile === file.id ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <span
                onClick={() => {
                  yActiveFile.delete(0, yActiveFile.length);
                  yActiveFile.insert(0, file.id);
                }}
                className="cursor-pointer flex-1"
              >
                📄 {file.name}
              </span>

              <input
                value={file.name}
                onChange={(e) => renameFile(file.id, e.target.value)}
                className="bg-transparent text-xs text-gray-300 w-20 outline-none border-b border-gray-600 mx-2"
              />

              <button
                onClick={() => deleteFile(file.id)}
                className="text-red-600 text-xs hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT SIDE (UNCHANGED) */}
      <section className="flex-1 flex flex-col">

        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <span>
            Logged in as <b>{username}</b>
          </span>

          <button
            onClick={runCode}
            className="bg-green-500 px-4 py-1 rounded"
          >
            Run Code
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          <div className="w-2/3 h-full overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={activeFileData?.content || ""}
              onChange={(value) => {
                if (!activeFile) return;

                const file = yFiles.get(activeFile);
                if (!file) return;

                yFiles.set(activeFile, {
                  ...file,
                  content: value || "",
                });
              }}
              onMount={handlemount}
            />
          </div>

          <div className="w-1/3 bg-black p-3 border-l border-gray-700 overflow-auto">
            <pre className="text-green-400">
              {output || "Run code to see output..."}
            </pre>
          </div>

        </div>
      </section>
    </main>
  );
}

export default App;