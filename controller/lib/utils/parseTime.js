export function parseTime(timeString){
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date('it-It');
    date.setHours(hours, minutes, 0, 0);
    return date;
}