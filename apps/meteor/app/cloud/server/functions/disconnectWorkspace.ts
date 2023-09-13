import { Settings } from '@rocket.chat/models';

import { syncWorkspace } from './syncWorkspace';

export async function disconnectWorkspace() {
	await Settings.updateValueById('Register_Server', false);

	await syncWorkspace();

	return true;
}
