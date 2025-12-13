"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Monitor, ShoppingBag, User, Box, CreditCard, Truck } from "lucide-react";
import { TbBulb } from "react-icons/tb";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
    role: "user" | "assistant";
    content: string;
    partial?: boolean;
    options?: string[];
    products?: Product[];
    receipt?: Receipt;
    agentName?: string;
}

interface Receipt {
    id: string;
    date: string;
    items: { name: string; price: number; quantity: number }[];
    total: number;
    paymentMethod: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your retail assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [activeChannel, setActiveChannel] = useState("web_chat");
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"UPI" | "Card" | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            ws = new WebSocket("ws://localhost:8000/ws/chat");
            wsRef.current = ws;

            ws.addEventListener("open", () => {
                console.log("ws connected");
                setConnected(true);
            });

            ws.addEventListener("message", (ev) => {
                try {
                    const payload = JSON.parse(ev.data);
                    if (payload.type === "partial") {
                        setMessages((prev) => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === "assistant" && last.partial) {
                                const copy = [...prev];
                                copy[copy.length - 1] = { role: "assistant", content: last.content + payload.chunk, partial: true };
                                return copy;
                            } else {
                                return [...prev, { role: "assistant", content: payload.chunk, partial: true }];
                            }
                        });
                    } else if (payload.type === "final") {
                        if (payload.product_context) {
                            setSelectedProduct(payload.product_context);
                        }
                        setMessages((prev) => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === "assistant") {
                                const copy = [...prev];
                                copy[copy.length - 1] = {
                                    role: "assistant",
                                    content: payload.content,
                                    partial: false,
                                    options: payload.options,
                                    products: payload.products,
                                    agentName: payload.agentName
                                };
                                return copy;
                            } else {
                                return [...prev, {
                                    role: "assistant",
                                    content: payload.content,
                                    partial: false,
                                    options: payload.options,
                                    products: payload.products,
                                    agentName: payload.agentName
                                }];
                            }
                        });
                        setLoading(false);
                    } else if (payload.type === "system") {
                        setMessages((prev) => [...prev, { role: "assistant", content: payload.content }]);
                    }
                } catch (e) {
                    console.error("Invalid WS message", e);
                }
            });

            ws.addEventListener("close", () => {
                console.log("ws closed, reconnecting...");
                setConnected(false);
                wsRef.current = null;
                reconnectTimer = setTimeout(connect, 3000);
            });
        };

        connect();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = (text?: string) => {
        const contentToSend = text || input.trim();
        if (!contentToSend) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not connected");
            alert("Connection to server lost. Please check if backend is running.");
            return;
        }
        const userMsg: Message = { role: "user", content: contentToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        // send user message and context via websocket
        wsRef.current.send(JSON.stringify({
            type: "user_message",
            data: {
                content: userMsg.content,
                channel: activeChannel,
                userId: "user-123"
            }
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const channels = [{ id: "web_chat", icon: Monitor, label: "Web Chat" }];

    return (
        <div className="flex h-[600px] w-full max-w-4xl mx-auto border rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <div className="w-16 md:w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
                <h2 className="text-sm font-semibold text-zinc-500 mb-4 hidden md:block uppercase tracking-wider">Channel</h2>
                <div className="space-y-2">
                    {channels.map(ch => (
                        <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                            className={cn(
                                "flex items-center gap-3 w-full p-2 rounded-lg transition-all text-sm font-medium",
                                activeChannel === ch.id
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                            )}>
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
                            <TbBulb className="w-3 h-3" /> Recommendation
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Truck className="w-3 h-3" /> Fulfillment
                        </div>
                        {/* other agent tags */}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", connected ? "bg-green-500" : "bg-red-500")}></div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Retail Assistant {connected ? "(Online)" : "(Offline)"}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="flex flex-col w-full mb-2">
                            <div className={cn("flex w-full items-start gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                                <div className={cn("flex flex-col max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
                                    {msg.agentName && (
                                        <span className="text-[10px] text-zinc-400 ml-1 mb-1 font-medium uppercase tracking-wider">
                                            {msg.agentName.replace("Agent", "")}
                                        </span>
                                    )}
                                    <div className={cn("w-full rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap",
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200 dark:border-zinc-700"
                                    )}>
                                        {msg.content}
                                        {msg.partial && <span className="text-xs opacity-60">▌</span>}
                                    </div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                )}
                            </div>
                            {
                                msg.products && msg.products.length > 0 && (
                                    <div className="flex gap-4 ml-10 mb-2 overflow-x-auto pb-2">
                                        {msg.products.map((prod) => (
                                            <div key={prod.id} className="flex-shrink-0 w-40 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800 p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => {
                                                    // Optional: clicking product could trigger context update or "buy this"
                                                    setSelectedProduct(prod);
                                                    sendMessage(`I want to buy ${prod.name}`);
                                                }}
                                            >
                                                <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-700 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                                                    {prod.imageUrl ? (
                                                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingBag className="w-8 h-8 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate" title={prod.name}>{prod.name}</div>
                                                <div className="text-xs text-zinc-500">₹{prod.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                            {
                                msg.receipt && (
                                    <div className="ml-10 mb-4 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 w-64 shadow-md text-sm font-mono relative rounded-sm">
                                        {/* Receipt jagged edge (CSS trick or svg) */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent border-t border-dashed border-zinc-300 dark:border-zinc-600"></div>
                                        <div className="text-center font-bold mb-4 border-b pb-2 border-zinc-200 dark:border-zinc-700">STORE RECEIPT</div>
                                        <div className="flex justify-between text-xs text-zinc-500 mb-2">
                                            <span>Date:</span>
                                            <span>{msg.receipt.date}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 mb-4">
                                            <span>Order ID:</span>
                                            <span>{msg.receipt.id}</span>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            {msg.receipt.items.map((item, i) => (
                                                <div key={i} className="flex justify-between">
                                                    <span className="truncate pr-2">{item.name}</span>
                                                    <span>₹{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-bold">
                                            <span>TOTAL</span>
                                            <span>₹{msg.receipt.total}</span>
                                        </div>
                                        <div className="mt-4 text-[10px] text-center text-zinc-400">
                                            Paid via {msg.receipt.paymentMethod}
                                        </div>
                                    </div>
                                )
                            }
                            {
                                msg.options && msg.options.length > 0 && (
                                    <div className="flex gap-2 ml-10 mt-2 mb-2">
                                        {msg.options.map((opt) => (
                                            <Button
                                                key={opt}
                                                variant="outline"
                                                size="sm"
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                                onClick={() => {
                                                    if (opt === "UPI" || opt === "Card") {
                                                        setSelectedPaymentMethod(opt as "UPI" | "Card");
                                                        setIsPaymentSuccessful(false);
                                                        setPaymentModalOpen(true);
                                                    }
                                                }}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                    ))}
                    {loading && (
                        <div className="text-xs text-zinc-500">Assistant typing…</div>
                    )}
                    <div ref={scrollRef} />
                </div>

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
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="absolute right-1 top-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <Dialog open={paymentModalOpen} onOpenChange={(open) => {
                if (!open && !isPaymentSuccessful) {
                    setMessages(prev => [...prev, { role: "assistant", content: "Payment denied." }]);
                }
                setPaymentModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Complete Payment via {selectedPaymentMethod}</DialogTitle>
                        <DialogDescription>
                            Enter your details to proceed with the secure transaction.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPaymentMethod === "UPI" && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="upi-id" className="text-sm font-medium">UPI ID</label>
                                <Input id="upi-id" placeholder="example@okhdfcbank" />
                            </div>
                        </div>
                    )}

                    {selectedPaymentMethod === "Card" && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="card-num" className="text-sm font-medium">Card Number</label>
                                <Input id="card-num" placeholder="0000 0000 0000 0000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="expiry" className="text-sm font-medium">Expiry</label>
                                    <Input id="expiry" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                                    <Input id="cvc" placeholder="123" />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            if (!isPaymentSuccessful) {
                                setMessages(prev => [...prev, { role: "assistant", content: "Payment denied." }]);
                            }
                            setPaymentModalOpen(false);
                        }}>Cancel</Button>
                        <Button
                            disabled={paymentProcessing}
                            onClick={() => {
                                setPaymentProcessing(true);
                                setTimeout(() => {
                                    setPaymentProcessing(false);
                                    setIsPaymentSuccessful(true);
                                    setPaymentModalOpen(false);
                                    const orderId = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

                                    const receiptItem = selectedProduct ? {
                                        name: selectedProduct.name,
                                        price: selectedProduct.price,
                                        quantity: 1
                                    } : {
                                        name: "General Item",
                                        price: 1999, // Fallback
                                        quantity: 1
                                    };

                                    const receipt: Receipt = {
                                        id: orderId,
                                        date: new Date().toLocaleDateString(),
                                        items: [receiptItem],
                                        total: receiptItem.price,
                                        paymentMethod: selectedPaymentMethod || "Card"
                                    };

                                    setMessages(prev => [...prev,
                                    { role: "user", content: `Paid with ${selectedPaymentMethod}` },
                                    {
                                        role: "assistant",
                                        content: `Payment successful! Here is your receipt.`,
                                        receipt: receipt
                                    }
                                    ]);
                                }, 1500);
                            }}>
                            {paymentProcessing ? "Processing..." : `Pay with ${selectedPaymentMethod}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
