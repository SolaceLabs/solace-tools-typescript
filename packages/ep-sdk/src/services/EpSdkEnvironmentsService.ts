import {
  Environment,
  EnvironmentResponse,
  EnvironmentsResponse,
  EnvironmentsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import {
  EpSdkApiContentError,
} from '../utils';
import { 
  EpApiMaxPageSize 
} from '../constants';
import { EpSdkServiceClass } from './EpSdkService';


/** @category Services */
export class EpSdkEnvironmentsServiceClass extends EpSdkServiceClass {

  public listAll = async({ pageSize = EpApiMaxPageSize }:{
    pageSize?: number; /** for testing */
  }): Promise<EnvironmentsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkEnvironmentsServiceClass.name}.${funcName}()`;

    const environmentList: Array<Environment> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const environmentsResponse: EnvironmentsResponse = await EnvironmentsService.getEnvironments({
        pageSize: pageSize,
        pageNumber: nextPage,
      });
      if(environmentsResponse.data === undefined || environmentsResponse.data.length === 0) nextPage = undefined;
      else {
        environmentList.push(...environmentsResponse.data);
        /* istanbul ignore next */
        if(environmentsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'environmentsResponse.meta === undefined', {
          environmentsResponse: environmentsResponse
        });
        /* istanbul ignore next */
        if(environmentsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'environmentsResponse.meta.pagination === undefined', {
          environmentsResponse: environmentsResponse
        });
        const pagination: Pagination = environmentsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const environmentsResponse: EnvironmentsResponse = {
      data: environmentList,
      meta: {
        pagination: {
          count: environmentList.length,
        }
      }
    };
    return environmentsResponse;
  }

  /**
   * @param object 
   * @returns Environment
   * @throws {@link EpSdkApiContentError} - if api response data is undefined
   */
  public getById = async ({ environmentId }: {
    environmentId: string;
  }): Promise<Environment> => {
    const funcName = 'getById';
    const logName = `${EpSdkEnvironmentsServiceClass.name}.${funcName}()`;

    const environmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({ id: environmentId });
    /* istanbul ignore next */
    if (environmentResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "environmentResponse.data === undefined", {
      environmentId: environmentId
    });
    const environment: Environment = environmentResponse.data;
    return environment;
  }

}
/** @category Services */
export default new EpSdkEnvironmentsServiceClass();

