
export enum ECliChannelOperation {
  Publish = "publish",
  Subscribe = "subscribe"
}
export enum ECliRunContext_RunMode {
  TEST_PASS_1 = "test_pass_1",
  TEST_PASS_2 = "test_pass_2",
  RELEASE = "release"
}
export interface ICliRunContext {
  runId: string;
  runMode: ECliRunContext_RunMode;
}
export interface ICliSetupTestDomainsContext extends Partial<ICliRunContext> {
  runProcess: "setUpTestDomains"
}
export interface ICliSetupTestApiRunContext extends Partial<ICliRunContext> {
  apiTitle: string;
  fromApplicationDomainName: string;
  toApplicationDomainName: string;
  fromAssetsApplicationDomainName: string;
  toAssetsApplicationDomainName: string;
}
export interface ICliApiFileRunContext extends Partial<ICliRunContext> {
  apiFile: string;
}
export interface ICliApiRunContext extends Partial<ICliApiFileRunContext> {
  apiTitle: string;
  apiVersion: string;
  apiBrokerType: string;
  applicationDomainName: string;
  assetApplicationDomainName: string;
}
export interface ICliGenerateApiOutputRunContext extends Partial<ICliApiFileRunContext> {
  applicationDomainName: string | undefined;
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionId: string;
}
export interface ICliApiRunContext_Channel extends Partial<ICliApiRunContext> {
  channelTopic: string;
  epEventName: string;
}
export interface ICliApiRunContext_Channel_Parameter extends Partial<ICliApiRunContext_Channel> {
  parameter: string;
  parameterEnumList?: Array<string>;
}
export interface ICliApiRunContext_Channel_Operation extends Partial<ICliApiRunContext_Channel> {
  type: ECliChannelOperation;
}
export interface ICliApiRunContext_Channel_Operation_Message extends Partial<ICliApiRunContext_Channel_Operation> {
  messageName: string; 
}

// export interface ICliEpRunContext_EventApi extends Partial<ICliApiRunContext> {
//   epEventApiName: string;
// }
// export interface ICliEpRunContext_EventApiVersion extends Partial<ICliEpRunContext_EventApi> {
//   epLatestExistingEventApiVersion?: string;
//   epTargetEventApiVersion: string;
// }
// export interface ICliEpRunContext_Channel_Event extends Partial<ICliEpRunContext_EventApiVersion> {
//   epEventName: string;
// }
// export interface ICliEpRunContext_Application extends Partial<ICliApiRunContext> {
//   epApplicationName: string;
// }
// export interface ICliEpRunContext_ApplicationVersion extends Partial<ICliEpRunContext_Application> {
//   epLatestExistingApplicationVersion?: string;
//   epTargetApplicationVersion: string;
// }


const LogMe = false;

class CliRunContext {
  private runContextStack: Array<ICliRunContext> = []; 

  public set = (runContext: ICliRunContext) => {
    this.runContextStack = [runContext];
    if(LogMe) console.log(`${CliRunContext.name}.set(): ${JSON.stringify(this.runContextStack, null, 2)}`);
  }

  public unset = () => {
    this.runContextStack = [];
    if(LogMe) console.log(`${CliRunContext.name}.unset(): ${JSON.stringify(this.runContextStack, null, 2)}`);
  }

  public push = (runContext: Partial<ICliRunContext>) => {
    const rctxt: ICliRunContext = {
      ...this.get(),
      ...runContext
    };
    this.runContextStack.push(rctxt);
    if(LogMe) console.log(`${CliRunContext.name}.push(): ${JSON.stringify(this.runContextStack, null, 2)}`);
  }

  public pop = (): ICliRunContext | undefined => {
    const last =  this.runContextStack.pop();
    if(LogMe) console.log(`${CliRunContext.name}.pop(): ${JSON.stringify(this.runContextStack, null, 2)}`);
    return last;
  }
  // public updateContext = ({ runContext }:{
  //   runContext: Partial<ICliRunContext>;
  // }): ICliRunContext => {
  //   const newContext: ICliRunContext = {
  //     ...this.runContext,
  //     ...runContext
  //   };
  //   return this.setContext({ runContext: newContext });
  // }

  public get = (): ICliRunContext => {
    return this.runContextStack[this.runContextStack.length-1];
  };

}

export default new CliRunContext();