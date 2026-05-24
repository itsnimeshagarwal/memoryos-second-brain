import { useState, useEffect, useRef } from "react";
import { askAI } from "./ai";

export default function App() {
  const [chats, setChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chats")) || [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(null);

  const [memory, setMemory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("memory")) || [];
    } catch {
      return [];
    }
  });

  const [insights, setInsights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("insights")) || {
        total: 0,
        today: 0,
      };
    } catch {
      return {
        total: 0,
        today: 0,
      };
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [pinnedChats, setPinnedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pinnedChats")) || [];
    } catch {
      return [];
    }
  });
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [expandedMemoryId, setExpandedMemoryId] = useState(null);
  const [topicStats, setTopicStats] = useState({
    DSA: 0,
    AI: 0,
    Project: 0,
    College: 0,
    General: 0,
  });
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
      return [];
    }
  });

  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("memory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    const stats = {
      DSA: 0,
      AI: 0,
      Project: 0,
      College: 0,
      General: 0,
    };

    memory.forEach((m) => {
      if (stats[m.topic] !== undefined) {
        stats[m.topic]++;
      }
    });

    setTopicStats(stats);
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("insights", JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
  }, [pinnedChats]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats]);

  const menu = [
    { name: "Chat", icon: "🧠", glow: "cyan" },
    { name: "Timeline", icon: "📅", glow: "yellow" },
    { name: "Tasks", icon: "📌", glow: "red" },
    { name: "Insights", icon: "📊", glow: "purple" },
  ];

  const addTask = () => {

    if (!taskInput.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskInput,
      completed: false,
      createdAt: new Date().toLocaleString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    setTaskInput("");
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const toggleTask = (id) => {

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );

  };
  
  const deleteChat = (id) => {

    const updatedChats = chats.filter(
      (chat) => chat.id !== id
    );

    setChats(updatedChats);

    if (activeChatId === id) {

      if (updatedChats.length > 0) {
        setActiveChatId(updatedChats[0].id);
      } else {
        setActiveChatId(null);
      }

    }

  };

  const renameChat = (id) => {

    if (!editedTitle.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title: editedTitle,
            }
          : chat
      )
    );

    setEditingChatId(null);
    setEditedTitle("");

  };

  const togglePinChat = (id) => {

    setPinnedChats((prev) => {

      if (prev.includes(id)) {
        return prev.filter((chatId) => chatId !== id);
      }

      return [...prev, id];

    });

  };

  const deleteTask = (id) => {

    setTasks((prev) =>
      prev.filter((task) => task.id !== id)
    );

  };

  const detectTopic = (text) => {
    const t = text.toLowerCase();

    // 🧠 AI / ML (strong context detection first)
    if (
      t.includes("machine learning") ||
      t.includes("neural") ||
      t.includes("transformer") ||
      t.includes("ai model") ||
      t.includes("chatgpt")
    ) return "AI";

    // 📚 DSA (must be strong & specific)
    if (
      t.includes("array") ||
      t.includes("binary tree") ||
      t.includes("dp") ||
      t.includes("graph") ||
      t.includes("leetcode") ||
      t.includes("data structure") ||
      t.includes("recursion") ||
      t.includes("algorithm")
    ) return "DSA";

    // 🎓 College / Academic (VERY IMPORTANT FIX)
    if (
      t.includes("college") ||
      t.includes("vit") ||
      t.includes("campus") ||
      t.includes("exam") ||
      t.includes("semester") ||
      t.includes("placement")
    ) return "College";

    // 🛠️ Project / Building
    if (
      t.includes("project") ||
      t.includes("build") ||
      t.includes("app") ||
      t.includes("website") ||
      t.includes("frontend") ||
      t.includes("create") ||
      t.includes("backend")
    ) return "Project";

    return "General";
  };

  const detectImportance = (text) => {
    const t = text.toLowerCase();

    if (
      t.includes("exam") ||
      t.includes("urgent") ||
      t.includes("important") ||
      t.includes("revise") ||
      t.includes("deadline")
    ) return "high";

    if (
      t.includes("project") ||
      t.includes("build") ||
      t.includes("leetcode") ||
      t.includes("practice")
    ) return "medium";

    return "normal";
  };
  

  const sendMessage = async () => {

    if (!input.trim()) return;

    let chatId = activeChatId;

    if (!chatId) {
      const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: [],
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);

      chatId = newChat.id;
    }

    const userMsg = { 
      role: "user", 
      text: input,
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat"
                  ? input.slice(0, 25)
                  : chat.title,
              messages: [...chat.messages, userMsg],
            }
          : chat
      )
    );

    setInput("");
    setLoading(true);

    const aiReply = await askAI(input);

    const taskKeywords = [
      "todo",
      "task",
      "complete",
      "finish",
      "submit",
      "remember",
      "assignment",
      "project",
      "meeting",
      "call",
      "buy",
      "study",
    ];

    const shouldCreateTask = taskKeywords.some((word) =>
      input.toLowerCase().includes(word)
    );

    if (shouldCreateTask) {

      const autoTask = {
        id: Date.now() + 1,
        text: input,
        completed: false,
        createdAt: new Date().toLocaleString(),
      };

      setTasks((prev) => [autoTask, ...prev]);

    }

    const botMsg = { 
      role: "ai", 
      text: aiReply, 
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, botMsg],
            }
          : chat
      )
    );

    const now = new Date();

    const topic = detectTopic(input);

    setMemory((prev) => [
      ...prev,
      {
        id: Date.now(),
        question: input,
        answer: botMsg.text,
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        topic: topic,

        // NEW: AI learning insight layer
        insight:
          topic === "DSA"
            ? "You are practicing problem solving skills"
            : topic === "AI"
            ? "You are learning artificial intelligence concepts"
            : topic === "Project"
            ? "You are building practical projects"
            : topic === "College"
            ? "You are focusing on academic preparation"
            : "You are exploring general knowledge",

        importance: detectImportance(input)
      }
    ]);

    setInsights((prev) => ({
      ...prev,
      total: prev.total + 1,
      today: prev.today + 1
    }));

    setLoading(false);

    inputRef.current?.focus();
  };

  const highlightText = (text, query) => {

    if (!query) return text;
 
    const regex = new RegExp(`(${query})`, "gi");

    return text.split(regex).map((part, i) =>

      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-400/30 text-yellow-200 px-1 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )

    );
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(
      searchQuery.toLowerCase()
    )
  );

  const currentChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currentChat, loading]);

  const filteredMemory = memory.filter((item) => {
    const q = (searchQuery || "").toLowerCase();

    return (
      (item.question || "").toLowerCase().includes(q) ||
      (item.answer || "").toLowerCase().includes(q) ||
      (item.topic || "").toLowerCase().includes(q)
    );
  });

  const visibleMemory = filteredMemory.filter((m) =>
    selectedTopic === "All" ? true : m.topic === selectedTopic
  );

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#0B0F1A] via-[#0F172A] to-black text-white">

      {/* SIDEBAR */}
      <div className="w-64 h-screen flex flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 p-5 overflow-hidden">

        {/* Logo */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 text-transparent bg-clip-text">
          MemoryOS
        </h1>

        <button
          onClick={createNewChat}
          className="w-full mb-5 p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 active:scale-95 transition-all duration-300 font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40"
        >
          ➕ New Chat
        </button>

        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm placeholder-gray-400"
        />

        {/* MENU */}
        <div className="mt-10 space-y-3">

          {menu.map((item, i) => (
            <div
              key={i}
              onClick={() => setActiveTab(item.name)}
              className="group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition duration-300
              bg-white/5 border border-white/10 hover:scale-[1.05] hover:bg-white/10"
            >

              {/* glow background */}
              <div
                className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition
                ${
                  item.glow === "cyan"
                    ? "bg-cyan-500/20"
                    : item.glow === "yellow"
                    ? "bg-yellow-500/20"
                    : item.glow === "red"
                    ? "bg-red-500/20"
                    : "bg-purple-500/20"
                }`}
              ></div>

              {/* content */}
              <span className="text-xl z-10">{item.icon}</span>
              <span className="text-gray-200 z-10">{item.name}</span>
            </div>
          ))}

        </div>

        {/* SAVED CHATS */}
        <div className="mt-6 space-y-2 flex-1 overflow-y-auto pr-1">

          {[
            ...filteredChats.filter((c) => pinnedChats.includes(c.id)),
            ...filteredChats.filter((c) => !pinnedChats.includes(c.id)),
          ].map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 rounded-xl cursor-pointer border transition ${
                activeChatId === chat.id
                  ? "bg-purple-500/20 border-purple-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                {editingChatId === chat.id ? (

                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => renameChat(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameChat(chat.id);
                      }
                    }}
                    autoFocus
                    className="bg-transparent outline-none text-sm w-full"
                  />

                ) : (

                  <span>💬 {chat.title}</span>

                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinChat(chat.id);
                  }}
                  className="text-yellow-400 hover:text-yellow-300 text-xs mr-2"
                >
                  {pinnedChats.includes(chat.id) ? "📌" : "📍"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChatId(chat.id);
                    setEditedTitle(chat.title);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-xs mr-2"
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 h-screen flex flex-col p-6 overflow-hidden">

        {/* HEADER */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 text-transparent bg-clip-text">
          AI Life OS Dashboard
        </h1>

        {/* ALWAYS VISIBLE AI SUMMARY */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300">
        
          <p className="text-purple-300 font-bold mb-1">
            AI Learning Summary
          </p>

          <div className="mb-3">
            <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
              {insights.total > 20
                ? "🔥 Active Learner"
                : insights.total > 10
                ? "⚡ Builder"
                : "🧠 Explorer"}
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            You are actively using MemoryOS. You are learning AI, programming, and problem-solving.
            Keep asking questions — your knowledge graph is improving every day 🚀
          </p>

        </div>

        {activeTab === "Chat" && (
          <>
            {/* CHAT AREA */}
            <div className="flex-1 mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-3">

              {!currentChat || currentChat.messages.length === 0 ? (

                <div className="flex flex-col items-center justify-center h-full text-center">

                  <div className="text-6xl mb-4">
                    🧠
                  </div>

                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text">
                    Welcome to MemoryOS
                  </h2>

                  <p className="text-gray-400 mt-3 max-w-md">
                    Your AI-powered second brain for learning, memory,
                    productivity, and intelligent conversations.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-xl">

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      💡 Ask anything
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      🧠 Store memories
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      📅 Track timeline
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      📊 AI insights
                    </div>

                  </div>

                </div>

              ) : (

                currentChat?.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`fade-in relative overflow-hidden p-4 rounded-xl max-w-2xl whitespace-pre-wrap leading-relaxed text-sm ${
                      msg.role === "user"
                        ? "ml-auto bg-cyan-500/20 border border-cyan-400"
                        : "mr-auto bg-purple-500/10 border border-purple-400/30 text-gray-100"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 blur-2xl"></div>

                    <div className="relative z-10 whitespace-pre-wrap leading-relaxed">
                      {msg.text.split("\n").map((line, i) => {

                        const text = line.trim();

                        const isHeading =
                          text === text.toUpperCase() &&
                          text.length > 0;

                        const isSubHeading =
                          text.length < 40 &&
                          !text.startsWith("-") &&
                          text !== text.toUpperCase();

                        return (
                          <p
                            key={i}
                            className={
                              isHeading
                                ? "font-extrabold text-cyan-300 mt-4 text-xl"
                                : isSubHeading
                                ? "font-bold text-purple-300 mt-3"
                                : "text-gray-100"
                            }
                          >
                            {text}
                          </p>
                        );

                      })}
                    </div>

                  </div>
                ))

              )}

              {loading && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-xl">

                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>

                  <div
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>

                  <div
                    className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>

                  <span className="text-gray-300 text-sm ml-2">
                    MemoryOS thinking...
                  </span>

                </div>
              )}

              <div ref={chatEndRef}></div>
            </div> 
          </>
        )}

        {activeTab === "Timeline" && (
          <div className="flex-1 mt-6 overflow-auto space-y-3">

            {/* TITLE */}
            <h2 className="text-xl font-bold text-yellow-300">
              Memory Timeline
            </h2>

            {/* FILTER CHIPS */}
            <div className="flex gap-2 mt-3 mb-4 flex-wrap">
              {["All", "DSA", "AI", "Project", "College", "General"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    selectedTopic === t
                      ? "bg-yellow-500/20 border-yellow-400 text-yellow-300"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {selectedTopic !== "All" && (
              <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm animate-pulse">
                🔍 Showing: <span className="font-bold">{selectedTopic}</span> Memories
              </div>
            )}

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-4 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 outline-none"
            />

            {/* EMPTY STATE */}
            {visibleMemory.length === 0 ? (
              <div className="relative flex flex-col items-center justify-center h-full text-center mt-10 animate-fade-in">

                <div className="absolute w-72 h-72 bg-purple-500/10 blur-3xl rounded-full"></div>
                <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-500/10 blur-3xl rounded-full animate-pulse"></div>

                <div className="text-6xl mb-4">🧠</div>

                <h2 className="text-2xl font-bold text-purple-300 animate-pulse">
                  Your AI Memory is Empty
                </h2>

                <p className="text-gray-400 mt-2">
                  Start chatting to build your second brain
                </p>

                <div className="mt-6 space-y-2 text-sm text-gray-500">

                  <p>💡 Try: "Explain arrays"</p>
                  <p>📚 Try: "What is AI?"</p>
                  <p>🚀 Try: "Give me a project idea"</p>
                
                </div>

              </div>
            ) : (
              visibleMemory
                .slice()
                .reverse()
                .map((m) => (
                  <div
                    key={m.id}
                    className={`fade-in p-4 rounded-xl border transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.18)] relative overflow-hidden backdrop-blur-xl ${
                      m.importance === "high"
                        ? "bg-red-500/10 border-red-400 shadow-md shadow-red-500/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-400"
                        : m.importance === "medium"
                        ? "bg-yellow-500/10 border-yellow-400 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-yellow-400"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {/* TOP ROW */}
                    <div className="flex items-center justify-between mb-3">

                      {/* LEFT SIDE: TOPIC */}
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                        📌 {m.topic}
                      </span>

                      {/* RIGHT SIDE: META */}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>📅 {m.date}</span>
                        <span>•</span>
                        <span>⏱ {m.time}</span>
                      </div>

                    </div>

                    {/* QUESTION */}
                    <div className="mt-3 text-cyan-300 font-bold">
                      Q: {highlightText(m.question, searchQuery)}
                    </div>

                    {/* ANSWER */}
                    <div className="mt-2 text-gray-200 text-sm whitespace-pre-wrap">

                      {expandedMemoryId === m.id
                        ? highlightText(m.answer, searchQuery)
                        : highlightText(`${m.answer.slice(0, 180)}...`, searchQuery)}

                    </div>

                    <button
                      onClick={() =>
                        setExpandedMemoryId(
                          expandedMemoryId === m.id ? null : m.id
                        )
                      }
                      className="mt-3 text-xs text-cyan-300 hover:text-cyan-200 transition"
                    >
                      {expandedMemoryId === m.id
                        ? "Show Less ▲"
                        : "Show More ▼"}
                    </button>

                    <button
                      onClick={() => setSelectedTopic(m.topic)}
                      className="mt-3 text-xs px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition"
                    >
                      🔍 Related
                    </button>

                    {/* NEW: INSIGHT */}
                    <div className="mt-3 p-2 rounded-lg bg-purple-500/10 border border-purple-400/20">
                      <p className="text-xs text-purple-300">
                        🧠 {m.insight}
                      </p>
                    </div>
                  </div>
                ))
              )}

            </div>
          )}

        {activeTab === "Insights" && (
          <div className="flex-1 mt-6 space-y-6">

            {/* HEADER */}
            <h2 className="text-xl font-bold text-purple-300">
              AI Insights Dashboard
            </h2>

            {/* MAIN STATS */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">

              {/* Total Questions */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 transition duration-300">
                <p className="text-gray-400 text-sm">Total Questions</p>
                <p className="text-3xl font-bold text-cyan-300 mt-1">
                  {insights.total}
                </p>
              </div>

              {/* Today Activity */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 transition duration-300">
                <p className="text-gray-400 text-sm">Today Activity</p>
                <p className="text-3xl font-bold text-yellow-300 mt-1">
                  {insights.today}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-purple-300 mb-3">
                  📊 Topic Breakdown
                </h3>

                <div className="space-y-3">

                  {Object.entries(topicStats).map(([topic, count]) => {

                    const percentage =
                      insights.total === 0
                        ? 0
                        : Math.round((count / insights.total) * 100);
                    return (
                      <div key={topic} className="flex items-center justify-between">

                        {/* Topic Name */}
                        <span className="text-gray-300 text-sm">
                          {topic}
                        </span>

                        {/* Bar */}
                        <div className="flex-1 mx-3 bg-white/5 rounded-full h-2 overflow-hidden">

                          <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-cyan-400"
                            style={{
                              width: `${percentage}%`
                            }}
                          ></div>

                        </div>

                        {/* Count */}
                        <span className="text-xs text-gray-400">
                          {count}
                        </span>

                      </div>
                    );
                  })}

                </div>
              </div>

            </div>

            {/* EXTRA INSIGHT BAR */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">

              <p className="text-sm text-gray-400 mb-3">
                Learning Progress
              </p>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                  style={{
                    width:
                      insights.total === 0
                        ? "0%"
                        : `${Math.min(
                            100,
                            (insights.today / Math.max(insights.total, 1)) * 100
                          )}%`,
                  }}
                />

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Based on today vs total activity
              </p>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() => {
                  const confirmClear = window.confirm(
                    "Are you sure you want to clear all memories?"
                  );

                  if (confirmClear) {
                    setMemory([]);
                    setInsights({
                      total: 0,
                      today: 0,
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition"
              >
                🗑 Clear Memory
              </button>

            </div>

          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="flex-1 mt-6 flex flex-col">

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-red-300 mb-4">
              AI Task Manager
            </h2>

            {/* ADD TASK */}
            <div className="flex gap-2 mb-6">
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none"
              />

              <button
                onClick={addTask}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 transition"
              >
                Add
              </button>
            </div>

            {/* TASK LIST */}
            <div className="space-y-3 overflow-auto">

              {tasks.length === 0 ? (
                <p className="text-gray-400">
                  No tasks yet.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >

                    {/* LEFT */}
                    <div>
                      <p
                        className={`font-medium ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-white"
                        }`}
                      >
                        {task.text}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {task.createdAt}
                      </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-2">

                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          task.completed
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {task.completed ? "Done" : "Pending"}
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-sm"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        )}

        {activeTab === "Chat" && (
          <>

            {/* INPUT */}
            <div className="flex gap-2 mt-4">
              <input
                ref={inputRef}
                className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MemoryOS..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-purple-500 rounded-xl hover:bg-purple-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Send
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Memory Count: {memory.length}
            </div>

          </>
        )}

      </div>
    </div>
  );
}