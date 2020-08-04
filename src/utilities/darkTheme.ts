var color = require("color");
import { DefaultTheme } from "react-native-paper";

const black = "#000000";
const white = "#ffffff";
const pinkA100 = "#ff80ab";

const DarkTheme: any = {
  ...DefaultTheme,
  dark: true,
  mode: "adaptive",
  colors: {
    ...DefaultTheme.colors,
    primary: "#c2c2f0",
    accent: "#03dac6",
    background: "#F8F8F8",
    surface: "#000000",
    error: "#CF6679",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    text: white,
    disabled: color(white).alpha(0.38).rgb().string(),
    placeholder: color(white).alpha(0.54).rgb().string(),
    backdrop: color(black).alpha(0.5).rgb().string(),
    notification: pinkA100,
  },
};

export default DarkTheme;
