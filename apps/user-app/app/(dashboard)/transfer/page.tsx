import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { Card } from "@repo/ui/card";
import { redirect } from "next/navigation";

async function getBalance() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
        console.error('Invalid user ID:', session.user.id);
        return { amount: 0, locked: 0 };
    }

    try {
        const balance = await prisma.balance.findUnique({
            where: {
                userId: userId
            }
        });

        if (!balance) {
            const newBalance = await prisma.balance.create({
                data: {
                    userId: userId,
                    amount: 0,
                    locked: 0
                }
            });
            return {
                amount: newBalance.amount,
                locked: newBalance.locked
            };
        }

        return {
            amount: balance.amount,
            locked: balance.locked
        };
    } catch (error) {
        console.error('Error fetching balance:', error);
        return { amount: 0, locked: 0 };
    }
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    try {
        const txns = await prisma.onRampTransaction.findMany({
            where: {
                userId: Number(session.user.id)
            },
            orderBy: {
                startTime: 'desc'
            },
            take: 5
        });
        return txns.map(t => ({
            time: t.startTime,
            amount: t.amount,
            status: t.status,
            provider: t.provider
        }));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export default async function TransferPage() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return (
        <div className="w-screen">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold px-4">
                Transfer
            </div>
            
            {/* Stats Summary */}
            <div className="px-4 mb-6">
                <Card title="Balance Summary">
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-700">Available Balance</h3>
                            <p className="text-3xl font-bold text-[#6a51a6]">
                                <span style={{ fontFamily: 'system-ui' }}>₹</span>
                                {(balance.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="flex space-x-6">
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Locked</div>
                                <div className="text-xl font-semibold text-gray-700">
                                    <span style={{ fontFamily: 'system-ui' }}>₹</span>
                                    {(balance.locked / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Total</div>
                                <div className="text-xl font-semibold text-green-600">
                                    <span style={{ fontFamily: 'system-ui' }}>₹</span>
                                    {((balance.amount + balance.locked) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 px-4">
                <div className="md:order-2">
                    {/* Balance Card */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm">
                        <BalanceCard amount={balance.amount} locked={balance.locked} />
                    </div>
                    
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <OnRampTransactions transactions={transactions} />
                    </div>
                </div>
                
                <div className="md:order-1">
                    {/* Transfer Options */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <Card title="Transfer Options">
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-[#6a51a6] mb-3 mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <p className="text-center text-sm font-medium">Add Money</p>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-3 mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                        </svg>
                                    </div>
                                    <p className="text-center text-sm font-medium">Send Money</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    {/* Add Money Form */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <AddMoney />
                    </div>
                </div>
            </div>
        </div>
    )
}