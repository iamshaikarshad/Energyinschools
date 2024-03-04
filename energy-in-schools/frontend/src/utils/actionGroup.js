/* eslint-disable */
export const FAILED = Object.freeze({
  failed: 'failed',
});

export const SUCCESS = Object.freeze({
  success: 'success',
});

export const FAIL_OR_SUCCESS = Object.freeze({
  failed: 'failed',
  success: 'success',
});


function toUpperCase(string) {
  if (string.match(/[a-z]/)) {
    return string.split(/(?=[A-Z])/).join('_').toUpperCase();
  }
  return string;
}

/**
 * This method set action key in next format: ACTION_GROUP__ACTION_NAME__ACTION_RESULT
 *
 * @template T
 * @param name name of the actions group
 * @param actions {T} {<action name>: {<result name>: <result value>}}
 * @return {T}
 */
export function makeActionsGroup(name, actions) {
  const actionGroup = {};

  for (const actionName in actions) {
    const actionResults = {};

    if (!actions.hasOwnProperty(actionName)) {
      continue;
    }

    for (const actionResultName in actions[actionName]) {
      if (!actions[actionName].hasOwnProperty(actionResultName)) {
        continue;
      }

      const actionResult = actions[actionName][actionResultName];

      actionResults[actionResultName] = `${toUpperCase(name)}__${toUpperCase(actionName)}__${toUpperCase(actionResult)}`;
    }
    actionGroup[actionName] = Object.freeze(actionResults);
  }

  return Object.freeze(actionGroup);
}
