import { formatSchedule } from '../utils/formatSchedule.js';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function daySchedule(date, user) {
    const schedule = await prisma.schedule.findMany({
        where: {
            courseId: user.courseId,
            courseAnnoId: user.annoId,
            date
        }
    });

    return { text: formatSchedule(schedule) };
}

export async function  weekSchedule(weekAdd, user) {
    const minWeek = (await prisma.schedule.aggregate({
        _min: {
            week: true
        }
    }))._min.week;

    const week = minWeek + weekAdd;

    const schedule = await prisma.schedule.findMany({
        where: {
            courseId: user.courseId,
            courseAnnoId: user.annoId,
            week: week
        }
    })

    return { text: formatSchedule(schedule) };
}