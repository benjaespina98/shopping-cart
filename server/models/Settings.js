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
    theme: { type: String, enum: ['default', 'elegante', 'moderno'], default: 'default' },
    contactEmail: { type: String, trim: true, default: 'piscinas@playaysol.com.ar' },
    whatsappNumber: { type: String, trim: true, default: '5493534224605' },
    phoneNumberDisplay: { type: String, trim: true, default: '3534224605' },
    phoneNumberLink: { type: String, trim: true, default: 'tel:+543534224605' },
    secondaryContactLabel: { type: String, trim: true, default: 'Ventas y presupuestos' },
    secondaryContactWhatsapp: { type: String, trim: true, default: '5493535668994' },
    contactPhotoUrl: { type: String, default: '' },
    contactPhotoPublicId: { type: String, default: '' },
    aboutPhotoUrl: { type: String, default: '' },
    aboutPhotoPublicId: { type: String, default: '' },
    businessHours: {
      type: [businessHourSchema],
      default: [
        { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
        { day: 'Sábados', hours: '9:00 - 13:00' },
        { day: 'Domingos', hours: 'Cerrado' },
      ],
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
