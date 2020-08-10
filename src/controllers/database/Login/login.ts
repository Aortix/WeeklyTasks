//3rd party modules
import moment from "moment";

//Functions
import { unCheckEveryTaskInTheDatabase } from "../Tasks/tasks";

export const createLoginDate = async (): Promise<string> => {
  try {
    let loginDateExists: any = global.realmContainer.objects("Login")[0]
      ? global.realmContainer.objects("Login")[0]
      : null;
    let currentDate: string = moment().format("YYYY-MM-DD");

    if (!loginDateExists) {
      global.realmContainer.write(() => {
        global.realmContainer.create("Login", {
          id: 0,
          date: currentDate,
          alreadyLoggedInToday: true,
        });
      });
    }

    return loginDateExists ? loginDateExists.date : currentDate;
  } catch (err) {
    return JSON.stringify(err);
  }
};

export const saveLoginDate = async (): Promise<string | void> => {
  try {
    let loginDateExists: string = await createLoginDate();
    let currentDate: string = moment().format("YYYY-MM-DD");

    if (loginDateExists !== currentDate) {
      global.realmContainer.write(() => {
        global.realmContainer.create(
          "Login",
          {
            id: 0,
            date: currentDate,
            alreadyLoggedInToday: true,
          },
          true
        );
      });

      let mondayOfThisWeek: string = moment()
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      let differenceBetweenLoginDateAndThisWeeksMonday: number = moment(
        loginDateExists,
        "YYYY-MM-DD"
      ).diff(mondayOfThisWeek, "days");

      if (differenceBetweenLoginDateAndThisWeeksMonday < 0) {
        const expectVoid: void = await unCheckEveryTaskInTheDatabase();

        if (expectVoid !== null && expectVoid !== undefined) {
          throw expectVoid;
        }

        return "New Week: All Tasks Unchecked!";
      }
    }
  } catch (err) {
    return JSON.stringify(err);
  }
};
