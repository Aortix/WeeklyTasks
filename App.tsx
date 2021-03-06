//React Native modules
import React from "react";

//React Native Paper modules
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

//Functions
import { getTheme } from "./src/controllers/database/Settings/settings";
import { createInitialDays } from "./src/controllers/database/Miscellaneous/CreateInitialDays/createInitialDays";
import {
  createLoginDate,
  updateLoginDate,
} from "./src/controllers/database/Login/login";

//React Native Navigation modules
import { NavigationContainer } from "@react-navigation/native";
import MyDrawer from "./src/navigation/drawer/Drawer";
import { AppProps, AppState } from "./App.interface";

//Utilities
import DarkTheme from "./src/utilities/darkTheme";

//Services
import {
  testLocalNotifications,
  setApplicationIconBadgeNumber,
} from "./src/services/pushNotifications";

class App extends React.PureComponent<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      theme: DefaultTheme,
    };
  }

  componentDidMount = async () => {
    //testLocalNotifications();
    try {
      let expectVoid: void = await createInitialDays();
      if (expectVoid !== undefined && expectVoid !== null) {
        throw expectVoid;
      }
    } catch (err) {
      console.log("Creating initial days: ", err);
    }

    try {
      let expectVoid: void = createLoginDate();
      if (expectVoid !== undefined && expectVoid !== null) {
        throw expectVoid;
      }
    } catch (err) {
      console.log("Error creating login date: ", err);
    }

    try {
      let expectVoid: void = await updateLoginDate();
      if (expectVoid !== undefined && expectVoid !== null) {
        throw expectVoid;
      }
    } catch (err) {
      console.log("Error updating login date: ", err);
    }

    try {
      let themeName: string = await getTheme();
      switch (themeName) {
        case "dark":
          this.setState({
            theme: DarkTheme,
          });
          break;
        case "light":
        default:
          this.setState({
            theme: DefaultTheme,
          });
      }
    } catch (err) {
      this.setState({
        theme: DefaultTheme,
      });
    }

    //Removes application badge
    setApplicationIconBadgeNumber(0);
  };

  componentWillUnmount = () => {
    //close global realm
    if (global.realmContainer !== null && !global.realmContainer.isClosed) {
      global.realmContainer.close();
    }
  };

  render() {
    return (
      <PaperProvider theme={this.state.theme}>
        <NavigationContainer>
          <MyDrawer />
        </NavigationContainer>
      </PaperProvider>
    );
  }
}

export default App;
