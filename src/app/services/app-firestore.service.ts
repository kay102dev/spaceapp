import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {retry} from 'rxjs/operators';

@Injectable()
export class AppFirestoreService {
  public static readonly MAX_RETRIES = 3;

  constructor(protected httpClient: HttpClient) {
  }

  public get(endpoint: string) {
    const httpHeaders = new HttpHeaders({});
    return this.httpClient.get(endpoint, {headers: httpHeaders}).pipe(
      // TODO - Show the loader overlay when retrying...
      retry(AppFirestoreService.MAX_RETRIES)
    );
  }

  public getTrafficURL(): string {
    return 'qui';
  }

}
