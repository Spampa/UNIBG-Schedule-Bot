import axios from "axios";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getOrari = async (day, username) => {

    const user = await prisma.user.findUnique({
        where: {
            username
        },
        select: {
            course: true
        }
    });
    
    if(!user) return undefined;

    const formData = new FormData();
    const date = day;
    //init form data
    formData.append('view', 'easycourse');
    formData.append('form-type', 'corso');
    formData.append('include', 'corso');
    formData.append('anno', '2024');
    formData.append('scuola', user.course.scuola);
    formData.append('corso', user.course.courseId);
    formData.append('date', date);
    formData.append('_lang', 'it');
    formData.append('txtcurr', '1 - PERCORSO COMUNE');
    formData.append('anno2[]', user.course.anno2); //2014
    formData.append('visualizzazione_orario', 'cal');

    const orario = [];
    const data = (await axios.post('https://logistica.unibg.it/PortaleStudenti/grid_call.php', formData)).data;

    for (const subject of data.celle) {
        if(subject.data === date && subject.Annullato === '0'){
            orario.push({
                subject: subject.nome_insegnamento,
                date: subject.data,
                schedule: subject.orario,
                classroom: subject.aula,
            });
        }
    }

    return orario;
}