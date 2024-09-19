import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const initDB = async () => {
    const data = await (await axios.get('https://logistica.unibg.it/PortaleStudenti/combo.php?sw=ec_&aa=2024&page=corsi')).data

    const corsi = JSON.parse(data.substring('var elenco_corsi = '.length, data.indexOf(';')));
    const scuole = JSON.parse(data.substring(data.indexOf('var elenco_scuole = ') + 'var elenco_scuole = '.length, data.indexOf(';', data.indexOf('var elenco_scuole = '))));

    for (const s of scuole) {
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
        if ((process.env.NODE_ENV === 'production') || (c.label === "INGEGNERIA INFORMATICA" || c.label === "INGEGNERIA MECCANICA" || c.label === "INGEGNERIA GESTIONALE" || c.label === "SCIENZE DELLA COMUNICAZIONE")) {
            const anni = c.elenco_anni;
            let i = c.tipo === 'Laurea' ? 1 : 4;
            for(const a of anni){
                if (c.valore === "CIS" || c.valore === "CINT") return;

                const obj = {
                    courseId: c.valore,
                    anno: c.tipo === 'Laurea Magistrale' ? parseInt(a.label[0]) + 3 : parseInt(a.label[0]),
                    annoId: a.valore,
                };

                i++;

                let name = a.label;
                name = name.includes('GENERALE') || name.includes('COMUNE') ? c.label : a.label.substring('x - '.length);


                const department = await prisma.department.upsert({
                    where: {
                        name
                    },
                    update: {
                        school: {
                            connect: {
                                schoolId: c.scuola // Assicurati che `c.scuolaId` sia l'ID corretto della scuola
                            }
                        }
                    },
                    create: {
                        name,
                        school: {
                            connect: {
                                schoolId: c.scuola // Assicurati che `c.scuolaId` sia l'ID corretto della scuola
                            }
                        }
                    }
                });


                await prisma.course.upsert({
                    where: {
                        courseId_annoId: {
                            courseId: obj.courseId,
                            annoId: obj.annoId
                        }
                    },
                    update: {
                        courseId: obj.courseId,
                        annoId: obj.annoId,
                        anno: obj.anno,
                        department: {
                            connect: {
                                departmentId: department.departmentId
                            }
                        }

                    },
                    create: {
                        courseId: obj.courseId,
                        annoId: obj.annoId,
                        anno: obj.anno,
                        department: {
                            connect: {
                                departmentId: department.departmentId
                            }
                        }
                    }
                });
            }
        }
    })


}