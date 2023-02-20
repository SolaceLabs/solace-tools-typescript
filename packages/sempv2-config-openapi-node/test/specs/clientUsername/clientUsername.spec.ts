import 'mocha';
import { expect } from 'chai';
import path from 'path';
import {
  TestContext,
} from '@internal/tools/src';
import { 
  TestLogger,
  TestConfig,
} from '../../lib';
import {
  ApiError,
  ClientUsernameService,
  MsgVpnClientUsername,
  MsgVpnClientUsernameResponse,
} from '../../../generated-src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const ClientUsername = "test-clientusername";

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      // delete client username
      try {
        await ClientUsernameService.deleteMsgVpnClientUsername({
          xContextId: 'xContextId',
          msgVpnName: TestConfig.getConfig().msgVpnName,
          clientUsername: ClientUsername,
        });
      } catch(e) {
        // ignore
      }
    });

    it(`${scriptName}: should create client username`, async () => {
      try {
        const msgVpnClientUsername: MsgVpnClientUsername = {
          clientUsername: ClientUsername,
          // password: 'foo'
        };
        const msgVpnClientUsernameResponse: MsgVpnClientUsernameResponse = await ClientUsernameService.createMsgVpnClientUsername({
          xContextId: 'xContextId',
          msgVpnName: TestConfig.getConfig().msgVpnName,
          body: msgVpnClientUsername,
        });
        expect(msgVpnClientUsernameResponse.data, TestLogger.createApiTestFailMessage('failed')).to.not.be.undefined;
        expect(msgVpnClientUsernameResponse.data.clientUsername, TestLogger.createApiTestFailMessage('failed')).to.equal(ClientUsername);
        // // DEBUG:
        // expect(false, TestLogger.createLogMessage('msgVpnClientUsernameResponse', msgVpnClientUsernameResponse)).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMessage(e.message)).to.be.true;
        expect(false, TestLogger.createApiTestFailMessage('failed', e)).to.be.true;
      }
    });

});
