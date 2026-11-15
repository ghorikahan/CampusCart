import { User } from "@/models/User";
import { connectDB } from "@/lib/db";
import type { NotificationType } from "@/models/Notification";

interface SendNotificationEmailParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

/**
 * Sends an email notification when enabled via environment variables.
 * Designed to be non-blocking (fails gracefully without breaking core workflows).
 */
export async function sendNotificationEmail({
  userId,
  type,
  title,
  body,
  link,
}: SendNotificationEmailParams): Promise<void> {
  // Feature flag check
  const isEmailEnabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === "true";
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!isEmailEnabled) {
    return;
  }

  // Only send emails for enquiry responses or important alerts
  if (!["ENQUIRY_ACCEPTED", "ENQUIRY_REJECTED", "ENQUIRY_RECEIVED"].includes(type)) {
    return;
  }

  try {
    await connectDB();
    const recipient = await User.findById(userId).select("email name").lean();
    if (!recipient?.email) {
      return;
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const actionUrl = link ? (link.startsWith("http") ? link : `${appUrl}${link}`) : appUrl;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { background: #4f46e5; padding: 24px 32px; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
            .content { padding: 32px; }
            .title { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; }
            .body { font-size: 15px; color: #475569; margin: 16px 0 24px; }
            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; }
            .footer { padding: 20px 32px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CampusCart</h1>
            </div>
            <div class="content">
              <h2 class="title">${title}</h2>
              <p class="body">${body}</p>
              ${
                link
                  ? `<p><a href="${actionUrl}" class="btn">View on CampusCart</a></p>`
                  : ""
              }
            </div>
            <div class="footer">
              <p>You received this email because you have notifications enabled on CampusCart.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (resendApiKey) {
      // Send through Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "CampusCart <notifications@campuscart.app>",
          to: recipient.email,
          subject: `CampusCart: ${title}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[Email Notification] Resend API error:", errorText);
      }
    } else {
      // Dev/Fallback mock logger
      console.log(`[Email Notification Mock] To: ${recipient.email} | Subject: ${title}`);
    }
  } catch (err) {
    console.warn("[Email Notification] Failed to send email:", err);
  }
}

