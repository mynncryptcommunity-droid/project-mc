import React from 'react';
import { useAccount } from 'wagmi';
import { getRoleByWallet, getAllAuthorizedWallets } from '../config/adminWallets';

export default function AdminDebugPage() {
  const { address, isConnected } = useAccount();
  const role = getRoleByWallet(address);
  const allWallets = getAllAuthorizedWallets();

  return (
    <div className="min-h-screen bg-sfc-dark-blue text-sfc-cream p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#F5C45E]">Admin Dashboard Debug</h1>

        {/* Connection Status */}
        <div className="bg-[#102E50] border-2 border-[#243DB6] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-[#4DA8DA]">Wallet Connection Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Connected:</span>
              <span className={`px-4 py-2 rounded ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                {isConnected ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            <div className="flex justify-between items-center break-all">
              <span className="font-semibold">Address:</span>
              <span className="text-[#4DA8DA] text-sm">{address || 'Not Connected'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Role:</span>
              <span className="text-[#F5C45E] font-bold uppercase">
                {role === 'owner' ? '👑 OWNER' : role === 'investor' ? '💰 INVESTOR' : '❌ UNKNOWN'}
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Wallets */}
        <div className="bg-[#102E50] border-2 border-[#243DB6] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-[#4DA8DA]">Authorized Wallets Config</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Owner Wallets:</h3>
              <div className="space-y-2 ml-4">
                {allWallets.owners.length > 0 ? (
                  allWallets.owners.map((wallet, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-[#4DA8DA]">{wallet}</span>
                      {wallet.toLowerCase() === address?.toLowerCase() && (
                        <span className="ml-2 text-green-400 font-bold">← Your wallet</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-yellow-400">No owners configured</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Investor Wallets:</h3>
              <div className="space-y-2 ml-4">
                {allWallets.investors.length > 0 ? (
                  allWallets.investors.map((wallet, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-[#4DA8DA]">{wallet}</span>
                      {wallet.toLowerCase() === address?.toLowerCase() && (
                        <span className="ml-2 text-green-400 font-bold">← Your wallet</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-yellow-400">No investors configured</div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-[#243DB6]">
              <span className="text-sm text-[#F5C45E]">Environment: <strong>{allWallets.environment}</strong></span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-[#102E50] border-2 border-[#243DB6] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-[#4DA8DA]">Access Control Test</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-3 bg-[#011220] rounded">
              <span className="font-semibold min-w-[100px]">Wallet Connected:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                {isConnected ? '✅ PASS' : '❌ FAIL'}
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[#011220] rounded">
              <span className="font-semibold min-w-[100px]">Address Exists:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold ${address ? 'bg-green-600' : 'bg-red-600'}`}>
                {address ? '✅ PASS' : '❌ FAIL'}
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[#011220] rounded">
              <span className="font-semibold min-w-[100px]">Role Detected:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold ${role !== 'unknown' ? 'bg-green-600' : 'bg-red-600'}`}>
                {role !== 'unknown' ? `✅ ${role.toUpperCase()}` : '❌ UNKNOWN'}
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[#011220] rounded">
              <span className="font-semibold min-w-[100px]">Can Access Admin:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold ${role === 'owner' || role === 'investor' ? 'bg-green-600' : 'bg-red-600'}`}>
                {role === 'owner' || role === 'investor' ? '✅ YES' : '❌ NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              console.log('Current Address:', address);
              console.log('Current Role:', role);
              console.log('All Wallets Config:', allWallets);
              alert(`Address: ${address}\nRole: ${role}`);
            }}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all border-2 border-[#243DB6]"
          >
            Log to Console
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#F5C45E] to-[#E78B48] text-[#102E50] hover:from-[#243DB6] hover:to-[#102E50] hover:text-[#F5C45E] transition-all border-2 border-[#F5C45E]"
          >
            Go to Admin Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all border-2 border-gray-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
