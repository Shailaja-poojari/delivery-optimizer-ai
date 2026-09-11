// src/components/Chatbot/FloatingChatbot.jsx
import React, { useState } from "react";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything about delivery, sustainability, or features." }]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    const botMessage = {
      role: "bot",
      text: generateBotResponse(input)
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  const generateBotResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("delay")) return "Delays are estimated using AI based on zone, distance, and current mode.";
    if (lower.includes("emergency")) return "Emergency Mode prioritizes Koramangala and re-routes nearby deliveries.";
    if (lower.includes("festival")) return "Festival Mode boosts delivery predictions due to congestion.";
    if (lower.includes("offline")) return "Offline mode shows cached orders and disables real-time updates.";
    if (lower.includes("gps") || lower.includes("track")) return "GPS tracking shows your current agent location on map.";
    return "I'm still learning! For now, I can answer about delays, tracking, modes, and offline.";
  };

  return (
    <div>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">AI Chatbot Assistant</div>
          <div className="p-3 h-64 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded ${msg.role === "bot" ? "bg-gray-100 text-left" : "bg-blue-100 text-right"}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-grow px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-tr-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
