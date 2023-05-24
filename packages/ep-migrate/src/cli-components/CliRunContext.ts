
import {
  EpSdkApplication,
  EpSdkEvent,
} from "@solace-labs/ep-sdk";
import { 
  ApplicationDomain,
  ApplicationVersion,
  EventVersion,
  SchemaObject,
  SchemaVersion,
} from "@solace-labs/ep-openapi-node";
import { 
  EpV1Application,
  EpV1ApplicationDomain, 
  EpV1Event, 
  EpV1EventSchema,
  EpV1Tag
} from "../epV1";
import { ECliMigrateManagerRunState } from "./CliMigrateManager";

// }
export enum ECliRunContext_RunMode {
  // TEST_PASS_1 = "test_pass_1",
  // TEST_PASS_2 = "test_pass_2",
  RELEASE = "release"
}
export interface ICliRunContext {
  runId: string;
  runState: ECliMigrateManagerRunState;
  runMode: ECliRunContext_RunMode;
}
export interface ICliEnumsRunContext extends Partial<ICliRunContext> {
  epV2ApplicationDomainName: string;
}
export interface ICliEnumRunContext extends ICliEnumsRunContext {
  enumName: string;
}
export interface ICliApplicationDomainRunContext extends Partial<ICliRunContext> {
  epV1ApplicationDomainName: string;
}
export interface ICliSchemaRunContext extends Partial<ICliRunContext> {
  epV1: {
    applicationDomain: EpV1ApplicationDomain;
    epV1EventSchema: EpV1EventSchema;
    epV1Tags: Array<EpV1Tag>;
  },
  epV2: {
    applicationDomain: ApplicationDomain;
    schemaObject?: SchemaObject;
    schemaVersion?: SchemaVersion;
  }
}
export interface ICliEventRunContext extends Partial<ICliRunContext> {
  epV1: {
    applicationDomain: EpV1ApplicationDomain;
    epV1Event: EpV1Event;
  },
  epV2: {
    applicationDomain: ApplicationDomain;
    epSdkEvent?: EpSdkEvent;
    eventVersion?: EventVersion;
  }
}

export interface ICliApplicationRunContext extends Partial<ICliRunContext> {
  epV1: {
    applicationDomain: EpV1ApplicationDomain;
    epV1Application: EpV1Application;
  },
  epV2: {
    applicationDomain: ApplicationDomain;
    epSdkApplication?: EpSdkApplication;
    applicationVersion?: ApplicationVersion;
  }
}

export interface ICliApplicationDomainRunAbsentContext extends Partial<ICliRunContext> {
  epV2ApplicationDomainPrefix: string;
}


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
    // return this.runContextStack[this.runContextStack.length-1];
    return this.runContextStack.slice(-1)[0];
  };

}

export default new CliRunContext();