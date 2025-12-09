"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag, User, Server, Smartphone, Monitor, ShoppingCart, CreditCard, Box, Tag } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Context {
    channel: string;
    userId: string;
    [key: string]: any;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your retail assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeChannel, setActiveChannel] = useState("mobile_app");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = [...messages, userMsg];
            const context: Context = { channel: activeChannel, userId: "user-123" };

            const response = await axios.post("http://localhost:8000/api/chat", {
                messages: history,
                context: context
            });

            const assistantMsg: Message = { role: "assistant", content: response.data.content };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const channels = [
        { id: "web_chat", icon: Monitor, label: "Web Chat" },
    ];

    return (
        <div className="flex h-[600px] w-full max-w-4xl mx-auto border rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            {/* Sidebar for Context/Channel Switching */}
            <div className="w-16 md:w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
                <h2 className="text-sm font-semibold text-zinc-500 mb-4 hidden md:block uppercase tracking-wider">Channel</h2>
                <div className="space-y-2">
                    {channels.map((ch) => (
                        <button
                            key={ch.id}
                            onClick={() => setActiveChannel(ch.id)}
                            className={cn(
                                "flex items-center gap-3 w-full p-2 rounded-lg transition-all text-sm font-medium",
                                activeChannel === ch.id
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                            )}
                        >
                            <ch.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="hidden md:block">{ch.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xs font-semibold text-zinc-500 mb-2 hidden md:block uppercase tracking-wider">Active Agents</h2>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">
                            <ShoppingBag className="w-3 h-3" /> Sales
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded dark:bg-purple-900/30 dark:text-purple-400">
                            <Box className="w-3 h-3" /> Inventory
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded dark:bg-orange-900/30 dark:text-orange-400">
                            <CreditCard className="w-3 h-3" /> Payment
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-cyan-100 text-cyan-700 px-2 py-1 rounded dark:bg-cyan-900/30 dark:text-cyan-400">
                            <CreditCard className="w-3 h-3" /> Recommendation
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                            <CreditCard className="w-3 h-3" /> Fullfillment
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Retail Assistant</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                        
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex w-full items-start gap-2",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200 dark:border-zinc-700"
                                )}
                            >
                                {msg.content}
                            </div>
                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex w-full items-start gap-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 border border-zinc-200 dark:border-zinc-700">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex gap-2 relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about products, orders, or stock..."
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="absolute right-1 top-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
