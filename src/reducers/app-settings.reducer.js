// @flow
/**
 * There is a certain amount of initialization that needs to happen before
 * it makes sense to show anything to the user.
 *
 * Specifically:
 *
 * - We need to load persisted redux state, to know if the user is onboarding,
 *   what their projects are, etc.
 * - We want to parse the projects on disk to get up-to-date info, because
 *   the persisted redux state is incomplete; doesn't have info about tasks.
 *
 * This simple boolean reducer defaults to `false` and is toggled to `true`
 * once enough state has been loaded for us to show the user some UI.
 */

import { SAVE_APP_SETTINGS_START } from '../actions';
import * as os from 'os';
import * as path from 'path';
import produce from 'immer';

import { windowsHomeDir, isWin } from '../services/platform.service';
// import { getProjectNameSlug } from '../services/create-project.service';

import type { Action } from 'redux';
import type { AppSettings } from '../types';

const homedir = isWin ? windowsHomeDir : os.homedir();

const initialState: AppSettings = {
  general: {
    defaultProjectPath:
      process.env.NODE_ENV === 'development'
        ? path.join(homedir, 'guppy-projects-dev')
        : path.join(homedir, 'guppy-projects'),
    defaultProjectType: 'create-react-app',
  },
  privacy: {
    enableUsageTracking: true,
  },
};

export default (state: AppSettings = initialState, action: Action = {}) => {
  switch (action.type) {
    case SAVE_APP_SETTINGS_START:
      return {
        ...action.settings,
      };

    default:
      return state;
  }
};

//
//
//
// Selectors
export const getDefaultProjectPath = (state: AppSettings) =>
  state.appSettings.general.defaultProjectPath;

export const getDefaultProjectType = (state: AppSettings) =>
  state.appSettings.general.defaultProjectType;

export const getPrivacySettings = (state: AppSettings) =>
  state.appSettings.privacy;