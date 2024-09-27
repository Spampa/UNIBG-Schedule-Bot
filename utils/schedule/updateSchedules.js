import { PrismaClient } from '@prisma/client';
import { fetchSchedule } from '../../services/fetchSchedule.js';
import { formatDate } from '../formatDate.js';

const prisma = new PrismaClient();

export async function updateSchedules() {
    try {
        const updates = [];

        const userCourses = await prisma.user.findMany({
            distinct: ['annoId', 'courseId'],
            select: {
                courseId: true,
                annoId: true,
                course: {
                    select: {
                        department: {
                            select: {
                                schoolId: true
                            }
                        }
                    }
                }
            }
        });

        const minWeek = (await prisma.schedule.aggregate({
            _min: {
                week: true
            }
        }))._min.week;

        for (let i = parseInt(minWeek || 0); i < parseInt(minWeek || 0) + parseInt(process.env.MAX_WEEKS); i++) {
            for (const u of userCourses) {
                const schedule = await fetchSchedule(formatDate( 7 * ((i - parseInt(minWeek || 0)) || i )), u.courseId, u.annoId, u.course.department.schoolId);
                for (const c of schedule) {
                    const oldSchedule = await prisma.schedule.findUnique({
                        where: {
                            subject_courseId_courseAnnoId_date_time: {
                                courseId: c.courseId,
                                courseAnnoId: c.courseAnnoId,
                                subject: c.subject,
                                date: c.date,
                                time: c.time
                            }
                        }
                    });
                    
                    const newSchedule = await prisma.schedule.upsert({
                        where: {
                            subject_courseId_courseAnnoId_date_time: {
                                courseId: c.courseId,
                                courseAnnoId: c.courseAnnoId,
                                subject: c.subject,
                                date: c.date,
                                time: c.time
                            }
                        },
                        update: {
                            classroom: c.classroom,
                            teacher: c.teacher,
                            isCanceled: c.isCanceled
                        },
                        create: {
                            courseId: c.courseId,
                            courseAnnoId: c.courseAnnoId,
                            subject: c.subject,
                            date: c.date,
                            time: c.time,
                            classroom: c.classroom,
                            teacher: c.teacher,
                            isCanceled: c.isCanceled,
                            week: i
                        }
                    });
                    
                    if (JSON.stringify(oldSchedule) !== JSON.stringify(newSchedule)) {
                        if(oldSchedule) updates.push(newSchedule);
                    }
                }
            };
        }
        return updates;
    }
    catch (err) {
        console.log("Errore nell'aggiornamento dati", err);
    }
}