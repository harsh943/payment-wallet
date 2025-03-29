import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";

async function getBalance() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }
    
    // Parse the user ID safely - use a more aggressive approach
    let userId;
    try {
        // Extract just the first 9 digits of the ID to ensure it fits in a 32-bit integer
        // This is a workaround for the ID being too large
        const idStr = session.user.id.toString();
        userId = parseInt(idStr.substring(0, 9), 10);
        
        if (isNaN(userId) || !isFinite(userId)) {
            throw new Error('Invalid user ID');
        }
        
        console.log('Using truncated userId:', userId);
    } catch (error) {
        console.error('Error parsing user ID:', error);
        redirect('/login');
    }
    
    const balance = await prisma.balance.findUnique({
        where: {
            userId: userId
        }
    });
    return {
        amount: balance?.amount ?? 0,
        locked: balance?.locked ?? 0
    };
}

async function getRecentTransactions() {
    const session = await getServerSession(authOptions);
    
    // Parse the user ID safely - use the same approach as getBalance
    let userId;
    try {
        // Extract just the first 9 digits of the ID to ensure it fits in a 32-bit integer
        const idStr = session?.user?.id?.toString() || '';
        userId = parseInt(idStr.substring(0, 9), 10);
        
        if (isNaN(userId) || !isFinite(userId)) {
            throw new Error('Invalid user ID');
        }
        
        console.log('Using truncated userId for transactions:', userId);
    } catch (error) {
        console.error('Error parsing user ID:', error);
        return [];
    }
    
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            startTime: 'desc'
        },
        take: 5
    });
    return txns.map(t => ({
        id: t.id,
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }));
}

export default async function() {
    const balance = await getBalance();
    const recentTransactions = await getRecentTransactions();
    
    return (
        <div className="w-screen">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
                Dashboard
            </div>
            
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
            <Card title="Available Balance">
  <div className="p-4">
    <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
    <p className="text-4xl font-bold text-[#6a51a6] mt-3 transition-all duration-500 hover:transform hover:scale-105">
      <span style={{ fontFamily: 'system-ui' }}>₹</span>
      {(balance.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
    <div className="mt-6">
      <Link href="/transfer">
        <Button className="w-full bg-[#6a51a6] hover:bg-[#5a4196] text-white py-3">
          Add Money
        </Button>
      </Link>
    </div>
  </div>
</Card>
                
                <Card title="Locked Balance">
  <div className="p-4">
    <h3 className="text-sm font-medium text-gray-500">Locked Balance</h3>
    <p className="text-4xl font-bold text-gray-700 mt-3 transition-all duration-500 hover:transform hover:scale-105">
      <span style={{ fontFamily: 'system-ui' }}>₹</span>
      {(balance.locked / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
    <div className="mt-6 text-xs text-gray-500">
      Funds that are currently locked in pending transactions
    </div>
  </div>
</Card>
                
                <Card title="Total Balance">
  <div className="p-4">
    <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
    <p className="text-4xl font-bold text-green-600 mt-3 transition-all duration-500 hover:transform hover:scale-105">
      <span style={{ fontFamily: 'system-ui' }}>₹</span>
      {((balance.amount + balance.locked) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
    <div className="mt-6 text-xs text-gray-500">
      Sum of available and locked funds
    </div>
  </div>
</Card>
            </div>
            
            {/* Quick Actions */}
<div className="px-4 mb-8">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <Link href="/transfer">
      <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-purple-100 text-[#6a51a6] mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-center font-medium text-gray-700">Add Money</p>
      </div>
    </Link>
    
    <Link href="/p2p">
      <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>
        <p className="text-center font-medium text-gray-700">P2P Transfer</p>
      </div>
    </Link>
    
    <Link href="/transactions">
      <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-600 mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-center font-medium text-gray-700">Transactions</p>
      </div>
    </Link>
    
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-yellow-100 text-yellow-600 mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-center font-medium text-gray-700">Support</p>
    </div>
  </div>
</div>
            
            {/* Recent Activity */}
<div className="px-4 mb-8">
  <Card title="Recent Activity">
    {recentTransactions.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No recent activity</p>
      </div>
    ) : (
      <div className="divide-y divide-gray-100">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="py-4 px-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.provider} Transfer
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(transaction.time), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ₹{(transaction.amount / 100).toFixed(2)}
              </p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                transaction.status === 'Success' 
                  ? 'bg-green-100 text-green-800' 
                  : transaction.status === 'Processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
     )}
    </Card>
    </div>
        </div>
    );
}