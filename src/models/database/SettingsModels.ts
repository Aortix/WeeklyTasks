export const SettingsModel = {
  name: "Settings",
  primaryKey: "id",
  properties: {
    id: "int",
    appFunctionality: "string",
    dailyUpdate: "bool",
    dailyUpdatePersistance: "bool",
    dailyUpdateTime: "string",
    noteFunctionality: "string",
    taskReminders: "bool",
    sortTasksBy: "string",
    theme: "string",
  },
};
