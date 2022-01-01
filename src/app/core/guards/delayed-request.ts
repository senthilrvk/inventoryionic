import { Observable, of, throwError } from "rxjs";
import { delay, mergeMap } from "rxjs/operators";
import { retryWhen } from "rxjs/operators";
const getErrorMessage = (maxRetry: number) =>
  `Tries to load Resource over XHR for ${maxRetry} times without success. Give Up.`;
const DEFAULT_MAX_RETRIES = 3;
export function delayedRetry(delayMs: number, maxRetry = DEFAULT_MAX_RETRIES) {
  let retries = maxRetry;
  return (src: Observable<any>) =>
    src.pipe(retryWhen((error: Observable<any>) => error.pipe(
      delay(delayMs),
      mergeMap(error => retries-- > 0 ? of(error) : throwError(getErrorMessage(maxRetry))
      ))
    )
    );
}
