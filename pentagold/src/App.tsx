import React from 'react';
import { Hexagon, Circle, ArrowRight, ChevronDown, Shield, BarChart3, Coins, Globe, Github, Twitter, Lock, Zap, Network, Bell, Newspaper, ExternalLink, Building2, Wallet, Database, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoldPriceChart from './components/GoldPriceChart';
import logo from './assets/logo.png';
import { motion } from 'framer-motion';

function TetraLogo() {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <Hexagon className="w-10 h-10 text-amber-600 absolute" strokeWidth={1.5} />
      <Circle className="w-7 h-7 text-amber-500 absolute" strokeWidth={2} />
      <Coins className="w-5 h-5 text-amber-700 absolute" strokeWidth={2} />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#10131a] text-white">
      {/* Navigation */}
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#10131a] border-b border-[#23263a]">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full border-2 border-amber-400 bg-white" />
          <span className="text-2xl font-bold tracking-wide text-white">PentaGold</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-gray-300 hover:text-amber-400 transition-colors">About</a>
          <a href="#tokenomics" className="text-gray-300 hover:text-amber-400 transition-colors">Tokenomics</a>
          <a href="#whitepaper" className="text-gray-300 hover:text-amber-400 transition-colors">Whitepaper</a>
          <Link to="/login" className="text-gray-300 hover:text-amber-400 transition-colors">Login</Link>
          <Link 
            to="/dashboard" 
            className="bg-amber-400 text-[#10131a] px-6 py-2 rounded-lg font-bold hover:bg-amber-500 transition-colors shadow-lg"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-[#10131a]">
        <motion.div
          className="md:w-1/2 flex flex-col items-start"
          initial={{ x: -80, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The Future of <span className="text-amber-400">Gold-Indexed</span><br /> Digital Assets
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            PentaGold (PGAUx) is a revolutionary token that tracks real-time gold prices through decentralized oracles, bringing the stability of gold markets to DeFi.
          </motion.p>
          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link 
              to="/dashboard"
              className="bg-amber-400 hover:bg-amber-500 text-[#10131a] px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              Get Started
            </Link>
            <a href="#about" className="border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-[#10131a] px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Learn More
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className="md:w-1/2 flex justify-center mt-12 md:mt-0"
          initial={{ x: 80, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="bg-[#181b24] rounded-2xl shadow-xl p-6 w-full max-w-4xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <GoldPriceChart />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full bg-white py-20 px-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-12">
          <motion.img 
            src={logo} 
            alt="Logo" 
            className="h-64 w-64 rounded-full border-4 border-amber-400 bg-white shadow-xl mb-6 animate-spin-slow"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          />
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#10131a] mb-4 text-center">The Future of PentaGold</h2>
          <p className="text-lg text-gray-700 max-w-2xl text-center">
            Our gold-indexed token model provides accurate price tracking, security, and transparency in the volatile world of digital assets.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
          {[1,2,3].map((i) => (
            <motion.div
              key={i}
              className="bg-amber-50 p-8 rounded-xl shadow-md flex flex-col items-center"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 * i }}
            >
              <span className="text-amber-400 text-4xl font-extrabold mb-4">{i}</span>
              <h3 className="text-xl font-bold text-[#10131a] mb-3">
                {i === 1 ? 'Instant Settlement' : i === 2 ? 'Zero Storage Costs' : 'Algorithmic Price Tracking'}
              </h3>
              <p className="text-gray-700 text-center">
                {i === 1 ? 'Trade gold exposure 24/7 with immediate settlement. No waiting for vault operations or custody transfers.' : i === 2 ? 'Eliminate vault fees, insurance costs, and storage concerns. Pure price exposure without physical custody overhead.' : 'Multi-source oracle aggregation ensures accurate real-time gold price tracking without centralized custody risks.'}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose PentaGold?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our gold-indexed token model provides accurate price tracking, security, and transparency in the volatile world of digital assets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[0,1,2,3,4,5].map((i) => (
              <motion.div
                key={i}
                className="bg-amber-50 p-8 rounded-xl"
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 * i }}
              >
                {i === 0 && <Zap className="h-12 w-12 text-amber-600 mb-6" />}
                {i === 1 && <Coins className="h-12 w-12 text-amber-600 mb-6" />}
                {i === 2 && <BarChart3 className="h-12 w-12 text-amber-600 mb-6" />}
                {i === 3 && <Shield className="h-12 w-12 text-amber-600 mb-6" />}
                {i === 4 && <Network className="h-12 w-12 text-amber-600 mb-6" />}
                {i === 5 && <Lock className="h-12 w-12 text-amber-600 mb-6" />}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {i === 0 && 'Instant Settlement'}
                  {i === 1 && 'Zero Storage Costs'}
                  {i === 2 && 'Algorithmic Price Tracking'}
                  {i === 3 && 'Capital Efficiency'}
                  {i === 4 && 'Complete Transparency'}
                  {i === 5 && 'Decentralized Security'}
                </h3>
                <p className="text-gray-700">
                  {i === 0 && 'Trade gold exposure 24/7 with immediate settlement. No waiting for vault operations or custody transfers.'}
                  {i === 1 && 'Eliminate vault fees, insurance costs, and storage concerns. Pure price exposure without physical custody overhead.'}
                  {i === 2 && 'Multi-source oracle aggregation ensures accurate real-time gold price tracking without centralized custody risks.'}
                  {i === 3 && 'Synthetic design eliminates 1:1 physical backing requirements, enabling efficient scaling and reduced counterparty risk.'}
                  {i === 4 && 'All price feeds, transactions, and smart contract operations are fully auditable on-chain.'}
                  {i === 5 && 'Multi-layer security with circuit breakers, timelock governance, and continuous monitoring eliminates single points of failure.'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tokenomics</h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Understanding the economic model behind PentaGold
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Token Supply & Distribution</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dynamic Supply</h4>
                    <p className="text-gray-700">Token supply adjusts based on market demand and trading activity</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Price Tracking</h4>
                    <p className="text-gray-700">Token value tracks real-time gold market prices via oracle network</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Transaction Fees</h4>
                    <p className="text-gray-700">Minimal fees to ensure sustainability and liquidity</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Oracle & Price Mechanism</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Decentralized Oracles</h4>
                    <p className="text-gray-700">Multiple trusted data sources ensure accurate gold price tracking</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Price Updates</h4>
                    <p className="text-gray-700">Continuous real-time price updates reflect current gold market conditions</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4 mt-1">
                    <div className="bg-amber-600 h-3 w-3 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Failsafe Mechanisms</h4>
                    <p className="text-gray-700">Multiple backup systems ensure continuous price feed reliability</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Integrations Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Partners & Integrations</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Connecting with leading platforms and protocols
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Partner Card 1 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="h-20 flex items-center justify-center mb-4">
                <Building2 className="h-16 w-16 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Major Exchanges</h3>
              <p className="text-gray-600 text-sm">Listed on leading cryptocurrency exchanges for maximum liquidity</p>
            </div>

            {/* Partner Card 2 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="h-20 flex items-center justify-center mb-4">
                <Boxes className="h-16 w-16 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Protocols</h3>
              <p className="text-gray-600 text-sm">Integrated with top financial platforms for yield generation</p>
            </div>

            {/* Partner Card 3 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="h-20 flex items-center justify-center mb-4">
                <Database className="h-16 w-16 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Oracle Networks</h3>
              <p className="text-gray-600 text-sm">Powered by industry-leading decentralized oracle solutions</p>
            </div>

            {/* Partner Card 4 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="h-20 flex items-center justify-center mb-4">
                <Wallet className="h-16 w-16 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Custody Solutions</h3>
              <p className="text-gray-600 text-sm">Compatible with major custody and banking solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest Updates</h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Stay informed about PentaGold's development and ecosystem growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Update Card 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-amber-50 p-8">
                <Bell className="h-24 w-24 text-amber-600 mx-auto" />
              </div>
              <div className="p-6">
                <div className="flex items-center text-amber-600 text-sm mb-2">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Announcement</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enhanced Oracle Network</h3>
                <p className="text-gray-600 mb-4">Upgraded price feed infrastructure with multiple data sources for improved accuracy.</p>
                <a href="#" className="text-amber-600 hover:text-amber-700 font-medium flex items-center">
                  Read More <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Update Card 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-amber-50 p-8">
                <Newspaper className="h-24 w-24 text-amber-600 mx-auto" />
              </div>
              <div className="p-6">
                <div className="flex items-center text-amber-600 text-sm mb-2">
                  <Newspaper className="h-4 w-4 mr-2" />
                  <span>Partnership</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">New Exchange Listing</h3>
                <p className="text-gray-600 mb-4">PentaGold is now available on another major cryptocurrency exchange.</p>
                <a href="#" className="text-amber-600 hover:text-amber-700 font-medium flex items-center">
                  Read More <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Update Card 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-amber-50 p-8">
                <Zap className="h-24 w-24 text-amber-600 mx-auto" />
              </div>
              <div className="p-6">
                <div className="flex items-center text-amber-600 text-sm mb-2">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Development</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile App Beta</h3>
                <p className="text-gray-600 mb-4">Our mobile wallet application enters public beta testing phase.</p>
                <a href="#" className="text-amber-600 hover:text-amber-700 font-medium flex items-center">
                  Read More <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="whitepaper" className="py-20 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Future of Gold Markets?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Download our comprehensive whitepaper to learn more about PentaGold's oracle network, tokenomics, and vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-amber-700 hover:bg-amber-100 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center">
              Download Whitepaper <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <Link 
              to="/dashboard"
              className="bg-amber-800 hover:bg-amber-900 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              Launch App <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <TetraLogo />
                <span className="text-2xl font-bold">PentaGold</span>
              </div>
              <p className="text-gray-400 mb-6">
                The future of gold-indexed digital assets, combining real-time gold price tracking with the flexibility of modern financial technology. Powered by PentaGold.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <Globe className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-amber-500 transition-colors">Home</Link></li>
                <li><a href="#about" className="text-gray-400 hover:text-amber-500 transition-colors">About</a></li>
                <li><a href="#tokenomics" className="text-gray-400 hover:text-amber-500 transition-colors">Tokenomics</a></li>
                <li><a href="#whitepaper" className="text-gray-400 hover:text-amber-500 transition-colors">Whitepaper</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-amber-500 transition-colors">Login</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-amber-500 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Oracle Network</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Contact</h3>
              <ul className="space-y-3">
                <li className="text-gray-400">info@pentagold.io</li>
                <li className="text-gray-400">Support: support@pentagold.io</li>
                <li className="text-gray-400">Partnerships: partners@pentagold.io</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 PentaGold. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Legal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;