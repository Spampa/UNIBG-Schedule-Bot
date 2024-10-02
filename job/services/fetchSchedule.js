import axios from "axios";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function fetchSchedule(date, courseId, annoId, schoolId) {
    const formData = new FormData();

    //init form data
    formData.append('view', 'easycourse');
    formData.append('form-type', 'corso');
    formData.append('include', 'corso');
    formData.append('anno', '2024');
    formData.append('scuola', schoolId);
    formData.append('corso', courseId);
    formData.append('date', date);
    formData.append('_lang', 'it');
    formData.append('txtcurr', '1 - PERCORSO COMUNE');
    formData.append('anno2[]', annoId); //2014
    formData.append('visualizzazione_orario', 'cal');

    const schedule = [];
    const data = (await axios.post('https://logistica.unibg.it/PortaleStudenti/grid_call.php', formData)).data;

    for (const subject of data.celle) {
        const startMinutes = parseInt(formatTime(subject.ora_inizio));
        const endMinutes = parseInt(formatTime(subject.ora_fine));
        schedule.push({
            courseId: courseId,
            courseAnnoId: annoId,
            subject: subject.nome_insegnamento,
            date: subject.data,
            start: subject.ora_inizio,
            startMinutes,
            end:  subject.ora_fine,
            endMinutes,
            classroom: subject.aula,
            teacher: subject.docente,
            isCanceled: subject.Annullato === '1' ? true : false
        });
    }
    return schedule;
}

function formatTime(string){
    const [h, m] = string.split(":");
    return h * 60 + m;
}