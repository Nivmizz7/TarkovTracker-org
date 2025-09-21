interface Permission {
  title: string;
  description: string;
}
interface Permissions {
  [key: string]: Permission;
}
const availablePermissions: Permissions = {
  GP: {
    title: 'Get Progression',
    description:
      'Allows access to read your progression information, ' +
      'including your TarkovTracker display name, quest progress, hideout progress. ' +
      'Data access is restricted by the token\'s game mode (PvP, PvE, or Dual).',
  },
  TP: {
    title: 'Get Team Progression',
    description:
      "Allows access to read a virtual copy of your team's progress, " +
      'including display names, quest, and hideout progress. ' +
      'Data access is restricted by the token\'s game mode (PvP, PvE, or Dual).',
  },
  WP: {
    title: 'Write Progression',
    description: 'Allows access to update your TarkovTracker progress data on your behalf. ' +
      'Updates are restricted by the token\'s game mode (PvP, PvE, or Dual).',
  },
};
export default availablePermissions;
