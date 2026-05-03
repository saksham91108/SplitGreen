import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import asyncio


def _send(to: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"]      = to
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.MAIL_FROM, to, msg.as_string())


async def send_otp_email(to: str, otp: str, name: str = "there"):
    subject = "Your SplitGreen verification code"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#346739">💚 SplitGreen</h2>
      <p>Hey {name}! Here's your verification code:</p>
      <div style="font-size:42px;font-weight:800;letter-spacing:12px;
                  color:#346739;text-align:center;padding:24px;
                  background:#f4faf0;border-radius:12px;margin:24px 0">
        {otp}
      </div>
      <p style="color:#666;font-size:13px">
        This code expires in 10 minutes. Don't share it with anyone.
      </p>
    </div>
    """
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send, to, subject, html)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        print(f"[DEV] OTP for {to} is: {otp}")
