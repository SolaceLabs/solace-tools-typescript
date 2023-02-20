import { 
  CustomAttribute,
  EventApiProduct,
  EventApiProductResponse,
  EventApiProductsResponse,
  EventApiProductsService,
  Pagination, 
} from '@solace-labs/ep-openapi-node';
import { 
  EEpSdkLoggerCodes, 
  EpSdkApiContentError, 
  EpSdkLogger 
} from '../utils';
import { 
  EEpSdkCustomAttributeEntityTypes, 
  EpSdkBrokerTypes, 
  IEpSdkAttributesQuery, 
  TEpSdkCustomAttributeList 
} from '../types';
import { EpSdkServiceClass } from './EpSdkService';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';
import EpSdkCustomAttributeDefinitionsService from './EpSdkCustomAttributeDefinitionsService';
import EpSdkCustomAttributesQueryService from './EpSdkCustomAttributesQueryService';


/** @category Services */
export class EpSdkEventApiProductsServiceClass extends EpSdkServiceClass {

  private async updateEventApiProduct({ xContextId, update }:{
    xContextId?: string;
    update: EventApiProduct;
  }): Promise<EventApiProduct> {
    const funcName = 'updateEventApiProduct';
    const logName = `${EpSdkEventApiProductsServiceClass.name}.${funcName}()`;

    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });

    const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.updateEventApiProduct({
      xContextId,
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(eventApiProductResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProductResponse.data === undefined', {
      eventApiProductResponse: eventApiProductResponse
    });
    return eventApiProductResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the event api product.
   * Creates attribute definitions / adds entity type 'eventApiProduct' if it doesn't exist.
   */
  public async setCustomAttributes({ xContextId, eventApiProductId, epSdkCustomAttributeList}:{
    xContextId?: string;
    eventApiProductId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EventApiProduct> {
    const eventApiProduct: EventApiProduct = await this.getById({
      xContextId,
      eventApiProductId: eventApiProductId,
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      xContextId,
      existingCustomAttributes: eventApiProduct.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.EVENT_API_PRODUCT
    });
    return await this.updateEventApiProduct({
      xContextId,
      update: {
        ...eventApiProduct,
        customAttributes: customAttributes,  
      }
    });
  }

  /**
   * Unsets the custom attributes in the list on the event api product.
   * Leaves attibute definitions as-is.
   */
  public async unsetCustomAttributes({ xContextId, eventApiProductId, epSdkCustomAttributeList }:{
    xContextId?: string;
    eventApiProductId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EventApiProduct> {
    const eventApiProduct: EventApiProduct = await this.getById({
      xContextId,
      eventApiProductId: eventApiProductId,
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesExcluding({
      existingCustomAttributes: eventApiProduct.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
    });
    return await this.updateEventApiProduct({
      xContextId,
      update: {
        ...eventApiProduct,
        customAttributes: customAttributes,  
      }
    });
  }

  public async removeAssociatedEntityTypeFromCustomAttributeDefinitions({ xContextId, customAttributeNames }: {
    xContextId?: string;
    customAttributeNames: Array<string>;
  }): Promise<void> {
    for(const customAttributeName of customAttributeNames) {
      await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
        xContextId,
        attributeName: customAttributeName,
        associatedEntityType: EEpSdkCustomAttributeEntityTypes.EVENT_API_PRODUCT,
      });
    }
  }

  /**
   * Retrieves a list of all EventApiProducts without paging.
   * @param param0 
   */
  public listAll = async({ xContextId, applicationDomainIds, shared, brokerType, attributesQuery }:{
    xContextId?: string;
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
    attributesQuery?: IEpSdkAttributesQuery;
  }): Promise<EventApiProductsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkEventApiProductsServiceClass.name}.${funcName}()`;

    const eventApiProductList: Array<EventApiProduct> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.getEventApiProducts({
        xContextId,
        pageSize: 100,
        pageNumber: nextPage,
        // // sort=<field>:<asc|desc>
        applicationDomainIds: applicationDomainIds,
        shared: shared,
        brokerType: brokerType
      });
      if(eventApiProductsResponse.data === undefined || eventApiProductsResponse.data.length === 0) nextPage = undefined;
      else {
        if(attributesQuery) {
          for(const eventApiProduct of eventApiProductsResponse.data) {
            if(EpSdkCustomAttributesQueryService.resolve({
              customAttributes: eventApiProduct.customAttributes,
              attributesQuery: attributesQuery,
            })) eventApiProductList.push(eventApiProduct);  
          }
        } else eventApiProductList.push(...eventApiProductsResponse.data);  
        /* istanbul ignore next */
        if(eventApiProductsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductsResponse.meta === undefined', {
          eventApiProductsResponse: eventApiProductsResponse
        });
        /* istanbul ignore next */
        if(eventApiProductsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductsResponse.meta.pagination === undefined', {
          eventApiProductsResponse: eventApiProductsResponse
        });
        const pagination: Pagination = eventApiProductsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const eventApiProductsResponse: EventApiProductsResponse = {
      data: eventApiProductList,
      meta: {
        pagination: {
          count: eventApiProductList.length,
        }
      }
    };
    return  eventApiProductsResponse;
  }

  public getById = async({ xContextId, eventApiProductId }:{
    xContextId?: string;
    eventApiProductId: string;
  }): Promise<EventApiProduct> => {
    const funcName = 'getById';
    const logName = `${EpSdkEventApiProductsServiceClass.name}.${funcName}()`;

    const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.getEventApiProduct({
      xContextId,
      id: eventApiProductId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApiProductResponse: eventApiProductResponse
    }}));

    if(eventApiProductResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventApiProductResponse.data === undefined", {
        eventApiProductId: eventApiProductId
      });
    }
    return eventApiProductResponse.data;
  }

}

/** @category Services */
export default new EpSdkEventApiProductsServiceClass();
