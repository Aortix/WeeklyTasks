const Realm = require("realm");

import {DaySchema, TaskSchema, NoteSchema, LoginSchema, SettingsSchema} from "./schemas";

const migration = () => {
    Realm.open({schema: [DaySchema, TaskSchema, NoteSchema, LoginSchema, SettingsSchema],
        schemaVersion: 4,
        migration: (oldRealm, newRealm) => {
            // only apply this change if upgrading to schemaVersion 1
            if (oldRealm.schemaVersion < 4) {
                /*const oldObjects = oldRealm.objects('Task');
                const newObjects = newRealm.objects('Task');
            
                // loop through all objects and set the name property in the new schema
                for (let i = 0; i < oldObjects.length; i++) {
                    newObjects[i].reminder = true;
                    newObjects[i].reminderTime = "5:00 PM";
                }*/
            }
        }
    })
}

export default migration;