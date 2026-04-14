import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

// 1. Order Confirmation Trigger
// Listens to new documents in 'orders' and creates an email in the 'mail' collection
export const sendOrderConfirmation = onDocumentCreated("orders/{orderId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.log("No data associated with the event");
        return;
    }

    const order = snapshot.data();
    
    // We only send if it's a new order with basic details
    if (!order.email || !order.name) {
        logger.log("Missing email or name, skipping");
        return;
    }

    // Prepare email HTML based on calculator mode. Note: order uses camelCase in the frontend but we map what we have.
    // BookingData structure: mode, name, email, phone, branch, baseAmount, quoteAmount, currencyCode
    const mode = order.mode === "BUY_FOREIGN" ? "Buy Currency" : "Sell Currency";
    
    // Ealing Exchange Branding
    const htmlBody = `
    <div style="font-family: inherit, Arial, sans-serif; max-w-lg mx-auto p-4 border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Ealing Exchange - Reservation Confirmed</h2>
        <p>Hi ${order.name},</p>
        <p>Thank you for submitting your currency reservation. Your collection details are below:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Service:</strong> ${mode}</p>
            <p><strong>Currency:</strong> ${order.currencyCode}</p>
            <p><strong>GBP Amount:</strong> £${order.baseAmount}</p>
            <p><strong>Foreign Amount:</strong> ${order.quoteAmount} ${order.currencyCode}</p>
            <p><strong>Collection Branch:</strong> ${order.branch}</p>
        </div>
        <p>Our team is currently preparing your order. Please visit the branch with your ID to complete the transaction.</p>
        <p>If you have any questions, call us at the branch.</p>
        <br/>
        <p>Best regards,<br/>The Ealing Exchange Team</p>
    </div>
    `;

    try {
        await db.collection("mail").add({
            to: [order.email],
            message: {
                subject: `Ealing Exchange - Reservation Confirmation (${order.currencyCode})`,
                html: htmlBody,
            }
        });
        logger.log(`Confirmation email sent to mail queue for order ${event.params.orderId}`);
    } catch (error) {
        logger.error("Error writing to mail queue:", error);
    }
});

// 2. Automated Rate Alerts Check (Runs Hourly)
export const checkRateAlerts = onSchedule("every 1 hours", async (event) => {
    logger.log("Running checkRateAlerts job...");
    
    try {
        // Fetch current active rates
        const ratesDoc = await db.collection("settings").doc("exchangeRates").get();
        if (!ratesDoc.exists) {
            logger.error("No exchange rate data found in settings/exchangeRates");
            return;
        }
        
        const rates = ratesDoc.data() as Record<string, { customerBuys: number; customerSells: number }>;
        
        // Fetch all active rate alerts
        const alertsSnapshot = await db.collection("rateAlerts").where("active", "!=", false).get();
        if (alertsSnapshot.empty) {
            logger.log("No active rate alerts found.");
            return;
        }

        let sentCount = 0;

        for (const doc of alertsSnapshot.docs) {
            const alert = doc.data(); // email, currencyCode, targetRate, mode
            const targetRate = parseFloat(alert.targetRate);
            if(isNaN(targetRate)) continue;

            const currentRateData = rates[alert.currencyCode];
            if (!currentRateData) continue;

            let conditionMet = false;
            let actualRate: number;

            // In BUY mode: user wants the rate to go UP (e.g. they get more Euros for 1 GBP)
            // So if current buy rate >= target rate, trigger alert!
            if (alert.mode === "BUY_FOREIGN") {
                actualRate = parseFloat(currentRateData.customerBuys.toString());
                if (actualRate >= targetRate) { conditionMet = true; }
            } 
            // In SELL mode: user gives foreign currency back for GBP. They want the rate to be LOW.
            else {
                actualRate = parseFloat(currentRateData.customerSells.toString());
                if (actualRate <= targetRate) { conditionMet = true; }
            }

            if (conditionMet) {
                // Send email
                const htmlBody = `
                <div style="font-family: inherit, Arial, sans-serif; max-w-lg mx-auto p-4 border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #1e3a8a;">Ealing Exchange - Rate Alert Reached!</h2>
                    <p>Hi there,</p>
                    <p>Good news! Your rate alert for <strong>${alert.currencyCode}</strong> has been reached.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p><strong>Your Target Rate:</strong> ${targetRate}</p>
                        <p><strong>Current Live Rate:</strong> <span style="font-weight: bold; font-size: 1.25em; color: #10b981;">${actualRate}</span></p>
                    </div>
                    <p>Log on to <a href="https://ealingexchange.co.uk" style="color: #3b82f6;">ealingexchange.co.uk</a> to lock in your rate now.</p>
                    <br/>
                    <p>Best regards,<br/>The Ealing Exchange Team</p>
                </div>
                `;

                await db.collection("mail").add({
                    to: [alert.email],
                    message: {
                        subject: `🟢 Rate Alert Met: ${alert.currencyCode} is now ${actualRate}!`,
                        html: htmlBody,
                    }
                });

                // Deactivate alert so it doesn't spam every hour
                await doc.ref.update({ active: false, triggeredAt: new Date() });
                sentCount++;
            }
        }
        
        logger.log(`Rate check complete. Triggered ${sentCount} alerts.`);

    } catch (error) {
        logger.error("Error running rate check:", error);
    }
});
