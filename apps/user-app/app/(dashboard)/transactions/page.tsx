import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import { Card } from "@repo/ui/card";
import { redirect } from "next/navigation";
import { TransactionList } from "../../../components/TransactionList";

async function getTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = Number(session.user.id);
  
  try {
    // Get P2P transfers (both sent and received)
    const p2pTransfers = await prisma.p2pTransfer.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        fromUser: true,
        toUser: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });

    // Get on-ramp transactions
    const onRampTransactions = await prisma.onRampTransaction.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 50
    });

    return {
      p2pTransfers,
      onRampTransactions,
      userId
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { p2pTransfers: [], onRampTransactions: [], userId };
  }
}

function formatCurrency(amount: number) {
  return (
    <>
      <span style={{ fontFamily: 'system-ui' }}>₹</span>
      {(amount / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </>
  );
}

export default async function TransactionsPage() {
  const { p2pTransfers, onRampTransactions, userId } = await getTransactions();

  // Calculate totals
  const totalReceived = p2pTransfers
    .filter(t => t.toUserId === userId)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalSent = p2pTransfers
    .filter(t => t.fromUserId === userId)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalAdded = onRampTransactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#6a51a6]">Transaction History</h1>
        </div>

        <TransactionList 
          p2pTransfers={p2pTransfers}
          onRampTransactions={onRampTransactions}
          userId={userId}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Received">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Received</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalReceived)}
              </p>
            </div>
          </Card>
          <Card title="Total Sent">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Sent</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalSent)}
              </p>
            </div>
          </Card>
          <Card title="Total Added">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Added</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAdded)}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}