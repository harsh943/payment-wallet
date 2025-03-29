"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2ptransfer";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const formatAmount = (value: number) => {
        return value.toLocaleString('en-IN', { 
            style: 'currency', 
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleTransfer = async () => {
        if (!number) {
            setError("Please enter a valid phone number");
            return;
        }
        
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        
        setError("");
        setIsLoading(true);
        
        try {
            await p2pTransfer(number, amountNum);
            setSuccess(`Successfully transferred ${formatAmount(amountNum)} to ${number}`);
            setNumber("");
            setAmount("");
        } catch (err: any) {
            setError(err.message || "Transfer failed. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return <div className="min-h-[80vh] py-8">
        <div className="max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-[#6a51a6] mb-6">Send Money</h1>
            
            <Card title="P2P Transfer">
                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            {success}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <TextInput 
                            placeholder="Enter phone number" 
                            label="Recipient's Phone Number" 
                            value={number}
                            onChange={(value) => {
                                setNumber(value);
                                setError("");
                                setSuccess("");
                            }} 
                        />
                    </div>
                    
                    <div className="mb-6">
                        <TextInput 
                            placeholder="Enter amount in rupees" 
                            label="Amount" 
                            value={amount}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(value) => {
                                setAmount(value);
                                setError("");
                                setSuccess("");
                            }} 
                        />
                        <div className="mt-1 text-xs text-gray-500">
                            Enter amount in rupees (e.g., 100.00)
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <Button 
                            onClick={handleTransfer}
                            disabled={isLoading || !number || !amount}
                            className="w-full py-2 bg-[#6a51a6] hover:bg-[#5a4590] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Processing..." : "Send Money"}
                        </Button>
                    </div>
                </div>
            </Card>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Quick Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Make sure you've entered the correct phone number</li>
                    <li>• Double-check the amount before sending</li>
                    <li>• Amount should be entered in rupees (₹)</li>
                    <li>• Transfers are instant and cannot be reversed</li>
                </ul>
            </div>
        </div>
    </div>
}