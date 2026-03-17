import mongoose from 'mongoose';

const businessHourSchema = new mongoose.Schema(
  {
    day: { type: String, trim: true, required: true },
    hours: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, unique: true, default: 'main' },
    contactEmail: { type: String, trim: true, default: 'benjaespina98@gmail.com' },
    whatsappNumber: { type: String, trim: true, default: '5493534224607' },
    phoneNumberDisplay: { type: String, trim: true, default: '3534224607' },
    phoneNumberLink: { type: String, trim: true, default: 'tel:+543534224607' },
    businessHours: {
      type: [businessHourSchema],
      default: [
        { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
        { day: 'Sabados', hours: '9:00 - 13:00' },
        { day: 'Domingos', hours: 'Cerrado' },
      ],
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
