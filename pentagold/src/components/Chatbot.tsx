import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Shield,
  Settings,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { useChatbot, ChatMessage } from '../hooks/useChatbot';

interface QuickQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
  category: string;
}

const Chatbot: React.FC = () => {
  const {
    messages,
    isTyping,
    error,
    sendMessage,
    clearChat,
    getQuickQuestions
  } = useChatbot();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions: QuickQuestion[] = [
    {
      id: '1',
      question: 'DCA là gì và tại sao nên sử dụng?',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'dca'
    },
    {
      id: '2',
      question: 'Làm thế nào để tạo kế hoạch DCA?',
      icon: <Settings className="h-4 w-4" />,
      category: 'dca'
    },
    {
      id: '3',
      question: 'Phí giao dịch và DCA là bao nhiêu?',
      icon: <DollarSign className="h-4 w-4" />,
      category: 'fees'
    },
    {
      id: '4',
      question: 'Dự án có an toàn không?',
      icon: <Shield className="h-4 w-4" />,
      category: 'security'
    },
    {
      id: '5',
      question: 'Tài liệu và hướng dẫn ở đâu?',
      icon: <BookOpen className="h-4 w-4" />,
      category: 'docs'
    },
    {
      id: '6',
      question: 'Cách sử dụng trading panel?',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'trading'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleQuickQuestion = async (question: QuickQuestion) => {
    await sendMessage(question.question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderSuggestedActions = (message: ChatMessage) => {
    if (!message.metadata?.suggestedActions || message.type !== 'bot') return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500">Gợi ý:</p>
        <div className="flex flex-wrap gap-2">
          {message.metadata.suggestedActions.map((action, index) => (
            <button
              key={index}
              onClick={() => sendMessage(action)}
              className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderConfidenceIndicator = (message: ChatMessage) => {
    if (!message.metadata?.confidence || message.type !== 'bot') return null;

    const confidence = message.metadata.confidence;
    let color = 'text-red-500';
    let text = 'Thấp';

    if (confidence > 0.8) {
      color = 'text-green-500';
      text = 'Cao';
    } else if (confidence > 0.6) {
      color = 'text-yellow-500';
      text = 'Trung bình';
    }

    return (
      <div className={`text-xs ${color} mt-1`}>
        Độ tin cậy: {text} ({(confidence * 100).toFixed(0)}%)
      </div>
    );
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold">PentaGold Assistant</h3>
                <p className="text-amber-100 text-sm">Online • Sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="text-white hover:text-amber-200 transition-colors p-1"
                title="Xóa chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-amber-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {renderSuggestedActions(message)}
                      {renderConfidenceIndicator(message)}
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-amber-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <User className="h-4 w-4 text-amber-100 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-amber-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - always at the bottom, above input, max-h-32, scrollable if overflow */}
          <div className="px-4 pb-2 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Câu hỏi thường gặp:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuickQuestion(question)}
                  className="flex items-center space-x-3 p-2 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="text-amber-600">
                    {question.icon}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {question.question}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nhấn Enter để gửi • Shift + Enter để xuống dòng
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 