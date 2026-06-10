import { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckCircle, Search, Activity, Wallet, PlusCircle } from 'lucide-react';
import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const glAccount = createAccount();
const glClient = createClient({ chain: studionet, account: glAccount });

function App() {
  const [contractAddress, setContractAddress] = useState('0xe5Ea8D654775Fb8883BDB9949f1B5254ae02fF2A');
  const [currentMarketId, setCurrentMarketId] = useState('m1');
  const [market, setMarket] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Custom Market Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newUrl, setNewUrl] = useState('');
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch real data on load
  useEffect(() => {
    refreshMarket();
  }, [contractAddress, currentMarketId]);

  const refreshMarket = async () => {
    if (!contractAddress) return;
    try {
      const data = await glClient.readContract({
        address: contractAddress as `0x${string}`,
        functionName: 'get_market',
        args: [currentMarketId],
      });
      if (data && data !== 'NOT_FOUND') {
        setMarket(JSON.parse(data as string));
      } else {
        setMarket(null); // Market not created yet
      }
    } catch (e) {
      console.error("Could not fetch market", e);
    }
  };

  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("User denied wallet connection");
      }
    } else {
      alert("Please install MetaMask to connect your wallet!");
    }
  };

  const initMarket = async () => {
    if (!contractAddress || !newQuestion || !newUrl) {
      alert("Please enter a question and resolution URL!");
      return;
    }
    setIsProcessing(true);
    setLoadingText('Broadcasting new market to GenLayer...');
    try {
      const generatedId = 'm_' + Date.now(); // Generate a truly unique market ID
      const txHash = await glClient.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'create_market',
        args: [generatedId, newQuestion, newUrl],
        value: 0n,
      });
      await glClient.waitForTransactionReceipt({ hash: txHash, status: TransactionStatus.FINALIZED });
      setCurrentMarketId(generatedId); // Switch view to the new market
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBet = async (prediction: 'YES' | 'NO') => {
    if (!walletAddress) {
      alert("Please Connect Wallet first to place a bet!");
      return;
    }
    
    try {
      // Force MetaMask popup to make the demo realistic
      const message = `AuraMarket Prediction\n\nAction: Place Bet\nMarket ID: ${currentMarketId}\nPrediction: ${prediction}\nAmount: 1 GEN\nTimestamp: ${new Date().toISOString()}`;
      const hexMessage = '0x' + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [hexMessage, walletAddress]
      });
    } catch (err) {
      console.warn("Signature rejected by user");
      return; // Stop if they reject the popup
    }

    setIsProcessing(true);
    setLoadingText(`Placing ${prediction} bet on-chain...`);
    
    try {
      const txHash = await glClient.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'place_bet',
        args: [currentMarketId, prediction, "1"],
        value: 0n,
      });
      await glClient.waitForTransactionReceipt({ hash: txHash, status: TransactionStatus.FINALIZED });
      await refreshMarket();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    setIsProcessing(true);
    setLoadingText('AI Oracle fetching web evidence & establishing consensus...');
    try {
      const txHash = await glClient.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'resolve_market',
        args: [currentMarketId],
        value: 0n,
      });
      await glClient.waitForTransactionReceipt({ hash: txHash, status: TransactionStatus.FINALIZED });
      await refreshMarket();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <Activity size={24} color="#fff" />
          </div>
          <h1 className="logo-text">AuraMarket</h1>
          <span className="badge">AI Prediction Market</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {market && (
            <button 
              onClick={() => setMarket(null)} 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--accent-primary)',
                background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              <PlusCircle size={18} />
              Create Market
            </button>
          )}
          <button onClick={connectWallet} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
            background: walletAddress ? 'rgba(16, 185, 129, 0.2)' : 'var(--gradient-glow)',
            color: walletAddress ? '#10b981' : 'white', cursor: 'pointer', fontWeight: 'bold'
          }}>
            <Wallet size={18} />
            {walletAddress ? walletAddress.substring(0,6) + '...' + walletAddress.substring(38) : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {isProcessing && (
        <div style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-primary)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent-primary)'}}>
          <div className="loader"></div>
          <strong>Processing on GenLayer:</strong> {loadingText}
        </div>
      )}

      {!market ? (
        <div className="glass-card" style={{textAlign: 'center'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Create New Prediction Market</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto'}}>
            <input 
              type="text" 
              placeholder="Market Question (e.g., 'Will Bitcoin reach $100k in 2026?')" 
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1.1rem' }}
            />
            <input 
              type="text" 
              placeholder="Resolution Evidence URL (e.g., 'https://coindesk.com/price/btc')" 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1.1rem' }}
            />
            <button className="btn-resolve" style={{padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '1rem'}} onClick={initMarket} disabled={isProcessing}>
              Deploy Market to Blockchain
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <div className="market-header">
            <h2 className="market-question">{market.question}</h2>
            <div className="market-meta">
              <span className="meta-item"><Search size={16} /> Resolution Source: <a href={market.resolution_url} target="_blank" rel="noreferrer" style={{color: 'var(--accent-primary)'}}>{market.resolution_url}</a></span>
              <span className="meta-item"><CheckCircle size={16} /> Status: <span style={{color: market.status === 'OPEN' ? '#10b981' : '#f59e0b'}}>{market.status}</span></span>
            </div>
          </div>
          
          <div className="pool-stats">
            <div className="pool-box yes">
              <div className="pool-label">YES POOL</div>
              <div className="pool-amount">{market.yes_pool.toLocaleString()} GEN</div>
            </div>
            <div className="pool-box no">
              <div className="pool-label">NO POOL</div>
              <div className="pool-amount">{market.no_pool.toLocaleString()} GEN</div>
            </div>
          </div>

          {market.status === 'OPEN' ? (
            <>
              <div className="bet-controls">
                <button className="btn btn-yes" onClick={() => handleBet('YES')} disabled={isProcessing || !walletAddress}>
                  Bet 1 YES
                </button>
                <button className="btn btn-no" onClick={() => handleBet('NO')} disabled={isProcessing || !walletAddress}>
                  Bet 1 NO
                </button>
              </div>
              {!walletAddress && <p style={{textAlign: 'center', color: 'var(--accent-secondary)', marginBottom: '1rem'}}>* Please connect wallet to place bets</p>}
              
              <button className="btn btn-resolve" onClick={handleResolve} disabled={isProcessing}>
                <Sparkles size={20} /> Trigger AI Oracle Resolution
              </button>
            </>
          ) : (
            <div className="resolution-box">
              <Brain size={48} color="var(--accent-primary)" />
              <h3>AI Oracle Consensus Reached</h3>
              <div className="outcome-text">{market.outcome}</div>
              <p className="reasoning">"{market.resolution_reasoning}"</p>
            </div>
          )}
        </div>
      )}
      
      <footer style={{marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
        <p>Built for GenLayer • Fully On-Chain Web Scraping via <code>gl.nondet.web.get</code></p>
      </footer>
    </div>
  );
}

export default App;
