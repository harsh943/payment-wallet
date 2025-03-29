import { Card } from "@repo/ui/card";

export const BalanceCard = ({amount, locked}: {
    amount: number;
    locked: number;
}) => {
    const formatAmount = (value: number) => {
        return (
            <>
                <span style={{ fontFamily: 'system-ui' }}>₹</span>
                {(value / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </>
        );
    };

    return <Card title="Balance Summary">
        <div className="flex justify-between border-b border-slate-300 pb-2 p-4">
            <div className="text-gray-600">
                Available Balance
            </div>
            <div className="font-semibold text-[#6a51a6]">
                {formatAmount(amount)}
            </div>
        </div>
        <div className="flex justify-between border-b border-slate-300 py-2 px-4">
            <div className="text-gray-600">
                Locked Balance
            </div>
            <div className="font-semibold text-gray-700">
                {formatAmount(locked)}
            </div>
        </div>
        <div className="flex justify-between py-2 px-4">
            <div className="text-gray-600">
                Total Balance
            </div>
            <div className="font-semibold text-green-600">
                {formatAmount(amount + locked)}
            </div>
        </div>
    </Card>
}