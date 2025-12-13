"use client"

import { useState } from 'react';
import ChatInterface from '@/components/chat';
import { Bot, SquarePlay, User } from 'lucide-react';
import { FaRobot } from "react-icons/fa";
import { TbBrain, TbGift } from "react-icons/tb";
import { MdCalendarToday, MdOutlineLocationOn, MdOutlineTrendingUp } from "react-icons/md";
import { RiArrowGoBackLine, RiArrowRightSLine, RiBankCardLine, RiChatSmileAiLine, RiCustomerService2Fill, RiGiftLine, RiHeadphoneLine, RiLightbulbLine, RiNotificationLine, RiRouteFill, RiSecurePaymentLine, RiSmartphoneLine, RiStarLine, RiStore3Line, RiStoreLine, RiTimeLine, RiTruckLine, RiUserHeartLine } from "react-icons/ri";
import Image from 'next/image';

const HomePage = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<number | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openDemo = () => {
    setIsDemoOpen(true);
  };

  const closeDemo = () => {
    setIsDemoOpen(false);
  };

  const agents = [
    {
      name: "Sales Agent",
      role: "Main Controller",
      color: "from-purple-500 to-purple-600",
      icon: <RiCustomerService2Fill />,
      responsibilities: [
        "Greets customer and collects intent",
        "Manages entire conversation",
        "Routes tasks to worker agents",
        "Maintains session context"
      ]
    },
    {
      name: "Recommendation Agent",
      role: "Product Suggestions",
      color: "from-orange-500 to-orange-600",
      icon: <RiLightbulbLine />,
      responsibilities: [
        "Reads customer profile",
        "Uses browsing & purchase history",
        "Applies seasonal trends",
        "Suggests products, bundles, promotions"
      ]
    },
    {
      name: "Inventory Agent",
      role: "Stock & Delivery Options",
      color: "from-green-500 to-green-600",
      icon: <RiStore3Line />,
      responsibilities: [
        "Checks stock in-store + warehouse",
        "Shows availability options",
        "Available here / Pick up in 2 hours",
        "Updates based on size/color"
      ]
    },
    {
      name: "Payment Agent",
      role: "Billing, Coupons, Loyalty",
      color: "from-blue-500 to-blue-600",
      icon: <RiSecurePaymentLine />,
      responsibilities: [
        "Shows total price + discounts",
        "Applies loyalty points & coupons",
        "Accepts multiple payment methods",
        "Manages payment failure & retry"
      ]
    },
    {
      name: "Fulfillment Agent",
      role: "Delivery / Pickup Scheduling",
      color: "from-teal-500 to-teal-600",
      icon: <RiTruckLine />,
      responsibilities: [
        "Schedules pickup or delivery",
        "Reserves item in-store",
        "Notifies store staff",
        "Sends order confirmation"
      ]
    },
    {
      name: "Post-Purchase Support Agent",
      role: "Returns, Tracking, Feedback",
      color: "from-pink-500 to-pink-600",
      icon: <RiHeadphoneLine />,
      responsibilities: [
        "Track orders",
        "Handle returns/exchanges",
        "Collect customer feedback",
        "Provide ongoing support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/in_store.jpg')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <i className="ri-robot-2-line text-2xl text-purple-300"></i>
              <span className="text-lg font-semibold inline-flex"><FaRobot className='w-6 h-6 text-purple-300 mr-2' />Multi-Agent System</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              In-Store Kiosk
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed ">
              Delivering Personalized, Real-Time Retail Assistance Through Advanced AI Agents
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={openDemo}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Start Chat
            </button>
            <button
              onClick={() => scrollToSection('agents-overview')}
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Agents Overview Section */}
      <section id="agents-overview" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
              SYSTEM ARCHITECTURE
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Six Intelligent Agents Working in Harmony
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each agent specializes in specific tasks while maintaining seamless communication throughout the customer journey
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Customer at top */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full text-white text-2xl mb-4">
                  <User />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
              </div>

              {/* Connecting line */}
              <div className="flex justify-center mb-8">
                <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-blue-500"></div>
              </div>

              {/* Agent flow */}
              <div className="space-y-8">
                {agents.map((agent, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer ${activeAgent === index ? 'border-purple-300 shadow-xl scale-105' : 'border-gray-200 hover:border-purple-200'
                        }`}
                      onClick={() => setActiveAgent(index)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                          {agent.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                          <p className="text-purple-600 font-medium mb-3">{agent.role}</p>
                          <ul className="space-y-1">
                            {agent.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-gray-600 text-sm flex items-start">
                                <span className="text-purple-500 mr-2 mt-1">•</span>
                                {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Connecting arrow */}
                    {index < agents.length - 1 && (
                      <div className="flex justify-center my-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Agent Section */}
      <section id="sales" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
                MAIN CONTROLLER
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Sales Agent</h2>
              <p className="text-xl text-gray-600 mb-8">
                Acts as the "brain" of the kiosk, managing the entire customer interaction and routing tasks to specialized worker agents.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiChatSmileAiLine />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Intelligent Greeting</h3>
                    <p className="text-gray-600">Welcomes customers and understands their shopping intent through natural conversation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiRouteFill />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Smart Routing</h3>
                    <p className="text-gray-600">Efficiently delegates tasks to appropriate agents while maintaining conversation context</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TbBrain />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Session Management</h3>
                    <p className="text-gray-600">Maintains complete conversation history and customer preferences throughout the journey</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                      <RiCustomerService2Fill />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Kiosk Interface</h4>
                      <p className="text-sm text-gray-500">Sales Agent Active</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">"Hello! I'm here to help you find what you're looking for. What can I assist you with today?"</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 ml-8">
                      <p className="text-sm text-gray-700">"I'm looking for running shoes"</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">"Great! Let me connect you with our recommendation system to find the perfect running shoes for you."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Agent Section */}
      <section id="recommendation" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recommended for You</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Image src="/nikeairmax.png" alt="nikeairmax" height={100} width={200} />
                      <h5 className="font-medium text-sm text-gray-900">Nike Air Max</h5>
                      <p className="text-xs text-gray-500">$129.99</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Image src="/image.png" alt="adidasboost" height={100} width={175} />
                      <h5 className="font-medium text-sm text-gray-900">Adidas Boost</h5>
                      <p className="text-xs text-gray-500">$149.99</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">
                      <i className="ri-lightbulb-line mr-1"></i>
                      Bundle suggestion: Add running socks for 20% off!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
                PERSONALIZATION ENGINE
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Recommendation Agent</h2>
              <p className="text-xl text-gray-600 mb-8">
                Provides personalized product suggestions based on customer profile, browsing history, and current trends.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiUserHeartLine />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Customer Profiling</h3>
                    <p className="text-gray-600">Analyzes purchase history, preferences, and behavioral patterns for accurate recommendations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdOutlineTrendingUp />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Trend Analysis</h3>
                    <p className="text-gray-600">Incorporates seasonal trends and popular items to suggest relevant products</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TbGift />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Bundle Suggestions</h3>
                    <p className="text-gray-600">Creates intelligent product bundles and promotional offers to enhance customer value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory & Payment Section */}
      <section id="inventory-payment" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Inventory & Payment Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time stock verification and secure payment processing ensure smooth transactions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Inventory Agent */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                  <RiStore3Line />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Inventory Agent</h3>
                  <p className="text-green-600 font-medium">Stock & Delivery Options</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Nike Air Max - Size 9</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <RiStoreLine className="mr-2 text-green-500" />
                      Available here (3 units)
                    </div>
                    <div className="flex items-center">
                      <RiTimeLine className="mr-2 text-blue-500" />
                      Pick up in 2 hours
                    </div>
                    <div className="flex items-center">
                      <RiTruckLine className="mr-2 text-purple-500" />
                      Ship to home (1-2 days)
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Real-time stock verification
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Multi-location inventory check
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Delivery option optimization
                </li>
              </ul>
            </div>

            {/* Payment Agent */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                  <RiSecurePaymentLine />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Agent</h3>
                  <p className="text-blue-600 font-medium">Billing, Coupons, Loyalty</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">$129.99</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Discount</span>
                    <span>-$13.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>$116.99</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button className="p-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 flex-col">
                    <RiSmartphoneLine className='flex items-center justify-center' />
                    UPI
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">
                    <RiBankCardLine />
                    Card
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">
                    <RiGiftLine />
                    Gift Card
                  </button>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Secure payment processing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Automatic discount application
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Multiple payment methods
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fulfillment & Support Section */}
      <section id="fulfillment-support" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Fulfillment & Support</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete order fulfillment and ongoing customer support for a seamless experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Fulfillment Agent */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white">
                  <RiTruckLine />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Fulfillment Agent</h3>
                  <p className="text-teal-600 font-medium">Delivery / Pickup Scheduling</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order Confirmation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Order #12345</span>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Confirmed</span>
                  </div>

                  <div className="text-sm space-y-2">
                    <div className="flex items-center">
                      <MdCalendarToday className="mr-2 text-teal-500" />
                      <span>Pickup: Tomorrow 2:00 PM</span>
                    </div>
                    <div className="flex items-center">
                      <MdOutlineLocationOn className="mr-2 text-teal-500" />
                      <span>Store Location: Main Street</span>
                    </div>
                    <div className="flex items-center">
                      <RiNotificationLine className="mr-2 text-teal-500" />
                      <span>Staff notified</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Intelligent delivery scheduling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Automatic staff notification
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Real-time order tracking
                </li>
              </ul>
            </div>

            {/* Support Agent */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white">
                  <RiHeadphoneLine />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Support Agent</h3>
                  <p className="text-pink-600 font-medium">Returns, Tracking, Feedback</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Support Dashboard</h4>
                <div className="space-y-3">
                  <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <RiTruckLine className="mr-3 text-pink-500" />
                        <span className="font-medium">Track Order</span>
                      </div>
                      <RiArrowRightSLine className="text-gray-400" />
                    </div>
                  </button>

                  <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <RiArrowGoBackLine className="mr-3 text-pink-500" />
                        <span className="font-medium">Start Return</span>
                      </div>
                      <RiArrowRightSLine className="text-gray-400" />
                    </div>
                  </button>

                  <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <RiStarLine className="mr-3 text-pink-500" />
                        <span className="font-medium">Leave Feedback</span>
                      </div>
                      <RiArrowRightSLine className="text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  24/7 order tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  Easy return processing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  Customer feedback collection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Demo Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={closeDemo}
              className="absolute top-2 right-2 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
            </button>
            <ChatInterface />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;