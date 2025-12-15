const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class CalendarService {
  constructor() {
    this.calendar = null;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Check if service account key file exists
      const keyPath = path.join(__dirname, '../config/google-service-account.json');
      
      if (!fs.existsSync(keyPath)) {
        console.warn('Google Calendar: Service account key not found. Calendar integration disabled.');
        return false;
      }

      if (!this.calendarId) {
        console.warn('Google Calendar: GOOGLE_CALENDAR_ID not set. Calendar integration disabled.');
        return false;
      }

      // Load service account credentials
      const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.initialized = true;
      console.log('Google Calendar integration initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error.message);
      return false;
    }
  }

  async createRentalEvent(rental, camera, customer) {
    if (!this.initialized) {
      console.log('Google Calendar not initialized, skipping event creation');
      return null;
    }

    try {
      const { start_date, end_date, start_time, end_time } = rental;
      
      // Build event title
      const title = `📷 ${camera.name} - ${customer.name}`;
      
      // Build description
      const description = [
        `Khách hàng: ${customer.name}`,
        customer.phone ? `Điện thoại: ${customer.phone}` : '',
        `Camera: ${camera.brand} ${camera.model}`,
        rental.total_amount ? `Tổng tiền: ${Number(rental.total_amount).toLocaleString('vi-VN')} ₫` : '',
        rental.deposit ? `Đặt cọc: ${Number(rental.deposit).toLocaleString('vi-VN')} ₫` : '',
        rental.notes ? `\nGhi chú: ${rental.notes}` : ''
      ].filter(Boolean).join('\n');

      // Build event time
      let eventStart, eventEnd;
      
      if (start_time && end_time) {
        eventStart = {
          dateTime: `${start_date}T${start_time}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
        eventEnd = {
          dateTime: `${end_date}T${end_time}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
      } else {
        eventStart = {
          date: start_date,
        };
        // For all-day events, end date should be the day after
        const endDateObj = new Date(end_date);
        endDateObj.setDate(endDateObj.getDate() + 1);
        eventEnd = {
          date: endDateObj.toISOString().split('T')[0],
        };
      }

      const event = {
        summary: title,
        description: description,
        start: eventStart,
        end: eventEnd,
        colorId: '9', // Blue color for rentals
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event,
      });

      console.log('Calendar event created:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Failed to create calendar event:', error.message);
      return null;
    }
  }

  async updateRentalEvent(eventId, rental, camera, customer) {
    if (!this.initialized || !eventId) {
      return null;
    }

    try {
      const { start_date, end_date, start_time, end_time } = rental;
      
      const title = `📷 ${camera.name} - ${customer.name}`;
      
      const description = [
        `Khách hàng: ${customer.name}`,
        customer.phone ? `Điện thoại: ${customer.phone}` : '',
        `Camera: ${camera.brand} ${camera.model}`,
        rental.total_amount ? `Tổng tiền: ${Number(rental.total_amount).toLocaleString('vi-VN')} ₫` : '',
        rental.deposit ? `Đặt cọc: ${Number(rental.deposit).toLocaleString('vi-VN')} ₫` : '',
        rental.notes ? `\nGhi chú: ${rental.notes}` : ''
      ].filter(Boolean).join('\n');

      let eventStart, eventEnd;
      
      if (start_time && end_time) {
        eventStart = {
          dateTime: `${start_date}T${start_time}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
        eventEnd = {
          dateTime: `${end_date}T${end_time}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
      } else {
        eventStart = { date: start_date };
        const endDateObj = new Date(end_date);
        endDateObj.setDate(endDateObj.getDate() + 1);
        eventEnd = { date: endDateObj.toISOString().split('T')[0] };
      }

      const event = {
        summary: title,
        description: description,
        start: eventStart,
        end: eventEnd,
        colorId: '9',
      };

      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: eventId,
        resource: event,
      });

      console.log('Calendar event updated:', eventId);
      return response.data.id;
    } catch (error) {
      console.error('Failed to update calendar event:', error.message);
      return null;
    }
  }

  async deleteRentalEvent(eventId) {
    if (!this.initialized || !eventId) {
      return false;
    }

    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      });

      console.log('Calendar event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const calendarService = new CalendarService();
module.exports = calendarService;
