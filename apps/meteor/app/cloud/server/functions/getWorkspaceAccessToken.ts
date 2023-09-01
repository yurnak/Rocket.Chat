import { Settings } from '@rocket.chat/models';

import { settings } from '../../../settings/server';
import { getWorkspaceAccessTokenWithScope } from './getWorkspaceAccessTokenWithScope';
import { retrieveRegistrationStatus } from './retrieveRegistrationStatus';

export async function getWorkspaceAccessToken(forceNew = false, scope = '', save = true) {
	const { connectToCloud, workspaceRegistered } = await retrieveRegistrationStatus();

	if (!connectToCloud || !workspaceRegistered) {
		return '';
	}

	const expires = await Settings.findOneById('Cloud_Workspace_Access_Token_Expires_At');

	if (expires === null) {
		throw new Error('Cloud_Workspace_Access_Token_Expires_At is not set');
	}
	const now = new Date();

	if (expires.value && now < expires.value && !forceNew) {
		return settings.get<string>('Cloud_Workspace_Access_Token');
	}

	const accessToken = await getWorkspaceAccessTokenWithScope(scope);

	if (save) {
		await Promise.all([
			Settings.updateValueById('Cloud_Workspace_Access_Token', accessToken.token),
			Settings.updateValueById('Cloud_Workspace_Access_Token_Expires_At', accessToken.expiresAt),
		]);
	}

	return accessToken.token;
}
