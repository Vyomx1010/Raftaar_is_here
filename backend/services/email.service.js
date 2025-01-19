import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // Configure your email service here
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: '"Raftaar" <noreply@raftaar.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Raftaar!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendRideReceipt = async (email, ride) => {
  try {
    await transporter.sendMail({
      from: '"Raftaar" <noreply@raftaar.com>',
      to: email,
      subject: 'Your Ride Receipt',
      html: `
        <h1>Ride Receipt</h1>
        <p>Thank you for riding with Raftaar!</p>
        <div>
          <p>Pickup: ${ride.pickup.address}</p>
          <p>Destination: ${ride.destination.address}</p>
          <p>Fare: $${ride.fare.toFixed(2)}</p>
          <p>Date: ${new Date(ride.createdAt).toLocaleString()}</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending ride receipt:', error);
    throw error;
  }
};