import { EmailService } from "@/lib/emailService";

const emailService = new EmailService();

async function sendTestEmail() {
  try {
    console.log(`Sending test email on ${process.env.NODE_ENV}`);
    console.log(`Using host: ${process.env.SMTP_HOST}`);

    await emailService.sendEmail(
      "odjonathankrause@gmail.com", // Recipient's email
      "Test Email from Spotify Liker", // Subject
      "This is a test email sent from the Spotify Liker app.", // Plain text body
      "<p>This is a <strong>test email</strong> sent from the Spotify Liker app.</p>", // HTML body
    );
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
}

sendTestEmail();
