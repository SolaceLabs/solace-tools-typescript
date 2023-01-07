import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
  TestUtils
} from '@internal/tools/src';
import { 
  TestLogger,
} from '../../lib';
import { 
  ApiError, 
  MessagingServicesService,
  MessagingServicesResponse,
  MessagingService,
  MessagingServiceResponse,
} from '@rjgu/ep-openapi-node';
import { 
  EpSdkError,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecName = "msgsvc-spec";
const TestSpecId: string = TestUtils.getUUID();

const MessagingServiceList: Array<MessagingService> = [];

const getProtocol = (authenticationDetails: any): string | undefined => {
    //  "authenticationDetails": {
    //           "protocol": "https",
    //           "properties": [
    //             {
    //               "name": "type",
    //               "value": "rest"
    //             }
    //           ]
    //         },
  // "authenticationDetails": {
  //   "protocol": "tcps",
  //   "properties": [
  //     {
  //       "name": "type",
  //       "value": "smf"
  //     }
  //   ]
  // },    
  if(!('protocol' in authenticationDetails)) return undefined;
  const protocol = authenticationDetails['protocol'].toUpperCase();
  const properties:Array<any> = authenticationDetails['properties'];
  if(properties === undefined || properties.length === 0) return protocol;
  const typeProperty = properties.find( (x) => {
    if('name' in x) return x.name === 'type';
  });
  if(typeProperty === undefined) return protocol;
  if(!('value' in typeProperty)) return protocol;
  return `${typeProperty.value.toUpperCase()}-${protocol}`;
}
const getProtocolVersion = (protocol: string): string => {
  switch(protocol) {
    case 'AMQP':
    case 'AMQPS':
      return '1.0.0';
    case 'MQTT':
    case 'MQTTS':
      return '3.1.1';
    case 'HTTP':
    case 'HTTPS':
      return '1.1';
    case 'JMS':
    case 'JMSS':
      return '1.1';
    default:
      return protocol;
  }
}

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get all messaging services`, async () => {
      try {
        // assumes no more than 100 defined
        const messagingServicesResponse: MessagingServicesResponse = await MessagingServicesService.getMessagingServices({
          pageSize: 100
        });
        if(messagingServicesResponse.data === undefined) throw new Error('messagingServicesResponse.data === undefined');
        MessagingServiceList.push(...messagingServicesResponse.data);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should patch all messaging services`, async () => {
      try {
        for(const messagingService of MessagingServiceList) {
          const errMsg = `messasgingService = \n${JSON.stringify(messagingService, null, 2)}`;
          if(messagingService.id === undefined) throw new Error(`messagingService.id === undefined, \n${errMsg}`);
          if(messagingService.messagingServiceConnections) {
            for(const messagingServiceConnection of messagingService.messagingServiceConnections) {
              if(messagingServiceConnection.messagingServiceAuthentications === undefined) throw new Error(`messagingServiceConnection.messagingServiceAuthentications === undefined, \n${errMsg}`);
              if(messagingServiceConnection.messagingServiceAuthentications.length !== 0) {
                if(messagingServiceConnection.messagingServiceAuthentications.length !== 1) throw new Error(`messagingServiceConnection.messagingServiceAuthentications.length !== 1, \n${errMsg}`);
                if(messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails === undefined) throw new Error(`messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails === undefined, \n${errMsg}`);
  
                const protocol: string | undefined = getProtocol(messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails);
                if(protocol !== undefined) {
                  messagingServiceConnection.protocol = protocol;
                  messagingServiceConnection.protocolVersion = getProtocolVersion(protocol);  
                }
              }
            }
          }
          const messagingServiceResponse: MessagingServiceResponse = await MessagingServicesService.updateMessagingService({
            id: messagingService.id,
            requestBody: {
              name: messagingService.name,
              messagingServiceConnections: messagingService.messagingServiceConnections
            }
          });
          // // DEBUG
          // expect(false, `messagingServiceResponse=\n${JSON.stringify(messagingServiceResponse, null, 2)}`).to.be.true;
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

