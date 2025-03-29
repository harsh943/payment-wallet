"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnRampTx } from "../app/lib/actions/createOnRampTx";

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [amount,setAmount] = useState(0);
    const [provider,setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [error, setError] = useState("");
    
    const handleAddMoney = async () => {
        // Clear any previous errors
        setError("");
        
        // Validate that amount is greater than 0
        if (amount <= 0) {
            setError("Please enter an amount greater than zero");
            return;
        }
        
        // Proceed with transaction
        await createOnRampTx(amount, provider);
        window.location.href = redirectUrl || "";
    };
    
    return <Card title="Add Money">
    <div className="w-full">
        <TextInput label={"Amount"} placeholder={"Amount"} onChange={(value) => {
            setAmount(Number(value));
            // Clear error when user starts typing
            if (error) setError("");
        }} />
        
        {error && (
            <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
        
        <div className="py-4 text-left">
            Bank
        </div>
        <Select onSelect={(value) => {
            setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "")
            setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "")
        }} options={SUPPORTED_BANKS.map(x => ({
            key: x.name,
            value: x.name
        }))} />
        <div className="flex justify-center pt-4">
            <Button onClick={handleAddMoney}>
            Add Money
            </Button>
        </div>
    </div>
</Card>
}