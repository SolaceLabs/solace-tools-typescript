import {
  ApiError,
} from '@solace-labs/ep-openapi-node';
import { EpSdkUtils } from '../../utils';

/** @category Utils */
export class EpSdkValidationClass {

  protected createEntityName(): string {
    return EpSdkUtils.getUUID();
  }

  protected isAuthorizationError(error: any): boolean {
    if(error instanceof ApiError) {
      const apiError: ApiError = error;
      return apiError.status === 401 || apiError.status === 403;
    } else return false;
  }

}

