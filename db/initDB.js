import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs'

const prisma = new PrismaClient();

export const initDB = async () => {

    const data = await (await axios.get('https://logistica.unibg.it/PortaleStudenti/combo.php?sw=ec_&aa=2024&page=corsi')).data

    const corsi = JSON.parse(data.substring('var elenco_corsi = '.length, data.indexOf(';')));
    const scuole = JSON.parse(data.substring(data.indexOf('var elenco_scuole = ') + 'var elenco_scuole = '.length, data.indexOf(';', data.indexOf('var elenco_scuole = '))));

    for(const s of scuole){
        await prisma.school.upsert({
            where: {
                schoolId: s.valore
            },
            update: {
                name: s.label,
            },
            create: {
                name: s.label,
                schoolId: s.valore
            }
        });
    }

    corsi.forEach(async (c) => {

        if (c.label === "INGEGNERIA INFORMATICA" || c.label === "INGEGNERIA MECCANICA" || c.label === "INGEGNERIA GESTIONALE" || c.label === "MEDIA E CULTURA") {
            const anni = c.elenco_anni;
            let i = c.tipo === 'Laurea' ? 1 : 4;
            anni.forEach(async (a) => {

                const obj = {
                    courseId: c.valore,
                    name: c.label,
                    anno: i,
                    annoId: a.valore,
                    school: {
                        connect: {
                            schoolId: c.scuola // Assicurati che `c.scuolaId` sia l'ID corretto della scuola
                        }
                    }
                };

                i++;

                await prisma.course.upsert({
                    where: {
                        courseId_annoId: {
                            courseId: obj.courseId,
                            annoId: obj.annoId
                        }
                    },
                    update: {
                        courseId: obj.courseId,
                        name: obj.name,
                        anno: obj.anno,
                        annoId: obj.annoId,
                        school: obj.school
                    },
                    create: {
                        courseId: obj.courseId,
                        name: obj.name,
                        anno: obj.anno,
                        annoId: obj.annoId,
                        school: obj.school
                    }
                });
            })
        }
    })


}