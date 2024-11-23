import { AppDataSource } from "../data-source";
import { Memory } from "../models/memory";
import nodemailer from "nodemailer";

// SMTP konfiguráció
const transporter = nodemailer.createTransport({
  host: "85.255.6.234", // A VPS IP-címe
  port: 587, // STARTTLS port
  secure: false, // STARTTLS használata
  auth: {
    user: "info@emlekidogep.hu", // Létrehozott email-fiók
    pass: "Admin0214112358!", // Az emailhez tartozó jelszó
  },
});

// Emlékeztetők ellenőrzése
export async function checkReminders() {
  const memoryRepository = AppDataSource.getRepository(Memory);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Csak a mai napot ellenőrizzük

    const reminders = await memoryRepository.find({
      where: {
        reminderDate: today,
      },
      relations: ["user"],
    });

    for (const reminder of reminders) {
      if (reminder.user && reminder.user.email) {
        await sendReminderEmail(
          reminder.user.email,
          reminder.title,
          reminder.description
        );
      }
    }
  } catch (error) {
    console.error("Hiba az emlékeztetők ellenőrzése során:", error);
  }
}

// Email küldése
async function sendReminderEmail(
  to: string,
  title: string,
  description: string
) {
  const mailOptions = {
    from: "your-email@example.com",
    to,
    subject: `Emlékeztető: ${title}`,
    text: `Ne feledd! ${description}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Emlékeztető email elküldve: ${to}`);
  } catch (error) {
    console.error("Hiba történt az email küldése során:", error);
  }
}
