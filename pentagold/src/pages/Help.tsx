import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LifeBuoy, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react';

const faqs = [
  {
    question: 'What is PGAUx?',
    answer: 'PGAUx is a stablecoin backed by real gold. Each PGAUx token represents ownership of a specific amount of physical gold stored securely.'
  },
  {
    question: 'How do I mint PGAUx?',
    answer: 'In the "Trading" section, select the "Mint" tab. Enter the amount of USD you want to use, and the system will show you the equivalent amount of PGAUx you will receive. After confirming, the transaction will be executed on the blockchain.'
  },
  {
    question: 'How do I redeem PGAUx?',
    answer: 'In the "Trading" section, select the "Redeem" tab. Enter the amount of PGAUx you want to redeem, and you will see the equivalent USD amount. The funds will be transferred to your account once the transaction is complete.'
  },
  {
    question: 'What is DCA and how does it work?',
    answer: 'DCA (Dollar-Cost Averaging) is an automated investment strategy. You can set up automatic purchases of PGAUx with a fixed amount at regular intervals (e.g., daily, weekly).'
  },
  {
    question: 'Are my transactions secure?',
    answer: 'Yes. All transactions are executed through audited smart contracts on the blockchain. We also implement security measures such as Timelock and Circuit Breaker to protect your assets.'
  }
];

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <header className="text-center mb-12">
            <LifeBuoy className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight">Help Center</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know to use PentaGold.
            </p>
          </header>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions (FAQ)</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <BookOpen className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Detailed Documentation</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Learn more about our architecture, smart contracts, and features.
              </p>
              <a href="#" className="font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center">
                View Documentation
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <MessageSquare className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Contact Support</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Can't find your answer? Our team is always ready to help.
              </p>
              <a href="mailto:support@pentagold.com" className="font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center">
                Send Email
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 