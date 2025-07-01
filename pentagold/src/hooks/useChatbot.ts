import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    category?: string;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
}

export interface ChatbotActions {
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  getQuickQuestions: () => Array<{
    id: string;
    question: string;
    category: string;
    icon: string;
  }>;
}

// Enhanced knowledge base with more sophisticated responses
const ENHANCED_KNOWLEDGE_BASE = {
  dca: {
    keywords: ['dca', 'dollar cost averaging', 'tự động', 'kế hoạch', 'đầu tư định kỳ'],
    responses: {
      'dca là gì': {
        content: `DCA (Dollar-Cost Averaging) là chiến lược đầu tư mua một lượng tiền cố định theo định kỳ, bất kể giá thị trường.

**Lợi ích của DCA:**
• Giảm rủi ro biến động giá
• Loại bỏ cảm xúc khi đầu tư
• Tự động hóa hoàn toàn
• Xây dựng danh mục dài hạn

**Tại sao nên dùng DCA trên PentaGold:**
• Phí thấp chỉ 0.1% mỗi lần
• Tần suất linh hoạt (ngày/tuần/tháng)
• Giao diện dễ sử dụng
• Bảo mật cao với smart contract`,
        confidence: 0.95,
        suggestedActions: ['Tạo kế hoạch DCA', 'Xem hướng dẫn DCA', 'Tính toán phí DCA']
      },
      'tạo kế hoạch dca': {
        content: `**Cách tạo kế hoạch DCA:**

1. **Đăng nhập** vào dashboard
2. **Chuyển sang tab** "DCA Automation"
3. **Nhấn "New Plan"**
4. **Nhập thông tin:**
   - Số tiền đầu tư (từ $0.01 - $10,000)
   - Tần suất: Daily/Weekly/Monthly
5. **Nhấn "Create Plan"**

**Quản lý kế hoạch:**
• Pause/Resume: Tạm dừng/khôi phục
• Edit: Thay đổi số tiền/tần suất
• Cancel: Hủy bỏ hoàn toàn

**Lưu ý:** Kế hoạch sẽ tự động thực thi theo lịch trình đã đặt.`,
        confidence: 0.90,
        suggestedActions: ['Mở DCA Panel', 'Xem video hướng dẫn', 'Liên hệ support']
      }
    }
  },
  trading: {
    keywords: ['trading', 'giao dịch', 'mua', 'bán', 'mint', 'redeem'],
    responses: {
      'trading panel': {
        content: `**Hướng dẫn sử dụng Trading Panel:**

**Mint PGAUx (Mua):**
1. Chọn "Mint PGAUx"
2. Nhập số lượng tokens muốn mua
3. Điều chỉnh slippage tolerance
4. Nhấn "Mint" và xác nhận

**Redeem PGAUx (Bán):**
1. Chọn "Redeem PGAUx"
2. Nhập số tokens muốn bán
3. Điều chỉnh slippage tolerance
4. Nhấn "Redeem" và xác nhận

**Cài đặt:**
• Slippage tolerance: 0.1% - 5%
• Gas price optimization
• Transaction confirmation

**Lưu ý:**
• Luôn kiểm tra slippage
• Đảm bảo đủ số dư
• Theo dõi gas fees`,
        confidence: 0.88,
        suggestedActions: ['Mở Trading Panel', 'Xem biểu đồ giá', 'Kiểm tra balance']
      }
    }
  },
  security: {
    keywords: ['bảo mật', 'an toàn', 'audit', 'hack', 'rủi ro'],
    responses: {
      'bảo mật': {
        content: `**Bảo mật PentaGold:**

**Smart Contract Security:**
• Đã audit bởi các công ty uy tín
• Sử dụng OpenZeppelin libraries
• Upgradeable contracts với timelock
• Circuit breaker tích hợp

**Oracle Security:**
• Multi-oracle system (Chainlink + Band)
• Price staleness protection
• Deviation threshold monitoring
• Emergency pause capability

**User Protection:**
• Role-based access control
• Slippage protection
• Maximum amount limits
• Emergency stop functions

**Audit Status:**
✅ Smart contract audit completed
✅ Security review passed
✅ Penetration testing done
✅ Bug bounty program active`,
        confidence: 0.92,
        suggestedActions: ['Xem audit report', 'Kiểm tra smart contract', 'Tham gia bug bounty']
      }
    }
  },
  fees: {
    keywords: ['phí', 'fee', 'chi phí', 'cost', 'giá'],
    responses: {
      'phí giao dịch': {
        content: `**Phí trên PentaGold:**

**Trading Fees:**
• Mint PGAUx: 0.5%
• Redeem PGAUx: 0.5%
• Slippage: 0.1% - 5% (tùy chỉnh)

**DCA Automation Fees:**
• Execution fee: 0.1% mỗi lần
• Không có phí quản lý
• Không có phí ẩn

**Ví dụ phí DCA:**
• Đầu tư $100/tuần
• Phí thực thi: $0.10
• Tổng phí năm: $5.20 (52 tuần)

**So sánh với các nền tảng khác:**
PentaGold có phí thấp hơn nhiều so với các sàn giao dịch truyền thống.`,
        confidence: 0.85,
        suggestedActions: ['Tính toán phí', 'So sánh phí', 'Tối ưu chi phí']
      }
    }
  }
};

// Quick questions for easy access
const QUICK_QUESTIONS = [
  {
    id: '1',
    question: 'DCA là gì và tại sao nên sử dụng?',
    category: 'dca',
    icon: '📈'
  },
  {
    id: '2',
    question: 'Làm thế nào để tạo kế hoạch DCA?',
    category: 'dca',
    icon: '⚙️'
  },
  {
    id: '3',
    question: 'Phí giao dịch và DCA là bao nhiêu?',
    category: 'fees',
    icon: '💰'
  },
  {
    id: '4',
    question: 'Dự án có an toàn không?',
    category: 'security',
    icon: '🛡️'
  },
  {
    id: '5',
    question: 'Cách sử dụng trading panel?',
    category: 'trading',
    icon: '📊'
  },
  {
    id: '6',
    question: 'Tài liệu và hướng dẫn ở đâu?',
    category: 'docs',
    icon: '📚'
  }
];

export const useChatbot = (): ChatbotState & ChatbotActions => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý ảo của PentaGold. Tôi có thể giúp bạn tìm hiểu về dự án, DCA automation, trading và nhiều thứ khác. Bạn có câu hỏi gì không?',
      timestamp: new Date(),
      metadata: {
        category: 'greeting',
        confidence: 1.0,
        suggestedActions: ['Hỏi về DCA', 'Hỏi về Trading', 'Hỏi về Bảo mật']
      }
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Natural language processing function
  const processUserMessage = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for exact matches first
    for (const [category, data] of Object.entries(ENHANCED_KNOWLEDGE_BASE)) {
      for (const [key, response] of Object.entries(data.responses)) {
        if (lowerMessage.includes(key)) {
          return {
            content: response.content,
            category: category,
            confidence: response.confidence,
            suggestedActions: response.suggestedActions
          };
        }
      }
    }

    // Check for keyword matches
    for (const [category, data] of Object.entries(ENHANCED_KNOWLEDGE_BASE)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          // Find the best response for this category
          const responses = Object.values(data.responses);
          const bestResponse = responses[0]; // For now, take the first response
          return {
            content: bestResponse.content,
            category: category,
            confidence: bestResponse.confidence * 0.8, // Lower confidence for keyword match
            suggestedActions: bestResponse.suggestedActions
          };
        }
      }
    }

    // Default response
    return {
      content: `Tôi hiểu câu hỏi của bạn. Để tôi có thể giúp bạn tốt hơn, bạn có thể hỏi cụ thể về:

• **DCA Automation**: "DCA là gì?", "Cách tạo kế hoạch DCA?"
• **Trading**: "Cách sử dụng trading panel?", "Giao dịch PGAUx"
• **Phí**: "Phí giao dịch bao nhiêu?", "Chi phí DCA"
• **Bảo mật**: "Dự án có an toàn không?", "Bảo mật smart contract"

Hoặc bạn có thể chọn một câu hỏi từ danh sách bên dưới.`,
      category: 'general',
      confidence: 0.5,
      suggestedActions: ['Hỏi về DCA', 'Hỏi về Trading', 'Hỏi về Bảo mật']
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const response = processUserMessage(message);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          category: response.category,
          confidence: response.confidence,
          suggestedActions: response.suggestedActions
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: new Date(),
        metadata: {
          category: 'error',
          confidence: 0,
          suggestedActions: ['Thử lại', 'Liên hệ support']
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [processUserMessage]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Xin chào! Tôi là trợ lý ảo của PentaGold. Tôi có thể giúp bạn tìm hiểu về dự án, DCA automation, trading và nhiều thứ khác. Bạn có câu hỏi gì không?',
        timestamp: new Date(),
        metadata: {
          category: 'greeting',
          confidence: 1.0,
          suggestedActions: ['Hỏi về DCA', 'Hỏi về Trading', 'Hỏi về Bảo mật']
        }
      }
    ]);
    setError(null);
  }, []);

  const getQuickQuestions = useCallback(() => {
    return QUICK_QUESTIONS;
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearChat,
    getQuickQuestions
  };
}; 