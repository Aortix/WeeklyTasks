const Realm = require("realm");
import {DaySchema, TaskSchema, NoteSchema} from "./../schemas/schemas";

export const getAllDaysData = () => { 
    return new Promise((resolve, reject) => {
        console.log("Is this running?");
        Realm.open({schema: [DaySchema, TaskSchema, NoteSchema]})
            .then((realm) => {
                console.log("This should finish second");
                let dayObjects = [];
                let dayObject = realm.objects("Day");
                let taskObjects = [];
                for (let i = 0; i < 7; i++) {
                    for (let j = 0; j < dayObject[i].tasks.length; j++) {
                        taskObjects.push({
                            id: dayObject[i].tasks[j].id, 
                            day: dayObject[i].tasks[j].day,
                            text: dayObject[i].tasks[j].text, 
                            isChecked: dayObject[i].tasks[j].isChecked
                        });
                    }
                    dayObjects.push({
                        id: dayObject[i].id,
                        tasks: taskObjects,
                        note: {
                            id: dayObject[i].note.id, 
                            text: dayObject[i].note.text
                        }
                    })
                    taskObjects = [];
                }
                resolve(dayObjects);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
})}