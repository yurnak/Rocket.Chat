import { expect } from 'chai';
import { describe, it } from 'mocha';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const hasAllPermissionAsyncMock = sinon.stub();
const serverFetchMock = sinon.stub();

const { getServerInfo } = proxyquire.noCallThru().load('../../../../../../app/api/server/lib/getServerInfo', {
	'../../../utils/rocketchat.info': {
		Info: {
			version: '3.0.1',
		},
	},
	'../../../authorization/server/functions/hasPermission': {
		hasPermissionAsync: hasAllPermissionAsyncMock,
	},
	'../../../cloud/server': {
		getWorkspaceAccessToken: async () => 'token',
	},
	'@rocket.chat/server-fetch': {
		serverFetch: serverFetchMock,
	},
});

describe('#getServerInfo()', () => {
	beforeEach(() => {
		hasAllPermissionAsyncMock.reset();
		serverFetchMock.reset();
	});

	it('should return only the version (without the patch info) when the user is not present', async () => {
		expect(await getServerInfo(undefined)).to.be.eql({ version: '3.0' });
	});

	it('should return only the version (without the patch info) when the user present but they dont have permission', async () => {
		hasAllPermissionAsyncMock.resolves(false);
		expect(await getServerInfo('userId')).to.be.eql({ version: '3.0' });
	});

	it('should return the info object + the supportedVersions from the cloud when the request to the cloud was a success', async () => {
		const signedJwt = 'signedJwt';
		hasAllPermissionAsyncMock.resolves(true);
		serverFetchMock.resolves({
			json: async () => ({
				signed: signedJwt,
			}),
		});
		expect(await getServerInfo('userId')).to.be.eql({ info: { version: '3.0.1', supportedVersions: signedJwt } });
	});

	it('should return the info object ONLY from the cloud when the request to the cloud was NOT a success', async () => {
		hasAllPermissionAsyncMock.resolves(true);
		serverFetchMock.rejects();
		expect(await getServerInfo('userId')).to.be.eql({ info: { version: '3.0.1' } });
	});
});
