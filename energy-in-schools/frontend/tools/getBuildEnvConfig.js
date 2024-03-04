export default function getBuildEnvConfig(buildEnv) {
  switch (buildEnv) {
    case 'staging': {
      return {
        GATID: JSON.stringify('UA-150176662-1'), // GATID: Google Analytics Tracker Id
      };
    }
    case 'production': {
      return {
        GATID: JSON.stringify('UA-150176662-2'),
      };
    }
    // case 'development': { // uncomment block for local testing
    //   return {
    //     GATID: JSON.stringify('UA-150176662-1'),
    //   };
    // }
    default:
      return {};
  }
}
