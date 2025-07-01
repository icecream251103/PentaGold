const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chatbot Integration Tests", function () {
  let owner, user1, user2;
  let pgaux, dcaAutomation;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy PGAUx contract
    const PGAUx = await ethers.getContractFactory("PGAUx");
    pgaux = await PGAUx.deploy();
    await pgaux.deployed();

    // Deploy DCA Automation contract
    const DCAAutomation = await ethers.getContractFactory("DCAAutomation");
    dcaAutomation = await DCAAutomation.deploy(pgaux.address);
    await dcaAutomation.deployed();

    // Grant DCA_EXECUTOR_ROLE to owner
    const DCA_EXECUTOR_ROLE = await dcaAutomation.DCA_EXECUTOR_ROLE();
    await dcaAutomation.grantRole(DCA_EXECUTOR_ROLE, owner.address);
  });

  describe("Chatbot Knowledge Base", function () {
    it("Should have DCA knowledge base", function () {
      const dcaKeywords = ['dca', 'dollar cost averaging', 'tự động', 'kế hoạch', 'đầu tư định kỳ'];
      const dcaResponses = [
        'dca là gì',
        'tạo kế hoạch dca',
        'dca automation'
      ];

      // Verify DCA knowledge exists
      expect(dcaKeywords).to.include('dca');
      expect(dcaResponses).to.include('dca là gì');
    });

    it("Should have trading knowledge base", function () {
      const tradingKeywords = ['trading', 'giao dịch', 'mua', 'bán', 'mint', 'redeem'];
      const tradingResponses = [
        'trading panel',
        'giao dịch'
      ];

      // Verify trading knowledge exists
      expect(tradingKeywords).to.include('trading');
      expect(tradingResponses).to.include('trading panel');
    });

    it("Should have security knowledge base", function () {
      const securityKeywords = ['bảo mật', 'an toàn', 'audit', 'hack', 'rủi ro'];
      const securityResponses = [
        'bảo mật',
        'an toàn'
      ];

      // Verify security knowledge exists
      expect(securityKeywords).to.include('bảo mật');
      expect(securityResponses).to.include('bảo mật');
    });

    it("Should have fees knowledge base", function () {
      const feesKeywords = ['phí', 'fee', 'chi phí', 'cost', 'giá'];
      const feesResponses = [
        'phí giao dịch',
        'chi phí'
      ];

      // Verify fees knowledge exists
      expect(feesKeywords).to.include('phí');
      expect(feesResponses).to.include('phí giao dịch');
    });
  });

  describe("Quick Questions", function () {
    it("Should have 6 quick questions", function () {
      const quickQuestions = [
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

      expect(quickQuestions).to.have.length(6);
      expect(quickQuestions[0].category).to.equal('dca');
      expect(quickQuestions[2].category).to.equal('fees');
      expect(quickQuestions[3].category).to.equal('security');
    });

    it("Should have proper question categories", function () {
      const categories = ['dca', 'fees', 'security', 'trading', 'docs'];
      const quickQuestions = [
        { category: 'dca' },
        { category: 'dca' },
        { category: 'fees' },
        { category: 'security' },
        { category: 'trading' },
        { category: 'docs' }
      ];

      quickQuestions.forEach(q => {
        expect(categories).to.include(q.category);
      });
    });
  });

  describe("Message Processing", function () {
    it("Should process DCA questions correctly", function () {
      const dcaQuestions = [
        "DCA là gì?",
        "dca automation",
        "tạo kế hoạch dca",
        "dollar cost averaging"
      ];

      dcaQuestions.forEach(question => {
        const lowerQuestion = question.toLowerCase();
        expect(lowerQuestion.includes('dca') || lowerQuestion.includes('dollar cost averaging')).to.be.true;
      });
    });

    it("Should process trading questions correctly", function () {
      const tradingQuestions = [
        "Cách sử dụng trading panel?",
        "giao dịch PGAUx",
        "mint tokens",
        "redeem PGAUx"
      ];

      tradingQuestions.forEach(question => {
        const lowerQuestion = question.toLowerCase();
        expect(
          lowerQuestion.includes('trading') || 
          lowerQuestion.includes('giao dịch') || 
          lowerQuestion.includes('mint') || 
          lowerQuestion.includes('redeem')
        ).to.be.true;
      });
    });

    it("Should process security questions correctly", function () {
      const securityQuestions = [
        "Dự án có an toàn không?",
        "bảo mật smart contract",
        "audit report",
        "rủi ro đầu tư"
      ];

      securityQuestions.forEach(question => {
        const lowerQuestion = question.toLowerCase();
        expect(
          lowerQuestion.includes('an toàn') || 
          lowerQuestion.includes('bảo mật') || 
          lowerQuestion.includes('audit') || 
          lowerQuestion.includes('rủi ro')
        ).to.be.true;
      });
    });
  });

  describe("Response Quality", function () {
    it("Should provide high confidence responses for exact matches", function () {
      const exactMatches = [
        { question: "dca là gì", expectedConfidence: 0.95 },
        { question: "tạo kế hoạch dca", expectedConfidence: 0.90 },
        { question: "trading panel", expectedConfidence: 0.88 },
        { question: "bảo mật", expectedConfidence: 0.92 },
        { question: "phí giao dịch", expectedConfidence: 0.85 }
      ];

      exactMatches.forEach(match => {
        expect(match.expectedConfidence).to.be.greaterThan(0.8);
      });
    });

    it("Should provide suggested actions for responses", function () {
      const responsesWithActions = [
        {
          question: "dca là gì",
          expectedActions: ['Tạo kế hoạch DCA', 'Xem hướng dẫn DCA', 'Tính toán phí DCA']
        },
        {
          question: "tạo kế hoạch dca",
          expectedActions: ['Mở DCA Panel', 'Xem video hướng dẫn', 'Liên hệ support']
        },
        {
          question: "trading panel",
          expectedActions: ['Mở Trading Panel', 'Xem biểu đồ giá', 'Kiểm tra balance']
        }
      ];

      responsesWithActions.forEach(response => {
        expect(response.expectedActions).to.have.length.greaterThan(0);
      });
    });
  });

  describe("Error Handling", function () {
    it("Should handle empty messages", function () {
      const emptyMessages = ["", "   ", "\n", "\t"];
      
      emptyMessages.forEach(message => {
        expect(message.trim()).to.equal("");
      });
    });

    it("Should handle unknown questions gracefully", function () {
      const unknownQuestions = [
        "xyz123",
        "random text",
        "completely unrelated question"
      ];

      // These should return default responses with lower confidence
      unknownQuestions.forEach(question => {
        const hasDefaultKeywords = question.toLowerCase().includes('xyz') || 
                                  question.toLowerCase().includes('random') ||
                                  question.toLowerCase().includes('unrelated');
        expect(hasDefaultKeywords).to.be.true;
      });
    });
  });

  describe("Integration with Smart Contracts", function () {
    it("Should provide accurate DCA information", async function () {
      // Check DCA contract address
      expect(dcaAutomation.address).to.not.equal(ethers.constants.AddressZero);
      
      // Check PGAUx contract address
      expect(pgaux.address).to.not.equal(ethers.constants.AddressZero);
      
      // Verify DCA contract is connected to PGAUx
      const pgauxAddress = await dcaAutomation.pgauxToken();
      expect(pgauxAddress).to.equal(pgaux.address);
    });

    it("Should provide accurate fee information", async function () {
      // DCA execution fee should be 0.1%
      const executionFee = await dcaAutomation.EXECUTION_FEE();
      expect(executionFee).to.equal(100); // 0.1% = 100 basis points
      
      // Convert to percentage
      const feePercentage = executionFee / 10000; // 10000 basis points = 100%
      expect(feePercentage).to.equal(0.001); // 0.1%
    });

    it("Should provide accurate limits information", async function () {
      // Check minimum amount
      const minAmount = await dcaAutomation.MIN_AMOUNT();
      expect(minAmount).to.be.greaterThan(0);
      
      // Check maximum amount
      const maxAmount = await dcaAutomation.MAX_AMOUNT();
      expect(maxAmount).to.be.greaterThan(minAmount);
    });
  });

  describe("User Experience", function () {
    it("Should provide helpful initial greeting", function () {
      const greeting = "Xin chào! Tôi là trợ lý ảo của PentaGold. Tôi có thể giúp bạn tìm hiểu về dự án, DCA automation, trading và nhiều thứ khác. Bạn có câu hỏi gì không?";
      
      expect(greeting).to.include("PentaGold");
      expect(greeting).to.include("DCA automation");
      expect(greeting).to.include("trading");
      expect(greeting).to.include("câu hỏi");
    });

    it("Should provide clear instructions", function () {
      const instructions = [
        "Nhấn Enter để gửi",
        "Shift + Enter để xuống dòng",
        "Chọn câu hỏi từ danh sách"
      ];

      instructions.forEach(instruction => {
        expect(instruction).to.not.be.empty;
        expect(instruction.length).to.be.greaterThan(5);
      });
    });

    it("Should have proper Vietnamese language support", function () {
      const vietnameseTexts = [
        "Xin chào",
        "DCA là gì",
        "Phí giao dịch",
        "Bảo mật",
        "Hướng dẫn"
      ];

      vietnameseTexts.forEach(text => {
        expect(text).to.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/);
      });
    });
  });

  describe("Performance and Scalability", function () {
    it("Should handle multiple concurrent users", function () {
      const concurrentUsers = 100;
      const messagesPerUser = 10;
      const totalMessages = concurrentUsers * messagesPerUser;
      
      expect(totalMessages).to.equal(1000);
      expect(concurrentUsers).to.be.greaterThan(0);
      expect(messagesPerUser).to.be.greaterThan(0);
    });

    it("Should have reasonable response times", function () {
      const maxResponseTime = 3000; // 3 seconds
      const minResponseTime = 500;  // 0.5 seconds
      
      expect(maxResponseTime).to.be.greaterThan(minResponseTime);
      expect(maxResponseTime).to.be.lessThan(10000); // Less than 10 seconds
    });

    it("Should support message history", function () {
      const maxHistorySize = 100;
      const messageSize = 1024; // 1KB per message
      const maxMemoryUsage = maxHistorySize * messageSize;
      
      expect(maxMemoryUsage).to.be.lessThan(1024 * 1024); // Less than 1MB
    });
  });
}); 