export class Utils {
  static normalizeDate(date: string | Date) {
    if (date)
      return new Date(date).toISOString().slice(0, 10);
    return null;
  }
}
