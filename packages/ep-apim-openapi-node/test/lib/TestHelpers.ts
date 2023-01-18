import { 
  EventApiProduct, 
  EventApiProductsResponse, 
  EventApiProductsService,
  EventApiProductState,
} from '../../generated-src';

export class TestHelpers {

  public static getEventApiProductStateValueList = (): Array<string> => {
    return Object.values(EventApiProductState);
  }
  
  public static getAllEventApiProducts = async(): Promise<Array<EventApiProduct>> => {
    const eventApiProductList: Array<EventApiProduct> = [];
    let nextPage: number | null = 1;
    while(nextPage !== null) {
      const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.listEventApiProducts({
        pageSize: 100,
        pageNumber: nextPage,
      });
      const meta = eventApiProductsResponse.meta;
      nextPage = meta.pagination.nextPage > 0 ? meta.pagination.nextPage : null;
      eventApiProductList.push(...eventApiProductsResponse.data);
    }
    return eventApiProductList;
  }

}