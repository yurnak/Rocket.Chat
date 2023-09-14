import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { getCachedSupportedVersionsToken } from '../../../cloud/server/functions/supportedVersionsToken';
import { Info } from '../../../utils/rocketchat.info';

type ServerInfo =
	| {
			info: typeof Info;
	  }
	| {
			version: string | undefined;
	  };

const removePatchInfo = (version: string): string => version.replace(/(\d+\.\d+).*/, '$1');

export async function getServerInfo(userId?: string): Promise<ServerInfo> {
	if (userId && (await hasPermissionAsync(userId, 'get-server-info'))) {
		try {
			const supportedVersionsToken = await getCachedSupportedVersionsToken();

			return {
				info: {
					...Info,
					supportedVersions: supportedVersionsToken,
				},
			};
		} catch (e) {
			return {
				info: Info,
			};
		}
	}
	return {
		version: removePatchInfo(Info.version),
	};
}
