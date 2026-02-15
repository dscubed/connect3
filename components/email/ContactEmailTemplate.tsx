type EmailData = {
  name: string;
  email: string;
  description: string;
  screenshotUrl?: string;
  ticketId?: string;
};

export function EmailTemplate(data: EmailData): string {
  const { name, email, description, screenshotUrl, ticketId } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c2b7ff 0%, #f0e5ff 50%, #ffbfd4 100%); padding: 40px 30px; text-align: center;">
              <div style="display: flex;justify-content: center;align-items: center;gap: 16px;">
                <svg width="50" height="90" viewBox="0 0 238 215" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
                  <path d="M25.2718 65.9509C63.3677 -9.85306 158.116 -1.13393 182.657 1.98416C207.199 5.10266 243.352 19.6348 236.342 47.4372C231.134 68.0907 196.485 74.19 184.24 73.2506C207.254 81.4166 249.297 112.596 224.799 154.168C200.301 195.74 136.458 197.968 94.1436 183.863C51.829 169.758 -3.55247 123.306 25.2718 65.9509Z" fill="#DCD1FF"/>
                  <path d="M7.97887 88.8208C46.0747 13.0168 140.823 21.7359 165.364 24.854C189.906 27.9725 226.059 42.5046 219.049 70.3071C213.841 90.9606 179.192 97.0599 166.947 96.1205C189.961 104.286 232.004 135.466 207.506 177.038C183.008 218.61 119.165 220.837 76.8506 206.733C34.536 192.628 -20.8454 146.176 7.97887 88.8208Z" fill="#DCD1FF"/>
                  <path d="M70.0527 24.0164C84.8847 18.1468 100.225 15.8175 112.432 15.4315C117.952 15.2569 122.142 20.0308 121.794 25.5427L121.584 28.8824C121.236 34.3943 116.475 38.5634 110.96 38.8596C101.485 39.3686 89.7928 41.3122 78.6433 45.7245C63.2564 51.8137 49.9396 62.129 43.6742 78.9039C35.4253 100.99 39.7311 120.621 50.0317 136.406C60.5708 152.557 77.3135 164.445 92.8072 169.609C109.043 175.021 129.52 177.285 147.987 174.254C166.483 171.218 181.34 163.221 189.307 149.7C193.348 142.844 194.313 137.066 193.849 132.247C193.373 127.302 191.3 122.471 187.889 117.842C182.955 111.146 175.789 105.662 169.185 102C164.8 99.5694 162.013 94.6856 163.052 89.7812L164.218 84.2773C165.257 79.3728 169.803 75.88 174.75 75.0706C178.014 74.5369 181.715 73.6598 185.318 72.3343C193.576 69.2964 197.068 65.5543 197.785 62.712C198.558 59.6465 198.12 57.4242 197.093 55.4625C195.925 53.2342 193.652 50.7552 189.956 48.2871C185.001 44.9787 178.575 42.4154 172.138 40.7175C166.798 39.3088 162.897 34.351 163.593 28.8723L164.015 25.5529C164.711 20.0741 169.731 16.1576 175.111 17.4057C184.446 19.5712 194.557 23.2871 202.92 28.8709C208.699 32.7296 214.238 37.8792 217.774 44.6301C221.45 51.6478 222.607 59.756 220.422 68.4203C217.124 81.4996 206.069 88.9168 196.58 92.9731C200.244 96.2519 203.691 99.9314 206.683 103.992C211.985 111.186 216.118 119.941 217.087 130.01C218.069 140.205 215.716 150.87 209.421 161.553C196.716 183.112 174.302 193.593 151.768 197.292C129.206 200.995 104.894 198.247 85.4243 191.757C65.2127 185.02 44.0575 169.972 30.4798 149.165C16.6636 127.992 10.6338 100.642 21.8037 70.7356C31.0733 45.917 50.6426 31.6977 70.0527 24.0164Z" fill="#14103A"/>
                  <path d="M129.481 147.811C126.913 152.701 120.868 154.584 115.978 152.017L113.016 150.461C108.126 147.894 106.243 141.849 108.81 136.959L116.059 123.151C118.626 118.261 124.671 116.378 129.561 118.945L132.524 120.501C137.414 123.068 139.297 129.113 136.73 134.003L129.481 147.811Z" fill="#14103A"/>
                  <path d="M82.2793 123.129C79.7122 128.019 73.6672 129.902 68.7773 127.335L66.8451 126.32C61.9551 123.753 60.072 117.708 62.6392 112.818L69.0633 100.581C71.6305 95.6911 77.6757 93.8081 82.5657 96.3753L84.4979 97.3897C89.3878 99.9569 91.2708 106.002 88.7036 110.892L82.2793 123.129Z" fill="#14103A"/>
                </svg>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Support Request
                </h1>
              </div>
              ${ticketId ? `<p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Ticket ID: <strong>${ticketId}</strong></p>` : ''}
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <strong style="color: #1f2937; font-size: 14px;">From:</strong>
                          <span style="color: #4b5563; font-size: 14px; margin-left: 8px;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong style="color: #1f2937; font-size: 14px;">Email:</strong>
                          <a href="mailto:${email}" style="color: #3b82f6; font-size: 14px; margin-left: 8px; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Issue Description</h2>
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; white-space: pre-wrap; color: #374151; font-size: 14px; line-height: 1.6;">
${description}
              </div>
            </td>
          </tr>

          ${
            screenshotUrl
              ? `
          <!-- Screenshot -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Screenshot</h2>
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="${screenshotUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  📷 View Screenshot
                </a>
              </div>
              <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                <img src="${screenshotUrl}" alt="Screenshot" style="width: 100%; height: auto; display: block;" />
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
              <div style="margin-bottom: 16px; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 4px;">
                  ✓ Your support request has been received
                </p>
                <p style="margin: 0; color: #047857; font-size: 13px;">
                  A member of the Connect3 team will get back to you soon.
                </p>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.5;">
                This email was sent from the Connect3 contact form.<br>
                <strong>If you did not submit a support request, please ignore this email.</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
