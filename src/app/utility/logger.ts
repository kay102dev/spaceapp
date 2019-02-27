import { Level } from './logger-level';
export class Logger {
  public static log(level: Level, message: any, ...optionalParams: any[]): void {
      switch (level) {
        case Level.LOG:
          console.log(message, optionalParams);
          break;
        case Level.ERROR:
          console.error(message, optionalParams);
          break;
        case Level.WARN:
          console.warn(message, optionalParams);
          break;
        case Level.LOG_OBJECT:
          console.log(message, JSON.parse(JSON.stringify(optionalParams)));
          break;
        default:
          console.log(message, optionalParams);
      }

    }
}
