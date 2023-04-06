import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { env } from "~/env.mjs";

export async function sendEmail(
  email: string,
  name: string,
  url: string,
  subject: string
) {
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "src/libs/email.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    name: name,
    url: url,
  };
  const htmlToSend = template(replacements);
  const transporter = nodemailer.createTransport({
    // host: env.EMAIL_HOST,
    // port: parseInt(env.EMAIL_PORT),
    service: "gmail",
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: '"noreply@drith.me" <noreply@drith.me>',
    to: email,
    subject: subject,
    html: htmlToSend,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
}
