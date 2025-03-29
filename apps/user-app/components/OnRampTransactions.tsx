import { Card } from "@repo/ui/card"
import { format } from "date-fns";

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        status: string,
        provider: string
    }[]
}) => {
    const formatAmount = (value: number) => {
        return (
            <>
                <span style={{ fontFamily: 'system-ui' }}>₹</span>
                {(value / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </>
        );
    };

    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center py-8 text-gray-500">
                No recent transactions
            </div>
        </Card>
    }

    return <Card title="Recent Transactions">
        <div className="divide-y">
            {transactions.map((t, index) => (
                <div key={index} className="flex justify-between p-4">
                    <div>
                        <div className="text-sm font-medium text-gray-700">
                            Added Money
                        </div>
                        <div className="text-xs text-gray-500">
                            {format(new Date(t.time), 'MMM d, yyyy')}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="text-green-600 font-medium">
                            + {formatAmount(t.amount)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
}