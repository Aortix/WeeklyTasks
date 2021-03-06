import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from "react-navigation";

export interface AppProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export interface AppState {
  date: string;
  dailyUpdateStatus: boolean;
  taskReminderStatus: boolean;
  dailyPersistanceStatus: boolean;
  showTextDialog: boolean;
  snackBarVisibility: boolean;
  snackBarIsError: boolean;
  snackBarText: string;
  sortTasksMenu: boolean;
  sortTasksByStatus: string;
  themeStatus: string;
  dailyUpdateTimeStatus: string;
  theme: string;
  themeText: string;
}
