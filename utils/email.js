const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ');
    this.url = url;
    this.from = `mohamed rashad <${process.env.ADMIN_EMAIL}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });
  }

  async send(tempelate, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/${tempelate}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this.newTransport().sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to natour Family');
  }

  async restPassword() {
    await this.send('passwordReset', 'Reset your password');
  }
};
