"use client";

import { Card } from "@repo/ui/card";
import { format } from "date-fns";
import { useState, useMemo } from "react";

// Define transaction types
type P2PTransfer = {
  id: number;
  amount: number;
  timestamp: string | Date;
  fromUserId: number;
  toUserId: number;
  fromUser: {
    id: number;
    name: string | null;
    number: string;
  };
  toUser: {
    id: number;
    name: string | null;
    number: string;
  };
};

type OnRampTransaction = {
  id: number;
  amount: number;
  startTime: string | Date;
  status: string;
  provider: string;
  userId: number;
};

type TransactionListProps = {
  p2pTransfers: P2PTransfer[];
  onRampTransactions: OnRampTransaction[];
  userId: number;
};

export const TransactionList = ({
  p2pTransfers,
  onRampTransactions,
  userId,
}: TransactionListProps) => {
  // State for filters
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Format amount with Rupee symbol
  const formatAmount = (amount: number) => {
    return (
      <>
        <span style={{ fontFamily: "system-ui" }}>₹</span>
        {(amount / 100).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </>
    );
  };

  // Combine and filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    // Combine all transactions with their type
    const allTransactions = [
      ...p2pTransfers.map((t) => ({
        type: "p2p",
        date: new Date(t.timestamp),
        data: t,
        isSender: t.fromUserId === userId,
      })),
      ...onRampTransactions.map((t) => ({
        type: "onramp",
        date: new Date(t.startTime),
        data: t,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply type filter
    let filtered = allTransactions;
if (filterType === "sent") {
  filtered = allTransactions.filter(
    (t) => t.type === "p2p" && 'isSender' in t && t.isSender === true
  );
} else if (filterType === "received") {
  filtered = allTransactions.filter(
    (t) => t.type === "p2p" && 'isSender' in t && t.isSender === false
  );
} else if (filterType === "added") {
  filtered = allTransactions.filter((t) => t.type === "onramp");
}

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        if (t.type === "p2p") {
          const p2pData = t.data as P2PTransfer;
          return (
            (p2pData.fromUser.name?.toLowerCase().includes(query) || false) ||
            p2pData.fromUser.number.toLowerCase().includes(query) ||
            (p2pData.toUser.name?.toLowerCase().includes(query) || false) ||
            p2pData.toUser.number.toLowerCase().includes(query)
          );
        } else if (t.type === "onramp") {
          const onrampData = t.data as OnRampTransaction;
          return onrampData.provider.toLowerCase().includes(query);
        }
        return false;
      });
    }

    return filtered;
  }, [p2pTransfers, onRampTransactions, filterType, searchQuery, userId]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full md:w-auto px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="sent">Money Sent</option>
            <option value="received">Money Received</option>
            <option value="added">Money Added</option>
          </select>
        </div>
      </div>

      <Card title="Transaction History">
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try changing your search criteria"
                  : "Start sending or receiving money to see your transactions here"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTransactions.map((transaction) => {
                if (transaction.type === "p2p") {
                  const t = transaction.data as P2PTransfer;
                  const isSender = t.fromUserId === userId;
                  return (
                    <div
                      key={`p2p-${t.id}`}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center justify-center h-10 w-10 rounded-full ${
                            isSender
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isSender ? "↗" : "↙"}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {isSender
                              ? `Sent to ${t.toUser.name || t.toUser.number}`
                              : `Received from ${
                                  t.fromUser.name || t.fromUser.number
                                }`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(t.timestamp), "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${
                          isSender ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isSender ? "- " : "+ "}
                        {formatAmount(t.amount)}
                      </div>
                    </div>
                  );
                } else {
                  const t = transaction.data as OnRampTransaction;
                  return (
                    <div
                      key={`onramp-${t.id}`}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                          ↓
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Added Money via {t.provider}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(t.startTime),
                              "MMM d, yyyy • h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            t.status === "Success"
                              ? "bg-green-100 text-green-700"
                              : t.status === "Failure"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {t.status}
                        </span>
                        <div className="font-medium text-blue-600">
                          + {formatAmount(t.amount)}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};