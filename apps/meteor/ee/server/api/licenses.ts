import { Settings, Users } from '@rocket.chat/models';
import { check } from 'meteor/check';

import { API } from '../../../app/api/server/api';
import { hasPermissionAsync } from '../../../app/authorization/server/functions/hasPermission';
import { getUnmodifiedLicenseAndModules, validateFormat, getMaxActiveUsers, isEnterprise } from '../../app/license/server/license';

API.v1.addRoute(
	'licenses.get',
	{ authRequired: true },
	{
		async get() {
			if (!(await hasPermissionAsync(this.userId, 'view-privileged-setting'))) {
				return API.v1.unauthorized();
			}

			const license = getUnmodifiedLicenseAndModules();
			const licenses = license ? [license] : [];

			return API.v1.success({ licenses });
		},
	},
);

API.v1.addRoute(
	'licenses.add',
	{ authRequired: true },
	{
		async post() {
			check(this.bodyParams, {
				license: String,
			});

			if (!(await hasPermissionAsync(this.userId, 'edit-privileged-setting'))) {
				return API.v1.unauthorized();
			}

			const { license } = this.bodyParams;
			if (!validateFormat(license)) {
				return API.v1.failure('Invalid license');
			}

			await Settings.updateValueById('Enterprise_License', license);

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'licenses.maxActiveUsers',
	{ authRequired: true },
	{
		async get() {
			const maxActiveUsers = getMaxActiveUsers() || null;
			const activeUsers = await Users.getActiveLocalUserCount();

			return API.v1.success({ maxActiveUsers, activeUsers });
		},
	},
);

API.v1.addRoute(
	'licenses.isEnterprise',
	{ authOrAnonRequired: true },
	{
		get() {
			const isEnterpriseEdtion = isEnterprise();
			return API.v1.success({ isEnterprise: isEnterpriseEdtion });
		},
	},
);
