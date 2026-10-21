import bookingsSeed from '../data/bookings.json';
import { Booking } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const BOOKINGS_KEY = 'bookings';

class BookingService {
  public getAllBookings(): Booking[] {
    return getInitialData<Booking[]>(BOOKINGS_KEY, bookingsSeed as Booking[]);
  }

  public getBookingsByFarmerId(farmerId: string): Booking[] {
    return this.getAllBookings().filter(b => b.farmerId === farmerId);
  }

  public getBookingsByCentreId(centreId: string): Booking[] {
    return this.getAllBookings().filter(b => b.centreId === centreId);
  }

  public createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
    const list = this.getAllBookings();
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now().toString().slice(-4)}`,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    };
    list.unshift(newBooking);
    saveStorageData(BOOKINGS_KEY, list);
    return newBooking;
  }

  public updateBookingStatus(
    bookingId: string,
    status: 'pending_approval' | 'confirmed' | 'rejected' | 'cancelled' | 'completed',
    statusReason?: string
  ): boolean {
    const list = this.getAllBookings();
    const idx = list.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;

    list[idx].status = status;
    if (statusReason) {
      list[idx].statusReason = statusReason;
    }
    saveStorageData(BOOKINGS_KEY, list);
    return true;
  }
}

export const bookingService = new BookingService();
