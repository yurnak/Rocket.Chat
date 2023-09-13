import { NPS, Banner } from '@rocket.chat/core-services';
import { Settings } from '@rocket.chat/models';
import { serverFetch as fetch } from '@rocket.chat/server-fetch';

import { SystemLogger } from '../../../../server/lib/logger/system';
import { getAndCreateNpsSurvey } from '../../../../server/services/nps/getAndCreateNpsSurvey';
import { settings } from '../../../settings/server';
import { buildWorkspaceRegistrationData } from './buildRegistrationData';
import { generateWorkspaceBearerHttpHeader } from './getWorkspaceAccessToken';
import { getWorkspaceLicense } from './getWorkspaceLicense';
import { retrieveRegistrationStatus } from './retrieveRegistrationStatus';
import { getCachedSupportedVersionsToken, wrapPromise } from './supportedVersionsToken/supportedVersionsToken';

		if (data.nps) {
			const { id: npsId, expireAt } = data.nps;

			const startAt = new Date(data.nps.startAt);

			await NPS.create({
				npsId,
				startAt,
				expireAt: new Date(expireAt),
				createdBy: {
					_id: 'rocket.cat',
					username: 'rocket.cat',
				},
			});

			const now = new Date();

			if (startAt.getFullYear() === now.getFullYear() && startAt.getMonth() === now.getMonth() && startAt.getDate() === now.getDate()) {
				await getAndCreateNpsSurvey(npsId);
			}
		}

		// add banners
		if (data.banners) {
			for await (const banner of data.banners) {
				const { createdAt, expireAt, startAt } = banner;

				await Banner.create({
					...banner,
					createdAt: new Date(createdAt),
					expireAt: new Date(expireAt),
					startAt: new Date(startAt),
				});
			}
		}
	} catch (err: any) {
		SystemLogger.error({
			msg: 'Failed to sync with Rocket.Chat Cloud',
			url: '/client',
			err,
		});

		return false;
	} finally {
		// always fetch the license
		await getWorkspaceLicense();
	}

	await getCachedSupportedVersionsToken.reset();

	return true;
}
