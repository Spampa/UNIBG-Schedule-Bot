import { classroom } from "./callbacks/classroom.js";
import { course } from "./callbacks/course.js";
import { school } from "./callbacks/school.js";
import { year } from "./callbacks/year.js";

export async function handleCallback(callback, callbackObj){
    const callbackId = callback.substring(0,callback.indexOf(':'));
    const data = callback.substring(callbackId.length + 1);

    switch(callbackId){
        case 'school':
            return school(data);
        case 'course':
            return course(data);
        case 'year':
            return year(data, callbackObj);
        case 'class':
            return classroom(data);
        default :
            return { text: '🤨 Callback non trovata'}
    }
}