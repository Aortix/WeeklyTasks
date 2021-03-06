import React, { Fragment, useRef } from "react";
import {
  Dialog,
  Portal,
  Button,
  TextInput,
  Paragraph,
  Divider,
} from "react-native-paper";
import { Dimensions, StyleSheet, Pressable, Keyboard } from "react-native";

import SetReminder from "./../SetReminder/SetReminder";

import { AppProps } from "./UpdateTaskDialog.interface";
import { updateTask } from "../../controllers/database/Tasks/tasks";

export default function UpdateTaskDialog(props: AppProps) {
  const [text, updateText] = React.useState<string>("");
  const [taskId, updateTaskId] = React.useState<number>(-1);
  const [textErrorExists, updateTextErrorExists] = React.useState<boolean>(
    false
  );
  const [textErrorText, updateTextErrorText] = React.useState<string[]>([]);
  const [dialogTopProperty, setDialogTopProperty] = React.useState<number>(0);
  const [keyboardOpen, setKeyboardOpen] = React.useState<boolean>(false);
  const [dialogContainerMargins, setDialogContainerMargins] = React.useState({
    marginLeft: 0,
    marginRight: 0,
  });
  const [isLandscape, setIsLandscape] = React.useState<boolean>(false);

  let inputEl = useRef(null);

  React.useEffect(() => {
    updateText(props.updateTaskTextState.text);
    updateTaskId(props.updateTaskTextState.taskID);

    dialogContainerCentering();
    Dimensions.addEventListener("change", () => {
      dialogContainerCentering();
    });
    Keyboard.addListener("keyboardDidShow", (e) => keyboardDidShowFunction(e));
    Keyboard.addListener("keyboardDidHide", (e) => keyboardDidHideFunction(e));

    return function cleanup() {
      Dimensions.removeEventListener("change", () => {
        dialogContainerCentering();
      });
      Keyboard.removeListener("keyboardDidShow", (e) =>
        keyboardDidShowFunction(e)
      );
      Keyboard.removeListener("keyboardDidHide", (e) =>
        keyboardDidHideFunction(e)
      );
    };
  }, [props.updateTaskTextState.text, props.updateTaskTextState.taskID]);

  const keyboardDidShowFunction = (e) => {
    setKeyboardOpen(true);
    let spaceBetweenTopOfScreenAndKeyboard =
      Dimensions.get("window").height - e.endCoordinates.height;

    if (Dimensions.get("window").height < Dimensions.get("window").width) {
      if (spaceBetweenTopOfScreenAndKeyboard < 70) {
        setDialogTopProperty(10);
      } else {
        setDialogTopProperty((spaceBetweenTopOfScreenAndKeyboard - 70) / 2);
      }
    } else {
      if (spaceBetweenTopOfScreenAndKeyboard < 300) {
        setDialogTopProperty(10);
      } else {
        setDialogTopProperty((spaceBetweenTopOfScreenAndKeyboard - 300) / 2);
      }
    }
  };

  const keyboardDidHideFunction = (e) => {
    setKeyboardOpen(false);
    setDialogTopProperty(0);
  };

  const submitTask = async () => {
    try {
      let expectVoid: void = await updateTask(
        inputEl.current?.state.value,
        taskId,
        props.reminder,
        props.reminderTime
      );
      if (expectVoid !== null && expectVoid !== undefined) {
        throw expectVoid;
      }

      updateTextErrorExists(false);
      updateTextErrorText([]);
      await props.updateTaskText();
    } catch (err) {
      updateTextErrorExists(true);
      updateTextErrorText(Object.values(JSON.parse(err)));
    }
  };

  const dialogContainerCentering = () => {
    let currentScreenWidth = Dimensions.get("window").width;
    let currentScreenHeight = Dimensions.get("window").height;

    if (currentScreenWidth > 700) {
      setDialogContainerMargins({
        marginLeft: (currentScreenWidth - 700) / 2,
        marginRight: (currentScreenWidth - 700) / 2,
      });
    } else {
      setDialogContainerMargins({
        marginLeft: 0,
        marginRight: 0,
      });
    }

    if (currentScreenWidth > currentScreenHeight) {
      setIsLandscape(true);
    } else {
      setIsLandscape(false);
    }
  };

  return (
    <Portal>
      <Dialog
        visible={props.updateTaskDialogVisible}
        onDismiss={props.dismissTaskDialog}
        style={{
          ...styles.dialogContainer,
          position: keyboardOpen ? "absolute" : "relative",
          top: dialogTopProperty,
          width: Dimensions.get("window").width >= 700 ? 700 : "90%",
          marginLeft: dialogContainerMargins.marginLeft,
          marginRight: dialogContainerMargins.marginRight,
          backgroundColor: props.theme === "light" ? "white" : "#181818",
        }}
      >
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          {isLandscape ? null : (
            <Fragment>
              <Dialog.Title style={{ marginBottom: 0 }}>
                Update Task
              </Dialog.Title>
              <Divider
                style={{
                  ...styles.dividerStyling,
                  backgroundColor: props.theme === "light" ? "silver" : "white",
                }}
              />
            </Fragment>
          )}
          {keyboardOpen && isLandscape ? null : (
            <SetReminder
              reminder={props.reminder}
              reminderTime={props.reminderTime}
              changeReminderTime={props.changeReminderTime}
              theme={props.theme}
              text="Change Reminder Time: "
            />
          )}
          <Dialog.Content style={{ marginTop: 5 }}>
            <TextInput
              mode="outlined"
              multiline={true}
              numberOfLines={3}
              style={styles.textInputStyling}
              error={textErrorExists}
              selectionColor={props.theme === "light" ? "black" : "white"}
              ref={inputEl}
              defaultValue={props.updateTaskTextState.text}
            ></TextInput>
            {textErrorText.map((errors, index) => {
              return (
                <Paragraph
                  key={index}
                  style={{
                    color: props.theme === "light" ? "#C00000" : "#ff8080",
                  }}
                >
                  {errors}
                </Paragraph>
              );
            })}
          </Dialog.Content>
          {keyboardOpen && isLandscape ? null : (
            <Dialog.Actions>
              <Button
                onPress={props.dismissTaskDialog}
                color={props.theme === "light" ? "#6200ee" : "white"}
              >
                Cancel
              </Button>
              <Button
                onPress={async () => {
                  await submitTask();
                }}
                color={props.theme === "light" ? "#6200ee" : "white"}
              >
                Update
              </Button>
            </Dialog.Actions>
          )}
        </Pressable>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    elevation: 10,
    borderWidth: 1,
    borderColor: "white",
    maxWidth: 700,
    alignSelf: "center",
    minHeight: 70,
  },
  dividerStyling: {
    marginTop: 5,
    marginBottom: 20,
  },
  textInputStyling: {
    minHeight: 80,
    maxHeight: 125,
  },
});
