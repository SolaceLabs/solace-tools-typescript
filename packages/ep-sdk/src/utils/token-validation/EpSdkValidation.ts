import {
  ApiError,
} from '@solace-labs/ep-openapi-node';
import { EpSdkUtils } from '../../utils';

/** @category Utils */
export class EpSdkValidationClass {

  protected createEntityName(): string {
    return EpSdkUtils.getUUID();
  }

}

