/* eslint-disable @typescript-eslint/require-await */

import nodemailer from 'nodemailer';

export const SendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER as string,
      pass: process.env.PASS as string,
    },
    tls: {
      rejectUnauthorized: false,
    },
    service: 'gmail',
  });
  const main = async () => {
    const info = await transporter.sendMail({
      from: `Trips App<${process.env.USER}>`,
      to,
      subject,
      html,
    });
    console.log(info);
  };
  main().catch((err) => {
    console.log('Sending Email Error => ', err);
  });
};
