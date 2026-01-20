import type { AppData, ChatMessage } from '../types';
import { IS_MOCK_MODE } from './exchangeService';

// --- Local Mock Sales Agent Logic ---
const mockSalesAgent = async (message: string, _history: ChatMessage[], appData: AppData | null): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMsg = message.toLowerCase();

    // 1. Identify intent
    const isSell = lowerMsg.includes('sell') || lowerMsg.includes('change back') || lowerMsg.includes('have');

    // 2. Identify Currency
    const currencies = appData?.currencies || [];
    const foundCurrency = currencies.find(c =>
        lowerMsg.includes(c.code.toLowerCase()) ||
        lowerMsg.includes(c.name.toLowerCase()) ||
        (c.code === 'USD' && lowerMsg.includes('dollar')) ||
        (c.code === 'EUR' && lowerMsg.includes('euro')) ||
        (c.code === 'JPY' && lowerMsg.includes('yen'))
    );

    // 3. Identify Amount
    const amountMatch = lowerMsg.match(/[\d,]+(\.\d{1,2})?/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : null;

    // Logic Tree

    // Scenario A: Greeting / General
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
        return "Hello! I'm here to get you the best deal on your travel money. Are you looking to buy or sell currency today?";
    }

    // Scenario B: Asking about rates generally
    if (lowerMsg.includes('rate') && !foundCurrency) {
        return "I can certainly help with rates. Which currency are you interested in? We have excellent rates for USD, EUR, and many more.";
    }

    // Scenario C: Specific Currency + Amount -> CLOSE THE SALE
    if (foundCurrency && amount) {
        const rateObj = appData?.rates[foundCurrency.code];
        if (rateObj) {
            const rate = isSell ? rateObj.customerSells : rateObj.customerBuys;
            const total = isSell ? (amount / rate) : (amount * rate);
            const totalFormatted = total.toFixed(2);
            const targetCurrency = isSell ? 'GBP' : foundCurrency.code;

            return `Excellent choice. At our extensive online rate of ${rate}, ${amount} ${isSell ? foundCurrency.code : 'GBP'} will get you ${totalFormatted} ${targetCurrency}. \n\nI can lock this rate in for you right now (0% Commission). Please fill out the form I've prepared for you below to secure this deal immediately.`;
        }
    }

    // Scenario D: Specific Currency only
    if (foundCurrency) {
        const rateObj = appData?.rates[foundCurrency.code];
        if (rateObj) {
            const rate = isSell ? rateObj.customerSells : rateObj.customerBuys;
            return `Our current online rate for ${foundCurrency.name} (${foundCurrency.code}) is ${rate}. \n\nHow much are you looking to ${isSell ? 'sell' : 'exchange'}? Let me know and I'll secure the stock for you.`;
        }
    }

    // Scenario E: "Yes" or confirmation
    if (lowerMsg.includes('yes') || lowerMsg.includes('sure') || lowerMsg.includes('ok')) {
        return "Perfect. To proceed, please fill out the form I've prepared for you below so our team can prepare your cash for collection.";
    }

    // Default Sales Push
    return "I understand. To ensure you don't miss out on today's rates, I recommend reserving now. It's fee-free and you pay on collection. Would you like to see a quote for a specific currency?";
};


const getChatbotResponse = async (message: string, history: ChatMessage[], appData: AppData | null): Promise<any> => {

    if (IS_MOCK_MODE) {
        const textResponse = await mockSalesAgent(message, history, appData);
        return { text: textResponse };
    }

    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx5z6gzClNvl6TqQVPs8G78s0GG0_4NCKSLAeT39wX944KAKKWNtbgvExigpB7OgvrOdA/exec';

    const recentHistory = history.slice(-4).map(m => ({ role: m.role, text: m.text }));

    const payload = {
        action: 'getChatbotResponse',
        data: {
            message,
            history: recentHistory,
            appData
        }
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            cache: 'no-cache',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fetch failed with status:", response.status, "Response:", errorText);
            throw new Error(`Request to backend failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result;

    } catch (error) {
        console.error(`Error during action "getChatbotResponse":`, error);
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error(`Network Error: Could not connect to the backend. Please check the backend URL.`);
            }
            throw new Error(`A problem occurred with action "getChatbotResponse". ${error.message}`);
        }
        throw new Error(`An unknown error occurred during action "getChatbotResponse".`);
    }
};


export const sendMessage = async (message: string, history: ChatMessage[], appData: AppData | null): Promise<string> => {
    try {
        const response = await getChatbotResponse(message, history, appData);
        if (response && typeof response.text === 'string') {
            return response.text;
        } else {
            throw new Error("Invalid response format from backend.");
        }
    } catch (error) {
        console.error("Error fetching chatbot response from backend:", error);
        // Fallback for demo if network fails even if not in mock mode explicitly, or if error occurs
        if (IS_MOCK_MODE) {
            return "I'm having trouble connecting right now, but you can still reserve your currency using the calculator above!";
        }
        throw error;
    }
};
